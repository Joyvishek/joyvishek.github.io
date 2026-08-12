document.addEventListener('DOMContentLoaded', () => {
    const SIZE = 4;
    const boardEl = document.getElementById('board');
    const scoreEl = document.getElementById('score');
    const bestEl = document.getElementById('best');
    const statusEl = document.getElementById('status');
    const restartBtn = document.getElementById('restart');

    let grid = [];
    let score = 0;
    let best = parseInt(localStorage.getItem('twenty48BestScore'), 10) || 0;
    let won = false;
    let over = false;

    bestEl.textContent = best;

    function emptyGrid() {
        return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    }

    function getEmptyCells() {
        const cells = [];
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c] === 0) cells.push([r, c]);
            }
        }
        return cells;
    }

    function addRandomTile() {
        const cells = getEmptyCells();
        if (cells.length === 0) return;
        const [r, c] = cells[Math.floor(Math.random() * cells.length)];
        grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    function tileClass(value) {
        if (value <= 2048) return `tile-${value}`;
        return 'tile-super';
    }

    function render() {
        boardEl.innerHTML = '';
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const value = grid[r][c];
                const div = document.createElement('div');
                if (value === 0) {
                    div.className = 'cell';
                } else {
                    div.className = `tile ${tileClass(value)}`;
                    div.textContent = value;
                }
                boardEl.appendChild(div);
            }
        }
        scoreEl.textContent = score;
        if (score > best) {
            best = score;
            localStorage.setItem('twenty48BestScore', String(best));
        }
        bestEl.textContent = best;
    }

    function slideRowLeft(row) {
        let arr = row.filter(v => v !== 0);
        let gained = 0;
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                gained += arr[i];
                arr.splice(i + 1, 1);
            }
        }
        while (arr.length < SIZE) arr.push(0);
        return { row: arr, gained };
    }

    function rotateGridClockwise(g) {
        const result = emptyGrid();
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                result[c][SIZE - 1 - r] = g[r][c];
            }
        }
        return result;
    }

    function move(direction) {
        if (over) return false;

        let rotations = 0;
        if (direction === 'up') rotations = 3;
        else if (direction === 'right') rotations = 2;
        else if (direction === 'down') rotations = 1;

        let working = grid;
        for (let i = 0; i < rotations; i++) working = rotateGridClockwise(working);

        let moved = false;
        let gainedTotal = 0;
        const newGrid = [];
        for (let r = 0; r < SIZE; r++) {
            const original = working[r];
            const { row, gained } = slideRowLeft(original);
            gainedTotal += gained;
            if (!moved && row.some((v, i) => v !== original[i])) moved = true;
            newGrid.push(row);
        }

        let result = newGrid;
        const restoreRotations = (4 - rotations) % 4;
        for (let i = 0; i < restoreRotations; i++) result = rotateGridClockwise(result);

        if (moved) {
            grid = result;
            score += gainedTotal;
            addRandomTile();
            render();
            checkWin();
            checkGameOver();
        }
        return moved;
    }

    function checkWin() {
        if (won) return;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                if (grid[r][c] === 2048) {
                    won = true;
                    statusEl.textContent = 'You win! Keep going or start a new game.';
                }
            }
        }
    }

    function canMove() {
        if (getEmptyCells().length > 0) return true;
        for (let r = 0; r < SIZE; r++) {
            for (let c = 0; c < SIZE; c++) {
                const value = grid[r][c];
                if (c < SIZE - 1 && grid[r][c + 1] === value) return true;
                if (r < SIZE - 1 && grid[r + 1][c] === value) return true;
            }
        }
        return false;
    }

    function checkGameOver() {
        if (!canMove()) {
            over = true;
            statusEl.textContent = 'Game over! No more moves left.';
        } else if (!won) {
            statusEl.textContent = 'Use arrow keys or WASD to play';
        }
    }

    function startGame() {
        grid = emptyGrid();
        score = 0;
        won = false;
        over = false;
        statusEl.textContent = 'Use arrow keys or WASD to play';
        addRandomTile();
        addRandomTile();
        render();
    }

    const keyMap = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        W: 'up',
        s: 'down',
        S: 'down',
        a: 'left',
        A: 'left',
        d: 'right',
        D: 'right'
    };

    document.addEventListener('keydown', (e) => {
        const direction = keyMap[e.key];
        if (direction) {
            e.preventDefault();
            move(direction);
        }
    });

    let touchStartX = 0;
    let touchStartY = 0;

    boardEl.addEventListener('touchstart', (e) => {
        const touch = e.changedTouches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });

    boardEl.addEventListener('touchend', (e) => {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const threshold = 20;

        if (Math.max(absDx, absDy) < threshold) return;

        if (absDx > absDy) {
            move(dx > 0 ? 'right' : 'left');
        } else {
            move(dy > 0 ? 'down' : 'up');
        }
    }, { passive: true });

    restartBtn.addEventListener('click', startGame);

    startGame();
});
