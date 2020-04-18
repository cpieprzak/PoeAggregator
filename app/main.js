const {app,BrowserWindow,session,protocol,ipcMain,shell} = require('electron')

var mainWindow = null;
async function createWindow () 
{	
	mainWindow = new BrowserWindow(
	{
	    width: 800,
	    height: 600,
	    webPreferences: 
	    {
	    	nodeIntegration: true
	    }
	})

	var url = 'index.html';
	mainWindow.maximize();
	mainWindow.loadFile(url);
	//mainWindow.webContents.openDevTools();
	mainWindow.once('focus', () => mainWindow.flashFrame(false));	
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
