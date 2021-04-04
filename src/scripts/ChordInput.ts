import { Chords, TONE_ORDER, ChordValues } from './Chords';

const N = 8192; // 4096;//8192;//2048; // Samples of Sound
const REFERENCE_FREQUENCE = 261.63; // Reference frequency middle C (C4)
const SMOOTHING = 0.8;

export default class ChordInput {
	audioContext: AudioContext;
	analyser: AnalyserNode;
	pitchClassProfiles = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // Pitch Class Profiles
	normalizedPitchClassProfiles: {[name: string]: number} = {
		'C': 0,
		'C#': 0,
		'D': 0,
		'D#': 0,
		'E': 0,
		'F': 0,
		'F#': 0,
		'G': 0,
		'G#': 0,
		'A': 0,
		'A#': 0,
		'B': 0,
	};
	buffer: Uint8Array;
	mediaStreamSource: MediaStreamAudioSourceNode;
	volumeSum: number = 0;
	volumeThreshold: number = 200;

	startRecording() {
		const constraints = {
			audio: {
				mandatory: {
					// Disable audio processing by browser
					googEchoCancellation: false,
					googAutoGainControl: false,
					googNoiseSuppression: false,
					googHighpassFilter: false
				},
				optional: []
			},
		} as any;

		this.audioContext = new AudioContext();

		navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
			// Create an analyzer node to process the audio
			this.analyser = this.audioContext.createAnalyser();
			this.analyser.smoothingTimeConstant = SMOOTHING;
			this.analyser.fftSize = N;

			this.analyser.fftSize = N;
			const bufferLen = N / 2;

			this.buffer = new Uint8Array(bufferLen);

			// Create an AudioNode from the stream.
			this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
			// Connect it to the destination.
			this.mediaStreamSource.connect(this.analyser);

			// Call algorithm every 50 ms
			window.setInterval(() => {
				this.performPcpAlgorithm();
			}, 50);
		})
		.catch((err) => {
			console.log(err.name + ': ' + err.message);
		});
	}

	performPcpAlgorithm() {
		this.analyser.getByteFrequencyData( this.buffer );

		// Reset PCP
		this.pitchClassProfiles = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		let highestFrequencyValue = 0;
		let highestFrequency;

		this.volumeSum = 0;

		for (var k = 20; k < 400 / 2; k++) { // 160

			const frequencyBin = k / N * this.audioContext.sampleRate;
			const frequencyValue = this.buffer[k]; // Math.pow(Math.abs(buffer[k]), 2);
			if (frequencyValue > highestFrequencyValue) {
				highestFrequencyValue = frequencyValue;
				highestFrequency = frequencyBin;
			}
			const targetBin = 12 * Math.log2(frequencyBin / REFERENCE_FREQUENCE);
			const closestTone = Math.round(targetBin);
			const closestFrequency = REFERENCE_FREQUENCE * Math.pow(2, closestTone/12);
			const ML = closestTone % 12;
			const tonalDistance = Math.abs(closestTone - targetBin);

			if (ML >= 0 && ML <= 11) {
				this.pitchClassProfiles[ML] += frequencyValue * (1 - tonalDistance);
				this.volumeSum += frequencyValue;
			}
		}
	}

	normalizePitchClassProfiles() {
		const pcpCopy = [...this.pitchClassProfiles].sort((a, b) => b - a);
		const thirdHighestValue = pcpCopy[2];
		for (let i = 0; i < this.pitchClassProfiles.length; i++) {
			const value = this.pitchClassProfiles[i] >= thirdHighestValue ?
				1 : 0;
				// this.pitchClassProfiles[i] / thirdHighestValue;
			this.normalizedPitchClassProfiles[TONE_ORDER[i]] = value;
		}
	}

	getChordPlayed() {
		if (this.volumeSum < this.volumeThreshold) {
			return Chords.NONE;
		}

		this.normalizePitchClassProfiles();

		const keys = Object.keys(ChordValues);
		const chordAmplitudes: {[name: string]: number} = {};
		keys.forEach((key) => {
			const tones = ChordValues[key];
			chordAmplitudes[key] = tones.reduce((sum, tone) => {
				return sum + this.normalizedPitchClassProfiles[tone];
			}, 0);
		});

		let highestAmplitude = 0;
		let highestChordKey: string = Chords.NONE;
		Object.keys(chordAmplitudes).forEach((chord) => {
			const amplitude = chordAmplitudes[chord];
			if (highestAmplitude < amplitude && amplitude > 2.7) {
				highestAmplitude = amplitude;
				highestChordKey = chord;
			}
		});

		return highestChordKey;
	}
}