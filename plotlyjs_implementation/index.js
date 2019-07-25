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
        pad: {l: 0, t: 45, r: 300},
        // pad: {l: 0, t: 55},
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
        pad: {l: 300, t: 45, r: 0},
        // pad: {l: 0, t: 175},
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
        title: {
            text: 'Mach vs Thrust'
        },
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

function scaleAll() {
    let outer = document.getElementById("outer");
    let minSize = Math.min(window.innerWidth, window.innerHeight);
    let newScale = minSize / 1000;
    let trText = "scale(" + newScale + ")";
    outer.style.transform = trText;
}

window.onresize = scaleAll;
document.body.onload = scaleAll;
altVsThrust(0);
machVsThrust(0);