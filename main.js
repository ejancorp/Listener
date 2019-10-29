const {
	app,
	Menu,
	Tray,
	Notification,
	BrowserWindow,
	systemPreferences,
	ipcMain,
} = require('electron');
const path = require('path');

class Main {

	constructor() {
		this.initEvent = null;
		this.tray = new Tray(path.join(__dirname, 'images/icons/', this.iconColor(), '/png/16x16.png'));
		this.window = new BrowserWindow({
			width: 300,
			height: 450,
			show: false,
			frame: false,
			fullscreenable: false,
			resizable: false,
			transparent: true,
			webPreferences: {
				preload: path.join(__dirname, 'listener.js'),
				nodeIntegration: true,
				backgroundThrottling: false,
			}
		});
		this.setup();
	}

	setup() {
		this.tray.setToolTip('Listener');
		this.tray.setContextMenu(this.buildMenu());
		this.window.loadFile(path.join(__dirname, 'index.html'));
	}

	buildMenu() {
		return Menu.buildFromTemplate([{
			label: 'Listen',
			type: 'checkbox',
			checked: true,
			click: this.onToggleFunction.bind(this)
		}, {
			label: 'Quit',
			role: 'quit'
		}])
	}

	isDarkMode() {
		return systemPreferences.isDarkMode();
	}

	iconColor() {
		if (this.isDarkMode()) {
			return 'dark';
		}
		return 'light';
	}

	onToggleFunction(item) {
		if (item.checked) {
			this.start();
		} else {
			this.stop();
		}
	}

	setInitEvent(initEvent) {
		this.initEvent = initEvent;
	}

	start() {
		this.initEvent.reply('start', true);
	}

	stop() {
		this.initEvent.reply('stop', true);
	}
};

app.dock.hide();
app.on('ready', () => {
	let main = new Main();
	ipcMain.on('init', (event) => main.setInitEvent(event));
	ipcMain.on('started', () => {
		new Notification({
			title: 'Listener - Start',
			body: 'You are now listening!',
		}).show();
	});
	ipcMain.on('ended', () => {
		new Notification({
			title: 'Listener - Stop',
			body: 'Listening has been stopped.',
		}).show();
	});
});