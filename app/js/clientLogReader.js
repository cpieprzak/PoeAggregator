const clientLogName = 'Client.txt';
var clientLog = '';
var clientLogPathInput;
var logReader;

document.addEventListener('localDataLoaded', () => {
    clientLogPathInput = document.getElementById('client-log-path');
});
function updateClientLogPath()
{
    clientLog = `${clientLogPathInput.value}/${clientLogName}`;
    console.log(`Updating log path to: ${clientLog}`);
    if(logReader)
    {
        logReader.stop();
    }
    logInit();
}

function logInit()
{
    clientLog = `${clientLogPathInput.value}/${clientLogName}`;
    console.log(`Connecting to: ${clientLog}`);
    logReader = new FileStreamReader(clientLog, processLine);
    logReader.start();    
}

function processLine(line)
{
    if(line.length > 0)
    {
        try
        {
            var isBuyMsg = line.includes('@From');
            if(line.includes('@From'))
            {
                var isBuyMsg = line.includes('Hi') && line.includes('like to buy');
                if(isBuyMsg)
                {   
                    ipc.send('trade-whisper',line);                
                    document.getElementById('trade-whisper-display-button').classList.add('new');
                    var tradeWhisper = new TradeWhisper(line);
                    if(pushTradeWhisper(tradeWhisper.toElement(), QS('#trade-whisper-display-window')))
                    {
                        playTradeSound(tradeWhisper);
                    }
                }
            }
            else if(line.includes(' has joined the area.'))
            {
                let playerName = line.split(' : ')[1].split(' has joined the area.')[0].trim();
                ipc.send('player-joined',playerName);
            }
        }
        catch (e)
        {
            console.log(e);
        }
    }
}