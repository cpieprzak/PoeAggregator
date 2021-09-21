const { app, BrowserWindow, session, protocol, ipcMain, shell, Menu, globalShortcut } = require('electron')

var mainWindow = null;
var tradeOverlayWindow = null;
var stashTabHighlightingWindow = null;
var overlays = new Map();
var overlayHeights = new Map();
var MIN_TRADE_WIDTH = 400;
var MIN_TRADE_HEIGHT = 200;
var COLLAPSED_TRADE_HEIGHT = 40;
var isDebug = false;
var poesessionid = null;

function getPoesessionid()
{
	debug(`getPoesessionid: ${poesessionid}`);
	return poesessionid;
}

function setPoesessionid(id)
{
	debug(`setPoesessionid: ${id}`);
	poesessionid = id;
}

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

	poesessionid = await getLocalStorageValue('poesessionid');
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
			details.requestHeaders['cookie'] = 'POESESSID=' + getPoesessionid();
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

ipcMain.on('update-poesessionid', (event, id) => {
	setPoesessionid(id);
});

ipcMain.on('set-resizable', (event,resizable)=>{
	debug(`set-resizable: ${resizable}`);
	var window = BrowserWindow.fromWebContents(event.sender);
	window.setResizable(false);
	debug(`isCollaped: ${window.isCollapsed}`);
	if(resizable && !window.isCollapsed)
	{
		window.setResizable(true);
	}
	window.lastResizable = resizable;
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
				overlay.isCollapsed = false;
				
				if(!isTradeWindowLocked)
				{
					var {width,height} = overlay.getBounds();
					var lastHeight = overlayHeights.get(overlayName);
					height = lastHeight ? lastHeight : height;
					height = height < MIN_TRADE_HEIGHT ? MIN_TRADE_HEIGHT : height;
					overlay.lastResizable ? overlay.setResizable(true) : '';
					overlay.setMinimumSize(MIN_TRADE_WIDTH,MIN_TRADE_HEIGHT);
					overlay.setSize(width, height);
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
			overlay.setMinimumSize(MIN_TRADE_WIDTH,COLLAPSED_TRADE_HEIGHT);
			overlay.setSize(width,COLLAPSED_TRADE_HEIGHT);
		}
		else{
			if(height < MIN_TRADE_HEIGHT)
			{
				var lastHeight = overlayHeights.get(overlayName);
				overlay.setResizable(true);
				overlay.setMinimumSize(MIN_TRADE_WIDTH,COLLAPSED_TRADE_HEIGHT);
				overlay.setSize(width, lastHeight ? lastHeight : MIN_TRADE_HEIGHT);
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
		if(height > MIN_TRADE_HEIGHT){overlayHeights.set(windowName,height);}		
		overlay.setResizable(true);	
		overlay.setMinimumSize(MIN_TRADE_WIDTH,COLLAPSED_TRADE_HEIGHT);
		overlay.setSize(width, COLLAPSED_TRADE_HEIGHT);
		overlay.setResizable(false);
		overlay.isCollapsed = true;
	}	
});

ipcMain.on('show-overlay-window', (event,windowName,show)=>{	
	if(overlays.has(windowName))
	{
		debug(`Showing ${windowName}: ${show}`);
		var overlay = overlays.get(windowName);
		show ? showWindow(overlay) : overlay.hide();
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
	var bounds = await (getLocalStorageValue('agg-main-bounds'));
	var isMaximized = await (getLocalStorageValue('agg-main-maximized'));

	if (bounds && bounds != 'undefined') 
	{
		bounds = JSON.parse(bounds);
		debug(bounds);
		mainWindow.setSize(bounds.width, bounds.height);
		mainWindow.setPosition(bounds.x,bounds.y);
		debug(`isMaximized: ${isMaximized}`)
		if(isMaximized === 'true'){mainWindow.maximize();}
	}
	else
	{
		mainWindow.maximize();
	}
	for (const [windowName, overlay] of overlays.entries())
	{
		var bounds = await getLocalStorageValue(windowName + '-bounds');
		if(bounds)
		{
			debug(`Found bounds for window ${windowName}: ${bounds}`);
			bounds = JSON.parse(bounds);
			overlayHeights.set(windowName,bounds.height);
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
			bounds = JSON.stringify(bounds);
			
			debug(`Saving bounds for window ${windowName}: ${bounds}`);
			saveLocalStorageValue(windowName + '-bounds', bounds);
		}
		saveLocalStorageValue('agg-main-bounds', JSON.stringify(mainWindow.getBounds()));
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
			width: MIN_TRADE_WIDTH,
			height: COLLAPSED_TRADE_HEIGHT,
			minWidth: MIN_TRADE_WIDTH,
			minHeight: COLLAPSED_TRADE_HEIGHT,
			resizable: false,
			frame: false,
			transparent: true,
			skipTaskbar: true,
			show: false,
			webPreferences:
			{
				nodeIntegration: true,
				contextIsolation: false,
				enableRemoteModule: true,
				webviewTag: true,
				backgroundThrottling: false
			},
		});
		tradeOverlayWindow.setPosition(0,0);
		tradeOverlayWindow.isCollapsed = true;

		tradeOverlayWindow.loadFile('./html/overlay/trade-whisper-overlay.html');
		if(isDebug)tradeOverlayWindow.openDevTools();

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
			show: false,
			webPreferences:
			{
				nodeIntegration: true,
				contextIsolation: false,
				enableRemoteModule: true,
				webviewTag: true,
				backgroundThrottling: false
			},
		});
		stashTabHighlightingWindow.loadFile('./html/overlay/stashTab-highlighting-overlay.html');
		if(isDebug)stashTabHighlightingWindow.openDevTools();

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
ipcMain.on('set-ignore-mouse-events', (event, ...args) => {
	BrowserWindow.fromWebContents(event.sender).setIgnoreMouseEvents(...args)
})

const debug = (msg) => {if(isDebug)console.log(msg);}