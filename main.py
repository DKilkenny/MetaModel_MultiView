# Imports
import numpy 
import openmdao.api as om

# ======================================================================
#                       Engine Setup
# ======================================================================
# Load Data:
tmp = numpy.loadtxt('UHB.outputFLOPS')

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
xt = numpy.zeros((nt, 3))
yt = numpy.zeros((nt, 2))

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
xlimits = numpy.array([
    [0.0, 0.9],
    [0., 43.],
    [0, 1]
])


# ni = 50
# nj = 50

# xlin1 = numpy.linspace(xlimits[0, 0], xlimits[0, 1], ni)
# xlin2 = numpy.linspace(xlimits[1, 0], xlimits[1, 1], nj)
# x1, x2 = numpy.meshgrid(xlin1, xlin2)
# x = numpy.zeros((ni, nj, 3))
# x[:, :, 0] = x1
# x[:, :, 1] = x2
# x[:, :, 2] = 1.0

# surf = numpy.zeros((ni, nj, 3))

interp = om.MetaModelUnStructuredComp(default_surrogate=om.ResponseSurface())
# Inputs
interp.add_input('Mach', 0., training_data=xt[:, 0])
interp.add_input('Alt', 0., training_data=xt[:, 1])
interp.add_input('Trottle', 0., training_data=xt[:, 2])

# Outputs
interp.add_output('Trust', training_data=yt[:, 0])
interp.add_output('TSFC', training_data=yt[:, 1])

# Create the problem setup
prob = om.Problem()
prob.model.add_subsystem('interp', interp)
prob.setup()

# Given a certain input...
prob['interp.Mach'] = 0.26
prob['interp.Alt'] = 10000
prob['interp.Trottle'] = 47

# ..Run the model...
prob.run_model()
# ...and print the predicted outputs
print(prob['interp.Trust'])
print(prob['interp.TSFC'])