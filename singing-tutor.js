// Laulunopetus Sovellus - Main JavaScript

// ============ CONSTANTS & NOTE FREQUENCIES ============
const NOTE_FREQUENCIES = {
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81,
    'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00,
    'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
    'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
    'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// ============ DRONE SYNTH ============
let drone = null;
let droneVolume = null;
let referenceNote = null;
let isPlaying = false;

function initializeDrone() {
    // Create a rich tanpura-like drone sound with multiple oscillators
    droneVolume = new Tone.Volume(-12).toDestination();
    const reverb = new Tone.Reverb(3).connect(droneVolume);

    // PolySynth for multiple simultaneous notes (tanpura style)
    drone = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3,
        modulationIndex: 10,
        oscillator: {
            type: 'sine'
        },
        envelope: {
            attack: 2,
            decay: 0,
            sustain: 1,
            release: 4
        },
        modulation: {
            type: 'square'
        },
        modulationEnvelope: {
            attack: 0.5,
            decay: 0,
            sustain: 1,
            release: 1
        }
    }).connect(reverb);

    // Reference note synth (simple sine wave)
    referenceNote = new Tone.Synth({
        oscillator: {
            type: 'sine'
        },
        envelope: {
            attack: 0.1,
            decay: 0.2,
            sustain: 0.5,
            release: 1
        }
    }).toDestination();
}

async function startDrone() {
    await Tone.start();
    const rootNote = document.getElementById('rootNote').value;

    // Play tanpura-style notes: root, fifth, octave, and upper root
    const root = rootNote;
    const fifth = Tone.Frequency(rootNote).transpose(7).toNote();
    const octave = Tone.Frequency(rootNote).transpose(12).toNote();

    // Trigger the drone notes
    drone.triggerAttack([root, fifth, octave]);

    isPlaying = true;
    updateDroneButtons();
}

function stopDrone() {
    if (drone) {
        drone.releaseAll();
    }
    isPlaying = false;
    updateDroneButtons();
}

function updateDroneButtons() {
    document.getElementById('startDrone').disabled = isPlaying;
    document.getElementById('stopDrone').disabled = !isPlaying;
}

function updateDroneVolume(value) {
    if (droneVolume) {
        droneVolume.volume.value = value;
    }
    document.getElementById('volumeValue').textContent = `${value} dB`;
}

async function playReferenceNote() {
    await Tone.start();
    const targetNote = document.getElementById('targetNote').value;
    referenceNote.triggerAttackRelease(targetNote, '1n');
}

// ============ PITCH DETECTION ============
let audioContext = null;
let analyser = null;
let microphone = null;
let rafId = null;

// Autocorrelation-based pitch detection
function autoCorrelate(buffer, sampleRate) {
    const SIZE = buffer.length;
    const MAX_SAMPLES = Math.floor(SIZE / 2);
    let best_offset = -1;
    let best_correlation = 0;
    let rms = 0;

    // Calculate RMS (root mean square) to detect if there's enough signal
    for (let i = 0; i < SIZE; i++) {
        const val = buffer[i];
        rms += val * val;
    }
    rms = Math.sqrt(rms / SIZE);

    // Not enough signal
    if (rms < 0.01) return -1;

    // Find the first zero crossing
    let lastCorrelation = 1;
    for (let offset = 1; offset < MAX_SAMPLES; offset++) {
        let correlation = 0;

        for (let i = 0; i < MAX_SAMPLES; i++) {
            correlation += Math.abs(buffer[i] - buffer[i + offset]);
        }

        correlation = 1 - (correlation / MAX_SAMPLES);

        if (correlation > 0.9 && correlation > lastCorrelation) {
            const foundGoodCorrelation = correlation > best_correlation;
            if (foundGoodCorrelation) {
                best_correlation = correlation;
                best_offset = offset;
            }
        }
        lastCorrelation = correlation;
    }

    if (best_correlation > 0.01 && best_offset !== -1) {
        const fundamental = sampleRate / best_offset;
        return fundamental;
    }
    return -1;
}

function frequencyToNote(frequency) {
    const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
    const nearestNote = Math.round(noteNum) + 69; // 69 is A4
    const noteIndex = (nearestNote - 12) % 12;
    const octave = Math.floor((nearestNote - 12) / 12);
    return NOTE_NAMES[noteIndex] + octave;
}

function calculateCents(frequency, targetFrequency) {
    return Math.floor(1200 * Math.log2(frequency / targetFrequency));
}

function updateTunerDisplay(frequency) {
    const detectedNoteEl = document.getElementById('detectedNote');
    const frequencyEl = document.getElementById('frequency');
    const centsOffEl = document.getElementById('centsOff');
    const meterNeedle = document.getElementById('meterNeedle');
    const accuracyStatus = document.getElementById('accuracyStatus');

    if (frequency === -1 || frequency < 50 || frequency > 2000) {
        detectedNoteEl.textContent = '--';
        frequencyEl.textContent = '-- Hz';
        centsOffEl.textContent = '0';
        meterNeedle.style.left = '50%';
        accuracyStatus.textContent = 'Odottaa ääntä...';
        accuracyStatus.className = 'status';
        return;
    }

    const note = frequencyToNote(frequency);
    const targetNote = document.getElementById('targetNote').value;
    const targetFreq = NOTE_FREQUENCIES[targetNote];
    const cents = calculateCents(frequency, targetFreq);

    // Update display
    detectedNoteEl.textContent = note;
    frequencyEl.textContent = `${frequency.toFixed(1)} Hz`;
    centsOffEl.textContent = `${cents > 0 ? '+' : ''}${cents}`;

    // Update meter needle position (50 cents = 25% of bar width)
    const maxCents = 50;
    const needlePosition = 50 + (cents / maxCents) * 25; // 50% center, ±25% for ±50 cents
    const clampedPosition = Math.max(0, Math.min(100, needlePosition));
    meterNeedle.style.left = `${clampedPosition}%`;

    // Update accuracy status
    const absCents = Math.abs(cents);
    if (absCents <= 5) {
        accuracyStatus.textContent = '🎯 Täydellinen!';
        accuracyStatus.className = 'status perfect';
    } else if (absCents <= 10) {
        accuracyStatus.textContent = '✓ Erittäin hyvä';
        accuracyStatus.className = 'status good';
    } else if (absCents <= 25) {
        accuracyStatus.textContent = 'Lähellä - jatka harjoittelua';
        accuracyStatus.className = 'status close';
    } else {
        accuracyStatus.textContent = `${cents > 0 ? 'Liian korkea' : 'Liian matala'}`;
        accuracyStatus.className = 'status off';
    }
}

function detectPitch() {
    const bufferLength = analyser.fftSize;
    const buffer = new Float32Array(bufferLength);
    analyser.getFloatTimeDomainData(buffer);

    const frequency = autoCorrelate(buffer, audioContext.sampleRate);
    updateTunerDisplay(frequency);

    rafId = requestAnimationFrame(detectPitch);
}

async function startMicrophone() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);

        detectPitch();

        document.getElementById('startMic').disabled = true;
        document.getElementById('stopMic').disabled = false;
    } catch (error) {
        alert('Mikrofonin käyttö epäonnistui. Varmista, että olet antanut luvan mikrofonin käyttöön.');
        console.error('Microphone error:', error);
    }
}

function stopMicrophone() {
    if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
    }

    if (microphone && microphone.mediaStream) {
        microphone.mediaStream.getTracks().forEach(track => track.stop());
    }

    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }

    updateTunerDisplay(-1);
    document.getElementById('startMic').disabled = false;
    document.getElementById('stopMic').disabled = true;
}

// ============ EVENT LISTENERS ============
document.addEventListener('DOMContentLoaded', () => {
    initializeDrone();

    // Drone controls
    document.getElementById('startDrone').addEventListener('click', startDrone);
    document.getElementById('stopDrone').addEventListener('click', stopDrone);
    document.getElementById('droneVolume').addEventListener('input', (e) => {
        updateDroneVolume(parseFloat(e.target.value));
    });

    // Root note change - restart drone if playing
    document.getElementById('rootNote').addEventListener('change', () => {
        if (isPlaying) {
            stopDrone();
            setTimeout(startDrone, 100);
        }
    });

    // Microphone controls
    document.getElementById('startMic').addEventListener('click', startMicrophone);
    document.getElementById('stopMic').addEventListener('click', stopMicrophone);

    // Reference note
    document.getElementById('playTarget').addEventListener('click', playReferenceNote);
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopDrone();
    stopMicrophone();
});
