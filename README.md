# Pipe Mania

Browser-based puzzle game inspired by the classic Pipe Mania, built with TypeScript and PixiJS.

## Features

- 9x7 grid-based gameplay
- Three pipe types: straight, curved, and cross
- Random pipe rotations and placements
- Water flow simulation
- Configurable game parameters via YAML
- Structured logging system
- Seeded random generation for reproducible games

## Architecture

The project follows SOLID principles with clear separation of concerns:

- **Core**: Domain models (Grid, Cell, Pipe)
- **Systems**: Game logic (FlowSystem, PathValidator, PipeFactory)
- **Config**: Configuration management with Zod validation
- **Rendering**: PixiJS-based presentation layer
- **Utils**: Logger and SeededRandom utilities

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Configuration

Edit `config/game.yaml` to customize game parameters:

- Grid dimensions
- Block ratio
- Minimum path length range
- Flow speed
- Pipe types and weights
- Visual settings

## Game Rules

1. Build a pipe path from the start point
2. Pipes are placed by clicking on cells
3. After a delay, water begins to flow
4. Win by creating a path of minimum required length
5. Lose if water reaches a dead end or invalid connection

## Tech Stack

- TypeScript
- Vite
- PixiJS
- Zod (validation)
- Vitest (testing)
