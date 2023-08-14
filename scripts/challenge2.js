
// TODO: 'many body' system

function calculateOrbitPosition(semiMajorAxis, eccentricity, orbitalPeriod, currentTime) {
    const angle = (2 * Math.PI * currentTime) / orbitalPeriod;
    const x = semiMajorAxis * Math.cos(angle);
    const y = semiMajorAxis * eccentricity * Math.sin(angle);
    return { x, y };
  }

initialise_challenge_2 = () => {

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
    for(j=1;j<11;j++) {
        _params=abe(j)
        points.push({
            x: [],
            y: [],
            mode: 'lines',
            type: 'scatter',
            name: data_array[j][0]
        })
        
        for(i=0;i<1000;i++){
            //coord = get_point(i/1000*Math.PI*2,_params[2],_params[0])
            //points[j].x.push(coord[0]/1.495979e8*2) // ? ~~> AU
            //points[j].y.push(coord[1]/1.495979e8*2) // ? ~~> AU
            coord = get_pos_indx_from_angle(i/1000*Math.PI*2, j)
            points[j].x.push(coord.x)
            points[j].y.push(coord.y)
        }

        // join up end with beginning
        points[j].x.push(points[j].x[0])
        points[j].y.push(points[j].y[0])
    }

    return points
}

challenge_2_data_load_points = null

get_challenge_2_data = point_i => {

    function initialise_points(point_i, extra) {
        data = []
        for (i=0; i<point_i.length; i++) {
            data_set = challenge_2_data_load_points[point_i[i]]
            data.push(data_set)
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
            title: {
            text:'Elliptical Orbits of The Planets',
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

    return [initialise_points(point_i, [sun]), layout, {responsive: true, displayModeBar: false, dragmode: 'zoom'}]

}


// data for planets closer to sun
get_challenge_2_closer_data = () => {
    return get_challenge_2_data([9,8,10,7])
}
//plot = Plotly.newPlot('chart', scope.data);


// data for further planets
get_challenge_2_further_data = () => {
    return get_challenge_2_data([3,1,2,5])
}
//plot2 = Plotly.newPlot('chart2', scope.data2);