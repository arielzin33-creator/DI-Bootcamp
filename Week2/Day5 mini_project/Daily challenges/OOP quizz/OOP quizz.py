# Answer the following questions:

# What is a class?
"A class is a blueprint or template for creating objects. It defines a set of attributes (data) and methods (behaviors) that all objects created from it will share. Think of it as a cookie cutter — the cutter is the class, the cookies are the objects."

# What is an instance?
"An instance is a specific object created from a class. Each instance has its own copy of the attributes defined in the class. For example, if Dog is a class, then my_dog = Dog('Rex') creates one specific instance of that class with its own data."

# What is encapsulation?
"Encapsulation is the practice of bundling data and the methods that operate on that data together inside a class, while restricting direct access to some of its internal components. The goal is to protect the object's internal state from unintended modification. In Python this is expressed through public, protected (_), and private (__) attributes."

# What is abstraction?
"Abstraction means hiding complex implementation details and exposing only what is necessary to the outside world. It lets you interact with an object at a high level without needing to understand how it works internally. In Python, this is commonly achieved using Abstract Base Classes (ABC)."

# What is inheritance?
"Inheritance is a mechanism where a child class derives attributes and methods from a parent class. It promotes code reuse and establishes an 'is-a' relationship between classes. For example, a Cat class can inherit from an Animal class and gain all its behaviors, while also adding its own."

# What is multiple inheritance?
"Multiple inheritance is when a class inherits from more than one parent class at the same time, combining the attributes and methods of all of them. Python supports this directly. For example, a Duck class could inherit from both a Flyable and a Swimmable class simultaneously."

# What is polymorphism?
"Polymorphism means 'many forms.' It allows the same method name to behave differently depending on the object that calls it. For example, a speak() method defined on a Dog and a Cat class will produce different outputs even when called the same way. It enables writing flexible, general code that works across different object types."

# What is method resolution order or MRO?
"MRO is the order in which Python searches through a class hierarchy to find a method or attribute when it is called. It becomes especially important in multiple inheritance scenarios where the same method name exists in several parent classes. Python uses the C3 Linearization algorithm to compute a consistent, predictable lookup order. You can inspect it on any class using ClassName.__mro__."