function SearchConnectionManager()
{
	this.totalSocketCount = 0;
	this.searches = [];
	this.sockets = [];
	this.lastUpdates = [];
	this.socketStatus = [];
	this.socketBox = document.getElementById('socket-count');
	this.fullyClosed = true;
	
	this.start = function(providedSearches,socketUrl)
	{
		if(this.fullyClosed)
		{
			this.fullyClosed = false;
			this.lastUpdates = [];
			this.socketStatus = [];
			this.socketBox.classList.add('active');
			this.totalSocketCount = 0;
			var tmp = [];
			var urlParts = [];
			for(var i = 0; i < providedSearches.length; i++)
			{
				var search = providedSearches[i];
				if(search.active == '1')
				{
					if(urlParts.indexOf(search.searchUrlPart) < 0)
					{
						urlParts.push(search.searchUrlPart);
						tmp.push(search);
						this.totalSocketCount++;
					}
				}
			}

			this.socketBox.value = '0/' + this.totalSocketCount;
			for(var i = 0; i < tmp.length; i++)
			{
				var searchInfo = tmp[i];
				var webSocketUrl = socketUrl + searchInfo.searchUrlPart;
				var searchSocket = new WebSocketWrapper(webSocketUrl, searchInfo, this);		
				searchSocket.connect();
				this.sockets.push(searchSocket);
			}
		}		
	}
	this.stop = function()
	{
		for(var i = 0; i < this.sockets.length; i++)
		{
			this.sockets[i].close();
		}
		this.socketBox.classList.remove('active');
	}
	this.update = function(event,socket)
	{
		var connectedCount = 0;
		if(event && socket && socket.readyState)
		{			
			if(event.target)
			{
				if(event.target.mywrapper)
				{
					if(event.target.mywrapper.searchInfo)
					{
						var searchInfo = event.target.mywrapper.searchInfo;
						var part = searchInfo.searchUrlPart;
						updateTime = this.lastUpdates[part];
						if(updateTime == null || updateTime < event.timeStamp)
						{
							this.lastUpdates[part] = event.timeStamp;
							var connected = false;
							if(socket.readyState === WebSocket.OPEN)
							{
								connected = true;
							}

							this.socketStatus[part] = connected;
							for (var property in this.socketStatus)
							{
								if(this.socketStatus[property])
								{
									connectedCount++;
								}
							}
						}
					}
				}
			}
			if(connectedCount == 0)
			{
				this.fullyClosed = true;
			}
		}
		
		this.socketBox.value = connectedCount + '/' + this.totalSocketCount;
	};
}
var SearchConnectionManager = new SearchConnectionManager();