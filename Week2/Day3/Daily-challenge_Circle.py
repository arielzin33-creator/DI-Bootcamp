The goal is to create a class that represents a simple circle.

A Circle can be defined by either specifying the radius or the diameter - use a decorator for it.
The user can query the circle for either its radius or diameter.



Abilities of a Circle Instance
Your Circle class should be able to:

✅ Compute the circle’s area.
✅ Print the attributes of the circle — use a dunder method (__str__ or __repr__).
✅ Add two circles together and return a new circle with the new radius — use a dunder method (__add__).
✅ Compare two circles to see which is bigger — use a dunder method (__gt__).
✅ Compare two circles to check if they are equal — use a dunder method (__eq__).
✅ Store multiple circles in a list and sort them — implement __lt__ or other comparison methods.



class Circle:
    def __init__ (self, radius):
        self.radius = radius

    @Diameter
    def diameter_calc():
        diameter = 2 * radius
        return diameter
    
def circle_area(self):
    self.circle_area = radius** 2  * 3.14 
