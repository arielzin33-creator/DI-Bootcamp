import os
import time
import random


class Cell:
    def __init__(self, alive=False):
        self.alive = alive

    def __repr__(self):
        return "█" if self.alive else "·"


class Grid:
    MAX_SIZE = 10000

    def __init__(self, rows, cols, expandable=False):
        self.rows = rows
        self.cols = cols
        self.expandable = expandable
        self.cells = {
            (r, c): Cell() for r in range(rows) for c in range(cols)
        }

    def set_alive(self, row, col, alive=True):
        if (row, col) in self.cells:
            self.cells[(row, col)].alive = alive
        elif self.expandable:
            self.cells[(row, col)] = Cell(alive=alive)

    def is_alive(self, row, col):
        if (row, col) in self.cells:
            return self.cells[(row, col)].alive
        return False

    def count_live_neighbors(self, row, col):
        directions = [
            (-1, -1), (-1, 0), (-1, 1),
            (0, -1),           (0, 1),
            (1, -1),  (1, 0),  (1, 1)
        ]
        count = 0
        for dr, dc in directions:
            if self.is_alive(row + dr, col + dc):
                count += 1
        return count

    def get_candidates(self):
        candidates = set()
        for (r, c), cell in self.cells.items():
            if cell.alive:
                candidates.add((r, c))
                directions = [
                    (-1, -1), (-1, 0), (-1, 1),
                    (0, -1),           (0, 1),
                    (1, -1),  (1, 0),  (1, 1)
                ]
                for dr, dc in directions:
                    nr, nc = r + dr, c + dc
                    if self.expandable:
                        if abs(nr) < self.MAX_SIZE and abs(nc) < self.MAX_SIZE:
                            candidates.add((nr, nc))
                    else:
                        if 0 <= nr < self.rows and 0 <= nc < self.cols:
                            candidates.add((nr, nc))
        return candidates

    def next_generation(self):
        new_cells = {}
        candidates = self.get_candidates()

        for (r, c) in candidates:
            live_neighbors = self.count_live_neighbors(r, c)
            currently_alive = self.is_alive(r, c)

            if currently_alive:
                survives = live_neighbors in (2, 3)
                new_cells[(r, c)] = Cell(alive=survives)
            else:
                born = live_neighbors == 3
                if born:
                    new_cells[(r, c)] = Cell(alive=True)

        if self.expandable:
            self.cells = new_cells
            live_positions = [pos for pos, cell in self.cells.items() if cell.alive]
            if live_positions:
                self.rows = max(r for r, c in live_positions) + 2
                self.cols = max(c for r, c in live_positions) + 2
        else:
            for pos in self.cells:
                self.cells[pos] = new_cells.get(pos, Cell(alive=False))

    def count_alive(self):
        return sum(1 for cell in self.cells.values() if cell.alive)

    def display(self, generation):
        os.system("cls" if os.name == "nt" else "clear")
        print(f"Generation: {generation} | Live cells: {self.count_alive()}")
        print(f"Mode: {'Expandable' if self.expandable else 'Fixed'} borders")
        print()

        if self.expandable:
            live_positions = [pos for pos, cell in self.cells.items() if cell.alive]
            if not live_positions:
                print("No live cells remaining.")
                return
            min_r = min(r for r, c in live_positions) - 1
            max_r = max(r for r, c in live_positions) + 1
            min_c = min(c for r, c in live_positions) - 1
            max_c = max(c for r, c in live_positions) + 1
            display_rows = min(max_r - min_r + 1, 40)
            display_cols = min(max_c - min_c + 1, 80)
            for r in range(min_r, min_r + display_rows):
                row_str = ""
                for c in range(min_c, min_c + display_cols):
                    row_str += str(self.cells.get((r, c), Cell(alive=False)))
                print(row_str)
        else:
            for r in range(self.rows):
                row_str = ""
                for c in range(self.cols):
                    row_str += str(self.cells.get((r, c), Cell(alive=False)))
                print(row_str)

        print()


class GameOfLife:
    def __init__(self, grid, max_generations=100, delay=0.2):
        self.grid = grid
        self.max_generations = max_generations
        self.delay = delay
        self.generation = 0
        self.history = []

    def get_state_signature(self):
        return frozenset(
            pos for pos, cell in self.grid.cells.items() if cell.alive
        )

    def run(self):
        print("Starting Conway's Game of Life...")
        time.sleep(1)

        while self.generation < self.max_generations:
            self.grid.display(self.generation)

            if self.grid.count_alive() == 0:
                print("All cells are dead. Game over.")
                break

            state = self.get_state_signature()
            if state in self.history:
                print(f"Stable or oscillating state detected at generation {self.generation}. Game over.")
                break
            self.history.append(state)

            self.grid.next_generation()
            self.generation += 1
            time.sleep(self.delay)

        else:
            print(f"Reached maximum generation limit: {self.max_generations}.")

        print(f"\nGame ended at generation {self.generation} with {self.grid.count_alive()} live cells.")


def preset_blinker(grid):
    mid_r, mid_c = grid.rows // 2, grid.cols // 2
    grid.set_alive(mid_r, mid_c - 1)
    grid.set_alive(mid_r, mid_c)
    grid.set_alive(mid_r, mid_c + 1)


def preset_glider(grid):
    mid_r, mid_c = 2, 2
    pattern = [
        (0, 1),
        (1, 2),
        (2, 0), (2, 1), (2, 2)
    ]
    for dr, dc in pattern:
        grid.set_alive(mid_r + dr, mid_c + dc)


def preset_pulsar(grid):
    mid_r, mid_c = grid.rows // 2, grid.cols // 2
    offsets = [
        (-6, -4), (-6, -3), (-6, -2), (-6, 2), (-6, 3), (-6, 4),
        (-4, -6), (-3, -6), (-2, -6), (-4, 6), (-3, 6), (-2, 6),
        (-4, -1), (-3, -1), (-2, -1), (-4, 1), (-3, 1), (-2, 1),
        (-1, -4), (-1, -3), (-1, -2), (-1, 2), (-1, 3), (-1, 4),
    ]
    symmetric = set()
    for dr, dc in offsets:
        symmetric.add((dr, dc))
        symmetric.add((-dr, dc))
        symmetric.add((dr, -dc))
        symmetric.add((-dr, -dc))
    for dr, dc in symmetric:
        grid.set_alive(mid_r + dr, mid_c + dc)


def preset_random(grid, density=0.3):
    for r in range(grid.rows):
        for c in range(grid.cols):
            if random.random() < density:
                grid.set_alive(r, c)


def main():
    print("Conway's Game of Life")
    print("=" * 40)
    print("Select a preset:")
    print("1. Blinker (oscillator)        [Fixed]")
    print("2. Glider (moves across grid)  [Expandable]")
    print("3. Pulsar (period-3 oscillator)[Fixed]")
    print("4. Random                      [Fixed]")
    print("5. Random                      [Expandable]")

    choice = input("\nEnter choice (1-5): ").strip()

    if choice == "1":
        grid = Grid(rows=20, cols=40, expandable=False)
        preset_blinker(grid)
        game = GameOfLife(grid, max_generations=20, delay=0.4)

    elif choice == "2":
        grid = Grid(rows=10, cols=10, expandable=True)
        preset_glider(grid)
        game = GameOfLife(grid, max_generations=60, delay=0.3)

    elif choice == "3":
        grid = Grid(rows=30, cols=60, expandable=False)
        preset_pulsar(grid)
        game = GameOfLife(grid, max_generations=50, delay=0.3)

    elif choice == "4":
        grid = Grid(rows=25, cols=60, expandable=False)
        preset_random(grid, density=0.3)
        game = GameOfLife(grid, max_generations=100, delay=0.15)

    elif choice == "5":
        grid = Grid(rows=20, cols=40, expandable=True)
        preset_random(grid, density=0.25)
        game = GameOfLife(grid, max_generations=100, delay=0.15)

    else:
        print("Invalid choice. Running default random fixed grid.")
        grid = Grid(rows=20, cols=40, expandable=False)
        preset_random(grid)
        game = GameOfLife(grid, max_generations=100, delay=0.15)

    game.run()


if __name__ == "__main__":
    main()