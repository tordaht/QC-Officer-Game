# 🏭 Quality Control Officer Game

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

A professional **Quality Control Simulation Game** built with pure HTML5, CSS3, and vanilla JavaScript. Take on the role of a quality inspector in a modern beverage bottling facility and protect production standards using cutting-edge inspection technology.

## 🎮 Game Features

### 🔍 **Advanced Inspection System**
- **Control Light Technology**: Permanent inspection zone that reveals hidden defects
- **Multi-layered Defect Detection**: Spot micro-cracks, foreign objects, fill level errors, and label misalignments
- **Real-time Visual Feedback**: Different defect types require strategic use of the control zone

### 🎯 **Progressive Gameplay**
- **40 Story-driven Levels**: Epic campaign with European factory setting
- **Dynamic Difficulty Scaling**: Conveyor belt speed increases with more complex defect patterns
- **Combo System**: Maintain accuracy streaks for bonus scoring
- **Professional Achievements**: Unlock quality certifications as you progress

### 🌍 **Multi-language Support**
- **English**: Professional European factory storyline
- **Turkish**: Localized industrial narrative
- **Seamless Language Switching**: Change language anytime during gameplay

### 🎨 **Professional Visual Design**
- **Real Factory Video Background**: Authentic bottling facility footage
- **High-Quality Bottle Assets**: 8 detailed PNG sprites (normal + 7 defect types)
- **Dynamic Particle Effects**: Visual feedback for inspection actions
- **Responsive UI**: Optimized for desktop and mobile devices

## 🚀 Quick Start

### Online Play
Visit the live demo: **[Play Quality Control Officer](https://your-demo-link.com)**

### Local Installation
```bash
# Clone the repository
git clone https://github.com/tordaht/QC-Officer-Game.git

# Navigate to project directory
cd QC-Officer-Game

# Open in browser (no build process required!)
open index.html
```

## 🎯 How to Play

### Basic Controls
- **Mouse**: Click defective bottles to remove them from the line
- **Keyboard**: Arrow keys for mobile/alternative control
- **Power-ups**: Use Slow Motion (Spacebar) strategically

### Defect Types
| Defect | Visibility | Detection Strategy |
|--------|------------|-------------------|
| **Color Errors** | Always visible | Immediate visual inspection |
| **Cracks** | Always visible | Look for structural damage |
| **Cap Defects** | Always visible | Check cap placement and color |
| **Micro-cracks** | Control zone only | Position bottles under inspection light |
| **Foreign Objects** | Control zone only | Use control zone for internal inspection |
| **Fill Level** | Control zone only | Monitor liquid levels under light |
| **Label Misalignment** | Control zone only | Verify label positioning |

### Scoring System
- ✅ **Correct Detection**: +100 points × combo multiplier
- ❌ **False Positive**: -50 points, combo reset
- ⏱️ **Time Bonus**: Remaining time × 10 points
- 🎯 **Perfect Level**: +500 bonus points

## 🛠️ Technical Architecture

### Technologies Used
- **Frontend**: Pure HTML5, CSS3, JavaScript ES6+
- **Graphics**: HTML5 Canvas API with real image assets
- **Audio**: Web Audio API for industrial sound effects
- **Storage**: LocalStorage for settings and high scores
- **Responsive Design**: CSS Grid and Flexbox

### Project Structure
```
QC-Officer-Game/
├── index.html              # Main game interface
├── css/
│   └── style.css           # Professional UI styling
├── js/
│   ├── language.js         # Multi-language system
│   ├── config.js          # Game configuration
│   ├── ui.js              # Interface management
│   ├── game.js            # Core game logic
│   └── main.js            # Application entry point
├── assets/
│   ├── images/            # Bottle sprites & factory video
│   └── sounds/            # Industrial audio effects
└── README.md              # Documentation
```

### Key Features Implementation
- **Modular Architecture**: Clean separation of concerns
- **Performance Optimized**: 60fps gameplay with efficient rendering
- **Error Handling**: Comprehensive fallback systems
- **Accessibility**: Keyboard navigation and screen reader support

## 🏆 Achievement System

Unlock professional certifications:

- 🥇 **First Catch**: Spot your first defective bottle
- 🎯 **Perfectionist**: Complete a level with 100% accuracy  
- ⚡ **Speed Demon**: Reach 10x combo multiplier
- 👁️ **Eagle Eye**: Find 5 micro-cracks in one level
- 🏅 **Quality Master**: Complete 10 levels
- 👑 **Legendary Inspector**: Reach level 20

## 🌟 Story & Characters

Experience the world of **EuroBottle Industries** through interactions with:
- **Sarah** - Shift Supervisor
- **Marcus** - Quality Engineer  
- **Elena** - Plant Manager
- **Hans** - Chief Inspector

Navigate an engaging 40-level campaign protecting production standards and uncovering factory secrets.

## 🔧 Development

### Local Development
```bash
# No build process required - pure web technologies
# Simply open index.html in your preferred browser

# For development server (optional):
python -m http.server 8000
# or
npx serve .
```

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📱 Browser Compatibility

- ✅ **Chrome 70+**
- ✅ **Firefox 65+**
- ✅ **Safari 12+**
- ✅ **Edge 79+**
- ⚠️ **IE 11**: Limited support (fallback mode)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Factory footage from professional beverage industry
- Bottle designs inspired by real quality control standards
- Audio effects from industrial manufacturing environments
- European quality management standards and practices

---

**Built with ❤️ for quality control professionals and gaming enthusiasts worldwide**

[🎮 Play Now](https://your-demo-link.com) | [📖 Documentation](https://github.com/tordaht/QC-Officer-Game/wiki) | [🐛 Report Issues](https://github.com/tordaht/QC-Officer-Game/issues)
