const fs = require('fs');
const readline = require('readline');
var clientLogPathInput = document.getElementById('client-log-path');
var clientLog = '';
var logwatcher;
var done = true;
function updateClientLogPath()
{
    if(logwatcher)
    {
        console.log('Closing file reader on ' + clientLog);
        fs.unwatchFile(clientLog);
        logwatcher = null;
    }
    var path = document.getElementById('client-log-path').value;
    clientLog = path + '/Client.txt';
    console.log('Updating log path to: ' + clientLog);
    logwatcher = null;
    done = true;
    logInit();
}

var lastClientLogLineRead = 0;
var currentLine = 0;
function logInit()
{
    lastClientLogLineRead = 0;
    currentLine = 0;
      
    if (fs.existsSync(clientLog)) 
    {
        console.log('Initializing log reader on: ' + clientLog);
        readfile(()=>{lastClientLogLineRead++},periodicRead);
    }
    else
    {
        console.log('Client.txt does not exist at ' + clientLog);
    }
}

function periodicRead()
{ 
    if(logwatcher == null)
    {
        console.log('Client log reader successfully initialized.');
        logwatcher = fs.watchFile(clientLog, { interval: 50 }, (curr, prev) => {
            if(done)
            {
                done = false;
                currentLine = 1;
                readfile(lineRead,()=>{done = true;});
            }
        });
    }
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