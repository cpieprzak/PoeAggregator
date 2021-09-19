const fs = require('fs');
const {promisify : clrPromisify} = require('util');
const {pipeline, Transform, PassThrough} = require('stream');
const clientLogName = 'Client.txt';
var clientLog = '';
var clientLogPathInput = document.getElementById('client-log-path');
var logReader;

const pipelinePromise = clrPromisify(pipeline);
const createLineByLineParser = () => new class extends Transform {
    _transform (chunk,encoding,callback) {
       const data = String(chunk);
       const lines = data.split('\n').map((line) => line.trim());
       for(const line of lines)
       {
           this.push(line);
       }
       callback(null);
    }
};



function transformToString(buffer)
{
    processLine(buffer.toString());
}

const startWatchingClientLog = (path) => {
    const aborter = new AbortController();
    const readStream = fs.createReadStream(path,{autoClose : false, emitClose : false});
    const writeStream = new PassThrough({objectMode : true});
    const transform = createLineByLineParser();
    writeStream.on('data', transformToString);
    pipelinePromise(readStream,transform,writeStream);

    return aborter;
};

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
    //startWatchingClientLog(clientLog);
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
                    if(pushTradeWhisper(tradeWhisper, QS('#trade-whisper-display-window')))
                    {
                        playTradeSound(tradeWhisper);
                    }
                }
            }
        }
        catch (e)
        {
            console.log(e);
        }
    }
}