import matplotlib.pyplot as plt
from math import *

def show():
    plt.plot(x, y)
    plt.show()

def get_point(theta, e, a):
    r = a*(1-e**2)/(1-e*cos(theta))
    return [r*cos(theta), r*sin(theta)]

angles = [num/1000*2*pi for num in range(1000)]
x = []
y = []
P = (365.256 + 365.242) / 2
G = 6.67*10**-11
M = 332_837
MASS_OF_SUN = 1.9891e30
m = 1/M*MASS_OF_SUN
print(m+MASS_OF_SUN,P**2*G*(m+MASS_OF_SUN))
a = (P**2*G*(m+MASS_OF_SUN)/4/pi**2)**(1/3)
e = 0.02
b = a*(1-e**2)
print(a,b,e)
#avg_rad = 152.100e6 # 147.095e6
#b = avg_rad / 2
#e = (1-b**2/a**2)**0.5

for angle in angles:
    point = get_point(angle, e, a)
    x.append(point[0])
    y.append(point[1])

# fix tiny white bit
#x.append(x[0])
#y.append(y[0])

show()