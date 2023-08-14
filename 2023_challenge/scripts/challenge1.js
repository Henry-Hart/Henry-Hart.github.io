
get_challenge_1_data = () => {

x_vals = []
y_vals = []
names = []

for(i=1;i<c.length;i++){
    x_vals.push(c[i][2] ** 1.5)
    y_vals.push(c[i][5])
    names.push(c[i][0])
}

planets = {
    x: x_vals,
    y: y_vals,
    mode: 'markers',
    text: names,
    type: 'scatter',
    name: 'Kepler\'s 3rd Law',
    hovertemplate: "%{text}"
}

k_3rd_law = {
    x: y_vals,
    y: y_vals,
    mode: 'lines',
    type: 'scatter',
    name: 'Linear (Kepler\'s 3rd Law)'
}

var layout = {
        title: {
        text:'Kepler\'s 3rd Law',
    },

    xaxis: {
        title: {
            text: '(a / AU)^(3/2)',
        },
        },

    yaxis: {
        title: {
            text: 'T/Yr',
        }
    }

};

// plot list_of_lines to div ID 'chart'
//plot = Plotly.newPlot('chart', [planets, k_3rd_law], layout, {responsive: true});
return [[planets, k_3rd_law], layout, {responsive: true, displayModeBar: false, dragmode: 'zoom'}]
}