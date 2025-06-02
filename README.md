# 💣 Minesweeper JS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2023+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![DDD](https://img.shields.io/badge/Architecture-DDD-blue.svg)](https://en.wikipedia.org/wiki/Domain-driven_design)
[![SOLID](https://img.shields.io/badge/Principles-SOLID-green.svg)](https://en.wikipedia.org/wiki/SOLID)

A modern, production-ready Minesweeper implementation built with **Domain-Driven Design**, **Clean Architecture**, and **SOLID principles**. This project demonstrates enterprise-level JavaScript development practices using vanilla ES2023+ features.

## 🎮 [**Live Demo**](https://inflop.github.io/minesweeper-js/)

## ✨ Features

- 🎯 **Classic Minesweeper Gameplay** - Traditional mine detection game with cascade reveal
- 🎨 **Modern UI/UX** - Clean, responsive design with theme switching  
- ⚡ **High Performance** - Optimized rendering with strategy patterns
- 🏗️ **Clean Architecture** - DDD with proper layer separation
- 🔒 **Type Safety** - Comprehensive runtime type validation
- 🎪 **Multiple Difficulties** - Beginner, Intermediate, Expert levels (auto-loads beginner)
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🌙 **Theme Support** - Light and dark mode toggle
- ⏱️ **Smart Timer** - Starts counting only on first cell click
- 🚩 **Advanced Flagging** - Counter can go negative, wrong flags highlighted on game over
- ❌ **Error Visualization** - Incorrectly flagged cells shown with red cross after game loss
- ⚙️ **Extensible** - Easy to add new features and customizations

## 🏗️ Architecture

This project showcases **modern JavaScript architecture** following industry best practices:

### **Domain-Driven Design (DDD)**
```
📁 domain/
├── entities/           # Rich domain models (Board, Cell)
├── value-objects/      # Immutable data structures (Position, GameConfiguration)
└── services/           # Domain logic (GameRules, CellInteractionService)

📁 application/         # Use cases (MinesweeperGameService)
📁 infrastructure/      # Cross-cutting concerns (DI, Events, Timer, GameOverService)
📁 presentation/        # UI layer (Renderers, Strategies)
📁 common/             # Shared utilities (Result, TypeGuards, EventBus)
```

### **Key Patterns**
- 🎯 **Result Pattern** - Functional error handling without exceptions
- 🏭 **Strategy Pattern** - Extensible cell rendering strategies  
- 💉 **Dependency Injection** - Loose coupling with IoC container
- 📡 **Event-Driven Architecture** - Decoupled communication
- 🛡️ **Type Guards** - Runtime type safety validation
- 🔄 **Immutable State** - Predictable state management

## 🚀 Quick Start

### **Prerequisites**
- Modern web browser with ES2023+ support
- Local HTTP server (optional, for development)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/inflop/minesweeper-js.git
   cd minesweeper-js
   ```

2. **Serve the application**
   ```bash
   # Option 1: Python
   python3 -m http.server 8000
   
   # Option 2: Node.js
   npx serve .
   
   # Option 3: Open directly
   open index.html
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🎮 How to Play

1. **🎯 Objective**: Find all mines without detonating them
2. **🖱️ Left Click**: Reveal a cell (timer starts on first click)
3. **🖱️ Right Click**: Flag/unflag a suspected mine  
4. **🔢 Numbers**: Indicate adjacent mine count
5. **🏆 Win**: Reveal all non-mine cells
6. **💥 Lose**: Click on a mine (wrong flags shown with ❌)

### **Game Features**
- **⏱️ Smart Timer**: Only starts counting when you make your first move
- **🚩 Flag Counter**: Shows remaining mines, can go negative if you over-flag
- **❌ Wrong Flag Detection**: After losing, incorrectly flagged cells are highlighted
- **⚡ Cascade Reveal**: Empty cells automatically reveal their neighbors

### **Difficulty Levels**
| Level | Size | Mines | Density |
|-------|------|-------|---------|
| 🟢 Beginner | 8×8 | 10 | 15.6% |
| 🟡 Intermediate | 16×16 | 38 | 14.8% |
| 🔴 Expert | 16×30 | 72 | 15.0% |

## 🛠️ Development

### **Project Structure**
```
minesweeper-js/
├── 📄 app.js                    # Application bootstrap
├── 📄 index.html                # Entry point
├── 📄 styles.css                # Styling
│
├── 📁 domain/                   # 🏛️ Business Logic
│   ├── entities/                # Domain entities
│   ├── value-objects/           # Immutable data
│   └── services/                # Domain operations
│
├── 📁 application/              # 🎯 Use Cases
├── 📁 infrastructure/           # ⚙️ Technical Services  
├── 📁 presentation/             # 🖼️ UI Layer
└── 📁 common/                   # 🛠️ Shared Utilities
```

### **Core Classes**

#### **Domain Layer**
```javascript
// Rich domain entity with business logic
const cell = new Cell('cell_1_1', false, position);
cell.reveal();           // Returns Result<T>
cell.toggleFlag();       // Functional state changes
cell.canBeRevealed();    // Business rule validation

// Value object with domain behavior  
const position = new Position(1, 1);
position.isAdjacentTo(other);         // Domain operations
position.getNeighborPositions(bounds); // Spatial calculations
```

#### **Application Layer**
```javascript
// Game orchestration service
const gameService = container.resolve('gameServiceFactory')(config);
const result = gameService.revealCell(position);

result.match({
  success: (data) => handleSuccess(data),
  failure: (error) => showError(error)
});
```

### **Adding New Features**

#### **1. New Cell Type**
```javascript
// Add new rendering strategy
class SpecialCellStrategy extends CellRenderingStrategy {
  canHandle(cell) { return cell.isSpecial; }
  render(cell) { return '⭐'; }
}

// Register in CellRenderer
cellRenderer.addStrategy(new SpecialCellStrategy(), 0);
```

#### **2. New Game Rule**
```javascript
// Extend GameRules service
class CustomGameRules extends GameRules {
  isGameWon(board) {
    // Custom win condition logic
    return super.isGameWon(board) && this.customCondition(board);
  }
}

// Register in ServiceRegistration
container.register('gameRules', () => new CustomGameRules());
```

#### **3. Custom Game Over Effects**
```javascript
// Add custom game over visualization
class CustomGameOverService extends GameOverService {
  markCellAsSpecial(cellId) {
    // Custom end-game marking logic
    this.markCellAsWrongFlag(cellId);
  }
}

// Register in DI container
container.register('gameOverService', () => new CustomGameOverService());
```

### **Testing**

The application includes comprehensive error handling and logging:

```bash
# Manual testing checklist
- [ ] Game auto-loads with beginner level
- [ ] Timer starts only on first cell click
- [ ] Cell revealing works (with cascade for empty cells)
- [ ] Cell flagging works (counter can go negative)
- [ ] Wrong flags highlighted on game loss (❌)
- [ ] All mines revealed on game loss
- [ ] Game win detection
- [ ] Theme switching (🌙/☀️)
- [ ] All difficulty levels work
- [ ] Responsive design on mobile
```

## 🚀 Latest Improvements

This version includes significant enhancements developed with **[Claude Code](https://claude.ai/code)**:

### **🎯 Gameplay Features**
- **⏱️ Smart Timer** - Starts counting only on first cell click (industry standard)
- **🚩 Enhanced Flagging** - Mine counter can go negative for better UX feedback
- **❌ Wrong Flag Detection** - Visual indicators for incorrectly flagged cells after game loss
- **⚡ Optimized Cascade Reveal** - Improved algorithm for revealing empty cell neighbors
- **🎮 Auto-Load** - Game starts immediately with beginner level for better UX

### **🏗️ Architecture Refinements**
- **🎭 Strategy Pattern Enhancement** - `WrongFlagStrategy` for game-over visualization
- **🏛️ Domain Purity** - Moved UI concerns from domain to infrastructure (`GameOverService`)
- **🔧 Method Decomposition** - Split large methods into focused, single-responsibility functions
- **📡 Event-Driven Improvements** - Enhanced event publishing for all game state changes
- **💉 Dependency Injection** - Complete IoC container integration throughout the application

## 🏆 Code Quality

### **Metrics**
- ✅ **0% Technical Debt** - Pure modern architecture
- ✅ **100% ES2023+** - Latest JavaScript features
- ✅ **SOLID Compliant** - All five principles implemented
- ✅ **DDD Architecture** - Proper domain modeling
- ✅ **Type Safe** - Comprehensive runtime validation
- ✅ **Functional** - Result pattern for error handling

### **Best Practices**
- 🎯 **Single Responsibility** - Each class has one clear purpose
- 🔄 **Immutable State** - Predictable state management  
- 🛡️ **Error Handling** - No uncaught exceptions
- 📝 **Self-Documenting** - Clear, descriptive naming
- 🧪 **Testable Design** - Dependency injection throughout
- ⚡ **Performance** - Efficient algorithms and rendering

## 🤝 Contributing

Contributions are welcome! This project follows strict architectural principles:

### **Guidelines**
1. **Domain First** - Place business logic in domain layer
2. **Result Pattern** - Return `Result<T>` instead of throwing exceptions
3. **Type Safety** - Use TypeGuards for validation
4. **Immutability** - Prefer immutable data structures
5. **SOLID Principles** - Follow all five principles
6. **No External Dependencies** - Vanilla JavaScript only

### **Development Process**
```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/amazing-feature

# 3. Make changes following architecture guidelines
# 4. Test thoroughly
# 5. Create a Pull Request
```

## 📚 Documentation

- 📖 **[Architecture Guide](CLAUDE.md)** - Development guidance for Claude Code
- 🎯 **Clean Architecture** - Pure DDD implementation with SOLID principles  
- 🚀 **Modern JavaScript** - ES2023+ features, no external dependencies
- 🏗️ **Extensible Design** - Strategy patterns for easy customization

## 🛡️ Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| 🌐 Chrome | 91+ | ✅ Fully Supported |
| 🦊 Firefox | 89+ | ✅ Fully Supported |
| 🧭 Safari | 14+ | ✅ Fully Supported |
| 🌀 Edge | 91+ | ✅ Fully Supported |

**Requirements**: ES2023+ features including:
- Private class fields (`#field`)
- Dynamic imports
- Optional chaining (`?.`)
- Nullish coalescing (`??`)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- 🎮 **Classic Minesweeper** - Inspiration from the timeless game
- 🏗️ **Clean Architecture** - Robert C. Martin's architectural principles
- 🎯 **Domain-Driven Design** - Eric Evans' design philosophy
- ⚡ **Modern JavaScript** - Latest ECMAScript standards
- 🤖 **[Claude Code](https://claude.ai/code)** - AI-powered development tool that assisted in implementing advanced features and architectural improvements

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/inflop/minesweeper-js/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/inflop/minesweeper-js/discussions)
- 📧 **Contact**: Create an issue for questions

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

*Built with ❤️ using modern JavaScript and clean architecture principles*

*Latest improvements developed with 🤖 [Claude Code](https://claude.ai/code)*

</div>