function WebSocketWrapper(url, searchInfo)
{
	this.url = url;
	this.searchInfo = searchInfo;
	this.socket = null;
	this.timeoutDelay = 10000;
	this.reconnect = function(event)
	{
		if(event)
		{
			if(event.code)
			{
				if(event.code != 1000)
				{
					console.log('Bad close (' + this.url + ')... reconnecting');
					console.log(event);
					var tmpFunction = function()
					{
						this.connect();
					};
					setTimeout(tmpFunction.bind(this), this.timeoutDelay);
				}
				else
				{
					console.log('Closing ' + this.url);
					document.getElementById('socket-count').value = 0;
				}
			}
			else
			{
				console.log('Closing ' + this.url);
				document.getElementById('socket-count').value = 0;
			}
		}
	};
	
	this.connect = function()
	{
		console.log('Connecting to ' + url);
		this.socket = new WebSocket(this.url);
		this.socket.mywrapper = this;
		this.socket.onopen = function(event)
		{
			console.log('Connection sucessfully opened to ' + this.mywrapper.url);
			openSockets++;
			document.getElementById('socket-count').value = openSockets + '/' + activeCount;
		}
		this.socket.onerror = function(event)
		{
			console.log(event.data);
		};
		this.socket.onclose = function(event)
		{
			openSockets--;
			if(openSockets < 1)
			{
				openSockets = 0;
			}
			document.getElementById('socket-count').value = openSockets + '/' + activeCount;
			this.mywrapper.reconnect(event);
		}
		this.socket.onmessage = function (event) 
		{
			var json = JSON.parse(event.data);
			var itemRequest = new ItemRequest(searchInfo, json.new);
			requestManager.addRequest(itemRequest);
		}
	}
	
	this.close = function()
	{
		if(this.socket != null)
		{
			this.socket.close();
			this.socket = null;
		}
	}
}