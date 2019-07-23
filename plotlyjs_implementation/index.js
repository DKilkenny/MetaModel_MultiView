var Plotly = require('plotly.js');
const path = require('path')
const json = require('json-loader!./data.json');

X = json['X'][0] // Mach
Y = json['alt']  // Alt
Z = json['Z']    // Thrust (predicted)

// Import the training data
let yt = json['training_data_yt']
let xt = json['training_data_xt']

// function to get an entire column from a multi dimentional array
const arrayColumn = (arr, n) => arr.map(x => x[n]);

let yt_0 = arrayColumn(yt, 0) // Thrust training data
let mach_xt = arrayColumn(xt, 0) // Mach 
let alt_xt = arrayColumn(xt, 1) // Altitude
let throttle_xt = arrayColumn(xt, 2) // Throttle


//// Contour Plot ////

let mach_slider_steps = []
let alt_slider_steps = []

for (i = 0; i < X.length; i++) {
    let mach_steps = [X[i]].toString()
    let alt_steps = [Y[i]].toString()

    alt_slider_steps.push({
        method: 'immediate',
        label: Number.parseFloat(Y[i]).toPrecision(3),
        args: [ alt_steps, {
            mode: 'animate',
            transition: {duration: 300},
            frame: {duration: 300, redraw: false}
        }]
    })

    mach_slider_steps.push({
        method: 'immediate',
        label: Number.parseFloat(X[i]).toPrecision(3),
        args: [ mach_steps, {
            mode: 'animate',
            transition: {duration: 300},
            frame: {duration: 300, redraw: false},
        }]
    })
}


let myPlot = document.getElementById('contour'),
    contour_data = [ {
    // x and y are limits for the scale
    z: json['Z'],
    x: json['X'][0],
    y: json['alt'],
    type: 'heatmap',
    colorbar:{
        title: 'Thrust',
        titleside: 'top',
        titlefont: {
          size: 10,
          family: 'Arial, sans-serif'
        }
    }
}];

let contour_layout = {
    title: 'Basic Contour Plot',
    xanchor: 'center',
    layer: 'top',
    xaxis: {
        title: {
            text: 'Mach'
        }
    },
    yaxis: {
        title: {
            text: 'Altitude kft'
        }
    },
    sliders: [{
        // Mach Slider
        name: 'mach_slider',
        pad: {l: 0, t: 55},
        xanchor: 'left',
        yanchor: "top",
        currentvalue: {
          visible: true,
          prefix: 'Mach:',
          xanchor: 'right',
          font: {size: 20, color: '#666'}
        },
        steps: mach_slider_steps
      }, {
        // Altitude Slider
        name: 'alt_slider',
        pad: {l: 0, t: 175},
        xanchor: 'left',
        yanchor: "top",
        currentvalue: {
          visible: true,
          prefix: 'Alt:',
          xanchor: 'right',
          font: {size: 20, color: '#666'}
        },
        steps: alt_slider_steps
      }],
    width: 700,
    height: 700,
    margin: {
    l: 50,
    r: 50,
    b: 100,
    t: 100,
    pad: 2
    },
    // shapes: [
    //     //line vertical
    //     { type: 'line',
    //     x0: 0,
    //     y0: 0,
    //     x1: 0,
    //     y1: 43,
    //     line: {
    //     color: 'rgb(255, 255, 255)',
    //     width: 3 }
    // }],
}

Plotly.newPlot('contour', contour_data, contour_layout, {responsive: true})

myPlot.on('plotly_sliderchange', function(slider_data){
    let slider_name = slider_data.slider.name
    let slider_selection = slider_data.slider.active

    if (slider_name == "mach_slider") {
        altVsThrust(slider_selection)
    } 
    if (slider_name == "alt_slider") {
        machVsThrust(slider_selection)
    }
})


///////// Alt vs Thrust //////////

function altVsThrust(thrust_data_from_mach) {
    let scatter_data = {
        // x will be thrust, y will be altitude
        x: Z[thrust_data_from_mach],
        y: Y,
        type: 'scatter'
    };

    let training_data = {
        x: yt_0,
        y: alt_xt,
        mode: 'markers',
        type: 'scatter'
      };

    let scatter_layout = {
        title: 'Thrust vs Alt',
        layer: 'below',
        xaxis: {
            title: {
                text: 'Thrust'
            },
            range: [0,1]
        },
        yaxis: {
            title: {
                text: 'Altitude kft'
            }
        },
        width: 300,
        height: 700,
    }

    return Plotly.newPlot('scatter_one', [scatter_data, training_data], scatter_layout)
}

function machVsThrust(thrust_data_from_alt) {
    let scatter_data = {
        // x will be thrust, y will be altitude
        x: X,
        y: Z[thrust_data_from_alt],
        type: 'scatter'
    };

    let training_data = {
        x: mach_xt,
        y: yt_0,
        mode: 'markers',
        type: 'scatter'
    };

    let scatter_layout = {
        title: 'Mach vs Thrust',
        layer: 'below',
        xaxis: {
            title: {
                text: 'Mach'
            }
        },
        yaxis: {
            title: {
                text: 'Thrust'
            },

        },
        width: 700,
        height: 300,
    }

    return Plotly.newPlot('scatter_two', [scatter_data, training_data], scatter_layout)
}


// var trace1 = {
// x: [1, 2],
// y: [1, 2],
// type: 'scatter',
// name: '(1,1)'
// };
// var trace2 = {
// x: [1, 2],
// y: [1, 2],
// type: 'scatter',
// name: '(1,2)',
// xaxis: 'x2',
// yaxis: 'y2'
// };
// var trace3 = {
// x: [1, 2],
// y: [1, 2],
// type: 'scatter',
// name: '(1,2)',
// xaxis: 'x3',
// yaxis: 'y3'
// };
// var trace4 = {
// x: [1, 2],
// y: [1, 2],
// type: 'scatter',
// name: '(1,2)',
// xaxis: 'x4',
// yaxis: 'y4'
// };
// var data = [trace1, trace2, trace3, trace4];
// var layout = {
// title: 'Mulitple Custom Sized Subplots',
// xaxis: {
//     domain: [0, 0.45],
//     anchor: 'y1'
// },
// yaxis: {
//     domain: [0.5, 1],
//     anchor: 'x1'
// },
// xaxis2: {
//     domain: [0.55, 1],
//     anchor: 'y2'
// },
// yaxis2: {
//     domain: [0.8, 1],
//     anchor: 'x2'
// },
// xaxis3: {
//     domain: [0.55, 1],
//     anchor: 'y3'
// },
// yaxis3: {
//     domain: [0.5, 0.75],
//     anchor: 'x3'
// },
// xaxis4: {
//     domain: [0, 1],
//     anchor: 'y4'
// },
// yaxis4: {
//     domain: [0, 0.45],
//     anchor: 'x4'
// }
// };
// Plotly.plot('contour', data, layout, {showSendToCloud: true});