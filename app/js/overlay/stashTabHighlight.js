const stashTabHighlightIpc = require('electron').ipcRenderer;

function confirmStashTabArea()
{
    stashTabHighlightIpc.send('confirm-stash-tab-area'); 
}

function highlightView()
{
    QS('.overlay-window').classList.add('hidden');
}

function configView()
{
    QS('.overlay-window').classList.remove('hidden');
}

QS('body').addEventListener('mouseenter', ()=>{
    if(QS('.overlay-window').classList.contains('hidden'))
        overlayIpc.send('highlight-stash',null,null,'Hide');
});