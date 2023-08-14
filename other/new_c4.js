
// TODO: 'many body' system

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

_scaleMultiplier = 1
centerX = 0
centerY = 0
function angleToRadius(angle, eccentricity, a) {
    //console.log(arguments)
    let firstPart = _scaleMultiplier * a * (1 - eccentricity ** 2);
    let secondPart = 1 - eccentricity * Math.cos(angle);
    return firstPart / secondPart
}

function polarToCartesian(r, theta, betaCorrection) {
    return {
        x: r * Math.cos(theta) * Math.cos(betaCorrection) + centerX,
        y: r * Math.sin(theta) + centerY
    };
}

angle_table = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
function get_angle_table(indx) {
    if (angle_table[indx] == 0) {
        angle_table[indx] = angleTimeMatrix(0, 2 * Math.PI + 0.2, 0.01, data_array[indx][5], data_array[indx][9]);
    }

    return angle_table[indx]
}

new_data_array = [
    ["Nothing"],
    ["Saturn", 29.457, 0.0565, 9.58, 2.5, 0.0, 'black'],
    ["Uranus", 84.747, 0.046, 19.22, 0.8, 0.0, 'green'],
    ["Jupiter", 11.862, 0.0489, 5.20, 1.3, 0.0, 'purple'],
    ["Sun"],
    ["Neptune", 166.344, 0.01, 30.246, 1.77, 0.0, 'blue'],
    ["Pluto", 248.348, 0.25, 39.509, 17.5, 1.0, 'red'],
    ["Mars", 1.881, 0.0934, 1.52, 1.9, 0.0, 'orange'],
    ["Venus", 0.615, 0.0068, 0.72, 3.4, 0.0, 'cyan'],
    ["Mercury", 0.241, 0.2056, 0.39, 7.0, 0.0, 'gray'],
    ["Earth", 1.0, 0.0167, 1.0, 0.0, 0.0, 'pink']
]
function get_new_ae(indx) {
    return [new_data_array[indx][3], new_data_array[indx][2]]
}

function get_pos_indx(time, indx) {
    theta = timeToAngle(time, get_angle_table(indx), new_data_array[indx][1]);
    //console.log(theta, indx)
    return get_pos_indx_from_angle(theta, indx)
}

function get_pos_indx_from_angle(theta, indx) {
    ae = get_new_ae(indx)
    r = angleToRadius(theta, ae[1], ae[0]);//data_array[indx][9], data_array[indx][10]);
    //0.0167
    // no beta correction: mapping all 2d orbits onto one 2d plane, NOT taking 2d slice of 3d space
    coords = polarToCartesian(r, theta, 0)
    coords.x = coords.x - ae[1]*ae[0]*2;
    return coords
}


show_animate_overlay = () => {
    document.getElementById("animate_overlay").style.display = "inherit"
}

hide_animate_overlay = () => {
    document.getElementById("animate_overlay").style.display = "none"
}


function calculateOrbitPosition(semiMajorAxis, eccentricity, orbitalPeriod, currentTime) {
    const angle = (2 * Math.PI * currentTime) / orbitalPeriod;
    const x = semiMajorAxis * Math.cos(angle);
    const y = semiMajorAxis * eccentricity * Math.sin(angle);
    return { x, y };
}

challenge_1_data = challenge_1_data = `Object,Mass rel. Earth,Distance from Sun / AU,Radius rel. Earth,Rotational Period (days),Orbital Period (years),relative g,T**2,D**3,epsilon,a,beta
Saturn,95.16,9.58,9.45,0.44,29.63,1.07,877.9369,879.217912,0.06,*,2.49
Uranus,14.5,19.29,4.01,0.72,84.75,0.9,7182.5625,7177.888089,0.05,*,0.77
Jupiter,317.85,5.2,11.21,0.41,11.86,2.53,140.6596,140.608,0.05,*,1.31
Sun,332837,-,109.12,-,-,27.95,#VALUE!,#VALUE!,-,-,-
Neptune,17.2,30.25,3.88,0.67,166.34,1.14,27668.9956,27680.64063,0.01,*,1.77
Pluto,0,39.51,0.19,6.39,248.35,0.09,61677.7225,61676.69435,0.25,*,17.5
Mars,0.107,1.523,0.53,1.03,1.88,0.38,3.5344,3.532642667,0.09,*,1.85
Venus,0.815,0.723,0.95,243.02,0.62,0.9,0.3844,0.377933067,0.01,*,3.39
Mercury,0.055,0.387,0.38,58.65,0.24,0.37,0.0576,0.057960603,0.21,*,7.00
Earth,1,1,1,1,1,1,1,1,0.02,*,0.00`

// do a bit of global processing of data for script convenience
c=challenge_1_data.split("\n")
for(i=0;i<c.length;i++){
    c[i]=c[i].split(",")
}

data_array = c

challenge_4_data_load_points = null

get_challenge_4_generic_planets = (indxs) => {
    if (!challenge_4_data_load_points) {
        challenge_4_data_load_points = initialise_challenge_4()
    }

    points_markers = challenge_4_data_load_points
    p = points_markers[0]
    m = points_markers[1]
    window.indexes = []
    ret = []
    for (i=0; i<indxs.length; i++) {
        foo = indxs[i] > 3 ? indxs[i]-1 : indxs[i]
        window.indexes.push(p[foo][1])
        ret.push(p[foo][0])
    }

    for (i=0; i<indxs.length; i++) {
        foo = indxs[i] > 3 ? indxs[i]-1 : indxs[i]
        window.indexes.push(m[foo-1][1])
        ret.push(m[foo-1][0])
    }


    //window.indexes = [p[1][1], p[2][1], p[3][1], p[5][1], m[0][1], m[1][1], m[2][1], m[4][1]]
    //return           [p[1][0], p[2][0], p[3][0], p[5][0], m[0][0], m[1][0], m[2][0], m[4][0]]
    return ret
}

_PRECISION = 100
initialise_challenge_4 = () => {

    earth_mass = 5.9722e24
    earth_orbit_period = (365.256 + 365.242) / 2
    G = 6.67e-11

    function abe(obj_index) {
        // quite imprecise with current values
        combined_mass = earth_mass*(data_array[obj_index][1]*1+data_array[4][1]*1)
        a = ((earth_orbit_period*data_array[obj_index][5])**2*G*combined_mass/4/Math.PI**2)**(1/3)
        e = data_array[obj_index][9]*1 // convert string to int (*1 doesn't repeat 1; only math op.)
        b = a*(1-e**2)
        return [a,b,e]
    }
    window.abe = abe

    function get_point(theta, e, a) {

        // radius
        r = a*(1-e**2)/(1-e*Math.cos(theta))

        // return x,y
        return [r*Math.cos(theta), r*Math.sin(theta)]
    }

    // window.a holds points
    points = [0]
    data2 = [0]
    markers = []
    color_indx = 0
    for(j=1;j<11;j++) {

        if (j==4) {data2.push([]);continue}

        _params=abe(j)
        
        data2.push([])
        for(i=0;i<_PRECISION;i++){
            //coord = get_point(i/1000*Math.PI*2,_params[2],_params[0])
            //points[j].x.push(coord[0]/1.495979e8*2) // ? ~~> AU
            //points[j].y.push(coord[1]/1.495979e8*2) // ? ~~> AU
            coord = get_pos_indx_from_angle(i/_PRECISION*Math.PI*2, j)
            x = coord.x * Math.cos(new_data_array[j][4] * Math.PI / 180)
            z = coord.x * Math.sin(new_data_array[j][4] * Math.PI / 180)
            data2[j].push([x, z, coord.y])
        }

        // join up end with beginning
        data2[j].push(data2[j][0])

        points.push([{
            name: new_data_array[j][0],
            lineWidth: 1,
            lineColor: org_colors[color_indx], // Color of the connecting lines
            marker: {
                symbol: 'Circle',
                enabled: false, // true removes vertex markers
                //fillColor: 'blue', // Fill color of the circle
                states: {
                    hover: {
                      fillColor: org_colors[color_indx] // Custom hover color for the legend and points
                    }
                  }
            },
            //colorByPoint: true,
            //accessibility: {
            //    exposeAsGroupOnly: true
            //},
            data: data2[j],
            showInLegend: false,
            //type: 'line'
        },j]) // bundle with index

        markers.push([{
            name: new_data_array[j][0],
            colorByPoint: true,
            //accessibility: {
             //   exposeAsGroupOnly: true
            //},
            data: [data2[j][0]],
            marker: {
                symbol: 'Circle',
                fillColor: org_colors[color_indx++], // Fill color of the circle
            },
            //type: 'line'
        },j])
    }

    return [points, markers]
}

// TODO: custom tooltips for swapped axes.

animate_time = 0
animate_interval = 0.1
// global hell.
function animate_3d(data) {

    data_i = []

    for (i=0; i<data.length; i++) {
        //data[i].markerGroup.element.firstChild.getAttribute("fill") === "red"
        if (chart.series[i].data.length === 1 && chart.series[i].name !== "Sun") {
            data_i.push(i)
        }
    }

    function __internal__animate() {

        animate_time += animate_interval;

        // find next points
        for (i=0; i<data_i.length; i++) {
            
            j = indexes[data_i[i]-1]
            coord = get_pos_indx(animate_time, j)
            x = coord.x * Math.cos(new_data_array[j][4] * Math.PI / 180)
            z = coord.x * Math.sin(new_data_array[j][4] * Math.PI / 180)
            //data[data_i[i]].x = [coords.x]
            //data[data_i[i]].y = [coords.z]
            //data[data_i[i]].z = [coords.y]
            //console.log(coord, animate_time, data_i[i])
            //console.log([x, z, coord.y])
            chart.series[data_i[i]].update({data:[[x, z, coord.y]]}, i === data_i.length-1)
            continue;

        }

        // redraw & animate
        //chart.series[0].update({data:[data]}, true)

        requestAnimationFrame(__internal__animate)
    };

    animate_func = () => {requestAnimationFrame(__internal__animate)}
    animate_func()
}

get_challenge_4_further_planets = () => {
    return get_challenge_4_generic_planets([1,2,3,5,6])
}


org_colors = Highcharts.getOptions().colors
// Give the points a 3D feel by adding a radial gradient
Highcharts.setOptions({
colors: Highcharts.getOptions().colors.map(function (color) {
return {
    /*radialGradient: {
        cx: 0.4,
        cy: 0.3,
        r: 0.5
    },*/
    stops: [
        [0, color],
        //[1, Highcharts.color(color).brighten(-0.2).get('rgb')]
    ]
};
})
});



// Set up the chart
var chart = new Highcharts.Chart({
chart: {
renderTo: 'container',
margin: 100,
//height: 300,
//width: 400,
type: 'scatter3d',
animation: false,
options3d: {
    enabled: true,
    alpha: 10,
    beta: 30,
    depth: 250,
    viewDistance: 5,
    fitToPlot: false,
    frame: {
        bottom: { size: 1, color: 'rgba(0,0,0,0.0)' },
        back: { size: 1, color: 'rgba(0,0,0,0.0)' },
        side: { size: 1, color: 'rgba(0,0,0,0.0)' }
    }
}
},
tooltip: {
enabled: false // Hide tooltips for the entire chart
},
title: {
text: '3d Orbits'
},
plotOptions: {
scatter: {
    //width: 10,
    //height: 10,
    //depth: 10
}
},
yAxis: {
//min: 0,
//max: 10,
gridLineWidth: 1,
title: {text: "z /AU"}
},
xAxis: {
//min: 0,
//max: 10,
gridLineWidth: 1,
title: {text: "x /AU"}
},
zAxis: {
min: -50,
max: 50,
showFirstLabel: false,
gridLineWidth: 1,
title: {text: "y /AU"}
},
legend: {
layout: 'vertical', // 'horizontal' or 'vertical'
align: 'right',     // 'left', 'center', or 'right'
verticalAlign: 'middle', // 'top', 'middle', or 'bottom'
itemStyle: {
fontWeight: 'normal'
}
},
series: [{
name: 'Sun',
colorByPoint: true,
accessibility: {
    exposeAsGroupOnly: true
},
marker: {
    fillColor: "yellow",
},
//lineColor: 'yellow',
data: [[0, 0, 0]]
}, ...get_challenge_4_further_planets()]
});

try {
document.getElementsByClassName("highcharts-credits")[0].remove()
document.getElementsByClassName("highcharts-exporting-group")[0].remove()
} catch {}

// Add mouse and touch events for rotation
(function (H) {
function dragStart(eStart) {
eStart = chart.pointer.normalize(eStart);

var posX = eStart.chartX,
    posY = eStart.chartY,
    alpha = chart.options.chart.options3d.alpha,
    beta = chart.options.chart.options3d.beta,
    sensitivity = 5,  // lower is more sensitive
    handlers = [];

function drag(e) {
    // Get e.chartX and e.chartY
    e = chart.pointer.normalize(e);

    chart.update({
        chart: {
            options3d: {
                alpha: alpha + (e.chartY - posY) / sensitivity,
                beta: beta + (posX - e.chartX) / sensitivity
            }
        }
    }, undefined, undefined, false);
}

function unbindAll() {
    handlers.forEach(function (unbind) {
        if (unbind) {
            unbind();
        }
    });
    handlers.length = 0;
}

handlers.push(H.addEvent(document, 'mousemove', drag));
handlers.push(H.addEvent(document, 'touchmove', drag));


handlers.push(H.addEvent(document, 'mouseup', unbindAll));
handlers.push(H.addEvent(document, 'touchend', unbindAll));
}
H.addEvent(chart.container, 'mousedown', dragStart);
H.addEvent(chart.container, 'touchstart', dragStart);
}(Highcharts));