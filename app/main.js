const {app,BrowserWindow,session,protocol,ipcMain,shell,Menu} = require('electron')

var mainWindow = null;
async function createWindow () 
{	
	mainWindow = new BrowserWindow(
	{
	    width: 800,
	    height: 600,
	    webPreferences: 
	    {
	    	nodeIntegration: true,
            contextIsolation: false,
			enableRemoteModule: true
	    }
	});
	var url = 'index.html';
	mainWindow.maximize();
	mainWindow.loadFile(url);
	
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
					click() { 
						mainWindow.webContents.executeJavaScript("showHide('notes-modal');");
					} 
				},
				{
					label:'Open Dev Tools', 
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