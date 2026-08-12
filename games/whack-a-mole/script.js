document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const startBtn = document.getElementById('start');
    const statusEl = document.getElementById('status');
    const timeEl = document.getElementById('time');
    const scoreEl = document.getElementById('score');
    const bestEl = document.getElementById('best');

    const HOLE_COUNT = 9;
    const ROUND_TIME = 30;
    const MOLES = ['🐹', '🦔'];

    let holes = [];
    let score = 0;
    let timeLeft = ROUND_TIME;
    let playing = false;
    let countdownId = null;
    let popTimeoutId = null;
    let activeHole = null;
    let hideTimeoutId = null;

    let best = parseInt(localStorage.getItem('whackBestScore') || '0', 10);
    bestEl.textContent = best;

    for (let i = 0; i < HOLE_COUNT; i++) {
        const hole = document.createElement('div');
        hole.className = 'hole';
        const span = document.createElement('span');
        span.textContent = MOLES[Math.floor(Math.random() * MOLES.length)];
        hole.appendChild(span);
        hole.addEventListener('click', () => whack(hole));
        board.appendChild(hole);
        holes.push(hole);
    }

    function whack(hole) {
        if (!playing || !hole.classList.contains('up')) return;
        hole.classList.remove('up');
        hole.classList.add('whacked');
        setTimeout(() => hole.classList.remove('whacked'), 200);
        clearTimeout(hideTimeoutId);
        activeHole = null;
        score++;
        scoreEl.textContent = score;
    }

    function popMole() {
        if (!playing) return;
        if (activeHole) {
            activeHole.classList.remove('up');
        }
        const hole = holes[Math.floor(Math.random() * holes.length)];
        const span = hole.querySelector('span');
        span.textContent = MOLES[Math.floor(Math.random() * MOLES.length)];
        hole.classList.add('up');
        activeHole = hole;

        const progress = (ROUND_TIME - timeLeft) / ROUND_TIME;
        const upTime = Math.max(500, 1100 - progress * 500);
        hideTimeoutId = setTimeout(() => {
            hole.classList.remove('up');
            if (activeHole === hole) activeHole = null;
        }, upTime);

        const nextDelay = Math.max(500, 1400 - progress * 700) + Math.random() * 500;
        popTimeoutId = setTimeout(popMole, nextDelay);
    }

    function startGame() {
        playing = true;
        score = 0;
        timeLeft = ROUND_TIME;
        scoreEl.textContent = score;
        timeEl.textContent = timeLeft;
        statusEl.textContent = 'Whack those moles!';
        startBtn.disabled = true;
        startBtn.textContent = 'Playing...';

        popTimeoutId = setTimeout(popMole, 600);

        countdownId = setInterval(() => {
            timeLeft--;
            timeEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    function endGame() {
        playing = false;
        clearInterval(countdownId);
        clearTimeout(popTimeoutId);
        clearTimeout(hideTimeoutId);
        holes.forEach(h => h.classList.remove('up'));
        activeHole = null;

        if (score > best) {
            best = score;
            localStorage.setItem('whackBestScore', String(best));
            bestEl.textContent = best;
        }

        statusEl.textContent = `Time's up! Score: ${score}`;
        startBtn.disabled = false;
        startBtn.textContent = 'Start';
    }

    startBtn.addEventListener('click', startGame);
});
