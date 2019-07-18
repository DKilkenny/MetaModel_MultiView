var Plotly = require('plotly.js');
const path = require('path')
const json = require('json-loader!./data.json');

X = json['X'][0]
Y = json['alt']
Z = json['Z']

var data = [ {
    // x and y are limits for the scale
    z: Z,
    x: X,
    y: Y,
    type: 'surface',
    colorbar:{
        title: 'Thrust',
        titleside: 'top',
        titlefont: {
          size: 10,
          family: 'Arial, sans-serif'
        }
    }
}];

var layout = {
    title: 'Basic Surface Plot',
    xaxis: {
        title: {
            text: 'Mach'
        }
    },
    yaxis: {
        title: {
            text: 'Altitude kft'
        }
    }
}

Plotly.newPlot('surface', data, layout)

var sliderSteps = []
for (i = 0; i < json['X'][0].length; i++) {
    sliderSteps.push({
        // method: 'animate',
        label: Number.parseFloat(X[i]).toPrecision(3),
        args: [[X[i]], {
            mode: 'animate',
            transition: {duration: 300},
            frame: {duration: 300, redraw: false},
        }]
    })
}

var myPlot = document.getElementById('contour'),
    data = [ {
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

var layout = {
    title: 'Basic Contour Plot',
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
        pad: {l: 0, t: 55},
        xanchor: 'left',
        yanchor: "top",
        currentvalue: {
          visible: true,
          prefix: 'Mach:',
          xanchor: 'right',
          font: {size: 20, color: '#666'}
        },
        steps: sliderSteps
      }]
}



Plotly.newPlot('contour', data, layout)

myPlot.on('plotly_sliderchange', function(){
    var slider_selection = layout.sliders[0].active
    console.log(sliderSteps[slider_selection].args[0]);
})

// var myPlot = document.getElementById('contour'),
//     data = [{
//         x: [1, 2, 3],
//         y: [2,1,3]      
//     }]
    
// var layout = {
//     sliders: [{
//       pad: {t: 30},
//       currentvalue: {
//         xanchor: 'right',
//         prefix: 'color: ',
//         font: {
//           color: '#888',
//           size: 20
//         }
//       },
//       steps: [{
//         label: 'red',
//         method: 'restyle',
//         args: ['line.color', 'red']
//       }, {
//         label: 'green',
//         method: 'restyle',
//         args: ['line.color', 'green']
//       }, {
//         label: 'blue',
//         method: 'restyle',
//         args: ['line.color', 'blue']
//       }]
//     }]
//   }
// Plotly.plot('contour', data, layout);

// console.log(myPlot.on('plotly_sliderchange', function(){
//     console.log(layout.sliders);
// }))
