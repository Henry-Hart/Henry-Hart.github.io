function setup() {
    let timeStep = 200000; // seconds
    let scale = 493560533 // m/pixel
    let isPlaying = false;
    let integrator = 0;

    // Screen
    const svg = d3.select("body").append("svg")
        .attr("width", 500)
        .attr("height", 500)
        .attr("style", "background:white;");

    // Sun - its position is the origin of our coordinate system
    const sunX = 200; 
    const sunY = 200; 
    svg.append("circle")
        .attr("cx", sunX)
        .attr("cy", sunY)
        .attr("r", 10)
        .attr("fill", "yellow");

    let G = 6.67 * 10**-11
    let sunMass = 1.989 * 10**30
    let c = 3 * 10**5
    let L = 9.1 * 10**38 // angular momentum

    class Mercury {
        constructor() {
            this.position = createVector(sunX + 100, sunY + 100);
            this.mass = 3.285 * 10**23;
            this.velocity = createVector(28806, -28806); // m/s
            this.previousPositions = []
        }
    }
    const mercury = new Mercury();

    schwarzschildRadius = 2*G*sunMass/(c**2)
    blackHole = svg.append("circle")
        .attr("cx", sunX)
        .attr("cy", sunY)
        .attr("r", schwarzschildRadius/scale)
        .attr("fill", "black");

    reducedMass = sunMass * mercury.mass / (sunMass + mercury.mass)

    function mercuryToSunVector() {
        let sun = createVector(sunX, sunY);
        return p5.Vector.sub(sun, mercury.position).mult(scale);
    }
    let r = mercuryToSunVector();

    const mercuryCircle = svg.append("circle")
        .attr("cx", mercury.x)
        .attr("cy", mercury.y)
        .attr("r", 5)
        .attr("fill", "gray");

    function radialForce(position) { // scalar
        let newton = G * sunMass * mercury.mass / (position.mag()**2);
        let GRcorrection = 3 * G * (sunMass + mercury.mass) * L**2 / (c**2 * reducedMass * position.mag()**4);
        let total = newton + GRcorrection
        return total
    }

    let lineGenerator = d3.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .curve(d3.curveCatmullRom.alpha(0));

    let path = svg.append("path")
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 1);

    function rk4solver() {
        let denominator = (mercury.mass*r.mag());
        let k1 = r.copy().mult(radialForce(r) / denominator);
        let k2 = r.copy().mult(radialForce(r.copy().add(k1.copy().mult(timeStep/2))) / denominator);
        let k3 = r.copy().mult(radialForce(r.copy().add(k2.copy().mult(timeStep/2))) / denominator);
        let k4 = r.copy().mult(radialForce(r.copy().add(k3.copy().mult(timeStep))) / denominator);

        mercury.velocity.add((k1.add(k2.mult(2)).add(k3.mult(2)).add(k4)).mult(timeStep/6))
    }

    function animateMercury() {
        if (!isPlaying) return; 
        r = mercuryToSunVector(); // keep this up top

        switch (integrator) {
            case 0:
                mercury.velocity.add(r.copy().mult( timeStep*radialForce(r) / (mercury.mass*r.mag()))) // Euler
                break;
            case 1:
                rk4solver();
                break;
        }
        
        mercury.position.add(mercury.velocity.copy().mult(timeStep/scale))
        mercuryCircle.attr("cx", sunX - r.x/scale)
        .attr("cy", sunY - r.y/scale);

        // Line drawing logic
        mercury.previousPositions.push({x: sunX - r.x/scale, y: sunY - r.y/scale});
        path.attr("d", lineGenerator(mercury.previousPositions));

        requestAnimationFrame(animateMercury);
    }

    mercuryCircle.attr("cx", sunX - r.x/scale)
        .attr("cy", sunY - r.y/scale);
    animateMercury();

    document.getElementById('clearButton').addEventListener('click', function() {
        if (mercury.previousPositions) {
            mercury.previousPositions = []
            path.attr("d", "");
        }
    });

    document.getElementById('toggleAnimation').addEventListener('click', function() {
        isPlaying = !isPlaying; // Toggle the state
        if (isPlaying) {
            this.innerText = "Pause";
            animateMercury();  // Restart the animation
        } else {
            this.innerText = "Play";
        }
    });

    document.getElementById('resetButton').addEventListener('click', function() {
        mercury.previousPositions = [];
        path.attr("d", "");
        mercury.position.set(sunX + 100, sunY + 100);
        mercury.velocity.set(28806, -28806);
        mercuryCircle.attr("cx", mercury.position.x)
                    .attr("cy", mercury.position.y);
    })

    document.getElementById('methodSelector').addEventListener('change', function() {
        if (document.getElementById('methodSelector').value === "euler") {
            integrator = 0
        } else if (document.getElementById('methodSelector').value === "rk4") {
            integrator = 1
        }
    });

    document.getElementById('lineSelector').addEventListener('change', function() {
        if (document.getElementById('lineSelector').value === "spline") {
            lineGenerator = d3.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                .curve(d3.curveCatmullRom.alpha(0));
        } else if (document.getElementById('lineSelector').value === "edgetoedge") {
            lineGenerator = d3.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; });
        }
    });

    document.getElementById('timeStep').addEventListener('change', function() {
        timeStep = parseFloat(document.getElementById('timeStep').value) * 86400
    });

    document.getElementById('cInput').addEventListener('change', function() {
        c = parseFloat(document.getElementById('cInput').value)
        schwarzschildRadius = 2*G*sunMass/(c**2)
        blackHole.attr("r", schwarzschildRadius/scale)
    });
    
}

