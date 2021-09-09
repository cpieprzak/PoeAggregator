const { app, BrowserWindow, session, protocol, ipcMain, shell, Menu } = require('electron')

var mainWindow = null;
async function createWindow() {
	mainWindow = new BrowserWindow(
		{
			width: 800,
			height: 600,
			minWidth: 610,
			minHeight: 500,
			frame: false,
			webPreferences:
			{
				nodeIntegration: true,
				contextIsolation: false,
				enableRemoteModule: true,
				webviewTag: true,
				backgroundThrottling: false
			},
		});
	mainWindow.hide();

	mainWindow.loadFile('index.html');

	var sessionid = await getLocalStorageValue('poesessionid');
	configurePosition();
	//mainWindow.webContents.openDevTools();

	mainWindow.show();
	const filter = {
		urls: ['https://*.pathofexile.com/*']
	}

	session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
		if (details.url.startsWith('https://www.pathofexile.com/api/trade/fetch/')) {
			details.requestHeaders['cookie'] = '';
		}
		else {
			details.requestHeaders['cookie'] = 'POESESSID=' + sessionid;
		}
		callback({ requestHeaders: details.requestHeaders })
	})

	session.defaultSession.webRequest.onResponseStarted(filter, (details) => {
		if (details.referrer) {
			var url = details.referrer.replace('https://www.pathofexile.com/trade/search/', '');
			var parts = url.split('/');
			if (parts.length == 2) {
				var league = parts[0];
				var search = parts[1];
				var javascript = 'displayTradeUrlPart("' + search + '");';

				mainWindow.webContents.executeJavaScript(javascript);
			}
		}
	})

	mainWindow.once('focus', () => mainWindow.flashFrame(false));

	var hotkeys = [];
	hotkeys['Ctrl+S'] = 'openSearchesModal();';
	hotkeys['Ctrl+N'] = 'showHide(\'notes-modal\');';

	var menu = buildMenu(hotkeys);
	Menu.setApplicationMenu(menu);
}

app.on('ready', () => {
	createWindow();
});

ipcMain.on('loadGH', (event, arg) => {
	shell.openExternal(arg);
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
})

async function getLocalStorageValue(key) {
	try {
		var value = null;
		var javascript = 'localStorage.getItem("' + key + '");';
		await mainWindow.webContents.executeJavaScript(javascript, true).then(result => {
			value = result;
		});
		return value;
	}
	catch (e) {
		console.log(e);
	}

}

async function saveLocalStorageValue(key, value) {
	try {
		var javascript = 'localStorage.setItem("' + key + '", "' + value + '");';
		await mainWindow.webContents.executeJavaScript(javascript, true).then(result => {
			value = result;
		});
	}
	catch (e) {
		console.log(e);
	}
}

async function configurePosition() {
	var x = await (getLocalStorageValue('agg-main-x'));
	var y = await (getLocalStorageValue('agg-main-y'));
	var height = await (getLocalStorageValue('agg-main-height'));
	var width = await (getLocalStorageValue('agg-main-width'));
	var isMaximized = await (getLocalStorageValue('agg-main-maximized'));

	if (x && y && height && width) {
		try {
			mainWindow.setPosition(Number.parseInt(x), Number.parseInt(y));
			mainWindow.height = height;
			mainWindow.width = width;
			if (isMaximized) {
				mainWindow.maximize();
			}
		} catch (e) {
			console.log(e)
		}
	}
	else {
		mainWindow.maximize();
	}

	mainWindow.on('close', () => {
		const [x, y] = mainWindow.getPosition();
		saveLocalStorageValue('agg-main-x', x);
		saveLocalStorageValue('agg-main-y', y);
		saveLocalStorageValue('agg-main-height', mainWindow.height);
		saveLocalStorageValue('agg-main-width', mainWindow.width);
		saveLocalStorageValue('agg-main-maximized', mainWindow.isMaximized());
	});
}

function buildMenu(hotkeys) {
	var menuItems = Object.entries(hotkeys).map(([command,javascript]) => ({
		label: 'View Searches',
		accelerator: process.platform === 'darwin' ? command.replace('Ctrl', 'Cmd') : command,
		click() {
			mainWindow.webContents.executeJavaScript(javascript);
		}
	}));

	menuItems.push({
		label: 'Open Dev Tools',
		accelerator: process.platform === 'darwin' ? 'Cmd+Shift+I' : 'Ctrl+Shift+I',
		click() { mainWindow.webContents.openDevTools(); }
	});

	return Menu.buildFromTemplate([
		{
			label: 'File',
			submenu: menuItems
		}
	])
}