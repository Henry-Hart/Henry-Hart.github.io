let scale = 5 * 10**8 // m/pixel 
// k35 scale - 5 * 10**8

class Planet {
    constructor(mass, position, velocity) {
        this.mass = mass; // kg
        this.position = position; // Object with x and y properties
        this.velocity = velocity; // Object with x and y properties
        this.force = { x: 0, y: 0 }; // Accumulated force from other planets, initialized to 0
        this.previousPositions = []
    }

    // Apply gravitational force from another planet
    applyGravityFrom(otherPlanet) {
        const G = 6.67430e-11; // Gravitational constant
        let dx = (otherPlanet.position.x - this.position.x) * scale;
        let dy = (otherPlanet.position.y - this.position.y) * scale;
        const distance = dx**2 + dy**2 ;
        const forceMagnitude = G * this.mass * otherPlanet.mass / distance;

        // Calculate force components
        const fx = forceMagnitude * dx / Math.sqrt(distance);
        const fy = forceMagnitude * dy / Math.sqrt(distance);

        // Accumulate force
        this.force.x += fx;
        this.force.y += fy;
    }
}

// 2. Function to update planet positions based on their velocities and forces
function updatePositions(planets, dt) {
    for (const planet of planets) {
        // Update velocity based on accumulated force and planet's mass
        planet.velocity.x += planet.force.x / planet.mass * dt;
        planet.velocity.y += planet.force.y / planet.mass * dt;

        // Update position based on velocity
        planet.position.x += planet.velocity.x * dt / scale;
        planet.position.y += planet.velocity.y * dt / scale;

        // Reset force for next iteration
        planet.force.x = 0;
        planet.force.y = 0;
    }
}


// buttons


pauseButton = document.getElementById("pauseButton")
pauseButton.addEventListener('click', function() {
    animate_toggle()
    pauseButton.textContent = animating ? '⏸️' : '▶️'
});
resetButton = document.getElementById("resetButton")
resetButton.addEventListener('click', function() {
    e = {target:{value: document.getElementById("systemSelect").value}}
    reset(e)
});
tickRate = document.getElementById("tickrate")
tickRate.addEventListener('change', function() {
    foo = tickRate.value*1 ? tickRate.value*1 : 0
    timeStep = foo * 24 * 3600
});


// --


let svgWidth = 700, svgHeight = 500;
let svg = d3.select("#svgContainer").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

const sunMass = 1.981 * 10**30
const jupiterMass = 1.898 * 10**27

k35initialVelocity = 30000
let kepler35A = new Planet(0.8877 * sunMass, { x: 200, y: 200 }, { x: -k35initialVelocity, y: k35initialVelocity });
let kepler35B = new Planet(0.81 * sunMass, { x: 237.5, y: 237.5 }, { x: 0.8877/0.81 * k35initialVelocity, y: -0.8877/0.81 * k35initialVelocity });
let kepler35b = new Planet(0.127 * jupiterMass, {x : 380, y: 220}, { x: 0, y: -55700});

let planets = [kepler35A, kepler35B, kepler35b];

let time = 0
const timeDisplayElement = document.getElementById("timeDisplay");
// Create circles for each planet in the SVG
let circles = svg.selectAll("circle")
    .data(planets)
    .enter().append("circle")
    .attr("r", d => 4) 
    .attr("cx", d => d.position.x)
    .attr("cy", d => d.position.y);

let lineGenerator = d3.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .curve(d3.curveCatmullRom.alpha(0));

let paths = svg.selectAll(".planet-path")
    .data(planets)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "blue")
    .attr("stroke-width", 1)
    .classed("planet-path", true);

let timeStep = 0.07*24*3600
animating = false
function tick() {
    // Compute gravitational forces
    for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
            planets[i].applyGravityFrom(planets[j]);
            planets[j].applyGravityFrom(planets[i]);
        }

        planets[i].previousPositions.push({x: planets[i].position.x, y: planets[i].position.y});
    }

    // Update positions
    updatePositions(planets, timeStep);
    time += timeStep;
    let timeInDays = time / (24 * 60 * 60);
    timeDisplayElement.innerText = `Time: ${timeInDays.toFixed(1)} days`;

    // Update d3.js circles' positions
    circles
        .attr("cx", d => d.position.x)
        .attr("cy", d => d.position.y);

    paths.attr("d", d => lineGenerator(d.previousPositions));

    if(animating) requestAnimationFrame(tick);
}

animate_toggle = () => {
    animating = !animating
    if(animating) {
        // Start the simulation
        tick();
    } else {

    }
}

// Get the select element by its ID
const systemSelect = document.getElementById('systemSelect');

reset = function(event) {
    if (event.target.value === 'kepler34') {
        scale = 10**9
        time = 0
        timeStep = 0.14*24*3600
        tickRate.value = "0.14"

        k34initialVelocity = 18000
        let kepler34A = new Planet(1.048 * sunMass, { x: 200, y: 200 }, { x: -k34initialVelocity, y: k34initialVelocity });
        let kepler34B = new Planet(1.021 * sunMass, { x: 233, y: 233 }, { x: 1.048/1.021 * k34initialVelocity, y: -1.048/1.021 * k34initialVelocity });
        let kepler34b = new Planet(0.22 * jupiterMass, {x : 380, y: 220}, { x: 0, y: -40900});
        planets = [kepler34A, kepler34B, kepler34b]
        planets.forEach(planet => {
            planet.previousPositions = []
        })
        let circleSelection = svg.selectAll("circle")
        .data(planets);

        circleSelection
        .attr("cx", d => d.position.x)
        .attr("cy", d => d.position.y);

        circleSelection.enter()
        .append("circle")
        .attr("r", 4)
        .attr("cx", d => d.position.x)
        .attr("cy", d => d.position.y);

        circleSelection.exit().remove();

        let pathSelection = svg.selectAll("path")
                                    .data(planets);

        pathSelection
            .attr("d", d => lineGenerator(d.previousPositions))
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 1);

        // For any new planets, append new paths
        pathSelection.enter()
            .append("path")
            .attr("d", d => lineGenerator(d.previousPositions))
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 1);

        // Remove paths that no longer have associated data
        pathSelection.exit().remove();

    } else if (event.target.value === 'kepler35') {
        scale = 5 * 10**8
        time = 0
        timeStep = 0.07*24*3600
        tickRate.value = "0.07"

        kepler35A = new Planet(0.8877 * sunMass, { x: 200, y: 200 }, { x: -k35initialVelocity, y: k35initialVelocity });
        kepler35B = new Planet(0.81 * sunMass, { x: 237.5, y: 237.5 }, { x: 0.8877/0.81 * k35initialVelocity, y: -0.8877/0.81 * k35initialVelocity });
        kepler35b = new Planet(0.127 * jupiterMass, {x : 380, y: 220}, { x: 0, y: -55700});

        planets = [kepler35A, kepler35B, kepler35b];
        planets.forEach(planet => {
            planet.previousPositions = []
        })
        let circleSelection = svg.selectAll("circle")
        .data(planets);

        circleSelection
        .attr("cx", d => d.position.x)
        .attr("cy", d => d.position.y);

        circleSelection.enter()
        .append("circle")
        .attr("r", 4)
        .attr("cx", d => d.position.x)
        .attr("cy", d => d.position.y);

        circleSelection.exit().remove();

        let pathSelection = svg.selectAll("path")
                                    .data(planets);

        pathSelection
            .attr("d", d => lineGenerator(d.previousPositions))
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 1);

        // For any new planets, append new paths
        pathSelection.enter()
            .append("path")
            .attr("d", d => lineGenerator(d.previousPositions))
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 1);

        // Remove paths that no longer have associated data
        pathSelection.exit().remove();
    }
}

// Add an event listener for the change event
systemSelect.addEventListener('change', reset);

