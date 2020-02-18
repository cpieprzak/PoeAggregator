const WebSocket = require('ws');
const cookie = require('cookie');

function WebSocketWrapper(url, searchInfo, connectionManager)
{
	this.url = url;
	this.searchInfo = searchInfo;
	this.socket = null;
	this.closedByUser = false;
	this.connectionManager = connectionManager;
	this.autoReconnectDelay = 45 * 60 * 1000;
	this.connectTimeout = null;
	this.autoReconnect = null;
	this.delay = 100;
	
	this.reconnect = function(event)
	{
		clearTimeout(this.autoReconnect);
		this.autoReconnect = null;
		
		if(event && !this.closedByUser)
		{
			if(event.code)
			{
				if(event.code == 401)
				{
					console.log('Bad close (' + this.url + ')[' + event.code + ']... Could not authenticate.');
					var socketCount = document.getElementById('socket-count');
					socketCount.value = 0;
					socketCount.classList.remove('active');
				}
				else if(event.code == -1000)
				{
					console.log('Scheduled close (' + this.url + ')[' + event.code + ']... reconnecting');
					this.connect();
				}
				else if(event.code == 1006)
				{
					console.log('Bad close (' + this.url + ')[' + event.code + ']... reconnecting');
					this.delay += 5000;
					this.connect();
				}
				else if(event.code != 1000)
				{
					console.log('Bad close (' + this.url + ')[' + event.code + ']... reconnecting');
					this.delay += 5000;
					this.connect();
				}
				else
				{
					console.log('Closing ' + this.url);
					var socketCount = document.getElementById('socket-count');
					socketCount.value = 0;
					socketCount.classList.remove('active');
				}
			}
			else
			{
				console.log('Closing ' + this.url);
				var socketCount = document.getElementById('socket-count');
				socketCount.value = 0;
				socketCount.classList.remove('active');
			}
		}
	};
	
	this.connect = function()
	{
		this.connectTimeout = setTimeout
		(
			function()
			{
				this.delayedConnection(); 
			}.bind(this), this.delay
		);
	}
	
	this.delayedConnection = function()
	{
		console.log('Connecting to ' + url);
		this.autoReconnect = setTimeout
		(
			function()
			{
				this.socket.close(1000);
				this.reconnect(new ScheduledClosedEvent()); 
			}.bind(this), this.autoReconnectDelay
		);
		this.socket = new WebSocket(
				this.url,
			    [],
			    {
			    	'origin' : 'https://www.pathofexile.com/',
			        'headers': 
			        {
			            'Cookie': cookie.serialize('POESESSID', poesessionid)
			        }
			    }
			);
		this.socket.mywrapper = this;
		this.socket.onopen = function(event)
		{
			if(this.readyState == WebSocket.OPEN)
			{
				console.log('Connected.');
			}
			this.mywrapper.connectionManager.update(event,this);
		}
		this.socket.onerror = function(event)
		{
			this.mywrapper.connectionManager.update(event,this);
		};
		this.socket.onclose = function(event)
		{
			this.mywrapper.connectionManager.update(event,this);
			if(!this.mywrapper.closedByUser)
			{
				var closedNormally = event.code == -1000 || event.code == 1000;
				if(!closedNormally)
				{
					clearTimeout(this.mywrapper.autoReconnect);
					this.mywrapper.autoReconnect = null;

					this.autoReconnect = setTimeout
					(
						function()
						{
							this.mywrapper.reconnect(event);
						}.bind(this), 10 * 1000
					);
				}
			}
		}
		this.socket.onmessage = function (event) 
		{
			this.mywrapper.connectionManager.update(event,this);
			var json = JSON.parse(event.data);
			var itemRequest = new ItemRequest(searchInfo, json.new);
			requestManager.addRequest(itemRequest);			
		}
	}
	
	this.close = function()
	{
		this.closedByUser = true;
		console.log('Closing ' + url);
		if(this.connectTimeout != null)
		{
			 clearTimeout(this.connectTimeout);
		}
		if(this.autoReconnect != null)
		{
			 clearTimeout(this.autoReconnect);
			 this.autoReconnect = null;
		}
		if(this.socket != null)
		{
			if(	this.socket.readyState !== WebSocket.CLOSED && 
				this.socket.readyState !== WebSocket.CLOSING)
			{
				this.socket.close();
			}
			this.socket = null;
		}
	}
}
function ScheduledClosedEvent()
{
	this.code = -1000;	
}