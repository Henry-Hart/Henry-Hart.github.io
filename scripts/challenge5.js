get_challenge_5_data = (indx) => {

    P = data_array[indx][5] //248.348 // Pluto period in years
    e = data_array[indx][9] //0.25 // Pluto eccentricity
    planet_name = data_array[indx][0]

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

    function timeBetweenAngles(startAngle, endAngle, P, e){
        // For a planet with period P and eccentricity e, return the time
        // in years it takes to pass between startAngle and endAngle
        function integrand(theta) {
            return 1/(1-e*Math.cos(theta))**2;
        }

        let firstPart = P*(1-e**2)**1.5/(2*Math.PI);
        let secondPart = simpsonIntegral(startAngle, endAngle, integrand, 100);
        return firstPart * secondPart;
    }

    function angleTimeMatrix(startAngle, endAngle, angleIncrement, P, e) {
        let returnMatrix = [];
        for (let theta = startAngle; theta <= endAngle; theta += angleIncrement) {
            let time = timeBetweenAngles(startAngle, theta, P, e);
            returnMatrix.push({ angle: theta, time: time });
        }

        return returnMatrix;
    }

    let layout = {
        title: "Orbit angle vs. time for "+planet_name,
        xaxis: {title: 'Time (years)'},
        yaxis: {title: 'Angle (radians)'}};

    // change 0.001 to 0.01 for performance
    let data = angleTimeMatrix(0, 6 * Math.PI, 0.01, P, e); 

    let straightLine = [{angle: 0, time: 0}, data[data.length - 1]] // Goes between 0,0 and the last point in data

    let x_vals = data.map(d => d.time);
    let y_vals = data.map(d => d.angle);

    let straightline_x = straightLine.map(d => d.time);
    let straightline_y = straightLine.map(d => d.angle);

    let pluto_line = {
        x: x_vals,
        y: y_vals,
        mode: 'lines', // 'markers' for individual points
        type: 'scatter', // don't change
        name: planet_name
    }
    let straight_line = {
        x: straightline_x,
        y: straightline_y,
        mode: 'lines', // 'markers' for individual points
        type: 'scatter', // don't change
        name: 'Circle'
    }

    return [[pluto_line, straight_line], layout, {responsive: true, displayModeBar: false, dragmode: 'zoom'}]
}

get_challenge_5_data_pluto = () => {
    return get_challenge_5_data(6)
}

get_challenge_5_data_mercury = () => {
    return get_challenge_5_data(9)
}

get_challenge_5_data_mars = () => {
    return get_challenge_5_data(7)
}

get_challenge_5_data_saturn = () => {
    return get_challenge_5_data(1)
}