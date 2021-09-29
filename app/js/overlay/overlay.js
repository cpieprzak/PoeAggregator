const overlayIpc = require('electron').ipcRenderer;

function hideHighlightOverlay()
{
	overlayIpc.send('highlight-stash',null,null,'Hide');
}

function hideTradeOverlay()
{
	overlayIpc.send('show-overlay-window','tradeOverlayWindow', false); 
}

function hideOverlay()
{
    overlayIpc.send('hide-overlay');
}

function lockOverlay(button,lock)
{
    var buttonText = button.innerHTML;
    var titleBar = QS('.title-bar');
    if(lock || buttonText === 'Unlock'){
        button.innerHTML = 'Lock';
        titleBar.classList.remove('locked');
        overlayIpc.send('set-resizable',true);
    }
    else{
        button.innerHTML = 'Unlock';
        titleBar.classList.add('locked');
        overlayIpc.send('set-resizable',false);
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

const makeClickable = (element) =>
{
    if(element)
    {
        element.addEventListener('mouseleave', () => {
            overlayIpc.send('set-ignore-mouse-events', true, { forward: true });
        });
        element.addEventListener('mouseenter', () => {
            overlayIpc.send('set-ignore-mouse-events', false);
        });
    }
};

const makeClickThrough = (element) =>
{
    if(element)
    {
        element.addEventListener('mouseleave', () => {
            overlayIpc.send('set-ignore-mouse-events', false);
        });
        element.addEventListener('mouseenter', () => {            
            overlayIpc.send('set-ignore-mouse-events', true, { forward: true });
        });
    }
};

makeClickThrough(QS('.overlay-body .click-through'));
QS('.overlay-body').addEventListener('wheel', (event) => {
    QS('.overlay-body').scrollLeft += event.deltaY;
  });