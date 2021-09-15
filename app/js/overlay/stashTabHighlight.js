const ipc = require('electron').ipcRenderer;

function confirmStashTabArea()
{
    ipc.send('confirm-stash-tab-area'); 
}

function highlightView()
{
    document.querySelector('.overlay-window').classList.add('hidden');
}

function configView()
{
    document.querySelector('.overlay-window').classList.remove('hidden');
}