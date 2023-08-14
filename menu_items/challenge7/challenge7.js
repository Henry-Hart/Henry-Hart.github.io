
// yuck yuck yuck
const canvas = document.getElementById('keplerGraph');

let planets = [];
let selectedPlanets = [];

let previousPositions = []; // array that stores spirograph line coordinates
class Planet {
    constructor(name, period, ecc, a, betaDegrees, startAngle, color) {
        this.name = name;
        this.period = period;
        this.ecc = ecc;
        this.a = a;
        this.table = angleTimeMatrix(startAngle, startAngle+2*Math.PI +0.2, 0.01, period, ecc); // buffer of 0.2 in endangle to prevent teleporting back to start
        this.beta = betaDegrees * (Math.PI / 180);
        this.color = color;

        // Position variables
        this.r = 1;
        this.theta = 1;

        planets.push(this);
    }

}

//const ticker = document.getElementById('timeTicker');

let planetRadius = 5; // radius of circle representing planet
// changed 0.001 to 0.01 then changed back...
const epsilon = 0.001; // used for floating point logic - NOT related to eccentricity

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

function cartesianPosition(planet) {return polarToCartesian(planet.r, planet.theta, planet.beta);}

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

function populateDropdown(dropdown) {
    planets.forEach(planet => {
        const option = document.createElement('option');
        option.value = planet.name;
        option.text = planet.name
        dropdown.appendChild(option);
    });
}

function getPlanetByName(name) {return planets.find(planet => planet.name === name);}

function polarToCartesian(r, theta, betaCorrection) {
    return {
        x: r * Math.cos(theta) * Math.cos(betaCorrection) + centerX,
        y: -r * Math.sin(theta) + centerY
    };
}

const centerX = canvas.width / 2; // polar coords origin
const centerY = canvas.height / 2;

//const ctx = canvas.getContext('2d');

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

let c7time = 0;
let c7timeStep = 0.01;
let c7timeSpeed = 1;
let c7timeInterval = 1 * c7timeStep;
let c7referenceTime = 0;
const c7timeSpeedToInterval = { // maps timeSpeed to the time in ms between loop executes
    1 : 100, 
    2 : 25, 
    3 : 0
}

let c7anglesChanged = false;
let c7isPaused = true;
let c7eccChanged = false;
let ptoPreviousPositions = [];

let ptoScaleMultiplier = 0.6;

let c7animationInterval = setInterval(c7loop, c7timeSpeedToInterval[c7timeSpeed]); // real time in ms between ticks
c7pauseButton.addEventListener('click', function() {
    c7isPaused = !c7isPaused; // Toggle the isPaused flag
    c7pauseButton.textContent = c7isPaused ? '▶️' : '⏸️'; // Toggle the button's icon/text

    // If user has dragged planets, recalculate the angleTimeMatrix for each planet 
    if (c7anglesChanged) {
        c7referenceTime = c7time;
        c7anglesChanged = false;
        c7eccChanged = false;
        let allPlanets = [...orbitingPlanets, centralPlanet];
        for (index in allPlanets) {
            let planet = allPlanets[index];
            planet.table = angleTimeMatrix(planet.theta, planet.theta+2*Math.PI +0.2, 0.01, planet.period, planet.ecc);
        }
    }
});

c7clearButton.addEventListener('click', function() {
    planets.forEach(planet => {
        planet.previousPositions = []
    })
    c7drawAllElements();
})

c7fastForwardButton.addEventListener('click', function() {
    if (c7timeSpeed < 3 ) {
        c7timeSpeed += 1;
    }
    clearInterval(c7animationInterval);
    c7animationInterval = setInterval(c7loop, c7timeSpeedToInterval[c7timeSpeed]);
});
c7fastBackwardButton.addEventListener('click', function() {
    if (c7timeSpeed > 1) {
        c7timeSpeed -= 1;
    }
    clearInterval(c7animationInterval);
    c7animationInterval = setInterval(c7loop, c7timeSpeedToInterval[c7timeSpeed]);
});

let centralSelect = document.getElementById('centralSelect')

$(document).on('click', '.keep-open', function (e) {
    e.stopPropagation();
});

function populateOrbitals() {
    // Get the dropdown menu
    let dropdownMenu = document.querySelector('.dropdown-menu');

    // Clear the dropdown menu
    dropdownMenu.innerHTML = '';

    // Iterate through the planets array
    planets.forEach(planet => {
        // Create a new div element for each planet
        let planetDiv = document.createElement('div');
        planetDiv.classList.add('form-check', 'dropdown-item');

        // Create a checkbox input for each planet
        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('form-check-input');
        checkbox.id = planet.name;

        // Create a label for the checkbox
        let label = document.createElement('label');
        label.classList.add('form-check-label');
        label.htmlFor = planet.name;
        label.textContent = planet.name;

        // Append the checkbox and label to the div
        planetDiv.appendChild(checkbox);
        planetDiv.appendChild(label);

        // Append the div to the dropdown menu
        dropdownMenu.appendChild(planetDiv);

        
        if (["Mercury", "Venus", "Mars"].includes(planet.name)) {
            checkbox.checked = true; // Set the checkbox to be ticked
        }
        if(planet.name === "Earth"){
            checkbox.disabled = true;    // Disable the checkbox
            checkbox.checked = false;    // Uncheck the checkbox
            planetDiv.classList.add('disabled');
        }
    });

    
}

let centralPlanet = "";

document.getElementById('centralSelect').addEventListener('change', function() {
    let oldCentralPlanet = centralPlanet; // Save the current central planet before changing it.
    let centralSelectedPlanet = this.value; // The newly selected central planet
    centralPlanet = getPlanetByName(this.value);

    // Get all checkboxes from the orbital dropdown
    let orbitalCheckboxes = document.querySelectorAll('.dropdown-menu .form-check-input');

    orbitalCheckboxes.forEach(checkbox => {
        let planetDiv = checkbox.parentElement;

        if (checkbox.id === centralSelectedPlanet) {
            checkbox.disabled = true;    // Disable the checkbox
            checkbox.checked = false;    // Uncheck the checkbox
            planetDiv.classList.add('disabled'); // Add the Bootstrap's disabled class
        } else {
            checkbox.disabled = false;   // Enable other checkboxes
            planetDiv.classList.remove('disabled'); // Remove the disabled class from other options
        }

        // Check the checkbox for the old central planet
        if (oldCentralPlanet && checkbox.id === oldCentralPlanet.name) {
            checkbox.checked = true;
        }
    });

    orbitingPlanets = []
    let checkedCheckboxes = document.querySelectorAll('.dropdown-menu .form-check-input:checked');
    checkedCheckboxes.forEach(checkbox => {
        orbitingPlanets.push(getPlanetByName(checkbox.id));
    });
    kepUpdateScaleMultiplier();
    kepUpdatePositions();
    planets.forEach(planet => {
        planet.previousPositions = []
    })
    c7drawAllElements();
    c7showCustomOptions()

    let allPlanets = [...orbitingPlanets, centralPlanet];
    let biggestPlanet = allPlanets.find(planet => planet.a === Math.max(...allPlanets.map(planet => planet.a)));
    c7timeStep = biggestPlanet.period / 1000;
    c7timeInterval = c7timeStep

    c7timeStepInput.value = c7timeStep;
});


function kepUpdateScaleMultiplier() {
    // Find the largest semi-major axis out of the two planets
    let allPlanets = [...orbitingPlanets, centralPlanet];
    let maxSemiMajorAxis = Math.max(...allPlanets.map(planet => planet.a));
    kepScaleMultiplier = 200 / maxSemiMajorAxis;
}

document.querySelector('.dropdown-menu').addEventListener('change', function(event) {
    // Update orbitingPlanets
    orbitingPlanets = [];

    // Get all checked checkboxes from the dropdown
    let checkedCheckboxes = document.querySelectorAll('.dropdown-menu .form-check-input:checked');

    // Add the checked planets to the orbitingPlanets array
    checkedCheckboxes.forEach(checkbox => {
        orbitingPlanets.push(getPlanetByName(checkbox.id));
    });

    planets.forEach(planet => {
        planet.previousPositions = []
    })

    kepUpdateScaleMultiplier();
    kepUpdatePositions();
    c7drawAllElements();
    c7showCustomOptions()

    let allPlanets = [...orbitingPlanets, centralPlanet];
    let biggestPlanet = allPlanets.find(planet => planet.a === Math.max(...allPlanets.map(planet => planet.a)));
    c7timeStep = biggestPlanet.period / 1000;
    c7timeInterval = c7timeStep

    c7timeStepInput.value = c7timeStep;
});

c7timeStepInput.addEventListener('input', function() {
    c7referenceTime = c7time;
    c7timeStep = parseFloat(c7timeStepInput.value);
    c7timeInterval = c7timeStep;
    c7timeTicker.textContent = `Time: ${Math.round(c7time)} years`;


    c7drawAllElements();
});

function c7showCustomOptions() {
    let allPlanets = [...orbitingPlanets, centralPlanet];
    document.querySelectorAll('.custom-options').forEach(el => el.style.display = 'none');
    if (allPlanets.some(planet => planet.name === 'Custom A')) {
        document.getElementById('c7customAOptions').style.display = 'inline-block';
    }

    if (allPlanets.some(planet => planet.name === 'Custom B')) {
        document.getElementById('c7customBOptions').style.display = 'inline-block';
    } 
}



// Startup
populateDropdown(centralSelect)
populateOrbitals();
centralSelect.value = "Earth"
centralPlanet = getPlanetByName(centralSelect.value)
planets.forEach(planet => {
    planet.previousPositions = []
})
c7timeStepInput.value = c7timeStep;

////////////////////////////////////////////////////////////////////////////////////

function c7setCustomInterfaceValues() {
    // Set values for Custom A
    document.getElementById('c7customAPeriod').value = customA.period;
    document.getElementById('c7customAA').value = customA.a;
    document.getElementById('c7customAEccentricityValue').innerText = customA.ecc;
    document.getElementById('c7customAEccentricity').value = customA.ecc;
    document.getElementById('c7customABetaValue').innerText = parseFloat(customA.beta.toFixed(1));
    document.getElementById('c7customABeta').value = customA.beta;

    // Set values for Custom B
    document.getElementById('c7customBPeriod').value = customB.period;
    document.getElementById('c7customBA').value = customB.a;
    document.getElementById('c7customBEccentricityValue').innerText = customB.ecc;
    document.getElementById('c7customBEccentricity').value = customB.ecc;
    document.getElementById('c7customBBetaValue').innerText = parseFloat(customB.beta.toFixed(1));
    document.getElementById('c7customBBeta').value = customB.beta;
}
c7setCustomInterfaceValues();

// CUSTOM A
document.getElementById('c7customAPeriod').addEventListener('change', function() {
    c7referenceTime = c7time;
    let allPlanets = [...orbitingPlanets, centralPlanet];
    customA.period = parseFloat(document.getElementById('c7customAPeriod').value);
    allPlanets.forEach(planet => {
        planet.table = angleTimeMatrix(planet.theta, planet.theta+2*Math.PI +0.2, 0.01, planet.period, planet.ecc);
    })
});

document.getElementById('c7customAEccentricity').addEventListener('input', function() {
    let currentValue = this.value;
    document.getElementById('c7customAEccentricityValue').innerText = currentValue;
    customA.ecc = parseFloat(currentValue);
    let allPlanets = [...orbitingPlanets, centralPlanet];
    c7referenceTime = c7time;
    allPlanets.forEach(planet => {
        planet.table = angleTimeMatrix(planet.theta, planet.theta+2*Math.PI +0.2, 0.01, planet.period, planet.ecc);
    })
    kepUpdatePositions();
    c7drawAllElements();
});

document.getElementById('c7customABeta').addEventListener('input', function() {
    let currentValue = this.value;
    document.getElementById('c7customABetaValue').innerText = currentValue;
    customA.beta = parseFloat(currentValue) * (Math.PI / 180);

    let allPlanets = [...orbitingPlanets, centralPlanet];
    c7referenceTime = c7time;
    allPlanets.forEach(planet => {
        planet.table = angleTimeMatrix(planet.theta, planet.theta+2*Math.PI +0.2, 0.01, planet.period, planet.ecc);
    })
    kepUpdatePositions();
    c7drawAllElements();
});

document.getElementById('c7customAA').addEventListener('change', function() {
    let allPlanets = [...orbitingPlanets, centralPlanet];
    allPlanets.forEach(planet => {
        planet.previousPositions = []
    })

    c7referenceTime = c7time;
    customA.a = parseFloat(document.getElementById('c7customAA').value);
    allPlanets.forEach(planet => {
        planet.table = angleTimeMatrix(planet.theta, planet.theta+2*Math.PI +0.2, 0.01, planet.period, planet.ecc);
    })
    kepUpdateScaleMultiplier();
    kepUpdatePositions();
    c7drawAllElements();
});

function simpsonIntegral(a, b, f, N) {
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

function timeBetweenAngles(startAngle, endAngle, P, e) {
    // For a planet with period P and eccentricity e, return the time
    // in years it takes to pass between startAngle and endAngle
    function integrand(theta) {
        return 1 / (1 - e * Math.cos(theta)) ** 2;
    }

    let firstPart = P * (1 - e ** 2) ** 1.5 / (2 * Math.PI);
    let secondPart = simpsonIntegral(startAngle, endAngle, integrand, 100);
    return firstPart * secondPart;
}

function angleTimeMatrix(startAngle, endAngle, angleIncrement, P, e) {
    let returnMatrix = [];
    for (let theta = startAngle; theta <= endAngle; theta += angleIncrement) {
        let time = timeBetweenAngles(startAngle, theta, P, e);
        returnMatrix.push({
            angle: theta,
            time: time
        });
    }

    return returnMatrix;
}

// CUSTOM B
document.getElementById('c7customBPeriod').addEventListener('change', function() {
    c7referenceTime = c7time;
    let allPlanets = [...orbitingPlanets, centralPlanet];
    customB.period = parseFloat(document.getElementById('c7customBPeriod').value);
    allPlanets.forEach(planet => {
        planet.table = angleTimeMatrix(planet.theta, planet.theta+2*Math.PI +0.2, 0.01, planet.period, planet.ecc);
    })
});

document.getElementById('c7customBEccentricity').addEventListener('input', function() {
    let currentValue = this.value;
    document.getElementById('c7customBEccentricityValue').innerText = currentValue;
    customB.ecc = parseFloat(currentValue);
    let allPlanets = [...orbitingPlanets, centralPlanet];
    c7referenceTime = c7time;
    allPlanets.forEach(planet => {
        planet.table = angleTimeMatrix(planet.theta, planet.theta+2*Math.PI +0.2, 0.01, planet.period, planet.ecc);
    })
    kepUpdatePositions();
    c7drawAllElements();
});

document.getElementById('c7customBBeta').addEventListener('input', function() {
    let currentValue = this.value;
    document.getElementById('c7customBBetaValue').innerText = currentValue;
    customB.beta = parseFloat(currentValue) * (Math.PI / 180);

    let allPlanets = [...orbitingPlanets, centralPlanet];
    c7referenceTime = c7time;
    allPlanets.forEach(planet => {
        planet.table = angleTimeMatrix(planet.theta, planet.theta+2*Math.PI +0.2, 0.01, planet.period, planet.ecc);
    })
    kepUpdatePositions();
    c7drawAllElements();
});

document.getElementById('c7customBA').addEventListener('change', function() {
    let allPlanets = [...orbitingPlanets, centralPlanet];
    allPlanets.forEach(planet => {
        planet.previousPositions = []
    })

    c7referenceTime = c7time;
    customB.a = parseFloat(document.getElementById('c7customBA').value);
    allPlanets.forEach(planet => {
        planet.table = angleTimeMatrix(planet.theta, planet.theta+2*Math.PI +0.2, 0.01, planet.period, planet.ecc);
    })
    kepUpdateScaleMultiplier();
    kepUpdatePositions();
    c7drawAllElements();
});


/////////////////////////////////////////////////////////////////////////////////////

let orbitingPlanets = [mercury, venus, mars]
let kepScaleMultiplier = 100;

let keplerCanvas = document.getElementById('keplerGraph')
let ptolemyCanvas = document.getElementById('ptolemyGraph')
const kep = keplerCanvas.getContext('2d')
const pto = ptolemyCanvas.getContext('2d');

let ptoCenterX = ptolemyCanvas.width / 2;
let ptoCenterY = ptolemyCanvas.height / 2;

function ptoDrawCentralPlanet(planet) {
    pto.beginPath();
    pto.arc(ptoCenterX, ptoCenterY, 5, 0, 2 * Math.PI, false);
    pto.fillStyle = planet.color;  // Color can be adjusted or based on planet properties.
    pto.fill();
    pto.closePath();
}


function kepDrawEllipticalOrbit(eccentricity, a, color, betaCorrection) {
    kep.beginPath();

    // Start at angle 0
    let startPos = polarToCartesian(c7angleToRadius(0, eccentricity, a, kepScaleMultiplier), 0, betaCorrection);
    kep.moveTo(startPos.x, startPos.y);


    for (let theta = 0; theta <= 2 * Math.PI +0.007; theta += 0.01) {
        let r = c7angleToRadius(theta, eccentricity, a, kepScaleMultiplier);
        let position = polarToCartesian(r, theta, betaCorrection);
        kep.lineTo(position.x, position.y);
    }

    kep.strokeStyle = color;
    kep.stroke();
}

function kepDrawPlanet(planet) {
    const position = cartesianPosition(planet)

    // Draw the planet
    kep.beginPath();
    kep.arc(position.x, position.y, planetRadius, 0, 2 * Math.PI); 
    kep.fillStyle = planet.color;
    kep.fill();
}

function ptoDrawPlanet(planet) {
    const position = ptoPos(planet)

    // Draw the planet
    pto.beginPath();
    pto.arc(position.x, position.y, planetRadius, 0, 2 * Math.PI); 
    pto.fillStyle = planet.color;
    pto.fill();
}

function ptoDrawTrace(planet) {
    //console.log(planet.previousPositions.length < 1 ? "called length 0" : "called")
    if (planet.previousPositions.length < 1) {
        return;
    }
    pto.beginPath();

    // Start from the first position
    let startPos = planet.previousPositions[0];
    pto.moveTo(startPos.x, startPos.y);

    // Draw lines to each subsequent position
    for (let pos of planet.previousPositions) {
        pto.lineTo(pos.x, pos.y);
    }

    // Set the stroke style and render the path
    pto.strokeStyle = planet.color;
    pto.stroke();
}


function kepUpdatePositions() {
    for (let index in orbitingPlanets) {
        let planet = orbitingPlanets[index];
        planet.theta = timeToAngle(c7time - c7referenceTime, planet.table, planet.period);
        planet.r = c7angleToRadius(planet.theta, planet.ecc, planet.a, kepScaleMultiplier);
    }
    centralPlanet.theta = timeToAngle(c7time - c7referenceTime, centralPlanet.table, centralPlanet.period);
    centralPlanet.r = c7angleToRadius(centralPlanet.theta, centralPlanet.ecc, centralPlanet.a, kepScaleMultiplier)
}

function c7drawAllElements() {
    kep.clearRect(0, 0, keplerCanvas.width, keplerCanvas.height);
    pto.clearRect(0, 0, ptolemyCanvas.width, ptolemyCanvas.height);

    // Draw the central planet (you'll need to define this function)
    ptoDrawCentralPlanet(centralPlanet);

    orbitingPlanets.forEach(planet => {
        kepDrawEllipticalOrbit(planet.ecc, planet.a, planet.color, planet.beta);
        kepDrawPlanet(planet);

        ptoDrawPlanet(planet)
    });    

    kepDrawPlanet(centralPlanet)
    kepDrawEllipticalOrbit(centralPlanet.ecc, centralPlanet.a, centralPlanet.color, centralPlanet.beta)
    orbitingPlanets.forEach(planet => {
        ptoDrawTrace(planet)
    })
}

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

function c7loop () {
    if (c7isPaused) {
        return;
    }

    c7time += c7timeStep;
    c7timeTicker.textContent = `Time: ${Math.round(c7time)} years`;


    // don't think 'avoid floating-point inaccuracies' helps; causes bugs
    if (1 || Math.abs((c7time - c7referenceTime) % c7timeInterval) < epsilon || 
    Math.abs((c7time - c7referenceTime) % c7timeInterval - c7timeInterval) < epsilon) { // to avoid floating-point inaccuracies
        //console.log("pushing...")
        orbitingPlanets.forEach(planet => {
            planet.previousPositions.push(ptoPos(planet))
        })
    }
    //console.log(mars.previousPositions.length)
    //let allPlanets = [...orbitingPlanets, centralPlanet];
    //console.log(allPlanets)
    kepUpdatePositions();
    c7drawAllElements();
}
kepUpdatePositions();
c7drawAllElements();

////////////////////////////////////////////////////////////////////////////////////////
function c7angleToRadius(angle, eccentricity, a, scale) {
    let firstPart = scale *a * (1 - eccentricity**2);
    let secondPart = 1 - eccentricity * Math.cos(angle);
    return firstPart / secondPart;
}

function ptoPos(planet) {
    // centralPlanet's position
    const centralPlanetPosition = cartesianPosition(centralPlanet);

    // The planet's position
    const planetPosition = cartesianPosition(planet);

    // Compute the vector from centralPlanet to the planet
    return {
        x: ptoScaleMultiplier * (planetPosition.x - centralPlanetPosition.x)  + centerX,
        y: ptoScaleMultiplier * (planetPosition.y - centralPlanetPosition.y)  + centerY
    };
}


////////////////////////////////////////////////////////////////////////////////////////
let kepPlanetBeingDragged = null;
keplerCanvas.addEventListener('mousedown', function(event) {
    if (!c7isPaused) {
        return;
    }

    let mouseX = event.clientX - window.offsets[0] - keplerCanvas.getBoundingClientRect().left;
    let mouseY = event.clientY - window.offsets[1] - keplerCanvas.getBoundingClientRect().top;
    let allPlanets = [...orbitingPlanets, centralPlanet];
    // Check each planet
    for (const planet of allPlanets) {  // or whatever planets you have
        let planetX = cartesianPosition(planet).x;
        let planetY = cartesianPosition(planet).y;
        let distanceSquared = (planetX - mouseX)**2 + (planetY - mouseY)**2;

        if (distanceSquared <= (1.5*planetRadius)**2) {  // assuming each planet has a radius property, and with a buffer factor for better user experience
            kepPlanetBeingDragged = planet;
            break;
        }
    }
});

function findIntersections(a, ecc, beta, x1, y1, x2, y2) {
    // Calculate the slope of the line
    let m = (y2 - y1) / (x2 - x1);

    // Calculate the discriminant
    let discriminant = Math.sqrt(
        (ecc - 1) * (ecc + 1) * (a*a*ecc*ecc*m*m*Math.cos(beta)*Math.cos(beta) + a*a*ecc*ecc - a*a*m*m*Math.cos(beta)*Math.cos(beta) - a*a - 2*a*ecc*m*m*x1*Math.cos(beta) + 2*a*ecc*m*y1*Math.cos(beta) + m*m*x1*x1 - 2*m*x1*y1 + y1*y1)
    );

    // Calculate x coordinates of the intersection points
    let xInt1 = (-a*ecc*ecc*ecc + a*ecc + m*m*x1*Math.cos(beta) - m*y1*Math.cos(beta) - discriminant) * Math.cos(beta) / (-ecc*ecc + m*m*Math.cos(beta)*Math.cos(beta) + 1);
    let xInt2 = (-a*ecc*ecc*ecc + a*ecc + m*m*x1*Math.cos(beta) - m*y1*Math.cos(beta) + discriminant) * Math.cos(beta) / (-ecc*ecc + m*m*Math.cos(beta)*Math.cos(beta) + 1);

    // Calculate y coordinates using the equation of the line
    let yInt1 = m * (xInt1 - x1) + y1;
    let yInt2 = m * (xInt2 - x1) + y1;

    return [
        {x: xInt1, y: -yInt1},
        {x: xInt2, y: -yInt2}
    ];
}

function cartesianEllipseCenter(planet) { 
    return {
        x: centerX + planet.a * planet.ecc * scaleMultiplier * Math.cos(planet.beta),
        y: centerY
    }
}
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

scaleMultiplier = 1

function cartesianToPolar(x, y, beta) {
    // Adjust the coordinates relative to the center of the canvas
    //x -= canvas.width / 2;
    x -= centerX;
    y -= canvas.height / 2;

    x /= Math.cos(beta);

    let r = Math.sqrt(x * x + y * y);
    let theta = Math.atan2(-y, x); // Assuming you want to keep the angle negation
    return { radius: r, angle: theta };
}


keplerCanvas.addEventListener('mousemove', function(event) {
    if (kepPlanetBeingDragged) {
        c7anglesChanged = true;
        let mouseX = event.clientX - window.offsets[0] - keplerCanvas.getBoundingClientRect().left;
        let mouseY = event.clientY - window.offsets[1] - keplerCanvas.getBoundingClientRect().top;
        
        points = findIntersections(kepPlanetBeingDragged.a * kepScaleMultiplier, kepPlanetBeingDragged.ecc, kepPlanetBeingDragged.beta,
                                     (cartesianEllipseCenter(kepPlanetBeingDragged).x - centerX), 0, (mouseX - centerX), (centerY - mouseY))

        let dist1 = distance(mouseX, mouseY, points[0].x + centerX, points[0].y + centerY);
        let dist2 = distance(mouseX, mouseY, points[1].x + centerX, points[1].y + centerY);

        // Determine which point is closer
        let closerPoint = dist1 < dist2 ? points[0] : points[1];

        kepPlanetBeingDragged.theta = cartesianToPolar(closerPoint.x + centerX, closerPoint.y + centerY, kepPlanetBeingDragged.beta).angle;
        kepPlanetBeingDragged.r = c7angleToRadius(kepPlanetBeingDragged.theta, kepPlanetBeingDragged.ecc, kepPlanetBeingDragged.a, kepScaleMultiplier);

        c7drawAllElements();
    }
    
});

keplerCanvas.addEventListener('mouseup', function() {
    kepPlanetBeingDragged = null;
});
