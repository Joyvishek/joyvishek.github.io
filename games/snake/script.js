document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('board');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const bestEl = document.getElementById('best');
    const statusEl = document.getElementById('status');
    const restartBtn = document.getElementById('restart');

    const GRID = 20;
    const CELL = canvas.width / GRID;
    const SPEED = 120;

    let snake, direction, nextDirection, food, score, best, gameOver, timer;

    best = parseInt(localStorage.getItem('snakeBestScore') || '0', 10);
    bestEl.textContent = best;

    function randomFood() {
        let pos;
        do {
            pos = {
                x: Math.floor(Math.random() * GRID),
                y: Math.floor(Math.random() * GRID)
            };
        } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
        return pos;
    }

    function init() {
        snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
        direction = { x: 1, y: 0 };
        nextDirection = { x: 1, y: 0 };
        score = 0;
        gameOver = false;
        food = randomFood();
        scoreEl.textContent = score;
        statusEl.textContent = 'Use arrow keys or WASD';
        if (timer) clearInterval(timer);
        timer = setInterval(tick, SPEED);
        draw();
    }

    function tick() {
        if (gameOver) return;
        direction = nextDirection;
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID ||
            snake.some(seg => seg.x === head.x && seg.y === head.y)) {
            endGame();
            return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreEl.textContent = score;
            food = randomFood();
        } else {
            snake.pop();
        }

        draw();
    }

    function endGame() {
        gameOver = true;
        clearInterval(timer);
        statusEl.textContent = 'Game Over! Score: ' + score;
        if (score > best) {
            best = score;
            localStorage.setItem('snakeBestScore', best);
            bestEl.textContent = best;
        }
    }

    function draw() {
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(food.x * CELL, food.y * CELL, CELL, CELL);

        snake.forEach((seg, i) => {
            ctx.fillStyle = i === 0 ? '#667eea' : '#764ba2';
            ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
        });
    }

    function setDirection(x, y) {
        if (gameOver) return;
        if (direction.x === -x && direction.y === -y) return;
        if (direction.x === x && direction.y === y) return;
        nextDirection = { x, y };
    }

    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                setDirection(0, -1);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                setDirection(0, 1);
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                setDirection(-1, 0);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                setDirection(1, 0);
                break;
        }
    });

    document.getElementById('up').addEventListener('click', () => setDirection(0, -1));
    document.getElementById('down').addEventListener('click', () => setDirection(0, 1));
    document.getElementById('left').addEventListener('click', () => setDirection(-1, 0));
    document.getElementById('right').addEventListener('click', () => setDirection(1, 0));

    restartBtn.addEventListener('click', init);

    init();
});
