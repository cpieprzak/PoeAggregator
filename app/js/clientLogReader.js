const fs = require('fs');
const readline = require('readline');
var clientLogPathInput = document.getElementById('client-log-path');
var clientLog = '';
function updateClientLogPath()
{
    clientLog = document.getElementById('client-log-path').value + '/Client.txt';
}

clientLogPathInput.onblur = updateClientLogPath;


var lastClientLogLineRead = 0;
var currentLine = 0;
function logInit()
{
    updateClientLogPath();
    readfile(()=>{lastClientLogLineRead++},periodicRead);
}

var done = true;
function periodicRead()
{   
    fs.watchFile(clientLog, { interval: 50 }, (curr, prev) => {
        if(done)
        {
            done = false;
            currentLine = 1;
            readfile(lineRead,()=>{done = true;});
        }
    });
}

function lineRead(line)
{
    if(currentLine > lastClientLogLineRead)
    {
        var isBuyMsg = line.includes('@From');
        if(line.includes('@From'))
        {
            var isBuyMsg = line.includes('Hi, I would like to buy');
            if(isBuyMsg)
            {   
                var whisper = new TradeWhisper(line).toElement();
                document.getElementById('trade-whisper-display-button').classList.add('unviewed');
                document.getElementById('trade-whisper-display-window').append(whisper);
                var soundId = soundId = document.getElementById('trade-notification-sound').value;
                var volume = document.getElementById('trade-notification-sound-volume').value;
                var isBigTrade = line.includes('exalted');
                if(isBigTrade)
                {
                    var bigSound = document.getElementById('big-trade-notification-sound').value
                    if(bigSound.trim() != '')
                    {
                        soundId = bigSound;
                        volume = document.getElementById('big-trade-notification-sound-volume').value;
                    }
                }
                if(soundId.trim() != '')
                {
                    playSound(soundId, volume);
                }
            }
        }
        
        lastClientLogLineRead++;
    }
    currentLine++;
}

function readfile (online,onclose)
{
    var lineReader = readline.createInterface(
    {
        input: fs.createReadStream(clientLog, {encoding: 'utf8'})
    });    
    lineReader.on('line', online);
    lineReader.on('close', onclose);
}

logInit();

