document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const statusDisplay = document.getElementById('status');
    const restartBtn = document.getElementById('restart');
    const goFirstToggle = document.getElementById('goFirstToggle');

    let board = ['', '', '', '', '', '', '', '', ''];
    let humanPlayer = 'X';
    let botPlayer = 'O';
    let currentPlayer = humanPlayer;
    let gameActive = true;
    let humanGoesFirst = true;
    const MAX_MOVES_PER_PLAYER = 3;
    let humanMoves = [];
    let botMoves = [];
    let botMoveTimeout = null;

    // Scores
    let scores = {
        player: 0,
        bot: 0,
        draws: 0
    };

    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    function checkWinner(currentBoard) {
        for (let condition of winConditions) {
            const [a, b, c] = condition;
            if (currentBoard[a] && currentBoard[a] === currentBoard[b] &&
                currentBoard[a] === currentBoard[c]) {
                return { winner: currentBoard[a], line: condition };
            }
        }
        return null;
    }

    function isBoardFull() {
        return board.every(cell => cell !== '');
    }

    // Minimax algorithm for the bot
    function minimax(currentBoard, depth, isMaximizing) {
        const result = checkWinner(currentBoard);

        if (result) {
            return result.winner === botPlayer ? 10 - depth : depth - 10;
        }
        if (isBoardFull()) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (currentBoard[i] === '') {
                    currentBoard[i] = botPlayer;
                    const score = minimax(currentBoard, depth + 1, false);
                    currentBoard[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (currentBoard[i] === '') {
                    currentBoard[i] = humanPlayer;
                    const score = minimax(currentBoard, depth + 1, true);
                    currentBoard[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    function getBestMove() {
        let bestScore = -Infinity;
        let move = -1;

        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = botPlayer;
                const score = minimax(board, 0, false);
                board[i] = '';

                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }

        return move;
    }

    function handleCellClick(event) {
        const cellIndex = parseInt(event.target.dataset.index);

        if (board[cellIndex] !== '' || !gameActive || currentPlayer !== humanPlayer) {
            return;
        }

        makeMove(cellIndex, humanPlayer);

        if (!gameActive) return;

        // Bot's turn
        currentPlayer = botPlayer;
        statusDisplay.textContent = 'Bot is thinking...';

        botMoveTimeout = setTimeout(() => {
            botMoveTimeout = null;
            if (!gameActive) return;

            const bestMove = getBestMove();
            if (bestMove !== -1) {
                makeMove(bestMove, botPlayer);
            }

            if (gameActive) {
                currentPlayer = humanPlayer;
                statusDisplay.textContent = 'Your turn (' + humanPlayer + ')';
            }
        }, 500);
    }

    function makeMove(index, player) {
        const moves = player === humanPlayer ? humanMoves : botMoves;

        if (moves.length >= MAX_MOVES_PER_PLAYER) {
            const oldestIndex = moves.shift();
            board[oldestIndex] = '';
            const oldestCell = document.querySelector(`[data-index="${oldestIndex}"]`);
            oldestCell.textContent = '';
            oldestCell.classList.remove('taken', 'x', 'o', 'winner');
        }

        moves.push(index);
        board[index] = player;
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add('taken', player.toLowerCase());

        const result = checkWinner(board);

        if (result) {
            gameActive = false;
            highlightWinningCells(result.line);

            if (player === humanPlayer) {
                statusDisplay.textContent = '🎉 You win!';
                scores.player++;
            } else {
                statusDisplay.textContent = '🤖 Bot wins!';
                scores.bot++;
            }
            updateScoreBoard();
            return;
        }

        if (isBoardFull()) {
            gameActive = false;
            statusDisplay.textContent = "🤝 It's a draw!";
            scores.draws++;
            updateScoreBoard();
        }
    }

    function highlightWinningCells(line) {
        line.forEach(index => {
            document.querySelector(`[data-index="${index}"]`).classList.add('winner');
        });
    }

    function updateScoreBoard() {
        document.getElementById('playerScore').textContent = scores.player;
        document.getElementById('botScore').textContent = scores.bot;
        document.getElementById('drawScore').textContent = scores.draws;
    }

    function toggleGoFirst() {
        humanGoesFirst = !humanGoesFirst;

        if (humanGoesFirst) {
            humanPlayer = 'X';
            botPlayer = 'O';
        } else {
            humanPlayer = 'O';
            botPlayer = 'X';
        }

        goFirstToggle.classList.toggle('active');
        restartGame();
    }

    function restartGame() {
        if (botMoveTimeout !== null) {
            clearTimeout(botMoveTimeout);
            botMoveTimeout = null;
        }

        board = ['', '', '', '', '', '', '', '', ''];
        gameActive = true;
        humanMoves = [];
        botMoves = [];

        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('taken', 'x', 'o', 'winner');
        });

        currentPlayer = humanPlayer;

        if (humanGoesFirst) {
            statusDisplay.textContent = 'Your turn (' + humanPlayer + ')';
        } else {
            statusDisplay.textContent = 'Bot is thinking...';

            // Bot makes the first move
            botMoveTimeout = setTimeout(() => {
                botMoveTimeout = null;
                if (!gameActive) return;

                const bestMove = getBestMove();
                if (bestMove !== -1) {
                    makeMove(bestMove, botPlayer);
                }

                if (gameActive) {
                    currentPlayer = humanPlayer;
                    statusDisplay.textContent = 'Your turn (' + humanPlayer + ')';
                }
            }, 500);
        }
    }

    // Event listeners
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    restartBtn.addEventListener('click', restartGame);
    goFirstToggle.addEventListener('click', toggleGoFirst);
});