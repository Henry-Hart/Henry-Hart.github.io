
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
    theta = timeToAngle(time, get_angle_table(indx), data_array[indx][5]);
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


// This script requires challenge2.js to be loaded

get_challenge_3_data = point_i => {

    function initialise_points(point_i, extra) {
        data = []
        for (i=0; i<point_i.length; i++) {
            data_set = challenge_2_data_load_points[point_i[i]]
            data.push(data_set)

            data.push({
                x: [data_set.x[0]],
                y: [data_set.y[0]],
                mode: 'markers',
                type: 'scatter',
                name: data_set.name,
                marker: {
                    color: 'rgb(200,0,0)',
                    size: 5,
                    //opacity: 0
                },
                showlegend: false,
                __hh_animate: true,
                __hh_animate_counter: 0,
                __hh_animate_incr: NaN,
                __hh_animate_indx: point_i[i]
            })
        }

        // extra data sets
        data=data.concat(extra)

        return data
    }

    if (!challenge_2_data_load_points) {
        challenge_2_data_load_points = initialise_challenge_2()
    }

    // sun as stationary point
    sun = {
        x: [0],
        y: [0],
        mode: 'markers',
        type: 'scatter',
        name: 'Sun',
        marker: {
            color: 'rgb(240,240,0)',
            size: 25,
        }
    }

    var layout = {

        //autosize: false, // Disable autosizing

        /*scene: {
            aspectmode: 'manual', // Use manual aspect ratio
            aspectratio: {
            x: 1, // Ratio for the x-axis
            y: 1, // Ratio for the y-axis
            z: 1  // Ratio for the z-axis
            },
        },*/

        title: {
            text:'Elliptical Orbits of The Planets (+ Animations)',
        },

        xaxis: {
            title: {
                text: 'x /AU',
            },
            scaleanchor: 'y',
            scaleratio: 1
        },

        yaxis: {
            title: {
                text: 'y /AU',
            },
            scaleanchor: 'x',
            scaleratio: 1
        }

    }

    // TODO: lots of global issues here
    data = initialise_points(point_i, [sun])

    org_data = JSON.parse(JSON.stringify(data))

    window.animate_current = () => {

        animate_running_toggle = !animate_running_toggle

        // meant to be playing; currently paused
        if(animate_running_toggle) {
            document.getElementById("animate_playpause").style.borderColor = "red"
            animate_stop_flag = false
            animate(data[0], "content_area")
        } else { // meant to be pausing; currently playing
            document.getElementById("animate_playpause").style.borderColor = ""
            animate_stop_flag = true
        }
    }

    window.reset_current = () => {
        // TODO: ATOMICITY!!!!!!!!!!!
        animate_stop_flag = true
        animate_running_toggle = false
        animate_time = 0
        document.getElementById("animate_playpause").style.borderColor = ""
        document.getElementById("animate_years").textContent = "-- t = "+animate_time.toFixed(1)+" years --"
        //data = org_data[0]
        Plotly.animate("content_area", {
            data: org_data
        }, {
            transition: {
                duration: 0
            },
            frame: {
                duration: 0,
                redraw: false
            }
        });
    }

    return [data, layout, {responsive: true, displayModeBar: false, dragmode: 'zoom'}]

}

show_animate_overlay = () => {
    document.getElementById("animate_overlay").style.display = "inherit"
}

hide_animate_overlay = () => {
    document.getElementById("animate_overlay").style.display = "none"
}

animate_stop_flag = true
animate_instareset = false
animate_running_toggle = false
animate_speed = 1
animate_time = 0

// global hell.
function animate(data, id) {

    animate_instareset = false

    data_i = []

    for (i=0; i<data.length; i++) {
        if (data[i]["__hh_animate"]) {
            data_i.push(i)
        }
    }

    for (i=0; i<data_i.length; i++) {

        dat_indx = 0
        for(; dat_indx < data_array.length; dat_indx++){
            if(data_array[dat_indx][0] === data[data_i[i]].name) break
        }
        data[data_i[i]].__hh_animate_incr = data_array[dat_indx][5]
    }

    function __internal__animate() {

        // cycle _i values
        //if(_i==1000){_i=0}
        //    _i++

        animate_speed = document.getElementById("animate_speed").value*1
        if(!animate_speed || animate_speed <= 0) {
            animate_speed = 0
        }

        animate_time += animate_speed/365
        document.getElementById("animate_years").textContent = "-- t = "+animate_time.toFixed(1)+" years --"

        if(animate_stop_flag) {
            if(animate_instareset) {
                document.getElementById("animate_years").textContent = "-- t = 0.0 years --"
                animate_time = 0
            }
            return;
        }

        // find next points
        for (i=0; i<data_i.length; i++) {
            
            //_i = data[data_i[i]].__hh_animate_counter++

            //if(data[data_i[i]].name === "Earth") {
                coords = get_pos_indx(animate_time, data[data_i[i]].__hh_animate_indx)
                data[data_i[i]].x = [coords.x]
                data[data_i[i]].y = [coords.y]
                //console.log(coords, animate_time, data_i[i])
                continue;
            //}

            data[data_i[i]].__hh_animate_counter += animate_speed*1000/365/data[data_i[i]].__hh_animate_incr
            // hacky
            //while (data[data_i[i]].__hh_animate_counter >= 1000) {
            //    data[data_i[i]].__hh_animate_counter -= 1000
            //}

            _i = Math.round(data[data_i[i]].__hh_animate_counter) % 1000
            // data[data_i[i]-1] since marker always procedes its path
            data[data_i[i]].x=[data[data_i[i]-1].x[_i]]
            data[data_i[i]].y=[data[data_i[i]-1].y[_i]]
        }

        // redraw & animate
        //Plotly.redraw(id)
        Plotly.animate(id, {
            data: data
        }, {
            transition: {
                duration: 0
            },
            frame: {
                duration: 0,
                redraw: false
            }
        });

        requestAnimationFrame(__internal__animate)
    };
    
    _i=0;

    animate_func = () => {requestAnimationFrame(__internal__animate)}
    animate_func()
    //return setInterval(animate_func, 100)
}

// data for planets closer to sun
get_challenge_3_closer_data = () => {
    return get_challenge_3_data([9,8,10,7])
}
//plot = Plotly.newPlot('chart', scope.data);


// data for further planets
get_challenge_3_further_data = () => {
    return get_challenge_3_data([3,1,2,5])
}
//plot2 = Plotly.newPlot('chart2', scope.data2);