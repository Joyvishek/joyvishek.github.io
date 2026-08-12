document.addEventListener('DOMContentLoaded', () => {
    const WORDS = [
        'javascript', 'python', 'developer', 'computer', 'keyboard', 'function',
        'variable', 'algorithm', 'database', 'internet', 'software', 'hardware',
        'network', 'browser', 'framework', 'compiler', 'debugging', 'programming',
        'application', 'interface', 'component', 'container', 'repository', 'terminal',
        'element', 'markdown', 'template', 'library', 'security', 'encryption',
        'mountain', 'elephant', 'umbrella', 'sandwich', 'building', 'calendar',
        'triangle', 'currency', 'festival', 'universe'
    ];

    const MAX_WRONG = 6;
    const KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

    const wordDisplay = document.getElementById('word-display');
    const statusEl = document.getElementById('status');
    const keyboardEl = document.getElementById('keyboard');
    const drawingEl = document.getElementById('drawing');
    const wrongCountEl = document.getElementById('wrong-count');
    const winsEl = document.getElementById('wins');
    const lossesEl = document.getElementById('losses');
    const restartBtn = document.getElementById('restart');

    let word = '';
    let guessed = new Set();
    let wrongCount = 0;
    let gameOver = false;

    function loadStats() {
        try {
            return JSON.parse(localStorage.getItem('hangmanStats')) || { wins: 0, losses: 0 };
        } catch (e) {
            return { wins: 0, losses: 0 };
        }
    }

    function saveStats(stats) {
        localStorage.setItem('hangmanStats', JSON.stringify(stats));
    }

    function renderStats() {
        const stats = loadStats();
        winsEl.textContent = stats.wins;
        lossesEl.textContent = stats.losses;
    }

    function updateStats(didWin) {
        const stats = loadStats();
        if (didWin) stats.wins++; else stats.losses++;
        saveStats(stats);
        renderStats();
    }

    const PARTS = [
        '<line x1="10" y1="180" x2="130" y2="180" stroke="#333" stroke-width="4" />',
        '<line x1="40" y1="180" x2="40" y2="20" stroke="#333" stroke-width="4" />',
        '<line x1="40" y1="20" x2="120" y2="20" stroke="#333" stroke-width="4" />',
        '<line x1="120" y1="20" x2="120" y2="45" stroke="#333" stroke-width="4" />',
        '<circle cx="120" cy="65" r="20" stroke="#333" stroke-width="4" fill="none" />',
        '<line x1="120" y1="85" x2="120" y2="130" stroke="#333" stroke-width="4" />',
        '<line x1="120" y1="100" x2="100" y2="120" stroke="#333" stroke-width="4" /><line x1="120" y1="100" x2="140" y2="120" stroke="#333" stroke-width="4" />',
        '<line x1="120" y1="130" x2="100" y2="160" stroke="#333" stroke-width="4" /><line x1="120" y1="130" x2="140" y2="160" stroke="#333" stroke-width="4" />'
    ];

    function renderDrawing() {
        const shown = [PARTS[0], PARTS[1], PARTS[2], PARTS[3]];
        const stageParts = PARTS.slice(4);
        for (let i = 0; i < wrongCount && i < stageParts.length; i++) {
            shown.push(stageParts[i]);
        }
        drawingEl.innerHTML = `<svg viewBox="0 0 180 190" xmlns="http://www.w3.org/2000/svg">${shown.join('')}</svg>`;
    }

    function renderWord() {
        wordDisplay.textContent = word
            .split('')
            .map(ch => (guessed.has(ch) ? ch.toUpperCase() : '_'))
            .join(' ');
    }

    function buildKeyboard() {
        keyboardEl.innerHTML = '';
        KEY_ROWS.forEach(row => {
            row.split('').forEach(letter => {
                const btn = document.createElement('button');
                btn.className = 'key';
                btn.textContent = letter;
                btn.dataset.letter = letter.toLowerCase();
                btn.addEventListener('click', () => handleGuess(letter.toLowerCase()));
                keyboardEl.appendChild(btn);
            });
        });
    }

    function setKeyState(letter, state) {
        const btn = keyboardEl.querySelector(`[data-letter="${letter}"]`);
        if (btn) {
            btn.disabled = true;
            btn.classList.add(state);
        }
    }

    function handleGuess(letter) {
        if (gameOver || guessed.has(letter) || !/^[a-z]$/.test(letter)) return;
        guessed.add(letter);

        if (word.includes(letter)) {
            setKeyState(letter, 'correct');
        } else {
            wrongCount++;
            setKeyState(letter, 'wrong');
        }

        renderWord();
        renderDrawing();
        wrongCountEl.textContent = `${wrongCount} / ${MAX_WRONG}`;
        checkGameEnd();
    }

    function checkGameEnd() {
        const won = word.split('').every(ch => guessed.has(ch));
        if (won) {
            gameOver = true;
            statusEl.textContent = 'You win!';
            disableKeyboard();
            updateStats(true);
        } else if (wrongCount >= MAX_WRONG) {
            gameOver = true;
            statusEl.textContent = `Game Over! The word was ${word.toUpperCase()}`;
            disableKeyboard();
            updateStats(false);
        }
    }

    function disableKeyboard() {
        keyboardEl.querySelectorAll('.key').forEach(btn => (btn.disabled = true));
    }

    function newGame() {
        word = WORDS[Math.floor(Math.random() * WORDS.length)];
        guessed = new Set();
        wrongCount = 0;
        gameOver = false;
        statusEl.textContent = 'Guess the word!';
        wrongCountEl.textContent = `0 / ${MAX_WRONG}`;
        buildKeyboard();
        renderWord();
        renderDrawing();
    }

    document.addEventListener('keydown', (e) => {
        const letter = e.key.toLowerCase();
        if (/^[a-z]$/.test(letter)) handleGuess(letter);
    });

    restartBtn.addEventListener('click', newGame);

    renderStats();
    newGame();
});
