import random
from abc import ABC, abstractmethod


# ==============================================================================
# Exercise 1: Temperature
# ==============================================================================

class Temperature(ABC):
    def __init__(self, value):
        self._value = value

    @property
    def value(self):
        return self._value

    @abstractmethod
    def to_celsius(self):
        pass

    @abstractmethod
    def to_kelvin(self):
        pass

    @abstractmethod
    def to_fahrenheit(self):
        pass

    def __repr__(self):
        return f"{self.__class__.__name__}({self._value})"


class Celsius(Temperature):
    def to_celsius(self):
        return Celsius(self._value)

    def to_kelvin(self):
        return Kelvin(self._value + 273.15)

    def to_fahrenheit(self):
        return Fahrenheit(self._value * 9 / 5 + 32)

    def __str__(self):
        return f"{self._value:.2f} °C"


class Kelvin(Temperature):
    def to_celsius(self):
        return Celsius(self._value - 273.15)

    def to_kelvin(self):
        return Kelvin(self._value)

    def to_fahrenheit(self):
        return self.to_celsius().to_fahrenheit()

    def __str__(self):
        return f"{self._value:.2f} K"


class Fahrenheit(Temperature):
    def to_celsius(self):
        return Celsius((self._value - 32) * 5 / 9)

    def to_kelvin(self):
        return self.to_celsius().to_kelvin()

    def to_fahrenheit(self):
        return Fahrenheit(self._value)

    def __str__(self):
        return f"{self._value:.2f} °F"


# ==============================================================================
# Exercise 2: Quantum Realm
# ==============================================================================

class QuantumParticle:
    _id_counter = 0

    def __init__(self, x=None, p=None):
        QuantumParticle._id_counter += 1
        self._id = QuantumParticle._id_counter

        self._position = x if x is not None else random.randint(1, 10_000)
        self._momentum = p if p is not None else random.uniform(0, 1)
        self._spin = random.choice([0.5, -0.5])
        self._entangled_partner = None

    # ── Internal disturbance ───────────────────────────────────────────────────

    def _disturb(self):
        self._position = random.randint(1, 10_000)
        self._momentum = random.uniform(0, 1)
        print("Quantum Interferences!!")

    # ── Measurement methods ────────────────────────────────────────────────────

    def position(self):
        self._disturb()
        return self._position

    def momentum(self):
        self._disturb()
        return self._momentum

    def spin(self):
        self._disturb()
        if self._entangled_partner is not None:
            self._entangled_partner._spin = -self._spin
            print("Spooky Action at a Distance !!")
        return self._spin

    # ── Entanglement ───────────────────────────────────────────────────────────

    def entangle(self, other):
        if not isinstance(other, QuantumParticle):
            raise TypeError(
                "Quantum entanglement is only possible between two QuantumParticle instances."
            )
        self._entangled_partner = other
        other._entangled_partner = self
        other._spin = -self._spin
        print(
            f"Particle p{self._id} is now in quantum entanglement "
            f"with Particle p{other._id}"
        )
        print("Spooky Action at a Distance !!")

    # ── Representation ─────────────────────────────────────────────────────────

    def __repr__(self):
        entangled = (
            f"entangled with p{self._entangled_partner._id}"
            if self._entangled_partner
            else "not entangled"
        )
        spin_str = "+1/2" if self._spin > 0 else "-1/2"
        return (
            f"QuantumParticle(id=p{self._id}, "
            f"position={self._position}, "
            f"momentum={self._momentum:.4f}, "
            f"spin={spin_str}, "
            f"{entangled})"
        )


# ==============================================================================
# Demo
# ==============================================================================

if __name__ == "__main__":

    # ── Temperature ─────────────────────────────────────────────────────────
    print("=" * 55)
    print("EXERCISE 1: Temperature Conversions")
    print("=" * 55)

    c = Celsius(100)
    print(f"{c}  →  {c.to_kelvin()}  →  {c.to_fahrenheit()}")

    k = Kelvin(300)
    print(f"{k}  →  {k.to_celsius()}  →  {k.to_fahrenheit()}")

    f = Fahrenheit(98.6)
    print(f"{f}  →  {f.to_celsius()}  →  {f.to_kelvin()}")

    # ── Quantum Realm ────────────────────────────────────────────────────────
    print("\n" + "=" * 55)
    print("EXERCISE 2: Quantum Realm")
    print("=" * 55)

    print("\n── Basic particle measurements ───────────────────────")
    p1 = QuantumParticle(x=1, p=5.0)
    print(repr(p1))
    print(f"Position measurement : {p1.position()}")
    print(f"Momentum measurement : {p1.momentum():.4f}")
    print(f"Spin measurement     : {p1.spin()}")

    print("\n── Entanglement (named constructor args) ─────────────")
    p2 = QuantumParticle(x=1, p=5.0)
    p3 = QuantumParticle(x=2, p=5.0)
    p2.entangle(p3)
    print(repr(p2))
    print(repr(p3))

    print("\n── Entanglement (default constructor) ────────────────")
    p4 = QuantumParticle()
    p5 = QuantumParticle()
    p4.entangle(p5)
    print(repr(p4))
    print(repr(p5))

    print("\n── Spin measurement triggers partner update ──────────")
    print(f"p4 spin before: {'+1/2' if p4._spin > 0 else '-1/2'}")
    print(f"p5 spin before: {'+1/2' if p5._spin > 0 else '-1/2'}")
    measured = p4.spin()
    print(f"p4 spin measured: {'+1/2' if measured > 0 else '-1/2'}")
    print(f"p5 spin after entanglement update: {'+1/2' if p5._spin > 0 else '-1/2'}")

    print("\n── Invalid entanglement attempt ──────────────────────")
    try:
        p4.entangle("not a particle")
    except TypeError as e:
        print(f"TypeError: {e}")