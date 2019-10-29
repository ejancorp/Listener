const {
	ipcRenderer
} = require('electron');
const Promise = require('bluebird');

class Listener {
	constructor() {
		this.stream = null;
		this.microphone = null;
		this.audioContext = new AudioContext();
		this.analyser = this.audioContext.createAnalyser();

		this.start().then(() => ipcRenderer.send('started'));
	}

	start() {
		return this.stop().then(() => {
			return navigator.mediaDevices.getUserMedia({
					audio: true
				})
				.then((stream) => this.stream = stream)
				.then(() => {
					this.microphone = this.audioContext.createMediaStreamSource(this.stream);
					this.microphone.connect(this.analyser);
					this.analyser.connect(this.audioContext.destination);
				});
		})
	}

	stop() {
		return Promise.all([
			this.closeStream(),
			this.closeAnalyser(),
			this.closeMicrophone(),
		]);
	}

	closeStream() {
		if (!this.stream) {
			return Promise.resolve({});
		}
		return Promise.map(this.stream.getTracks(), (track) => track.stop());
	}

	closeAnalyser() {
		return Promise.resolve(this.analyser.disconnect());
	}

	closeMicrophone() {
		if (!this.microphone) {
			return Promise.resolve({});
		}
		return Promise.resolve(this.microphone.disconnect());
	}
};

const app = new Listener();

ipcRenderer.send('init', true);
ipcRenderer.on('start', () => app.start().then(() => ipcRenderer.send('started')));
ipcRenderer.on('stop', () => app.stop().then(() => ipcRenderer.send('ended')));