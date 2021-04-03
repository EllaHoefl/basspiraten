import { Chords, TONE_ORDER, ChordValues } from './Chords';

const N = 8192; //4096;//8192;//2048; // Samples of Sound
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
	volumeThreshold: number = 1400;
	

	startRecording() {
		var constraints = {
			"audio": {
				"mandatory": {
					// Disable audio processing by browser
					"googEchoCancellation": "false",
					"googAutoGainControl": "false",
					"googNoiseSuppression": "false",
					"googHighpassFilter": "false"
				},
				"optional": []
			},
		} as any;

		this.audioContext = new AudioContext();

		navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
			// Create an analyzer node to process the audio
			this.analyser = this.audioContext.createAnalyser();
			this.analyser.smoothingTimeConstant = SMOOTHING;
			this.analyser.fftSize = N; //FFT_SIZE;
			//analyser.minDecibels = -140
			//analyser.maxDecibels = 0
			this.analyser.fftSize = N;
			const bufferLen = N / 2;
			//bufferLen = analyser.frequencyBinCount;
			console.log('bufferLen = ' + bufferLen);
			this.buffer = new Uint8Array(bufferLen);

			// Create an AudioNode from the stream.
			this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
			// Connect it to the destination.
			this.mediaStreamSource.connect(this.analyser);

			// Call algorithm every 50 ms
			window.setInterval(function() {
				this.performPcpAlgorithm();
			}, 50);

			// // Visualizer
			// draw();
		})
		.catch(function(err) {
			console.log(err.name + ": " + err.message);
		});
	}

	performPcpAlgorithm() {
		this.analyser.getByteFrequencyData( this.buffer );

		// Reset PCP
		this.pitchClassProfiles = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		let highestFrequencyValue = 0;
		let highestFrequency;

		this.volumeSum = 0;

		for (var k = 20; k < 160 / 2; k++) { // k = 0,1,...,[(N/2) - 1]

			const frequencyBin = k / N * this.audioContext.sampleRate;
			const frequencyValue = this.buffer[k]; //Math.pow(Math.abs(buffer[k]), 2);
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
		for (var i = 0; i < this.pitchClassProfiles.length; i++) {
			const value = this.pitchClassProfiles[i] >= thirdHighestValue ?
				1 :
				this.pitchClassProfiles[i] / thirdHighestValue;
			this.normalizedPitchClassProfiles[TONE_ORDER[i]] = value;
		}
	}

	getChordPlayed() {
		if (this.volumeSum < this.volumeThreshold) {
			return Chords.NONE;
		}

		const keys = Object.keys(ChordValues);
		const value = keys.find((key) => {
			const tones = ChordValues[key];
			tones.forEach((tone) => {
				if (this.normalizedPitchClassProfiles[tone] < 0.9) {
					return false;
				}
			});
			return true;
		});

		if (value) {
			return value;
		}
		return Chords.NONE;
	}
}