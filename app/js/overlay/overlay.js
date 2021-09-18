const overlayIpc = require('electron').ipcRenderer;

function hideHighlightOverlay()
{
	overlayIpc.send('highlight-stash',null,null,'Hide');
}

function hideTradeOverlay()
{
	overlayIpc.send('show-overlay-window','tradeOverlayWindow', false); 
}

function lockOverlay(button)
{
    var buttonText = button.innerHTML;
    var titleBar = QS('.title-bar');
    if(buttonText === 'Lock'){
        button.innerHTML = 'Unlock';
        titleBar.classList.add('locked');
        overlayIpc.send('set-resizable',false);
    }
    else{
        button.innerHTML = 'Lock';
        titleBar.classList.remove('locked');
        overlayIpc.send('set-resizable',true);
    }
}

function lockTradeClosed()
{
    var button = QS('#collase-btn');
    var buttonText = button.innerHTML;
    var isLocked = false;
    if(buttonText === '-'){
        button.innerHTML = '+';
        isLocked = true;
    }
    else{
        button.innerHTML = '-';
    }
    overlayIpc.send('lock-trade-whisper-window',isLocked,getTradeWhisperCount()); 
}

if(QS('.trade-notification'))
{
    QS('.overlay-window').addEventListener('mouseenter', (e)=>{QS('.trade-notification').classList.remove('new');});
}
