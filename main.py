# Imports
import numpy as np
import openmdao.api as om
import matplotlib.pyplot as plt

import plotly.plotly as py
import plotly.graph_objs as go
import plotly

# ======================================================================
#                       Engine Setup
# ======================================================================
# Load Data from John:
tmp = np.loadtxt('UHB.outputFLOPS')

# net thrust = gross thrust - ram drag (and convert to N)
tmp[:, 3] = (tmp[:, 3] - tmp[:, 4])*4.44822162

# Need to replace power code with fraction Tmax since there is not
# enough precision:
for i in range(len(tmp)):
    if tmp[i, 2] == 50:
        tmax = tmp[i, 3]
    tmp[i, 2] = tmp[i, 3] / tmax

# Converting units and identifying column titles
engineOptions = {'mach':tmp[:, 0],
           'altitude':tmp[:, 1]*.3048, # Alt in m
           'throttle':tmp[:, 2],
           'thrust':tmp[:, 3],
           'tsfc':tmp[:, 6]/3600.0, # TSFC in 1/s
           'rbfType':'cubic'}

# Creating empty arrays
nt = len(tmp)
xt = np.zeros((nt, 3))
yt = np.zeros((nt, 2))

# Mach in column 0 of xt
xt[:, 0] = tmp[:, 0]
# Altitude in column 1 of xt
xt[:, 1] = tmp[:, 1] / 1e3
# Trottle in column 2 of xt
xt[:, 2] = tmp[:, 2]

# Thrust in column 0 of yt
yt[:, 0] = tmp[:, 3] / 1e5
# tsfc in column 1 of yt
yt[:, 1] = tmp[:, 6] / 3600.

# Set the limits of x
xlimits = np.array([
    [0.0, 0.9],
    [0., 43.],
    [0, 1]
])

# Initial class call
interp = om.MetaModelUnStructuredComp(default_surrogate=om.ResponseSurface())
# Inputs
interp.add_input('Mach', 0., training_data=xt[:, 0])
interp.add_input('Alt', 0., training_data=xt[:, 1])
interp.add_input('Throttle', 0., training_data=xt[:, 2])

# Outputs
interp.add_output('Thrust', training_data=yt[:, 0])
interp.add_output('TSFC', training_data=yt[:, 1])

# Create the problem setup
prob = om.Problem()
prob.model.add_subsystem('interp', interp)
prob.setup()

# #Inital conditions in the code are optional
## Given a certain input...
# prob['interp.Mach'] = 0.26
# prob['interp.Alt'] = 10000
# prob['interp.Throttle'] = 47

## ..Run the model...
# prob.run_model()
## ...and print the predicted outputs (optional)
# print(prob['interp.Thrust'])
# print(prob['interp.TSFC'])



# N is number of points we want to predict for
n = 100

mach = np.linspace(min(xt[:, 0]), max(xt[:, 0]), n)
alt = np.linspace(min(xt[:, 1]), max(xt[:, 1]), n)
throttle = np.linspace(min(xt[:, 2]), max(xt[:, 2]), n)
param = zip(mach, alt, throttle)


# Loop with run_model to get predicted values
# Going to need to refactor this in the future to possibly use 
# the compute method within the Unstructured MetaModel component
def make_predictions(x):
    thrust = []
    tsfc = []
    print("Making Predictions")

    for i, j, k in x:
        prob['interp.Mach'] = i
        prob['interp.Alt'] = j
        prob['interp.Throttle'] = k
        prob.run_model()
        thrust.append(float(prob['interp.Thrust']))
        tsfc.append(float(prob['interp.TSFC']))

    # Cast as np arrays to concatenate them together at the end
    thrust = np.asarray(thrust)
    tsfc = np.asarray(tsfc)

    return np.stack([thrust, tsfc], axis=-1)


### Set up grid ###
nx = 3
ny = 2
x_index = 0
y_index = 1
output_variable = 0

# Here we create a meshgrid so that we can take the X and Y
# arrays and make pairs to send to make_predictions to get predictions
xe = np.zeros((n, n, nx))
ye = np.zeros((n, n, ny))

x0_list = np.ones(nx)
for ix in range(nx):
    xe[:,:, ix] = x0_list[ix]
xlins = np.linspace(min(mach), max(mach), n)
ylins = np.linspace(min(alt), max(alt), n)

X, Y = np.meshgrid(xlins, ylins)
xe[:,:, x_index] = X
xe[:,:, y_index] = Y

ye[:,:,:] = make_predictions(xe.reshape((n**2, nx))).reshape((n, n, ny))
Z = ye[:,:,output_variable].flatten()

Z = Z.reshape(n, n)

# ======================================================================
#                       MultiView Ploting
# ======================================================================

# Comment out if plot is not desired
def plot(plot_type):
    # Plotly Py
    if plot_type == 'plotly':
        data = [go.Heatmap(z=Z, zsmooth='best')]
        plotly.offline.plot(data)
    elif plot_type == 'no_plot' :
        pass
    else:
        # Matplotlib version
        cmap = plt.get_cmap('viridis')
        fig = plt.figure()
        ax = fig.add_subplot(111)
        ax.imshow(Z, cmap=cmap, extent=[min(mach), max(mach), min(alt), max(alt)], aspect='auto', origin='lower')
        ax.set_xlabel('Mach')
        ax.set_ylabel('Altitude, kft')
        plt.show()

plot('no_plot')

# ======================================================================
#                           JSON Dump
# ======================================================================

import json

def make_serializable(o):
    """
    Recursively convert numpy types to native types for JSON serialization.

    Parameters
    ----------
    o : object
        the object to be converted

    Returns
    -------
    object
        The converted object.
    """
    if isinstance(o, np.number):
        return o.item()
    elif isinstance(o, np.ndarray):
        return make_serializable(o.tolist())
    elif hasattr(o, '__dict__'):
        return make_serializable(o.__class__.__name__)
    else:
        return o

with open('data.json', 'w') as outfile:
    json.dump({'X': X, 'Y': Y, 'Z': Z, 'mach_min': min(mach), 'mach_max': max(mach), 'alt_min': min(alt), 'alt_max': max(alt), 'alt': alt, 'training_data_yt':yt, 'training_data_xt': xt},
     outfile, default=make_serializable) 
