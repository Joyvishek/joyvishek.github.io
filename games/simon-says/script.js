document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const pads = Array.from(document.querySelectorAll('.pad'));
    const startBtn = document.getElementById('start');
    const statusEl = document.getElementById('status');
    const roundEl = document.getElementById('round');
    const bestEl = document.getElementById('best');

    const BEST_KEY = 'simonBestRound';
    let audioCtx = null;
    let sequence = [];
    let playerStep = 0;
    let round = 0;
    let best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0;
    let playing = false;
    let acceptingInput = false;

    bestEl.textContent = best;

    function ensureAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function beep(freq, duration = 300) {
        ensureAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration / 1000);
    }

    function litUp(pad, duration = 300) {
        pad.classList.add('active');
        beep(parseFloat(pad.dataset.note), duration);
        return new Promise(resolve => {
            setTimeout(() => {
                pad.classList.remove('active');
                resolve();
            }, duration);
        });
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function setPadsDisabled(disabled) {
        pads.forEach(pad => pad.classList.toggle('disabled', disabled));
    }

    async function playSequence() {
        playing = true;
        acceptingInput = false;
        setPadsDisabled(true);
        statusEl.textContent = 'Watch the sequence...';
        await sleep(500);
        for (const index of sequence) {
            await litUp(pads[index]);
            await sleep(150);
        }
        playing = false;
        acceptingInput = true;
        playerStep = 0;
        setPadsDisabled(false);
        statusEl.textContent = 'Your turn!';
    }

    function nextRound() {
        round += 1;
        roundEl.textContent = round;
        sequence.push(Math.floor(Math.random() * 4));
        playSequence();
    }

    function endGame() {
        acceptingInput = false;
        setPadsDisabled(true);
        statusEl.textContent = `Game Over! Reached round ${round}`;
        if (round > best) {
            best = round;
            localStorage.setItem(BEST_KEY, best);
            bestEl.textContent = best;
        }
        startBtn.disabled = false;
        startBtn.textContent = 'Start';
    }

    function handlePadClick(pad) {
        if (!acceptingInput || playing) return;
        const index = pads.indexOf(pad);
        litUp(pad, 200);

        if (index === sequence[playerStep]) {
            playerStep += 1;
            if (playerStep === sequence.length) {
                acceptingInput = false;
                setTimeout(nextRound, 700);
            }
        } else {
            endGame();
        }
    }

    pads.forEach(pad => {
        pad.addEventListener('click', () => handlePadClick(pad));
    });

    startBtn.addEventListener('click', () => {
        ensureAudio();
        sequence = [];
        round = 0;
        playerStep = 0;
        roundEl.textContent = round;
        startBtn.disabled = true;
        startBtn.textContent = 'Playing...';
        nextRound();
    });
});
