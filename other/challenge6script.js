(() => {

    P = 248.348 // Pluto period in years
    e = 0.25 // Pluto eccentricity

    function _simpsonIntegral(a, b, f, N) {
        // Integrates f(x) with respect to x from lower bound x=a to x=b at resolution N.
        // NB ensure f only has one parameter. Higher N => higher accuracy.
        if (N % 2 !== 0) {
            throw new Error('N must be even.');
        }
        let h = (b - a) / N;
        let sum = f(a) + f(b); // Initial and final points
        // Loop for odd terms
        for (let i = 1; i < N; i += 2) {
            sum += 4 * f(a + i * h);
        }
        // Loop for even terms
        for (let i = 2; i < N - 1; i += 2) {
            sum += 2 * f(a + i * h);
        }
        return (h / 3) * sum;
    }

    function _timeBetweenAngles(startAngle, endAngle, P, e) {
        // For a planet with period P and eccentricity e, return the time
        // in years it takes to pass between startAngle and endAngle
        function integrand(theta) {
            return 1 / (1 - e * Math.cos(theta)) ** 2;
        }

        let firstPart = P * (1 - e ** 2) ** 1.5 / (2 * Math.PI);
        let secondPart = _simpsonIntegral(startAngle, endAngle, integrand, 100);
        return firstPart * secondPart;
    }

    function _angleTimeMatrix(startAngle, endAngle, angleIncrement, P, e) {
        let returnMatrix = [];
        for (let theta = startAngle; theta <= endAngle; theta += angleIncrement) {
            let time = _timeBetweenAngles(startAngle, theta, P, e);
            returnMatrix.push({
                angle: theta,
                time: time
            });
        }

        return returnMatrix;
    }
    let time = 0;
    let timeStepsBetweenLines = 2;
    let timeStep = 0.62087 // years between planet position updates
    let timeInterval = timeStepsBetweenLines * timeStep; // years between spirograph strokes
    let timeSpeed = 1; // constant affecting real time in ms between ticks

    let referenceTime = 0; // ensures we count (years passed since selected planets were changed) rather than (years since t = 0)
    // to avoid discrepancies due to varying timeSteps

    const timeSpeedToInterval = { // maps timeSpeed to the time in ms between loop executes
        1: 100,
        2: 25,
        3: 0
    }

    let animationInterval = setInterval(spiroLoop, timeSpeedToInterval[timeSpeed]); // real time in ms between ticks

    scaleMultiplier = 0; // used to set distance scale - value set by updateScaleMultiplier()

    const epsilon = 0.001; // used for floating point logic - NOT related to eccentricity

    const fastBackwardButton = document.getElementById('fastBackwardButton');

    const fastForwardButton = document.getElementById('fastForwardButton');

    fastBackwardButton.addEventListener('click', function() {
        if (timeSpeed > 1) {
            timeSpeed -= 1;
        }
        clearInterval(animationInterval);
        animationInterval = setInterval(spiroLoop, timeSpeedToInterval[timeSpeed]);
    });

    let isPaused = true;
    pauseButton.addEventListener('click', function() {
        isPaused = !isPaused; // Toggle the isPaused flag
        pauseButton.textContent = isPaused ? '▶️' : '⏸️'; // Toggle the button's icon/text

        // If user has dragged planets, recalculate the _angleTimeMatrix for each planet 
        if (anglesChanged) {
            referenceTime = time;
            anglesChanged = false;
            eccChanged = false;
            for (index in selectedPlanets) {
                let planet = selectedPlanets[index];
                planet.table = _angleTimeMatrix(planet.theta, planet.theta + 2 * Math.PI + 0.2, 0.01, planet.period, planet.ecc);
            }
        }
    });

    fastForwardButton.addEventListener('click', function() {
        if (timeSpeed < 3) {
            timeSpeed += 1;
        }
        clearInterval(animationInterval)
        animationInterval = setInterval(spiroLoop, timeSpeedToInterval[timeSpeed])
    });

    //////////////////////////////////////////////////////////////////////////////////////////
    let planets = [];
    let selectedPlanets = [];

    let previousPositions = []; // array that stores spirograph line coordinates
    class Planet {
        constructor(name, period, ecc, a, betaDegrees, startAngle, color) {
            this.name = name;
            this.period = period;
            this.ecc = ecc;
            this.a = a;
            this.table = _angleTimeMatrix(startAngle, startAngle + 2 * Math.PI + 0.2, 0.01, period, ecc); // buffer of 0.2 in endangle to prevent teleporting back to start
            this.beta = betaDegrees * (Math.PI / 180);
            this.color = color;

            // Position variables
            this.r = 1;
            this.theta = 1;

            planets.push(this);
        }

    }

    let mercury = new Planet("Mercury", 0.241, 0.2056, 0.39, 7.0, 0.0, 'gray');
    let venus = new Planet("Venus", 0.615, 0.0068, 0.72, 3.4, 0.0, 'cyan');
    let earth = new Planet("Earth", 1.0, 0.0167, 1.0, 0.0, 0.0, 'pink');
    let mars = new Planet("Mars", 1.881, 0.0934, 1.52, 1.9, 0.0, 'orange');
    let jupiter = new Planet("Jupiter", 11.862, 0.0489, 5.20, 1.3, 0.0, 'purple');
    let saturn = new Planet("Saturn", 29.457, 0.0565, 9.58, 2.5, 0.0, 'black');
    let uranus = new Planet("Uranus", 84.747, 0.046, 19.22, 0.8, 0.0, 'green');
    let neptune = new Planet("Neptune", 166.344, 0.01, 30.246, 1.77, 0.0, 'blue');
    let pluto = new Planet("Pluto", 248.348, 0.25, 39.509, 17.5, 1.0, 'red');

    let customA = new Planet("Custom A", 200, 0.1, 15, 0, 0.0, 'black');
    let customB = new Planet("Custom B", 150, 0.3, 10, 1, 0.0, 'brown');

    function timeToAngle(t, table, period) {
        t = t % period;

        // Binary search
        let low = 0;
        let high = table.length - 1;

        while (low <= high) {
            let mid = Math.floor((low + high) / 2);

            if (table[mid].time === t) {
                return table[mid].angle; // Exact match found
            } else if (table[mid].time < t) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        // At this point, 'low' is the index of the smallest time value that is greater than t
        // and 'high' is the index of the largest time value that is less than t
        if (low >= table.length || high < 0) {
            return null; // t is out of range
        }

        // Linear interpolation between the values at indexes 'low' and 'high'
        let t0 = table[high].time;
        let theta0 = table[high].angle;
        let t1 = table[low].time;
        let theta1 = table[low].angle;

        return theta0 + (t - t0) * (theta1 - theta0) / (t1 - t0);
    }

    function angleToRadius(angle, eccentricity, a) {
        let firstPart = scaleMultiplier * a * (1 - eccentricity ** 2);
        let secondPart = 1 - eccentricity * Math.cos(angle);
        return firstPart / secondPart
    }

    function polarToCartesian(r, theta, betaCorrection) {
        return {
            x: r * Math.cos(theta) * Math.cos(betaCorrection) + centerX,
            y: -r * Math.sin(theta) + centerY
        };
    }

    function polarToCartesianPlane(r, theta) { // polarToCartesian with no beta correction
        return {
            x: r * Math.cos(theta) + centerX,
            y: -r * Math.sin(theta) + centerY
        };
    }

    function cartesianPosition(planet) {
        return polarToCartesian(planet.r, planet.theta, planet.beta);
    }

    function cartesianToPolar(x, y, beta) {
        // Adjust the coordinates relative to the center of the canvas
        //x -= canvas.width / 2;
        x -= centerX;
        y -= canvas.height / 2;

        x /= Math.cos(beta);

        let r = Math.sqrt(x * x + y * y);
        let theta = Math.atan2(-y, x); // Assuming you want to keep the angle negation
        return {
            radius: r,
            angle: theta
        };
    }


    ////////////////////////////////////////////////////////////////////////////////////////////

    function updateScaleMultiplier() {
        // Find the largest semi-major axis out of the two planets
        let maxSemiMajorAxis = Math.max(...selectedPlanets.map(planet => planet.a));
        scaleMultiplier = 200 / maxSemiMajorAxis;
    }


    const planetDropdown1 = document.getElementById('planetDropdown1');
    const planetDropdown2 = document.getElementById('planetDropdown2');

    const timeStepInput = document.getElementById('timeStepInput');

    function getPlanetByName(name) {
        return planets.find(planet => planet.name === name);
    }

    let oldPlanet = null;

    function updateParamsAfterPlanetSelection() {
        selectedPlanets = [];
        selectedPlanets.push(getPlanetByName(planetDropdown1.value));
        selectedPlanets.push(getPlanetByName(planetDropdown2.value));

        let biggestPlanet = selectedPlanets.find(planet => planet.a === Math.max(...selectedPlanets.map(planet => planet.a)));
        timeStep = biggestPlanet.period / 400;
        timeInterval = 2 * timeStep

        timeStepInput.value = timeStep;

        updateScaleMultiplier();
        previousPositions = []

        oldPlanet.table = _angleTimeMatrix(oldPlanet.theta, oldPlanet.theta + 2 * Math.PI + 0.2, 0.01, oldPlanet.period, oldPlanet.ecc);
        referenceTime = time;
        updatePositions();
        drawAllElements();
    }

    planetDropdown1.addEventListener('change', function() {
        const selectedPlanet = getPlanetByName(planetDropdown1.value);
        updateDropdownOptions(selectedPlanet, planetDropdown2);
        oldPlanet = getPlanetByName(planetDropdown2.value);

        updateParamsAfterPlanetSelection();
        showCustomOptions();
    });

    planetDropdown2.addEventListener('change', function() {
        const selectedPlanet = getPlanetByName(planetDropdown2.value);
        updateDropdownOptions(selectedPlanet, planetDropdown1);
        oldPlanet = getPlanetByName(planetDropdown1.value);

        updateParamsAfterPlanetSelection();
        showCustomOptions();
    });

    function showCustomOptions() {
        // Hide all custom option containers
        document.querySelectorAll('.custom-options').forEach(el => el.style.display = 'none');

        if (selectedPlanets.some(planet => planet.name === 'Custom A')) {
            document.getElementById('customAOptions').style.display = 'block';
        }

        if (selectedPlanets.some(planet => planet.name === 'Custom B')) {
            document.getElementById('customBOptions').style.display = 'block';
        }
    }


    function updateDropdownOptions(selectedPlanet, dropdownToUpdate) {
        // Go through each option in the dropdown
        for (let i = 0; i < dropdownToUpdate.options.length; i++) {
            let option = dropdownToUpdate.options[i];

            // If the option matches the selected planet, disable it
            if (option.value === selectedPlanet.name) {
                option.disabled = true;
            } else {
                option.disabled = false; // Ensure other options are enabled
            }
        }
    }

    function populateDropdown(dropdown) {
        planets.forEach(planet => {
            const option = document.createElement('option');
            option.value = planet.name;
            option.text = planet.name
            dropdown.appendChild(option);
        });
    }

    const increaseStepsButton = document.getElementById('increaseSteps');
    const decreaseStepsButton = document.getElementById('decreaseSteps');
    const stepDisplay = document.getElementById('stepDisplay');

    stepDisplay.textContent = timeStepsBetweenLines;

    increaseStepsButton.addEventListener('click', function() {
        timeStepsBetweenLines++;
        stepDisplay.textContent = timeStepsBetweenLines;
        timeInterval = timeStepsBetweenLines * timeStep;
        if (isPaused && previousPositions.length > 0) {
            time -= timeStep;
            ticker.textContent = `Time: ${Math.round(time)} years`;
        }

        drawAllElements();
    });

    decreaseStepsButton.addEventListener('click', function() {
        if (timeStepsBetweenLines > 1) { // Ensure it doesn't go below 1
            timeStepsBetweenLines--;
            stepDisplay.textContent = timeStepsBetweenLines;
            timeInterval = timeStepsBetweenLines * timeStep;
            if (isPaused && previousPositions.length > 0) {
                time -= timeStep;
                ticker.textContent = `Time: ${Math.round(time)} years`;
            }

            drawAllElements();
        }
    });

    timeStepInput.addEventListener('input', function() {
        referenceTime = time;
        timeStep = parseFloat(timeStepInput.value);
        timeInterval = timeStepsBetweenLines * timeStep;

        if (isPaused && previousPositions.length > 0) {
            time -= timeStep;
            ticker.textContent = `Time: ${Math.round(time)} years`;
        }

        drawAllElements();
    });

    // Startup
    populateDropdown(planetDropdown1);
    populateDropdown(planetDropdown2);
    planetDropdown1.value = "Neptune";
    planetDropdown2.value = "Pluto";
    Array.from(planetDropdown1.options).find(option => option.value === 'Pluto').disabled = true;
    Array.from(planetDropdown2.options).find(option => option.value === 'Neptune').disabled = true;
    selectedPlanets = [pluto, neptune]
    timeStepInput.value = timeStep;

    ///////////////////////////////////////////////////////////////////////////////////////

    function setCustomInterfaceValues() {
        // Set values for Custom A
        document.getElementById('customAPeriod').value = customA.period;
        document.getElementById('customAA').value = customA.a;
        document.getElementById('customAEccentricityValue').innerText = customA.ecc;
        document.getElementById('customAEccentricity').value = customA.ecc;
        document.getElementById('customABetaValue').innerText = parseFloat(customA.beta.toFixed(1));
        document.getElementById('customABeta').value = customA.beta;

        // Set values for Custom B
        document.getElementById('customBPeriod').value = customB.period;
        document.getElementById('customBA').value = customB.a;
        document.getElementById('customBEccentricityValue').innerText = customB.ecc;
        document.getElementById('customBEccentricity').value = customB.ecc;
        document.getElementById('customBBetaValue').innerText = parseFloat(customB.beta.toFixed(1));
        document.getElementById('customBBeta').value = customB.beta;
    }
    setCustomInterfaceValues();

    // CUSTOM A
    document.getElementById('customAPeriod').addEventListener('change', function() {
        if (Math.abs((time - referenceTime) % timeInterval) < epsilon ||
            Math.abs((time - referenceTime) % timeInterval - timeInterval) < epsilon) {
            console.log('No artifact')
        } else {
            console.log('artifact') // I know what causes this bug, but have absolutely no idea how to fix it
        }

        referenceTime = time;
        customA.period = parseFloat(document.getElementById('customAPeriod').value);
        selectedPlanets.forEach(planet => {
            planet.table = _angleTimeMatrix(planet.theta, planet.theta + 2 * Math.PI + 0.2, 0.01, planet.period, planet.ecc);
        })
    });

    document.getElementById('customAEccentricity').addEventListener('input', function() {
        let currentValue = this.value;
        document.getElementById('customAEccentricityValue').innerText = currentValue;
        customA.ecc = parseFloat(currentValue);

        referenceTime = time;
        selectedPlanets.forEach(planet => {
            planet.table = _angleTimeMatrix(planet.theta, planet.theta + 2 * Math.PI + 0.2, 0.01, planet.period, planet.ecc);
        })
        updatePositions();
        drawAllElements();
    });

    document.getElementById('customABeta').addEventListener('input', function() {
        let currentValue = this.value;
        document.getElementById('customABetaValue').innerText = currentValue;
        customA.beta = parseFloat(currentValue) * (Math.PI / 180);

        referenceTime = time;
        selectedPlanets.forEach(planet => {
            planet.table = _angleTimeMatrix(planet.theta, planet.theta + 2 * Math.PI + 0.2, 0.01, planet.period, planet.ecc);
        })
        updatePositions();
        drawAllElements();
    });

    document.getElementById('customAA').addEventListener('change', function() {
        previousPositions = [];

        referenceTime = time;
        customA.a = parseFloat(document.getElementById('customAA').value);
        selectedPlanets.forEach(planet => {
            planet.table = _angleTimeMatrix(planet.theta, planet.theta + 2 * Math.PI + 0.2, 0.01, planet.period, planet.ecc);
        })
        updateScaleMultiplier();
        updatePositions();
        drawAllElements();
    });

    // CUSTOM B

    document.getElementById('customBPeriod').addEventListener('change', function() {
        if (Math.abs((time - referenceTime) % timeInterval) < epsilon ||
            Math.abs((time - referenceTime) % timeInterval - timeInterval) < epsilon) {
            console.log('No artifact')
        } else {
            console.log('artifact') // I know what causes this bug, but have absolutely no idea how to fix it
        }

        referenceTime = time;
        customB.period = parseFloat(document.getElementById('customBPeriod').value);
        selectedPlanets.forEach(planet => {
            planet.table = _angleTimeMatrix(planet.theta, planet.theta + 2 * Math.PI + 0.2, 0.01, planet.period, planet.ecc);
        })
    });

    document.getElementById('customBEccentricity').addEventListener('input', function() {
        let currentValue = this.value;
        document.getElementById('customBEccentricityValue').innerText = currentValue;
        customB.ecc = parseFloat(currentValue);

        referenceTime = time;
        selectedPlanets.forEach(planet => {
            planet.table = _angleTimeMatrix(planet.theta, planet.theta + 2 * Math.PI + 0.2, 0.01, planet.period, planet.ecc);
        })
        updatePositions();
        drawAllElements();
    });

    document.getElementById('customBBeta').addEventListener('input', function() {
        let currentValue = this.value;
        document.getElementById('customBBetaValue').innerText = currentValue;
        customB.beta = parseFloat(currentValue) * (Math.PI / 180);

        referenceTime = time;
        selectedPlanets.forEach(planet => {
            planet.table = _angleTimeMatrix(planet.theta, planet.theta + 2 * Math.PI + 0.2, 0.01, planet.period, planet.ecc);
        })
        updatePositions();
        drawAllElements();
    });

    document.getElementById('customBA').addEventListener('change', function() {
        previousPositions = [];

        referenceTime = time;
        customB.a = parseFloat(document.getElementById('customBA').value);
        selectedPlanets.forEach(planet => {
            planet.table = _angleTimeMatrix(planet.theta, planet.theta + 2 * Math.PI + 0.2, 0.01, planet.period, planet.ecc);
        })
        updateScaleMultiplier();
        updatePositions();
        drawAllElements();
    });

    ////////////////////////////////////////////////////////////////////////////////////////////

    const ticker = document.getElementById('timeTicker');

    const canvas = document.getElementById('orbitCanvas');
    var ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2; // polar coords origin
    const centerY = canvas.height / 2;

    /*hooks = ["moveTo", "lineTo", "arc"]
    window.hooked = []
    for (i=0;i<hooks.length;i++) {
        hooked.push(ctx[hooks[i]])
        ctx[hooks[i]] = eval(`(a,b,c,d,e) => {
            console.log(a,b,c,d,e)
            window.hooked[`+i+`](a,b,c,d,e)
        }`)
    }*/
    if (!window["challenge_6_shim_executed"]) {
        window.challenge_6_shim_executed = true
        const originalMoveTo = CanvasRenderingContext2D.prototype.moveTo;
        const originalLineTo = CanvasRenderingContext2D.prototype.lineTo;
        const originalArc = CanvasRenderingContext2D.prototype.arc;
        window.offsets = [-120, 0]

        CanvasRenderingContext2D.prototype.moveTo = function(x, y) {
            originalMoveTo.call(this, window.offsets[0]+x, window.offsets[1]+y);
        };
        CanvasRenderingContext2D.prototype.lineTo = function(x, y) {
            originalLineTo.call(this, window.offsets[0]+x, window.offsets[1]+y);
        };
        CanvasRenderingContext2D.prototype.arc = function(a,b,c,d,e) {
            originalArc.call(this, window.offsets[0]+a, window.offsets[1]+b, c, d, e);
        };
    }

    function drawSpirographLines() {
        ctx.strokeStyle = 'black'; // Set this to a color that's visible against your canvas's background
        ctx.lineWidth = 0.2;

        for (let pos of previousPositions) {
            ctx.beginPath();
            ctx.moveTo(pos[0].x, pos[0].y);
            ctx.lineTo(pos[1].x, pos[1].y);
            ctx.stroke();
        }
    }
    const clearButton = document.getElementById('clearButton');
    clearButton.addEventListener('click', function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (isPaused && previousPositions.length > 0) {
            time -= timeStep;
            ticker.textContent = `Time: ${Math.round(time)} years`;
        }
        previousPositions = []; // Clear the array
        drawAllElements();
    });

    let planetRadius = 5; // radius of circle representing planet
    function drawPlanet(planet) {
        const position = cartesianPosition(planet);

        // Draw the planet
        ctx.beginPath();
        ctx.arc(position.x, position.y, planetRadius, 0, 2 * Math.PI);
        ctx.fillStyle = planet.color;
        ctx.fill();
    }

    function drawEllipticalOrbit(eccentricity, a, color, betaCorrection) {
        ctx.beginPath();

        // Start at angle 0
        let startPos = polarToCartesian(angleToRadius(0, eccentricity, a), 0, betaCorrection);
        ctx.moveTo(startPos.x, startPos.y);

        // Loop through all angles from 0 to 2π
        for (let theta = 0; theta <= 2 * Math.PI + 0.007; theta += 0.01) {
            let r = angleToRadius(theta, eccentricity, a);
            let position = polarToCartesian(r, theta, betaCorrection);
            ctx.lineTo(position.x, position.y);
        }

        ctx.strokeStyle = color;
        ctx.stroke();
    }

    function drawSun() {
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 0.05 * scaleMultiplier, 0, 2 * Math.PI);
        ctx.fillStyle = 'yellow';
        ctx.fill();
    }

    function updatePositions() {
        for (let index in selectedPlanets) {
            let planet = selectedPlanets[index];
            planet.theta = timeToAngle(time - referenceTime, planet.table, planet.period);
            planet.r = angleToRadius(planet.theta, planet.ecc, planet.a);
        }
    }

    function drawPlanets() {
        ctx.lineWidth = 0.5;
        selectedPlanets.forEach(planet => {
            drawEllipticalOrbit(planet.ecc, planet.a, planet.color, planet.beta);
            drawPlanet(planet)
        })
    }

    function drawAllElements() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSun(); // ??
        drawSpirographLines();
        drawPlanets();
    }

    function findIntersections(a, ecc, beta, x1, y1, x2, y2) {
        // Calculate the slope of the line
        let m = (y2 - y1) / (x2 - x1);

        // Calculate the discriminant
        let discriminant = Math.sqrt(
            (ecc - 1) * (ecc + 1) * (a * a * ecc * ecc * m * m * Math.cos(beta) * Math.cos(beta) + a * a * ecc * ecc - a * a * m * m * Math.cos(beta) * Math.cos(beta) - a * a - 2 * a * ecc * m * m * x1 * Math.cos(beta) + 2 * a * ecc * m * y1 * Math.cos(beta) + m * m * x1 * x1 - 2 * m * x1 * y1 + y1 * y1)
        );

        // Calculate x coordinates of the intersection points
        let xInt1 = (-a * ecc * ecc * ecc + a * ecc + m * m * x1 * Math.cos(beta) - m * y1 * Math.cos(beta) - discriminant) * Math.cos(beta) / (-ecc * ecc + m * m * Math.cos(beta) * Math.cos(beta) + 1);
        let xInt2 = (-a * ecc * ecc * ecc + a * ecc + m * m * x1 * Math.cos(beta) - m * y1 * Math.cos(beta) + discriminant) * Math.cos(beta) / (-ecc * ecc + m * m * Math.cos(beta) * Math.cos(beta) + 1);

        // Calculate y coordinates using the equation of the line
        let yInt1 = m * (xInt1 - x1) + y1;
        let yInt2 = m * (xInt2 - x1) + y1;

        return [{
                x: xInt1,
                y: -yInt1
            },
            {
                x: xInt2,
                y: -yInt2
            }
        ];
    }




    function spiroLoop() {
        if (isPaused) {
            return;
        }
        // Log data points for spirograph
        if (Math.abs((time - referenceTime) % timeInterval) < epsilon ||
            Math.abs((time - referenceTime) % timeInterval - timeInterval) < epsilon) { // to avoid floating-point inaccuracies
            previousPositions.push([cartesianPosition(selectedPlanets[0]), cartesianPosition(selectedPlanets[1])]);
        }
        time += timeStep;
        ticker.textContent = `Time: ${Math.round(time)} years`;

        updatePositions();
        drawAllElements();
    }

    updateScaleMultiplier();
    updatePositions();
    drawAllElements();

    ///////////////////////////////////////////////////////////////////////////////
    let planetBeingDragged = null;

    canvas.addEventListener('mousedown', function(event) {
        if (!isPaused) {
            return;
        }
        let mouseX = event.clientX - window.offsets[0] - canvas.getBoundingClientRect().left;
        let mouseY = event.clientY - window.offsets[1] - canvas.getBoundingClientRect().top;

        // Check each planet
        for (const planet of selectedPlanets) { // or whatever planets you have
            let planetX = cartesianPosition(planet).x;
            let planetY = cartesianPosition(planet).y;
            let distanceSquared = (planetX - mouseX) ** 2 + (planetY - mouseY) ** 2;

            if (distanceSquared <= (1.5 * planetRadius) ** 2) { // assuming each planet has a radius property, and with a buffer factor for better user experience
                planetBeingDragged = planet;
                break;
            }
        }
    });
    let anglesChanged = false;

    function distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }

    canvas.addEventListener('mousemove', function(event) {
        if (planetBeingDragged) {
            anglesChanged = true;
            let mouseX = event.clientX - window.offsets[0] - canvas.getBoundingClientRect().left;
            let mouseY = event.clientY - window.offsets[1] - canvas.getBoundingClientRect().top;

            console.log(mouseX - centerX, mouseY - centerY)

            points = findIntersections(planetBeingDragged.a * scaleMultiplier, planetBeingDragged.ecc, planetBeingDragged.beta,
                (cartesianEllipseCenter(planetBeingDragged).x - centerX), 0, (mouseX - centerX), (centerY - mouseY))

            let dist1 = distance(mouseX, mouseY, points[0].x + centerX, points[0].y + centerY);
            let dist2 = distance(mouseX, mouseY, points[1].x + centerX, points[1].y + centerY);

            // Determine which point is closer
            let closerPoint = dist1 < dist2 ? points[0] : points[1];

            planetBeingDragged.theta = cartesianToPolar(closerPoint.x + centerX, closerPoint.y + centerY, planetBeingDragged.beta).angle;
            planetBeingDragged.r = angleToRadius(planetBeingDragged.theta, planetBeingDragged.ecc, planetBeingDragged.a);

            drawAllElements();
        }

    });

    function cartesianEllipseCenter(planet) {
        return {
            x: centerX + planet.a * planet.ecc * scaleMultiplier * Math.cos(planet.beta),
            y: centerY
        }
    }

    canvas.addEventListener('mouseup', function() {
        planetBeingDragged = null;
    });

    // show the thing
    document.getElementById("galaxyContainer").style.visibility = "visible"

})()