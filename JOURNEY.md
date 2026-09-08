# Build Journey: Tic-Tac-Toe

A look at how this project came together, step by step.

## 1. The original build

This was the very first project — a classic Tic-Tac-Toe game built with plain HTML, CSS, and JavaScript, no frameworks. It shipped with both a Two Players mode and a Vs. Computer mode, where the computer plays an unbeatable minimax AI: it looks ahead through every possible sequence of moves and always picks the one that can't lose. Playing as X or O against the computer is a choice on its own screen, the winning line highlights when a game ends, and a scoreboard tracks wins, losses, and draws across sessions using `localStorage`. Dark mode was built in from the start, defaulting to the system's light/dark preference and remembering whatever you last chose.

## 2. Coming back to it

After building the React rebuild of this same game — with sound, confetti, difficulty levels, and keyboard controls — plus a calculator, a weather app, and a portfolio site to show them all off, this original version was the one project still missing GitHub docs and a live deployment. Coming back to finish it meant giving it the same treatment as everything else: a proper README, this journey file, and a real deployment.

## 3. Deploying and documenting

Pushed to GitHub and deployed on Vercel using the same "Other" framework preset as the other static projects — no build step needed since it's just HTML, CSS, and JS. Then wrote this README and journey file to match the documentation style used across the other builds, and confirmed the AI still plays correctly on the live site.

## What's next

This one's intentionally simple — the more feature-rich rebuild lives in the [React version](https://github.com/8fn4wf8phr-ops/tic-tac-toe-react). If it grows further, a few ideas:

- Sound effects, matching the React version
- A "how it works" note explaining the minimax algorithm
- Difficulty levels, instead of always playing unbeatable
