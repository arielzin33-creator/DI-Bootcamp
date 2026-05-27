# The goal is to create a class that represents a simple circle.

# A Circle can be defined by either specifying the radius or the diameter - use a decorator for it.
# The user can query the circle for either its radius or diameter.
import math


# Abilities of a Circle Instance
# Your Circle class should be able to:

# ✅ Compute the circle’s area.
# ✅ Print the attributes of the circle — use a dunder method (__str__ or __repr__).
# ✅ Add two circles together and return a new circle with the new radius — use a dunder method (__add__).
# ✅ Compare two circles to see which is bigger — use a dunder method (__gt__).
# ✅ Compare two circles to check if they are equal — use a dunder method (__eq__).
# ✅ Store multiple circles in a list and sort them — implement __lt__ or other comparison methods.



import math


class Circle:
    def __init__(self, radius):
        if radius < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = radius


    @classmethod
    def from_diameter(cls, diameter):
        return cls(diameter / 2)


    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value < 0:
            raise ValueError("Radius cannot be negative")
        self._radius = value

    @property
    def diameter(self):
        return self._radius * 2

    @diameter.setter
    def diameter(self, value):
        if value < 0:
            raise ValueError("Diameter cannot be negative")
        self._radius = value / 2


    def area(self):
        return round(math.pi * self._radius ** 2, 2)

    def __str__(self):
        return f"Circle(radius={self._radius}, diameter={self.diameter}, area={self.area()})"

    def __repr__(self):
        return f"Circle(radius={self._radius})"

    def __add__(self, other):
        if not isinstance(other, Circle):
            raise TypeError(f"Cannot add Circle and {type(other).__name__}")
        return Circle(self._radius + other._radius)

    def __gt__(self, other):
        if not isinstance(other, Circle):
            raise TypeError(f"Cannot compare Circle and {type(other).__name__}")
        return self._radius > other._radius

    def __eq__(self, other):
        if not isinstance(other, Circle):
            return NotImplemented
        return self._radius == other._radius

    def __lt__(self, other):
        if not isinstance(other, Circle):
            raise TypeError(f"Cannot compare Circle and {type(other).__name__}")
        return self._radius < other._radius
