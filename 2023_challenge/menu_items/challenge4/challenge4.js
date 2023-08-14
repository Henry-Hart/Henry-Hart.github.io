
// TODO: 'many body' system


// data provided by BPhO
challenge_1_data = `Object,Mass rel. Earth,Distance from Sun / AU,Radius rel. Earth,Rotational Period (days),Orbital Period (years),relative g,T**2,D**3,epsilon,a,beta
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

// parse data into array
data_array = challenge_1_data.split("\n")
for(i=0;i<data_array.length;i++){
    data_array[i]=data_array[i].split(",")
}

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

function get_point(theta, e, a) {

    // radius
    r = a*(1-e**2)/(1-e*Math.cos(theta))

    // return x,y
    return [r*Math.cos(theta), r*Math.sin(theta)]
}

// `points` holds points
points = [0]
for(j=1;j<11;j++) {
    _params=abe(j)
    points.push({
        x: [],
        y: [],
        z: [],
        mode: 'lines',
        type: 'scatter3d',
        name: data_array[j][0]
    })
    
    for(i=0;i<1000;i++){
        coord = get_point(i/1000*Math.PI*2,_params[2],_params[0])
        points[j].y.push(coord[1]/1.495979e8*2) // ? ~~> AU
        // x, z = org_x*cos(beta), org_x*sin(beta)
        points[j].x.push(coord[0]*Math.cos(data_array[j][11]/180*Math.PI)/1.495979e8*2) // ? ~~> AU
        points[j].z.push(coord[0]*Math.sin(data_array[j][11]/180*Math.PI)/1.495979e8*2) // ? ~~> AU
    }

    // join up end with beginning
    points[j].x.push(points[j].x[0])
    points[j].y.push(points[j].y[0])
    points[j].z.push(points[j].z[0])
}

function animate(data, id) {

    data_i = []

    for (i=0; i<data.length; i++) {
        if (data[i]["__hh_animate"]) {
            data_i.push(i)
        }
    }

    function ionasd() {

        // cycle _i values
        //if(_i==1000){_i=0}
        //_i++

        // find next points
        for (i=0; i<data_i.length; i++) {

            _i = data[data_i[i]].__hh_animate_counter++
            if (data[data_i[i]].__hh_animate_counter == 1000) {
                data[data_i[i]].__hh_animate_counter = 0
            }

            // data[data_i[i]-1] since marker always procedes its path
            data[data_i[i]].x=[data[data_i[i]-1].x[_i]]
            data[data_i[i]].y=[data[data_i[i]-1].y[_i]]
            data[data_i[i]].z=[data[data_i[i]-1].z[_i]]
        }

        // redraw & animate
        Plotly.redraw(id)
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
    };
    
    _i=0;

    animate_func = () => {requestAnimationFrame(ionasd)}
    return setInterval(animate_func, 10)
}

// sun as stationary point
sun = {
    x: [0],
    y: [0],
    z: [0],
    mode: 'markers',
    type: 'scatter3d',
    name: 'Sun',
    marker: {
        color: 'rgb(240,240,0)',
        size: 20,
    }
}

// test
test = {
    x: [0],
    y: [0],
    z: [0],
    mode: 'markers',
    type: 'scatter3d',
    marker: {
        color: 'rgb(200,0,0)',
        size: 5,
        opacity: 0
    },
    showlegend: false,
    __hh_animate: true,
    __hh_animate_counter: 0,
}

function initialise_points(point_i, extra) {
    data = []
    for (i=0; i<point_i.length; i++) {
        data_set = points[point_i[i]]
        data.push(data_set)

        data.push({
            x: [data_set.x[0]],
            y: [data_set.y[0]],
            z: [data_set.z[0]],
            mode: 'markers',
            type: 'scatter3d',
            marker: {
                color: 'rgb(200,0,0)',
                size: 5,
                //opacity: 0
            },
            showlegend: false,
            __hh_animate: true,
            __hh_animate_counter: 0
        })
    }

    // extra data sets
    data=data.concat(extra)

    return data
}

var scope = {}

// data for planets closer to sun
//scope.data = initialise_points([9,8,10,7], [sun]);
//plot = Plotly.newPlot('chart', scope.data);

var layout = {margin: {
    l: 0,
    r: 0,
    b: 0,
    t: 0
}};

// data for further planets
scope.data2 = initialise_points([3,2,5,6], [sun]);
plot2 = Plotly.newPlot('chart', scope.data2, layout);