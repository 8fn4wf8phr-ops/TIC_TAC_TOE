/* ============ Theme ============ */
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  try { localStorage.setItem('ttt-theme', theme); } catch (e) {}
}

(function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('ttt-theme'); } catch (e) {}
  const preferred = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(saved || preferred);
})();

themeToggle.addEventListener('click', () => {
  applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

/* ============ Screens ============ */
const modeScreen = document.getElementById('modeScreen');
const symbolScreen = document.getElementById('symbolScreen');
const gameScreen = document.getElementById('gameScreen');

function showScreen(name) {
  modeScreen.hidden = name !== 'mode';
  symbolScreen.hidden = name !== 'symbol';
  gameScreen.hidden = name !== 'game';
}

/* ============ Game state ============ */
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

let board = Array(9).fill(null);
let mode = '2p';        // '2p' or 'ai'
let humanSymbol = 'X';
let aiSymbol = 'O';
let currentPlayer = 'X';
let gameOver = false;

let score = { X: 0, O: 0, draw: 0 };
try { score = JSON.parse(localStorage.getItem('ttt-score') || '') || score; } catch (e) {}

/* ============ Mode select ============ */
document.querySelectorAll('#modeScreen [data-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    mode = btn.dataset.mode;
    if (mode === 'ai') {
      showScreen('symbol');
    } else {
      humanSymbol = 'X';
      aiSymbol = 'O';
      startGame();
    }
  });
});

document.getElementById('backFromSymbol').addEventListener('click', () => showScreen('mode'));

document.querySelectorAll('#symbolScreen [data-symbol]').forEach(btn => {
  btn.addEventListener('click', () => {
    humanSymbol = btn.dataset.symbol;
    aiSymbol = humanSymbol === 'X' ? 'O' : 'X';
    startGame();
  });
});

document.getElementById('changeModeBtn').addEventListener('click', () => showScreen('mode'));
document.getElementById('restartBtn').addEventListener('click', () => startGame());

/* ============ Board / cells ============ */
const boardEl = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const statusText = document.getElementById('statusText');
const scoreboardEl = document.getElementById('scoreboard');

cells.forEach(cell => {
  cell.addEventListener('click', () => {
    const index = parseInt(cell.dataset.index, 10);
    handleCellClick(index);
  });
});

function startGame() {
  board = Array(9).fill(null);
  currentPlayer = 'X';
  gameOver = false;
  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
    cell.disabled = false;
  });
  updateScoreboard();
  showScreen('game');
  updateStatus();

  // If playing vs AI and AI goes first (human chose O)
  if (mode === 'ai' && currentPlayer === aiSymbol) {
    disableBoard(true);
    setTimeout(aiMove, 350);
  }
}

function handleCellClick(index) {
  if (gameOver || board[index] !== null) return;
  if (mode === 'ai' && currentPlayer !== humanSymbol) return;

  placeMark(index, currentPlayer);

  const result = getResult(board);
  if (result) {
    endGame(result);
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus();

  if (mode === 'ai' && !gameOver && currentPlayer === aiSymbol) {
    disableBoard(true);
    setTimeout(aiMove, 350);
  }
}

function placeMark(index, symbol) {
  board[index] = symbol;
  const cell = cells[index];
  cell.textContent = symbol;
  cell.classList.add(symbol === 'X' ? 'mark-x' : 'mark-o');
  cell.disabled = true;
}

function disableBoard(disabled) {
  cells.forEach((cell, i) => {
    if (board[i] === null) cell.disabled = disabled;
  });
}

function updateStatus() {
  if (gameOver) return;
  if (mode === 'ai') {
    statusText.textContent = currentPlayer === humanSymbol ? 'Your turn' : "Computer's turn";
  } else {
    statusText.textContent = `${currentPlayer}'s turn`;
  }
}

function endGame(result) {
  gameOver = true;
  disableBoard(true);

  if (result.winner) {
    result.line.forEach(i => cells[i].classList.add('winning-cell'));
    score[result.winner] = (score[result.winner] || 0) + 1;
    if (mode === 'ai') {
      statusText.textContent = result.winner === humanSymbol ? 'You win! 🎉' : 'Computer wins';
    } else {
      statusText.textContent = `${result.winner} wins! 🎉`;
    }
  } else {
    score.draw = (score.draw || 0) + 1;
    statusText.textContent = "It's a draw";
  }

  try { localStorage.setItem('ttt-score', JSON.stringify(score)); } catch (e) {}
  updateScoreboard();
}

function updateScoreboard() {
  scoreboardEl.innerHTML = `
    <span>X: <strong>${score.X || 0}</strong></span>
    <span>O: <strong>${score.O || 0}</strong></span>
    <span>Draws: <strong>${score.draw || 0}</strong></span>
  `;
}

/* ============ Win / draw detection ============ */
function getResult(b) {
  for (const line of WIN_LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) {
      return { winner: b[a], line: line };
    }
  }
  if (b.every(cell => cell !== null)) {
    return { winner: null, line: [] }; // draw
  }
  return null; // game continues
}

/* ============ Minimax AI ============ */
function aiMove() {
  const bestIndex = getBestMove(board, aiSymbol, humanSymbol);
  if (bestIndex === -1) return;

  placeMark(bestIndex, aiSymbol);

  const result = getResult(board);
  if (result) {
    endGame(result);
    return;
  }

  currentPlayer = humanSymbol;
  disableBoard(false);
  updateStatus();
}

function getBestMove(b, ai, human) {
  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < 9; i++) {
    if (b[i] === null) {
      b[i] = ai;
      const score = minimax(b, 0, false, ai, human);
      b[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(b, depth, isMaximizing, ai, human) {
  const result = getResult(b);
  if (result) {
    if (result.winner === ai) return 10 - depth;
    if (result.winner === human) return depth - 10;
    return 0; // draw
  }

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i] === null) {
        b[i] = ai;
        best = Math.max(best, minimax(b, depth + 1, false, ai, human));
        b[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (b[i] === null) {
        b[i] = human;
        best = Math.min(best, minimax(b, depth + 1, true, ai, human));
        b[i] = null;
      }
    }
    return best;
  }
}
