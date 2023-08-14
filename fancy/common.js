function transparentize(value, opacity) {
    var alpha = opacity === undefined ? 0.5 : 1 - opacity;
    return value
}
const CHART_COLORS = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

const DATA_COUNT = 7;
const NUMBER_CFG = {count: DATA_COUNT, rmin: 1, rmax: 1, min: 0, max: 100};

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

const NO_IFRAMES = true