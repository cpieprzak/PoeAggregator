const FileStreamReaderFS = require('fs');

class FileStreamReader {   
    // constants 
    static READ_INTERVAL_MS = 500;
    static BUFFER_SIZE = 500;

    fileDescriptor;
    bufferedLine = '';
    offset = 0;
    logInitialized = false;
    processLineFunction;
    fileUrl;
    buffer = Buffer.alloc(FileStreamReader.BUFFER_SIZE);
    isStopping = false;

    constructor(fileUrl, processLineFunction)
    {
        this.fileUrl = fileUrl;
        this.processLineFunction = processLineFunction.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleRead = this.handleRead.bind(this);
    }

    start() 
    {
        this.logInitialized = false;
        var stats = FileStreamReaderFS.statSync(this.fileUrl);
        this.offset = stats.size;

        FileStreamReaderFS.open(this.fileUrl, 'r', this.handleOpen);
    }

    stop() 
    {
        isStopping = true;
    }

    handleOpen(status, fileDescriptor) 
    {
        if (status) 
        {
            console.log(status.message);
            return;
        }
        this.fileDescriptor = fileDescriptor;
        this.readLog();
    }

    readLog()
    {
        this.buffer = Buffer.alloc(FileStreamReader.BUFFER_SIZE);
        FileStreamReaderFS.read(this.fileDescriptor, this.buffer, 0, FileStreamReader.BUFFER_SIZE, this.offset, this.handleRead);
    }

    handleRead(err, num)
    {
        if(!this.isStopping)
        {
            this.offset += num;
            var chunk = this.buffer.toString('utf8', 0, num);
            if(this.logInitialized)
            {
                this.processChunk(chunk,num);
            }
            else if(num === 0)
            {
                this.logInitialized = true
            }
            setTimeout(this.readLog.bind(this), num == 0 ? FileStreamReader.READ_INTERVAL_MS : 10);
        }
    }

    processChunk(chunk,num)
    {
        var newline = '\n';
        if(num === 0) 
        {
            this.bufferedLine += chunk;
            this.processLineFunction(this.bufferedLine.trim());
            this.bufferedLine = '';
        }
        else if(chunk.includes(newline)) 
        {
            var parts = chunk.split(newline);
            while(parts.length > 1)
            {
                this.bufferedLine += parts.shift();
                this.processLineFunction(this.bufferedLine.trim());
                this.bufferedLine = '';
            }
            this.bufferedLine += parts[0];
        }
        else
        {
            this.bufferedLine += chunk;
        }
    }
}