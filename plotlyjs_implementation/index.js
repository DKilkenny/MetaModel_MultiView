var Plotly = require('plotly.js');
const path = require('path')
const json = require('json-loader!./data.json');

X = json['X'][0] // Mach
Y = json['alt']  // Alt
Z = json['Z']    // Thrust

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
console.log('mach')
console.log(mach_slider_steps[99])
console.log('alt')
console.log(alt_slider_steps[99])

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

Plotly.newPlot('contour', contour_data, contour_layout)

myPlot.on('plotly_sliderchange', function(){
    // let mach_selection = contour_layout.sliders[0].active
    // let current_mach_number = mach_slider_steps[mach_selection].args[0]
    // altVsThrust(mach_selection)

    let alt_selection = contour_layout
    // let current_mach_number = mach_slider_steps[mach_selection].args[0]
    console.log(alt_selection)
})


///////// Alt vs Thrust //////////

function altVsThrust(thrust_data_from_mach) {
    let scatter_data = [ {
        // x will be thrust, y will be altitude
        x: Z[thrust_data_from_mach],
        y: Y,
        type: 'scatter'
    }];

    let scatter_layout = {
        title: 'Thrust vs Alt',
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

    return Plotly.newPlot('scatter_one', scatter_data, scatter_layout)
}

function machVsThrust(thrust_data_from_alt) {
    let scatter_data = [ {
        // x will be thrust, y will be altitude
        x: X,
        y: Z[thrust_data_from_alt],
        type: 'scatter'
    }];

    let scatter_layout = {
        title: 'Thrust vs Alt',
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

    return Plotly.newPlot('scatter_two', scatter_data, scatter_layout)
}