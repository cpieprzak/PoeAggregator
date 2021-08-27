const {app,BrowserWindow,session,protocol,ipcMain,shell,Menu} = require('electron')

var mainWindow = null;
async function createWindow () 
{	
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
			webviewTag: true
	    }
	});
	mainWindow.maximize();
	mainWindow.loadFile('index.html');

	var sessionid = null;
	await mainWindow.webContents.executeJavaScript('localStorage.getItem("poesessionid");', true).then(result => 
	{
		sessionid = result;
	});

	const filter = {
		urls: ['https://*.pathofexile.com/*']
	}

	session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
		if(details.url.startsWith('https://www.pathofexile.com/api/trade/fetch/'))
		{	
			details.requestHeaders['cookie'] = '';
		}
		else
		{
			details.requestHeaders['cookie'] = 'POESESSID=' + sessionid;
		}
		callback({ requestHeaders: details.requestHeaders })
	})

	session.defaultSession.webRequest.onResponseStarted(filter, (details) => {
		if(details.referrer)
		{
			var url = details.referrer.replace('https://www.pathofexile.com/trade/search/','');
			var parts = url.split('/');
			if(parts.length == 2)
			{
				var league = parts[0];
				var search = parts[1];
				var javascript = 'displayTradeUrlPart("' + search + '");';

				mainWindow.webContents.executeJavaScript(javascript);
			}
		}
	})
	
	mainWindow.once('focus', () => mainWindow.flashFrame(false));	
	var menu = Menu.buildFromTemplate([
		{
			label: 'File',
			submenu: [
				{
					label:'Settings', 
					click() { 
						mainWindow.webContents.executeJavaScript("showHide('settings-modal')");
					} 
				},			
				{
					label:'View Searches', 
					accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
					click() { 
						mainWindow.webContents.executeJavaScript("openSearchesModal();");
					} 
				},		
				{
					label:'Export Searches', 
					click() { 
						mainWindow.webContents.executeJavaScript("exportSearches();");
					} 
				},				
				{
					label:'Open Notes', 
					accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N',
					click() { 
						mainWindow.webContents.executeJavaScript("showHide('notes-modal');");
					} 
				},
				{
					label:'Open Dev Tools', 
					accelerator: process.platform === 'darwin' ? 'Cmd+Shift+I' : 'Ctrl+Shift+I',
					click() { 
						mainWindow.webContents.openDevTools(); 
					} 
				},
				{
					label:'Exit', 
					click() { 
						app.quit() 
					} 
				}
			]
		},
		{
			label: 'Watched Items',
			submenu: [
				{
					label:'Clear All', 
					click() { 
						mainWindow.webContents.executeJavaScript("clearWatchedItems();");
					} 
				}
			]
		}		
	])
	Menu.setApplicationMenu(menu); 
}

app.on('ready', () => 
{
    createWindow();
});

ipcMain.on('loadGH', (event, arg) => {
    shell.openExternal(arg);
});

app.on('window-all-closed', () => 
{
	if (process.platform !== 'darwin') 
	{
		app.quit()
	}
})

app.on('activate', () => 
{
	if (BrowserWindow.getAllWindows().length === 0) 
	{
		createWindow();
	}
})