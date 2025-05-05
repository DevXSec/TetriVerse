# 🌌 TetriVerse

A modern, reactive take on the classic Tetris game — rebuilt as **TetriVerse** with React, JavaScript, and WebSockets. Solo or multiplayer, classic or hardcore, this universe of falling blocks is ready for your challenge.

## 🚀 Features

- 🎮 Classic Tetris gameplay (move, rotate, drop, line clears)
- ⚛️ Built with React for a fluid, reactive UI
- 🔧 Game logic in pure JavaScript (vanilla ES6+)
- 🎹 Responsive keyboard controls
- ✅ Unit-tested core mechanics with Jest
- 🧱 Solo and Multiplayer game modes
- 🏆 Leaderboard tracking for Solo mode
- 💀 Game mode switch:  
  - **Classic Mode**  
  - **Hard Mode** (invisible pieces)
- 🎨 Modular, clean and scalable codebase

## 🛠️ Tech Stack

- **React** – Functional components with Hooks
- **JavaScript (ES6+)**
- **WebSockets** – Real-time multiplayer communication
- **Jest** – Unit testing for stable game logic
- **Docker** – Dockerized client & server, accessible on your network

## 📦 Installation

```bash
git clone https://github.com/DevXSec/tetriverse.git
cd tetriverse

cp .env.example .env
# Fill in your environment variables

make          # Start in development mode
make prod     # Start in production mode
```