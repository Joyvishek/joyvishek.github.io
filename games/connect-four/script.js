document.addEventListener('DOMContentLoaded', () => {
    const ROWS = 6;
    const COLS = 7;
    const PLAYER = 'red';
    const BOT = 'yellow';

    const boardEl = document.getElementById('board');
    const statusEl = document.getElementById('status');
    const restartBtn = document.getElementById('restart');
    const playerScoreEl = document.getElementById('playerScore');
    const drawScoreEl = document.getElementById('drawScore');
    const botScoreEl = document.getElementById('botScore');

    let grid = [];
    let gameOver = false;
    let cells = [];
    let scores = { player: 0, draw: 0, bot: 0 };

    function createBoard() {
        boardEl.innerHTML = '';
        cells = [];
        grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
        for (let r = 0; r < ROWS; r++) {
            const row = [];
            for (let c = 0; c < COLS; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener('click', () => onColumnClick(c));
                boardEl.appendChild(cell);
                row.push(cell);
            }
            cells.push(row);
        }
        boardEl.classList.remove('disabled');
        gameOver = false;
        statusEl.textContent = 'Your turn';
    }

    function lowestEmptyRow(col) {
        for (let r = ROWS - 1; r >= 0; r--) {
            if (!grid[r][col]) return r;
        }
        return -1;
    }

    function placeDisc(row, col, color) {
        grid[row][col] = color;
        const disc = document.createElement('div');
        disc.className = 'disc ' + color;
        cells[row][col].appendChild(disc);
    }

    function checkWin(color) {
        const dirs = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c] !== color) continue;
                for (const [dr, dc] of dirs) {
                    const line = [[r, c]];
                    for (let i = 1; i < 4; i++) {
                        const nr = r + dr * i;
                        const nc = c + dc * i;
                        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || grid[nr][nc] !== color) break;
                        line.push([nr, nc]);
                    }
                    if (line.length === 4) return line;
                }
            }
        }
        return null;
    }

    function isFull() {
        return grid[0].every(cell => cell !== null);
    }

    function onColumnClick(col) {
        if (gameOver) return;
        const row = lowestEmptyRow(col);
        if (row === -1) return;
        placeDisc(row, col, PLAYER);
        const winLine = checkWin(PLAYER);
        if (winLine) {
            endGame(winLine, 'player');
            return;
        }
        if (isFull()) {
            endGame(null, 'draw');
            return;
        }
        statusEl.textContent = "Bot is thinking...";
        boardEl.classList.add('disabled');
        setTimeout(botMove, 500);
    }

    function botMove() {
        if (gameOver) return;
        const col = pickBotColumn();
        const row = lowestEmptyRow(col);
        if (row === -1) {
            boardEl.classList.remove('disabled');
            return;
        }
        placeDisc(row, col, BOT);
        const winLine = checkWin(BOT);
        if (winLine) {
            endGame(winLine, 'bot');
            return;
        }
        if (isFull()) {
            endGame(null, 'draw');
            return;
        }
        boardEl.classList.remove('disabled');
        statusEl.textContent = 'Your turn';
    }

    function validColumns() {
        const cols = [];
        for (let c = 0; c < COLS; c++) {
            if (lowestEmptyRow(c) !== -1) cols.push(c);
        }
        return cols;
    }

    function wouldWin(col, color) {
        const row = lowestEmptyRow(col);
        if (row === -1) return false;
        grid[row][col] = color;
        const win = checkWin(color);
        grid[row][col] = null;
        return !!win;
    }

    function pickBotColumn() {
        const cols = validColumns();

        for (const c of cols) {
            if (wouldWin(c, BOT)) return c;
        }
        for (const c of cols) {
            if (wouldWin(c, PLAYER)) return c;
        }

        const center = Math.floor(COLS / 2);
        const weighted = cols.slice().sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
        const bestDistance = Math.abs(weighted[0] - center);
        const goodCols = weighted.filter(c => Math.abs(c - center) <= bestDistance + 1);
        return goodCols[Math.floor(Math.random() * goodCols.length)];
    }

    function endGame(winLine, winner) {
        gameOver = true;
        boardEl.classList.add('disabled');
        if (winLine) {
            winLine.forEach(([r, c]) => cells[r][c].classList.add('win'));
        }
        if (winner === 'player') {
            statusEl.textContent = 'You win!';
            scores.player++;
            playerScoreEl.textContent = scores.player;
        } else if (winner === 'bot') {
            statusEl.textContent = 'Bot wins!';
            scores.bot++;
            botScoreEl.textContent = scores.bot;
        } else {
            statusEl.textContent = "It's a draw!";
            scores.draw++;
            drawScoreEl.textContent = scores.draw;
        }
    }

    restartBtn.addEventListener('click', createBoard);

    createBoard();
});
