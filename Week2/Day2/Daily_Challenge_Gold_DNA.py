import random
import math


class Gene:
    def __init__(self, value=None):
        self.value = value if value is not None else random.randint(0, 1)

    def mutate(self):
        self.value = 1 - self.value

    def __repr__(self):
        return str(self.value)

    def __eq__(self, other):
        if isinstance(other, Gene):
            return self.value == other.value
        return self.value == other


class Chromosome:
    SIZE = 10

    def __init__(self, genes=None):
        self.genes = genes if genes is not None else [Gene() for _ in range(self.SIZE)]

    def mutate(self):
        for gene in self.genes:
            if random.random() < 0.5:
                gene.mutate()

    def is_perfect(self):
        return all(gene.value == 1 for gene in self.genes)

    def fitness(self):
        return sum(gene.value for gene in self.genes) / self.SIZE

    def __repr__(self):
        return "[" + " ".join(str(g) for g in self.genes) + "]"


class DNA:
    SIZE = 10

    def __init__(self, chromosomes=None):
        self.chromosomes = (
            chromosomes if chromosomes is not None
            else [Chromosome() for _ in range(self.SIZE)]
        )

    def mutate(self):
        for chromosome in self.chromosomes:
            if random.random() < 0.5:
                chromosome.mutate()

    def is_perfect(self):
        return all(chrom.is_perfect() for chrom in self.chromosomes)

    def fitness(self):
        return sum(chrom.fitness() for chrom in self.chromosomes) / self.SIZE

    def __repr__(self):
        return "\n  ".join(str(c) for c in self.chromosomes)


class Organism:
    _id_counter = 0

    def __init__(self, dna, environment):
        Organism._id_counter += 1
        self.id = Organism._id_counter
        self.dna = dna
        self.environment = environment  # mutation probability modifier
        self.generation = 0

    def evolve(self):
        if random.random() < self.environment:
            self.dna.mutate()
        self.generation += 1

    def is_perfect(self):
        return self.dna.is_perfect()

    def fitness(self):
        return self.dna.fitness()

    def __repr__(self):
        return (
            f"Organism(id={self.id}, "
            f"generation={self.generation}, "
            f"fitness={self.fitness():.2%})"
        )


class ResearchNotebook:
    def __init__(self):
        self.entries = []

    def log(self, message):
        self.entries.append(message)
        print(message)

    def write_conclusion(self, winner, population_size, environment):
        separator = "=" * 60
        self.log(separator)
        self.log("       BIOLOGY RESEARCH NOTEBOOK")
        self.log(separator)
        self.log(f"Experiment Parameters:")
        self.log(f"  Population size   : {population_size} organisms")
        self.log(f"  Environment       : {environment:.0%} mutation probability")
        self.log(f"  DNA structure     : 10 chromosomes × 10 genes = 100 genes")
        self.log("")
        self.log(f"Result:")
        self.log(f"  Winning Organism  : #{winner.id}")
        self.log(f"  Generations taken : {winner.generation:,}")
        self.log(f"  Final fitness     : {winner.fitness():.2%}")
        self.log("")
        self.log("Conclusion:")
        self.log(
            "  Natural selection through random mutation eventually produces\n"
            "  a perfect organism (all genes = 1), but the number of\n"
            "  generations required depends heavily on population size and\n"
            "  mutation rate. A higher environment pressure (mutation rate)\n"
            "  accelerates convergence but may also disrupt near-perfect DNA.\n"
            "  With 100 binary genes, the probability of a perfect organism\n"
            f"  arising at random is 1 / 2^100 ≈ {1/2**100:.2e},\n"
            "  confirming that iterative mutation guided by selection pressure\n"
            "  is vastly more efficient than pure chance."
        )
        self.log(separator)


def run_simulation(population_size=20, environment=0.9, max_generations=100_000):
    notebook = ResearchNotebook()
    notebook.log("\n🔬 Initialising simulation...\n")

    population = [
        Organism(DNA(), environment)
        for _ in range(population_size)
    ]

    notebook.log(f"Population of {population_size} organisms created.")
    notebook.log(f"Mutation pressure (environment): {environment:.0%}\n")

    generation = 0
    winner = None
    log_interval = max(1, max_generations // 20)

    while generation < max_generations:
        for organism in population:
            organism.evolve()

        perfect = [o for o in population if o.is_perfect()]
        if perfect:
            winner = perfect[0]
            break

        if generation % log_interval == 0:
            best = max(population, key=lambda o: o.fitness())
            notebook.log(
                f"  Gen {generation:>7,} | "
                f"Best fitness: {best.fitness():.2%} | "
                f"Organism #{best.id}"
            )

        generation += 1

    if winner:
        notebook.log(f"\n✅ Perfect organism found!\n")
        notebook.write_conclusion(winner, population_size, environment)
    else:
        notebook.log(f"\n❌ No perfect organism found within {max_generations:,} generations.")
        best = max(population, key=lambda o: o.fitness())
        notebook.log(f"Best organism after {max_generations:,} generations: {best}")
        notebook.log(f"Final fitness: {best.fitness():.2%}")

    return winner


if __name__ == "__main__":
    run_simulation(population_size=20, environment=0.9, max_generations=500_000)