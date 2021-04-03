var promisifiedOldGUM = function(constraints, successCallback, errorCallback) {

  // First get ahold of getUserMedia, if present
  var getUserMedia = (navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia);

  // Some browsers just don't implement it - return a rejected promise with an error
  // to keep a consistent interface
  if (!getUserMedia) {
    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
  }

  // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
  return new Promise(function(successCallback, errorCallback) {
    getUserMedia.call(navigator, constraints, successCallback, errorCallback);
  });

}

// Older browsers might not implement mediaDevices at all, so we set an empty object first
if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
}

// Some browsers partially implement mediaDevices. We can't just assign an object
// with getUserMedia as it would overwrite existing properties.
// Here, we will just add the getUserMedia property if it's missing.
if (navigator.mediaDevices.getUserMedia === undefined) {
  navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
}

// Only retrieve microphone input
//var constraints = { audio: true };

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
};

// Set audio Context
window.AudioContext = window.AudioContext || window.webkitAudioContext;

const toneOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

var mediaStreamSource = null;
var analyser = null;
var N = 8192; //4096;//8192;//2048; // Samples of Sound
var bufferLen = null;
var buffer = null;
var PCP = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // Pitch Class Profiles
var fref = 261.63; // Reference frequency middle C (C4)
// fref = 65.4; // Reference frequency C2
// fref = 440.0; // Reference frequency A4
var audioContext = new AudioContext();
var fsr = audioContext.sampleRate; // Retrieve sampling rate. Usually 48KHz
var useMicrophone = true;
var freqsBuffer = null;
var timesBuffer = null;
//Visuals
var WIDTH = 640;
var HEIGHT = 360;
var SMOOTHING = 0.8;
let volumeSum = 0;

const VOLUME_THRESHOLD = 1400;

navigator.mediaDevices.getUserMedia(constraints)
  .then(function(stream) {
    // Create an analyzer node to process the audio
    analyser = audioContext.createAnalyser();
    //analyser.minDecibels = -140
    //analyser.maxDecibels = 0
    analyser.fftSize = N;
    bufferLen = N / 2;
    //bufferLen = analyser.frequencyBinCount;
    console.log('bufferLen = ' + bufferLen);
    buffer = new Float32Array(bufferLen);
    freqsBuffer = new Uint8Array(analyser.frequencyBinCount);
    timesBuffer = new Uint8Array(analyser.frequencyBinCount);

		// Create an AudioNode from the stream.
		mediaStreamSource = audioContext.createMediaStreamSource(stream);
		// Connect it to the destination.
		mediaStreamSource.connect(analyser);

    // Call algorithm every 50 ms
    setInterval(function() {
      pcpAlg();
    }, 50);

    // Visualizer
    draw();
  })
  .catch(function(err) {
    console.log(err.name + ": " + err.message);
  });

function pcpAlg() {
  // analyser.getFloatTimeDomainData(buffer);
  analyser.getByteFrequencyData( freqsBuffer );

  // Reset PCP
  PCP = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  // M(0)=-1 so we don't have to start at 0
	let highestFrequencyValue = 0;
	let highestFrequency;
	let frequencyList = [];

	volumeSum = 0;

  for (var k = 20; k < 160 / 2; k++) { // k = 0,1,...,[(N/2) - 1]

		const frequencyBin = k / N * fsr;
		const frequencyValue = freqsBuffer[k]; //Math.pow(Math.abs(buffer[k]), 2);
		if (frequencyValue > highestFrequencyValue) {
			highestFrequencyValue = frequencyValue;
			highestFrequency = frequencyBin;
		}
		const targetBin = 12 * Math.log2(frequencyBin / fref);
		const closestTone = Math.round(targetBin);
		const closestFrequency = fref * Math.pow(2, closestTone/12);
		const ML = closestTone % 12;
		const tonalDistance = Math.abs(closestTone - targetBin);

    if (ML >= 0 && ML <= 11) {
      PCP[ML] += frequencyValue * (1 - tonalDistance);
			volumeSum += frequencyValue;
    }
  }

	// console.log(`Highest frequency: ${highestFrequency} with value ${highestFrequencyValue}`);

  // Display Data on UI and also try to determine if the sound is a C or F chord
  draw();
}

// function displayAndCategorize() {
// 	const pcpSum = PCP.reduce((sum, val) => sum + val, 0);
// 	// if (pcpSum < 10000) {
// 	// 	return;
// 	// }

// 	const strongTones = [];
// 	// PCP.forEach((tone, index) => {
// 	// 	if (tone > pcpSum / PCP.length) {
// 	// 		strongTones.push(`${toneOrder[index]}: ${(tone / pcpSum * 100).toFixed(2)}%`);
// 	// 	}
// 	// })
// 	// console.log(strongTones.join('\n'));
//   // CTT Chord Type Template
//   // Ukulele C chord has strings: g+c+e+C (lower case is open)
//   CTTofC = [1, 0, 0, 0, 1, -1, 0, 1, 0, -1, 0, 0]; // -1 on A,F to not be confused with F chord
//   // Ukulele F chord has strings: A+c+F+a (lower case is open)
//   CTTofF = [1, 0, 0, 0, -1, 1, 0, -1, 0, 1, 1, 0]; // -1 on G,E to not be confused with C chord
//   scoreOfC = 0
//   scoreOfF = 0;
//   // Calculate weighted sum
//   for (var i = 0; i < 12; i++) {
//     scoreOfC += CTTofC[i] * PCP[i];
//     scoreOfF += CTTofF[i] * PCP[i];
//   }
//   if (scoreOfC > 3 && scoreOfC > scoreOfF) {
//     console.log( 'c chord' )
//     //console.log( scoreOfC )
//   }
//   if (scoreOfF > 3 && scoreOfF > scoreOfF) {
//     console.log( 'f chord' )
//   }
//   document.getElementById("demo1").innerHTML = PCP[0].toFixed(3) > 0.3 ? 'JA' : 'Nein';
//   document.getElementById("demo2").innerHTML = PCP[1].toFixed(3) > 0.3 ? 'JA' : 'Nein';
//   document.getElementById("demo3").innerHTML = PCP[2].toFixed(3) > 0.3 ? 'JA' : 'Nein';
//   document.getElementById("demo4").innerHTML = PCP[3].toFixed(3) > 0.3 ? 'JA' : 'Nein';
//   document.getElementById("demo5").innerHTML = PCP[4].toFixed(3) > 0.3 ? 'JA' : 'Nein';
//   document.getElementById("demo6").innerHTML = PCP[5].toFixed(3) > 0.3 ? 'JA' : 'Nein';
//   document.getElementById("demo7").innerHTML = PCP[6].toFixed(3) > 0.3 ? 'JA' : 'Nein';
//   document.getElementById("demo8").innerHTML = PCP[7].toFixed(3) > 0.3 ? 'JA' : 'Nein';
//   document.getElementById("demo9").innerHTML = PCP[8].toFixed(3) > 0.3 ? 'JA' : 'Nein';
//   document.getElementById("demo10").innerHTML = PCP[9].toFixed(3) > 0.3 ? 'JA' : 'Nein';
//   document.getElementById("demo11").innerHTML = PCP[10].toFixed(3) > 0.3 ? 'JA' : 'Nein';
//   document.getElementById("demo12").innerHTML = PCP[11].toFixed(3) > 0.3 ? 'JA' : 'Nein';
// }

// Visualizer taken from http://webaudioapi.com/samples/visualizer/
function draw() {
  analyser.smoothingTimeConstant = SMOOTHING;
  analyser.fftSize = N; //FFT_SIZE;

  // Get the frequency data from the currently playing music
  analyser.getByteFrequencyData(freqsBuffer);
  // analyser.getByteTimeDomainData(timesBuffer);

  var width = Math.floor(1 / freqsBuffer.length, 10);

  var canvas = document.querySelector('canvas');
  var drawContext = canvas.getContext('2d');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  // Draw the frequency domain chart.
  // for (var i = 0; i < analyser.frequencyBinCount; i++) {
  //   var value = freqsBuffer[i];
  //   var percent = value / 256;
  //   var height = HEIGHT * percent;
  //   var offset = HEIGHT - height - 1;
  //   var barWidth = WIDTH / analyser.frequencyBinCount;
  //   var hue = i / analyser.frequencyBinCount * 360;
  //   drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
  //   drawContext.fillRect(i * barWidth, offset, barWidth, height);
  // }
	const pcpCopy = [...PCP].sort((a, b) => b - a);
	const thirdHighestValue = pcpCopy[2];
  for (var i = 0; i < PCP.length; i++) {
    var value = PCP[i] >= thirdHighestValue ? 1 : 0;
    var percent = volumeSum > VOLUME_THRESHOLD ? value : 0;// / 256;
    var height = HEIGHT * percent;
    var offset = HEIGHT - height - 1;
    var barWidth = WIDTH / PCP.length;
    var hue = i / PCP.length * 360;
    drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
    drawContext.fillRect(i * barWidth, offset, barWidth, height);
  }

  // // Draw the time domain chart.
  // for (var i = 0; i < analyser.frequencyBinCount; i++) {
  //   var value = this.timesBuffer[i];
  //   var percent = value / 256;
  //   var height = HEIGHT * percent;
  //   var offset = HEIGHT - height - 1;
  //   var barWidth = WIDTH / analyser.frequencyBinCount;
  //   drawContext.fillStyle = 'black';
  //   drawContext.fillRect(i * barWidth, offset, 1, 2);
  // }

  window.requestAnimationFrame(draw);
}

function getFrequencyValue(freq) {
  var nyquist = context.sampleRate / 2;
  var index = Math.round(freq / nyquist * this.freqs.length);
  return this.freqs[index];
}