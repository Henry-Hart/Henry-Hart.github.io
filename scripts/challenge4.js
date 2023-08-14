
// TODO: 'many body' system

initialise_challenge_4 = () => {

    PRECISION = 100

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
        
        for(i=0;i<PRECISION;i++){
            coord = get_point(i/PRECISION*Math.PI*2,_params[2],_params[0])
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

    return points
}

challenge_4_data_load_points = null

get_challenge_4_data = point_i => {

    function initialise_points(point_i, extra) {
        data = []
        for (i=0; i<point_i.length; i++) {
            data_set = challenge_4_data_load_points[point_i[i]]
            data.push(data_set)

            data.push({
                x: [data_set.x[0]],
                y: [data_set.y[0]],
                z: [data_set.z[0]],
                mode: 'markers',
                type: 'scatter3d',
                name: data_set.name,
                marker: {
                    color: 'rgb(200,0,0)',
                    size: 5,
                    //opacity: 0
                },
                showlegend: false,
                __hh_animate: true,
                __hh_animate_counter: 0,
                __hh_animate_incr: 0
            })
        }

        // extra data sets
        data=data.concat(extra)

        return data
    }

    if (!challenge_4_data_load_points) {
        challenge_4_data_load_points = initialise_challenge_4()
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
            size: 12,
        }
    }

    var layout = {
        title: "3d Solar System",
        scene: {
            //aspectmode: "cube",
            /*aspectmode: 'manual', // Use manual aspect ratio
            aspectratio: {
            x: 1, // Ratio for the x-axis
            y: 1, // Ratio for the y-axis
            z: 1  // Ratio for the z-axis
            },*/
            camera: {
            up: { x: 0, y: 0, z: 1 },
            center: { x: 0, y: 0, z: 0 },
            eye: { x: 2, y: 2, z: 2 } // Adjust the eye position to zoom in
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
                scaleanchor: 'z',
                scaleratio: 1
            },
            zaxis: {
                range: undefined,
                title: {
                    text: 'z /AU',
                },
                scaleanchor: 'x',
                scaleratio: 1
            },
        },
        
        //margin: {
        //    l: 0,
        //    r: 0,
        //    b: 0,
        //    t: 0,
        //    pad: 4
        //},
    };

    window.animate_current = () => {

        animate_running_toggle = !animate_running_toggle

        // meant to be playing; currently paused
        if(animate_running_toggle) {
            document.getElementById("animate_playpause").style.borderColor = "red"
            animate_3d_stop_flag = false
            animate_3d(data[0], "preloading")
        } else { // meant to be pausing; currently playing
            document.getElementById("animate_playpause").style.borderColor = ""
            animate_3d_stop_flag = true
        }
    }

    // TODO: lots of global issues here
    data = initialise_points(point_i, [sun])

    org_data = JSON.parse(JSON.stringify(data))

    window.reset_current = () => {
        // TODO: ATOMICITY!!!!!!!!!!!
        animate_3d_stop_flag = true
        animate_running_toggle = false
        animate_time = 0
        document.getElementById("animate_playpause").style.borderColor = ""
        document.getElementById("animate_years").textContent = "-- t = "+animate_time.toFixed(1)+" years --"
        //data = org_data[0]
        Plotly.animate("preloading", {
            data: org_data
        }, {
            transition: {
                duration: 0
            },
            frame: {
                duration: 0,
                redraw: true
            }
        });

        setTimeout(()=>{animate_3d_stop_flag = true
            animate_running_toggle = false
            animate_time = 0
            document.getElementById("animate_playpause").style.borderColor = ""
            document.getElementById("animate_years").textContent = "-- t = "+animate_time.toFixed(1)+" years --";},50);
    }

    return [data, layout, {
        responsive: true, displayModeBar: true, modeBarButtonsToRemove: ['pan3d','zoom3d']
    }]

}


// wow lots of lines
challenge_4_loading_b64_html = "PGgxPkxvYWRpbmcgM0QgZ3JhcGguLi48L2gxPjxicj48ZGl2PlRo" +
"aXMgaGFwcGVucyBvbmNlIHBlciBwYWdlIHJlZnJlc2g8L2Rpdj48c3ZnIHhtbG5zPSJodHRwOi8vd3d3Lnc" +
"zLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHN0eW" +
"xlPSJtYXJnaW46IGF1dG87IGJhY2tncm91bmQ6IHJnYigyNDEsIDI0MiwgMjQzKTsgZGlzcGxheTogYmxvY" +
"2s7IiB3aWR0aD0iMTgxcHgiIGhlaWdodD0iMTgxcHgiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBwcmVzZXJ2" +
"ZUFzcGVjdFJhdGlvPSJ4TWlkWU1pZCI+CjxnIHRyYW5zZm9ybT0icm90YXRlKDAgNTAgNTApIj4KICA8cmV" +
"jdCB4PSI0NyIgeT0iMjQiIHJ4PSIwIiByeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iMTIiIGZpbGw9IiM5M2" +
"RiZTkiPgogICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpb" +
"WVzPSIwOzEiIGR1cj0iMS40MDg0NTA3MDQyMjUzNTJzIiBiZWdpbj0iLTEuMjkxMDc5ODEyMjA2NTcyNXMi" +
"IHJlcGVhdENvdW50PSJpbmRlZmluaXRlIj48L2FuaW1hdGU+CiAgPC9yZWN0Pgo8L2c+PGcgdHJhbnNmb3J" +
"tPSJyb3RhdGUoMzAgNTAgNTApIj4KICA8cmVjdCB4PSI0NyIgeT0iMjQiIHJ4PSIwIiByeT0iMCIgd2lkdG" +
"g9IjYiIGhlaWdodD0iMTIiIGZpbGw9IiM5M2RiZTkiPgogICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib" +
"3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMS40MDg0NTA3MDQyMjUzNTJzIiBi" +
"ZWdpbj0iLTEuMTczNzA4OTIwMTg3NzkzM3MiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIj48L2FuaW1hdGU" +
"+CiAgPC9yZWN0Pgo8L2c+PGcgdHJhbnNmb3JtPSJyb3RhdGUoNjAgNTAgNTApIj4KICA8cmVjdCB4PSI0Ny" +
"IgeT0iMjQiIHJ4PSIwIiByeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iMTIiIGZpbGw9IiM5M2RiZTkiPgogI" +
"CAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEi" +
"IGR1cj0iMS40MDg0NTA3MDQyMjUzNTJzIiBiZWdpbj0iLTEuMDU2MzM4MDI4MTY5MDE0cyIgcmVwZWF0Q29" +
"1bnQ9ImluZGVmaW5pdGUiPjwvYW5pbWF0ZT4KICA8L3JlY3Q+CjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZS" +
"g5MCA1MCA1MCkiPgogIDxyZWN0IHg9IjQ3IiB5PSIyNCIgcng9IjAiIHJ5PSIwIiB3aWR0aD0iNiIgaGVpZ" +
"2h0PSIxMiIgZmlsbD0iIzkzZGJlOSI+CiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJvcGFjaXR5IiB2" +
"YWx1ZXM9IjE7MCIga2V5VGltZXM9IjA7MSIgZHVyPSIxLjQwODQ1MDcwNDIyNTM1MnMiIGJlZ2luPSItMC4" +
"5Mzg5NjcxMzYxNTAyMzQ2cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiPjwvYW5pbWF0ZT4KICA8L3JlY3" +
"Q+CjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgxMjAgNTAgNTApIj4KICA8cmVjdCB4PSI0NyIgeT0iMjQiI" +
"HJ4PSIwIiByeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iMTIiIGZpbGw9IiM5M2RiZTkiPgogICAgPGFuaW1h" +
"dGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpbWVzPSIwOzEiIGR1cj0iMS4" +
"0MDg0NTA3MDQyMjUzNTJzIiBiZWdpbj0iLTAuODIxNTk2MjQ0MTMxNDU1M3MiIHJlcGVhdENvdW50PSJpbm" +
"RlZmluaXRlIj48L2FuaW1hdGU+CiAgPC9yZWN0Pgo8L2c+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMTUwIDUwI" +
"DUwKSI+CiAgPHJlY3QgeD0iNDciIHk9IjI0IiByeD0iMCIgcnk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjEy" +
"IiBmaWxsPSIjOTNkYmU5Ij4KICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0" +
"iMTswIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjEuNDA4NDUwNzA0MjI1MzUycyIgYmVnaW49Ii0wLjcwNDIyNT" +
"M1MjExMjY3NTlzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSI+PC9hbmltYXRlPgogIDwvcmVjdD4KPC9nP" +
"jxnIHRyYW5zZm9ybT0icm90YXRlKDE4MCA1MCA1MCkiPgogIDxyZWN0IHg9IjQ3IiB5PSIyNCIgcng9IjAi" +
"IHJ5PSIwIiB3aWR0aD0iNiIgaGVpZ2h0PSIxMiIgZmlsbD0iIzkzZGJlOSI+CiAgICA8YW5pbWF0ZSBhdHR" +
"yaWJ1dGVOYW1lPSJvcGFjaXR5IiB2YWx1ZXM9IjE7MCIga2V5VGltZXM9IjA7MSIgZHVyPSIxLjQwODQ1MD" +
"cwNDIyNTM1MnMiIGJlZ2luPSItMC41ODY4NTQ0NjAwOTM4OTY2cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pd" +
"GUiPjwvYW5pbWF0ZT4KICA8L3JlY3Q+CjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgyMTAgNTAgNTApIj4K" +
"ICA8cmVjdCB4PSI0NyIgeT0iMjQiIHJ4PSIwIiByeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iMTIiIGZpbGw" +
"9IiM5M2RiZTkiPgogICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIG" +
"tleVRpbWVzPSIwOzEiIGR1cj0iMS40MDg0NTA3MDQyMjUzNTJzIiBiZWdpbj0iLTAuNDY5NDgzNTY4MDc1M" +
"TE3M3MiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIj48L2FuaW1hdGU+CiAgPC9yZWN0Pgo8L2c+PGcgdHJh" +
"bnNmb3JtPSJyb3RhdGUoMjQwIDUwIDUwKSI+CiAgPHJlY3QgeD0iNDciIHk9IjI0IiByeD0iMCIgcnk9IjA" +
"iIHdpZHRoPSI2IiBoZWlnaHQ9IjEyIiBmaWxsPSIjOTNkYmU5Ij4KICAgIDxhbmltYXRlIGF0dHJpYnV0ZU" +
"5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMTswIiBrZXlUaW1lcz0iMDsxIiBkdXI9IjEuNDA4NDUwNzA0MjI1M" +
"zUycyIgYmVnaW49Ii0wLjM1MjExMjY3NjA1NjMzNzk1cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiPjwv" +
"YW5pbWF0ZT4KICA8L3JlY3Q+CjwvZz48ZyB0cmFuc2Zvcm09InJvdGF0ZSgyNzAgNTAgNTApIj4KICA8cmV" +
"jdCB4PSI0NyIgeT0iMjQiIHJ4PSIwIiByeT0iMCIgd2lkdGg9IjYiIGhlaWdodD0iMTIiIGZpbGw9IiM5M2" +
"RiZTkiPgogICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIxOzAiIGtleVRpb" +
"WVzPSIwOzEiIGR1cj0iMS40MDg0NTA3MDQyMjUzNTJzIiBiZWdpbj0iLTAuMjM0NzQxNzg0MDM3NTU4NjZz" +
"IiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSI+PC9hbmltYXRlPgogIDwvcmVjdD4KPC9nPjxnIHRyYW5zZm9" +
"ybT0icm90YXRlKDMwMCA1MCA1MCkiPgogIDxyZWN0IHg9IjQ3IiB5PSIyNCIgcng9IjAiIHJ5PSIwIiB3aW" +
"R0aD0iNiIgaGVpZ2h0PSIxMiIgZmlsbD0iIzkzZGJlOSI+CiAgICA8YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lP" +
"SJvcGFjaXR5IiB2YWx1ZXM9IjE7MCIga2V5VGltZXM9IjA7MSIgZHVyPSIxLjQwODQ1MDcwNDIyNTM1MnMi" +
"IGJlZ2luPSItMC4xMTczNzA4OTIwMTg3NzkzM3MiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIj48L2FuaW1" +
"hdGU+CiAgPC9yZWN0Pgo8L2c+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMzMwIDUwIDUwKSI+CiAgPHJlY3QgeD" +
"0iNDciIHk9IjI0IiByeD0iMCIgcnk9IjAiIHdpZHRoPSI2IiBoZWlnaHQ9IjEyIiBmaWxsPSIjOTNkYmU5I" +
"j4KICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMTswIiBrZXlUaW1lcz0i" +
"MDsxIiBkdXI9IjEuNDA4NDUwNzA0MjI1MzUycyIgYmVnaW49IjBzIiByZXBlYXRDb3VudD0iaW5kZWZpbml" +
"0ZSI+PC9hbmltYXRlPgogIDwvcmVjdD4KPC9nPgo8L3N2Zz4="


challenge_4_loading_html = atob(challenge_4_loading_b64_html).replace("This happens once per page refresh", "This takes longer the first time you load Challenge 4 (per page refresh)")

challenge_4_overlay_toggle = on => {
    if (on) {
        //show_animate_overlay()
        document.getElementById("preloading").style.opacity = 1
        document.getElementById("preloading").style.zIndex = 2
    }
    else {
        //show_animate_overlay()
        document.getElementById("preloading").style.zIndex = -1
        document.getElementById("preloading").style.opacity = 0
    }
}

challenge_4_btn_shim = () => {
    if ((node=document.getElementById("preloading")
        .getElementsByClassName("modebar-btn")[3]
        ).dataset.title === "Reset camera to default"
    ) {
        node.remove()
    }
}

challenge_4_timeout = null

// data for planets closer to sun
get_challenge_4_closer_data = () => {

    content_area.innerHTML = challenge_4_loading_html
    try {
    if(window["reset_current"]) reset_current()
    } catch {}
    
    challenge_4_timeout = setTimeout(() => {
        // TODO: consider blocking page change
        // user might have gone off to be annoying
        if(loc[0] == 4) {
            data = get_challenge_4_data([9,8,10,7])
            data[1].scene.aspectmode = "cube"
            data[1].scene.xaxis.range = [-1.7, 1.7]
            data[1].scene.yaxis.range = [-1.7, 1.7]
            data[1].scene.zaxis.range = [-1.7, 1.7]
            data[1].scene.zaxis.tickvals = [-1.5, -1, -0.5, 0, 0.5, 1, 1.5]
            plot = document.getElementById("preloading")
            /*plot.addEventListener('mousedown', (event) => {
                if (event.button === 2) {
                  event.preventDefault();
                  event.stopPropagation()
                }
              });
        
              plot.addEventListener('contextmenu', (event) => {
                event.preventDefault();
                event.stopPropagation()
              });*/
        
            Plotly.react(plot, ...data);
            // hide home button; evil
            challenge_4_btn_shim()
            challenge_4_overlay_toggle(true)
            document.getElementById("animate_overlay").style.display = "inherit"
            document.getElementById("animate_lock").style.display = "block"
        }
    }, 500);

    return null
}
//plot = Plotly.newPlot('chart', scope.data, layout);

// data for further planets
get_challenge_4_further_data = () => {

    content_area.innerHTML = challenge_4_loading_html
    try {
        if(window["reset_current"]) reset_current()
    } catch {}
    
    challenge_4_timeout = setTimeout(() => {
        // TODO: consider blocking page change
        // user might have gone off to be annoying
        if(loc[0] == 4) {
            data = get_challenge_4_data([3,2,5,6])
            Plotly.react("preloading", ...data);
            // hide home button; evil
            challenge_4_btn_shim()
            challenge_4_overlay_toggle(true)
            document.getElementById("animate_overlay").style.display = "inherit"
            document.getElementById("animate_lock").style.display = "block"
        }
    }, 500);

    return null
}
//plot2 = Plotly.newPlot('chart', scope.data2, layout);

animate_3d_stop_flag = true
window.z = 0

function animate_3d(data, id) {

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

        window.z++;

        animate_speed = document.getElementById("animate_speed").value*1
        if(!animate_speed || animate_speed <= 0) {
            animate_speed = 0
        }

        animate_time += animate_speed/365
        document.getElementById("animate_years").textContent = "-- t = "+animate_time.toFixed(1)+" years --"

        if(animate_3d_stop_flag) {
            if(animate_instareset) {
                document.getElementById("animate_years").textContent = "-- t = 0.0 years --"
                animate_time = 0
            }
            return;
        }

        // cycle _i values
        //if(_i==1000){_i=0}
        //    _i++

        // find next points
        for (i=0; i<data_i.length; i++) {
            
            //_i = data[data_i[i]].__hh_animate_counter++

            data[data_i[i]].__hh_animate_counter += animate_speed*PRECISION/365/data[data_i[i]].__hh_animate_incr
            // hacky
            while (data[data_i[i]].__hh_animate_counter >= PRECISION) {
                data[data_i[i]].__hh_animate_counter -= PRECISION
            }

            _i = Math.round(data[data_i[i]].__hh_animate_counter) % PRECISION
            // data[data_i[i]-1] since marker always procedes its path
            data[data_i[i]].x=[data[data_i[i]-1].x[_i]]
            data[data_i[i]].y=[data[data_i[i]-1].y[_i]]
            data[data_i[i]].z=[data[data_i[i]-1].z[_i]]
        }

        // redraw & animate
        //Plotly.redraw(id)
        Plotly.animate(id, {
            data: data,
            //layout: Plotly.getPlotData(id)
        }, {
            frame: { duration: 0, redraw: true },
            transition: { duration: 0 }
        });
        //Plotly.restyle("preloading",{}) 
        //Plotly.update("preloading")

        requestAnimationFrame(__internal__animate)
    };
    
    _i=0;

    animate_func = () => {requestAnimationFrame(__internal__animate)}
    animate_func()
    //return setInterval(animate_func, 100)
}



/*function animate(data, id) {

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
        data[data_i[i]].__hh_animate_incr = 10/data_array[dat_indx][5]
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
}*/