# Imports
import numpy 
import openmdao.api as om

# Load data
tmp = numpy.loadtxt('UHB.outputFLOPS')

# net thrust = gross thrust - ram drag (and convert to N)
tmp[:, 3] = (tmp[:, 3] - tmp[:, 4]) * 4.44822162

# Need to replace power code with fraction Tmax since there is not
# enough precision:
for i in range(len(tmp)):
    if tmp[i, 2] == 50:
        tmax = tmp[i, 3]
    tmp[i, 2] = tmp[i, 3] / tmax

engineOptions = {'mach':tmp[:, 0],
           'altitude':tmp[:, 1]*.3048, # Alt in m
           'throttle':tmp[:, 2],
           'thrust':tmp[:, 3],
           'tsfc':tmp[:, 6]/3600.0, # TSFC in 1/s
           'rbfType':'cubic'}

nt = len(tmp)
xt = numpy.zeros((nt, 3))
yt = numpy.zeros((nt, 2))

xt[:, 0] = tmp[:, 0]
xt[:, 1] = tmp[:, 1] / 1e3
xt[:, 2] = tmp[:, 2]

yt[:, 0] = tmp[:, 3] / 1e5
yt[:, 1] = tmp[:, 6] / 3600.

xlimits = numpy.array([
    [0.0, 0.9],
    [0., 43.],
    [0, 1]
])


ni = 50
nj = 50

xlin1 = numpy.linspace(xlimits[0, 0], xlimits[0, 1], ni)
xlin2 = numpy.linspace(xlimits[1, 0], xlimits[1, 1], nj)
x1, x2 = numpy.meshgrid(xlin1, xlin2)
x = numpy.zeros((ni, nj, 3))
x[:, :, 0] = x1
x[:, :, 1] = x2
x[:, :, 2] = 1.0

surf = numpy.zeros((ni, nj, 3))

interp = om.MetaModelUnStructuredComp()
interp.add_input('x', 0., training_data=xt)
interp.add_output('y', numpy.zeros(2))

