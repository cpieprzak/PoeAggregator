const { app, BrowserWindow, session, protocol, ipcMain, shell, Menu, globalShortcut } = require('electron')

var mainWindow = null;
var tradeOverlayWindow = null;
var stashTabHighlightingWindow = null;
var overlays = new Map();
var overlayHeights = new Map();
var minTradeHeight = 150;

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
	mainWindow.on('close',()=>{
		quitApp();
	});

	mainWindow.loadFile('index.html');
	tradeOverlayWindow = buildTradeOverlayWindow();
	stashTabHighlightingWindow = buildStashTabHighlightingWindow();

	overlays.set('tradeOverlayWindow',tradeOverlayWindow);
	overlays.set('stashTabHighlightingWindow',stashTabHighlightingWindow);

	var sessionid = await getLocalStorageValue('poesessionid');
	await configurePosition();
	if(await getLocalStorageValue('show-trade-whisper-overlay')){
		showWindow(tradeOverlayWindow);
	}
	
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

ipcMain.on('loadGH', (event, arg) => {
	shell.openExternal(arg);
});

ipcMain.on('set-resizable', (event,resizable)=>{
	for (const [windowName, overlay] of overlays.entries())
	{
		if(overlay.webContents === event.sender)
		{
			overlay.setResizable(resizable);
			overlay.lastResizable = resizable;
			break;
		}
	}
});

var isTradeWindowLocked = false;
ipcMain.on('trade-whisper', (event,line)=>{		
	var overlayName = 'tradeOverlayWindow';
	if(overlays.has(overlayName))
	{
		var overlay = overlays.get(overlayName);
		getLocalStorageValue('show-trade-whisper-overlay').then((showOverlay)=>{
			if(showOverlay){
				overlay.show();
				getLocalStorageValue('stash-tab-bounds').then((bounds)=>{
					var stashBoundConifgured = bounds ? true : false;
					tradeOverlayWindow.webContents.send('trade-whisper',line,stashBoundConifgured);
				});
				
				if(!isTradeWindowLocked)
				{
					var {width,height} = overlay.getBounds();
					if(height < minTradeHeight)
					{
						var lastHeight = overlayHeights.get(overlayName);
						if(overlay.lastResizable)
						{
							overlay.setResizable(true);
						}
						overlay.setSize(width, lastHeight ? lastHeight : minTradeHeight);
						overlay.setMinimumSize(400,40);
					}
				}				
			}
		});
	}
});

ipcMain.on('lock-trade-whisper-window', (event,islocked,tradeWhisperCount)=>{
	isTradeWindowLocked = islocked;
	if(tradeWhisperCount > 0)
	{
		var overlayName = 'tradeOverlayWindow';
		var overlay = overlays.get(overlayName);
		var {width,height} = overlay.getBounds();
		if(islocked){
			overlay.setSize(width,40);
			overlay.setMinimumSize(400,40);
		}
		else{
			if(height < minTradeHeight)
			{
				var lastHeight = overlayHeights.get(overlayName);
				overlay.setResizable(true);
				overlay.setSize(width, lastHeight ? lastHeight : minTradeHeight);
				overlay.setMinimumSize(400,40);
			}
		}
	}
});

ipcMain.on('main-window-function', (event,javascript)=>{
	mainWindow.webContents.executeJavaScript(javascript, true);
});

ipcMain.on('show-main-window', (event)=>{
	mainWindow.show();
});

var configuringStashTabs = false;
ipcMain.on('confirm-stash-tab-area', (event)=>{
	var bounds = stashTabHighlightingWindow.getBounds();
	stashTabHighlightingWindow.hide();
	saveLocalStorageValue('stash-tab-bounds', JSON.stringify(bounds));
	configuringStashTabs = false;
});

ipcMain.on('configure-highlight-stash', (event) => {
	configuringStashTabs = true;
	getLocalStorageValue('stash-tab-bounds').then((bounds)=>{
		if(bounds){
			bounds = JSON.parse(bounds);
			stashTabHighlightingWindow.setSize(bounds.width,bounds.height);
			stashTabHighlightingWindow.setPosition(bounds.x,bounds.y);
		}
		else{
			stashTabHighlightingWindow.setSize(300,300);
		}
		stashTabHighlightingWindow.setMinimumSize(200,200);
		stashTabHighlightingWindow.setResizable(true);
		stashTabHighlightingWindow.webContents.executeJavaScript('configView()', true);
	});

	showWindow(stashTabHighlightingWindow);
});

ipcMain.on('highlight-stash', (event,x,y,tabType) => {
	getLocalStorageValue('stash-tab-bounds').then((bounds)=>{
		if(tabType == 'Hide')
		{
			stashTabHighlightingWindow.hide();
			configuringStashTabs = false;
		}
		else if(bounds != null && !configuringStashTabs)
		{
			bounds = JSON.parse(bounds);
			var slots = 12;
			if(tabType == '4x'){slots = 24}
			var width = bounds.height / slots;
			var height = width;
			var newX = ((Number.parseInt(x)-1) * width) + bounds.x;
			var newY = ((Number.parseInt(y)-1) * height) + bounds.y;
			stashTabHighlightingWindow.setPosition(Number.parseInt(newX),Number.parseInt(newY));
			stashTabHighlightingWindow.setMinimumSize(Number.parseInt(width),Number.parseInt(height));
			stashTabHighlightingWindow.setSize(Number.parseInt(width),Number.parseInt(height));
			stashTabHighlightingWindow.setResizable(false);
			stashTabHighlightingWindow.webContents.executeJavaScript('highlightView()', true);

			showWindow(stashTabHighlightingWindow);
		}
	});
});

ipcMain.on('all-window-function', (event,javascript)=>{
	mainWindow.webContents.executeJavaScript(javascript, true);
	tradeOverlayWindow.webContents.executeJavaScript(javascript, true);
});

ipcMain.on('collapse-overlay-window', (event,windowName)=>{	
	if(overlays.has(windowName))
	{
		var overlay = overlays.get(windowName);
		var {width,height} = overlay.getBounds();
		if(height > minTradeHeight){overlayHeights.set(windowName,height);}		
		overlay.setResizable(true);	
		overlay.setSize(width, 40);
		overlay.setResizable(false);
	}	
});

ipcMain.on('show-overlay-window', (event,windowName,show)=>{	
	if(overlays.has(windowName))
	{
		var overlay = overlays.get(windowName);
		if(show) {
			showWindow(overlay);
		}
		else {
			overlay.hide();
		}
	}	
});

app.on('ready', () => {	
	globalShortcut.register('CommandOrControl+Alt+Shift+L', () => {
		log('Focusing PoeAggregator');
	});
	createWindow();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		quitApp();
	}
})

function quitApp()
{
	globalShortcut.unregister('CommandOrControl+Alt+Shift+L');
	app.quit();
}

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
})

async function getLocalStorageValue(key) {
	try {
		var value = null;
		var javascript = 'localStorage.getItem(\'' + key + '\');';
		await mainWindow.webContents.executeJavaScript(javascript, true).then(result => {
			value = result;
		});
		return value;
	}
	catch (e) {
		log(e);
	}
}

async function saveLocalStorageValue(key, value) {
	try {
		var javascript = 'localStorage.setItem(\'' + key + '\', \'' + value + '\');';
		await mainWindow.webContents.executeJavaScript(javascript, true).then(result => {
			value = result;
		});
	}
	catch (e) {
		log(e);
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
			log(e);
		}
	}
	else {
		mainWindow.maximize();
	}
	for (const [windowName, overlay] of overlays.entries())
	{
		var bounds = await getLocalStorageValue(windowName + '-bounds');
		if(bounds)
		{
			bounds = JSON.parse(bounds);
			overlayHeights.set(windowName,bounds.height)
			overlay.setSize(bounds.width, overlay.getBounds().height);
			overlay.setPosition(bounds.x,bounds.y);
		}
	}

	mainWindow.on('close', () => {
		for (const [windowName, overlay] of overlays.entries())
		{
			var bounds = overlay.getBounds();
			if(overlayHeights.get(windowName))
			{
				bounds.height = overlayHeights.get(windowName);
			}
			saveLocalStorageValue(windowName + '-bounds', JSON.stringify(bounds));
		}

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

function buildTradeOverlayWindow()
{
	var tradeOverlayWindow = new BrowserWindow(
		{
			width: 390,
			height: 40,
			minWidth: 390,
			minHeight: 40,
			resizable: false,
			frame: false,
			transparent: true,
			skipTaskbar: true,
			webPreferences:
			{
				nodeIntegration: true,
				contextIsolation: false,
				enableRemoteModule: true,
				webviewTag: true,
				backgroundThrottling: false
			},
		});

		tradeOverlayWindow.hide();
		tradeOverlayWindow.loadFile('./html/overlay/trade-whisper-overlay.html');
		//tradeOverlayWindow.openDevTools();

	return tradeOverlayWindow;
}

function buildStashTabHighlightingWindow()
{
	var stashTabHighlightingWindow = new BrowserWindow(
		{
			width: 400,
			height: 400,
			minWidth: 200,
			minHeight: 200,
			frame: false,
			transparent: true,
			skipTaskbar: true,
			webPreferences:
			{
				nodeIntegration: true,
				contextIsolation: false,
				enableRemoteModule: true,
				webviewTag: true,
				backgroundThrottling: false
			},
		});
		stashTabHighlightingWindow.hide();
		stashTabHighlightingWindow.loadFile('./html/overlay/stashTab-highlighting-overlay.html');
		//stashTabHighlightingWindow.openDevTools();

	return stashTabHighlightingWindow;
}

function showWindow(window)
{
	window.show();
	window.setAlwaysOnTop(true, "screen-saver");
	window.setVisibleOnAllWorkspaces(true);
}

function log(msg)
{
	if(msg)
	{
		msg = (typeof msg === 'string' || msg instanceof String) ? msg : JSON.stringify(msg);
		msg = msg.replace('\'','\\\'');
		var javascript = 'log(\'' + msg + '\');';
		mainWindow.webContents.executeJavaScript(javascript);
	}
}