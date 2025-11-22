# Arkadium Senior Software Engineer Technical - Assignment

### 1. Overview
- Using a JavaScript/TypeScript/HTML5 tech stack, develop a browser-based puzzle game inspired by the classic Pipe Mania.
- In this Game, players must connect pipes to guide flowing water from a start point to an end point. The game must be fully playable in modern web browsers.
- The objective is to deliver a complete and reliable gameplay loop, emphasizing core logic, performance, and clean, maintainable code.
- Visual presentation is secondary — the focus is on engineering quality, structure, and extensibility.
- You may use any framework or engine (e.g., PixiJS, Phaser, or a custom implementation) as long as the architecture remains clear and modular.
- **Example gameplay:** [Pipe Mania video](https://www.youtube.com/watch?v=6Ve8MXuRr7Y&ab_channel=CzasNaRetro)

### 2. Evaluation Criteria

- **Functionality**: The game must be fully playable.
- **Architecture**: Code should demonstrate a clear, modular structure with consistent ownership, low coupling, and high cohesion. SOLID principles must guide a maintainable and scalable design.
- **Extensibility**: The system should be easily extensible, supporting new pipe types, rules, or difficulty variants without modifying core logic.
- **Configuration**: All gameplay parameters must come from validated JSON or YAML configuration files with safe fallbacks ( e.g. rules, gridSize, blockRatioPerLevel, etc) . The game should handle invalid data gracefully.
- **Logging**: Logging must be structured, consistent, and informative, capturing key events.
- **Testing** (Extra Credit – Not Mandatory) : Core logic should include unit tests and support deterministic runs via seeded RNG to ensure repeatable and verifiable results.

### 3. Deliverables

- A Git repository with full source code and documentation
- A playable build (HTML5 bundle) that can be opened directly in the browser

### 4. Game Mechanics Explanation

- Grid:
  - 9x7 cells
  - Some cells are randomly blocked and cannot hold pipes
- Start Point:
  - Randomly chosen, not on the last row
  - Cannot have a blocked cell directly below
- Pipe Pieces:
  - Types: Straight, curved, and cross
  - Appear in random rotations (non-rotatable by the player)
  - Unlimited supply, displayed in a side queue
- Gameplay:
  - The game must define a **minimum number of connected pipe segments** required to win before the water reaches the end.
  - Player clicks on a cell to place a pipe
  - Placing a new one replaces the existing piece
  - After a short delay, water begins to flow from the start cell
  - Each pipe segment fills in sequence to simulate flow
- Win Condition:
  - Player builds a continuous valid path of at least a random minimum length before the water reaches the end.

- Lose Condition:
  - Water exits the valid path or reaches a dead-end before completing the minimum required path length

### 5. Technical Considerations
- **Write modular and flexible code**, ensuring clear separation of concerns and maintainable structure.
- **Write efficient and performant code**, optimizing logic and data handling to support scalability and responsiveness.
- **Keep all gameplay parameters data-driven** (e.g., grid size, flow speed, minimum path length) and easily adjustable through configuration files. Note: You can simulate water flow with delays or time-based updates — no need for advanced animations.

### 6. Nice-to-haves
These features are optional nice-to-haves but are not required to do for the assignment. Keep in mind that **we are more interested on code quality** than game polish.

- Display a progressive flow effect as water moves through the connected pipes.
- Add animations or visual effects when placing or replacing a pipe to enhance user feedback.
- Make the game adapt to different screen sizes and aspect ratios for a better experience on various devices

### 7. Delivery
You will have one full week to complete your assignment.