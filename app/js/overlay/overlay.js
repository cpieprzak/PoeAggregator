const ipc = require('electron').ipcRenderer;

function hideHighlightOverlay()
{
	ipc.send('highlight-stash',null,null,'Hide');
}

function hideTradeOverlay()
{
	ipc.send('show-overlay-window','tradeOverlayWindow', false); 
}

function lockOverlay(button)
{
    var buttonText = button.innerHTML;
    var titleBar = document.querySelector('.title-bar');
    if(buttonText === 'Lock'){
        button.innerHTML = 'Unlock';
        titleBar.classList.add('locked');
    }
    else{
        button.innerHTML = 'Lock';
        titleBar.classList.remove('locked');
    }
}