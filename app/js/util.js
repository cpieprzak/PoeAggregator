const utilIpc = require('electron').ipcRenderer;

function copyTextToClipboard(text)
{
	var textArea = document.createElement("textarea");
	textArea.classList.add('copy-text-area');
	textArea.value = text;
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();
	try
	{
		document.execCommand('copy');
	}
	catch(error) 
	{
		console.log(error);
	}
	document.body.removeChild(textArea);
}

function showHide(elementId)
{
	var element = document.getElementById(elementId);
	if(element != null)
	{
		var classList = element.classList;
		var hidden = 'hidden';
		if(classList.contains(hidden))
		{
			classList.remove(hidden);
		}
		else
		{
			classList.add(hidden);
		}
	}	
}

function callMainWindowFunction(javascript)
{
	utilIpc.send('main-window-function',javascript);
}

function callAllWindowFunction(javascript)
{
	utilIpc.send('all-window-function',javascript);
}

function goToHideout()
{
	copyTextToClipboard('/hideout');
	callMainWindowFunction('sendClipboardTextToPoe();');
}
