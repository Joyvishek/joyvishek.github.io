document.addEventListener('DOMContentLoaded', () => {
    const statusDisplay = document.getElementById('status');
    const restartBtn = document.getElementById('restart');
    const playerChoiceEl = document.getElementById('playerChoice');
    const botChoiceEl = document.getElementById('botChoice');
    const choiceButtons = document.querySelectorAll('.choice-btn');

    const icons = { rock: '🪨', paper: '📄', scissors: '✂️' };
    const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

    let scores = { player: 0, bot: 0, draws: 0 };

    function play(playerChoice) {
        const options = Object.keys(icons);
        const botChoice = options[Math.floor(Math.random() * options.length)];

        playerChoiceEl.textContent = icons[playerChoice];
        botChoiceEl.textContent = icons[botChoice];
        playerChoiceEl.classList.remove('reveal');
        botChoiceEl.classList.remove('reveal');
        void playerChoiceEl.offsetWidth;
        playerChoiceEl.classList.add('reveal');
        botChoiceEl.classList.add('reveal');

        if (playerChoice === botChoice) {
            scores.draws++;
            statusDisplay.textContent = "🤝 It's a draw!";
        } else if (beats[playerChoice] === botChoice) {
            scores.player++;
            statusDisplay.textContent = '🎉 You win!';
        } else {
            scores.bot++;
            statusDisplay.textContent = '🤖 Bot wins!';
        }

        updateScoreBoard();
    }

    function updateScoreBoard() {
        document.getElementById('playerScore').textContent = scores.player;
        document.getElementById('botScore').textContent = scores.bot;
        document.getElementById('drawScore').textContent = scores.draws;
    }

    function resetScores() {
        scores = { player: 0, bot: 0, draws: 0 };
        updateScoreBoard();
        playerChoiceEl.textContent = '❓';
        botChoiceEl.textContent = '❓';
        statusDisplay.textContent = 'Make your move';
    }

    choiceButtons.forEach(btn => {
        btn.addEventListener('click', () => play(btn.dataset.choice));
    });

    restartBtn.addEventListener('click', resetScores);
});
