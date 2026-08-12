document.addEventListener('DOMContentLoaded', () => {
    const boardEl = document.getElementById('board');
    const statusDisplay = document.getElementById('status');
    const movesDisplay = document.getElementById('moves');
    const matchesDisplay = document.getElementById('matches');
    const bestDisplay = document.getElementById('best');
    const restartBtn = document.getElementById('restart');

    const icons = ['🐶', '🐱', '🦊', '🐼', '🦁', '🐸', '🐵', '🐰'];
    const BEST_KEY = 'memoryMatchBestMoves';

    let cards = [];
    let flipped = [];
    let matchedCount = 0;
    let moves = 0;
    let lockBoard = false;

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function buildBoard() {
        boardEl.innerHTML = '';
        cards = shuffle([...icons, ...icons]);
        flipped = [];
        matchedCount = 0;
        moves = 0;
        lockBoard = false;

        movesDisplay.textContent = moves;
        matchesDisplay.textContent = `0 / ${icons.length}`;
        statusDisplay.textContent = 'Find all the matching pairs';
        bestDisplay.textContent = localStorage.getItem(BEST_KEY) || '-';

        cards.forEach((icon, index) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataset.index = index;
            card.dataset.icon = icon;
            card.addEventListener('click', () => handleCardClick(card));
            boardEl.appendChild(card);
        });
    }

    function handleCardClick(card) {
        if (lockBoard) return;
        if (card.classList.contains('flipped') || card.classList.contains('matched')) return;

        card.classList.add('flipped');
        card.textContent = card.dataset.icon;
        flipped.push(card);

        if (flipped.length === 2) {
            moves++;
            movesDisplay.textContent = moves;
            checkMatch();
        }
    }

    function checkMatch() {
        const [first, second] = flipped;

        if (first.dataset.icon === second.dataset.icon) {
            first.classList.add('matched');
            second.classList.add('matched');
            flipped = [];
            matchedCount++;
            matchesDisplay.textContent = `${matchedCount} / ${icons.length}`;

            if (matchedCount === icons.length) {
                finishGame();
            }
            return;
        }

        lockBoard = true;
        setTimeout(() => {
            first.classList.remove('flipped');
            second.classList.remove('flipped');
            first.textContent = '';
            second.textContent = '';
            flipped = [];
            lockBoard = false;
        }, 700);
    }

    function finishGame() {
        statusDisplay.textContent = `🎉 Solved in ${moves} moves!`;

        const best = parseInt(localStorage.getItem(BEST_KEY), 10);
        if (!best || moves < best) {
            localStorage.setItem(BEST_KEY, moves);
            bestDisplay.textContent = moves;
            statusDisplay.textContent += ' New best!';
        }
    }

    restartBtn.addEventListener('click', buildBoard);

    buildBoard();
});
