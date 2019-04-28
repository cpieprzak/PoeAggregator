var lastItem = null;
var sockets = [];
var openSockets = 0;
var socketsToOpen = 0;
var maxItemsDisplayed = 300;
var allDisplayedItems = [];
var hasActiveSockets = false;

function ItemRequest(searchInfo, listings)
{	
	this.listings = listings;
	this.searchInfo = searchInfo;
}

function RequestManager()
{
	this.itemRequests = [];
	this.queueBox = document.getElementById('queue-count');
	this.addRequest = function(newRequest)
	{	
		var listings = newRequest.listings;
		var filteredListing = [];
			
		for(var i = 0; i < listings.length; i++)
		{
			filteredListing.push(newRequest.listings[i]);
			if(filteredListing.length == 10)
			{
				var tmpRequest = new ItemRequest(newRequest.searchInfo, filteredListing);
				this.itemRequests.push(tmpRequest);		
				filteredListing = [];
			}
		}
		
		if(filteredListing.length > 0)
		{
			var tmpRequest = new ItemRequest(newRequest.searchInfo, filteredListing);
			this.itemRequests.push(tmpRequest);
		}			

		this.queueBox.value = requestManager.itemRequests.length;
	}
	this.getNextItem = function()
	{
		if(this.itemRequests.length > 0)
		{
			var itemRequest = this.itemRequests.shift();
			this.queueBox.value = this.itemRequests.length;		
			var getItemUrl = 'https://www.pathofexile.com/api/trade/fetch/';	
			var itemUrl = getItemUrl + itemRequest.listings;
			itemUrl += '?query=' + itemRequest.searchInfo.searchUrlPart;
			this.processItem(itemUrl, itemRequest.searchInfo);			
		}
	};
	this.processItem = function (itemUrl, searchInfo)
	{
		callAjax(itemUrl, addItem, searchInfo);
		playSound(searchInfo.soundId, searchInfo.soundVolume);
	};
}

var requestManager = new RequestManager();
function getItems()
{
	requestManager.getNextItem();
}

setInterval(getItems, 500);


function updateTimes()
{
	var timesToUpdate = document.querySelectorAll('.create-date');
	for (var i = 0; i < timesToUpdate.length; i++)
	{
		var time = timesToUpdate[i];
		var createDate = time.createDate;
		var now = new Date();
		var text = 'A few seconds';
		var ageInSeconds = (now - createDate) / 1000;
		if(ageInSeconds < 60)
		{
			text = Math.round(ageInSeconds) + ' seconds ago';
		}
		else
		{
			var timeInMinutes = ageInSeconds / 60;
			text = Math.round(timeInMinutes) + ' minutes ago';
		
		}
		time.innerHTML = text;
	}
}
setInterval(updateTimes, 1000);
function startSockets() 
{	
	if(hasActiveSockets)
	{
		return false;
	}
	else
	{
		hasActiveSockets = true;
		var socketCounterBox = document.getElementById('socket-count');
		socketCounterBox.classList.add('active');
		
		var league = document.getElementById('league').value;
		window.localStorage.setItem('league', league);
		var socketUrl = "wss://pathofexile.com/api/trade/live/" + league + '/';
		var searchesString = document.getElementById('searches').value;
		window.localStorage.setItem('searches', searchesString);
		var soundId = document.getElementById('notification-sound').value;
		window.localStorage.setItem('notification-sound', soundId);

		var listingManager = new ListingManager(searchesString);
		var providedSearches = listingManager.searches;
		if(providedSearches != null && providedSearches.length > 0)
		{
			var activeCount = 0;
			for(var i = 0; i < providedSearches.length; i++)
			{
				if(providedSearches[i].active == '1')
				{
					activeCount++;
				}
			}
			
			for(var i = 0; i < providedSearches.length; i++)
			{
				var searchInfo = providedSearches[i];
				if(searchInfo.active == '1')
				{
					var webSocketUrl = socketUrl + searchInfo.searchUrlPart;
					var searchSocket = new WebSocket(webSocketUrl);
					searchSocket.searchInfo = searchInfo;
					searchSocket.onopen = function(event)
					{
						openSockets++;
						document.getElementById('socket-count').value = openSockets + '/' + activeCount;
					};
					searchSocket.onerror = function(event)
					{
						var errorMsg = this.searchpart + ' has experienced an error.';
						console.log(event.data);
						alert(errorMsg);
					};
					searchSocket.onclose = function(event)
					{
						openSockets--;
						if(openSockets < 1)
						{
							document.getElementById('socket-count').value = 0;
						}
						document.getElementById('socket-count').value = openSockets + '/' + socketsToOpen;
					};
					searchSocket.onmessage = function (event) 
					{
						var json = JSON.parse(event.data);
						var itemRequest = new ItemRequest(this.searchInfo, json.new);
						requestManager.addRequest(itemRequest);
					}
					sockets.push(searchSocket);
				}				
			}
		}		
	}
} 

function callAjax(url, callback, searchInfo){
    var xmlhttp;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function()
    {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
        {
            callback(xmlhttp.responseText, searchInfo);
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

function clearDisplay()
{
	var display = document.getElementById('display-window');
	display.innerHTML = '';
	allDisplayedItems = [];
	lastItem = null;
}

function stopSockets() 
{
			
	if(sockets != null && sockets.length > 0)
	{
		for(var i = 0; i < sockets.length; i++)
		{
	  		sockets[i].close();
		}
	}	
	requestManager.itemRequests = [];
	document.getElementById('queue-count').value = requestManager.itemRequests.length;
	var socketCounterBox = document.getElementById('socket-count');
	socketCounterBox.classList.remove('active');
	hasActiveSockets = false;
} 

var frameType = ["Normal","Magic","Rare","Unique","Gem","Currency","DivinationCard","Quest","Prophecy","Relic"];
function addItem(data, searchInfo) 
{
	var json = JSON.parse(data);
	var results = json.result;

	var display = document.getElementById('display-window');
	for(var resultIndex = 0; resultIndex < results.length; resultIndex++)
	{	
		var result = results[resultIndex];
		var newNode = dView(result, searchInfo);
		display.insertBefore(newNode, lastItem);
		lastItem = newNode;

		allDisplayedItems.push(lastItem);
		if(allDisplayedItems.length > maxItemsDisplayed)
		{
			var oldestItem = allDisplayedItems.shift();
			if(oldestItem != null)
			{
				oldestItem.parentNode.removeChild(oldestItem);
				oldestItem = null;			
			}
		}
	}
} 

function buildCopyButton(buttonText, textToCopy)
{
	var inputElement = document.createElement('input');
	inputElement.type = "button"
	inputElement.className = "button"
	inputElement.value = buttonText;
	inputElement.addEventListener('click', function(event)
	{
	    copyTextToClipboard(textToCopy);
	    event.target.classList.add('copied');
	});

	return inputElement;
}

function copyTextToClipboard(text)
{
	var textArea = document.createElement("textarea");
	textArea.classList.add('copy-text-area');
	textArea.value = text;
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();
	try
	{
		document.execCommand('copy');
	}
	catch (e) 
	{
		
	}
	document.body.removeChild(textArea);
}


function showHide()
{
	var target = this.showHideTarget;
	if(target.classList.contains('hidden'))
	{
		target.classList.remove('hidden');
	}
	else
	{
		target.classList.add('hidden');
	}
}


function toggleFontSize()
{
	var body = document.querySelector('body');
	var targetClass = 'small';
	if(body.classList.contains(targetClass))
	{
		body.classList.remove(targetClass);	
	}
	else
	{
		body.classList.add(targetClass);	
	}
}

function toggleView()
{
	var targetElement = document.getElementById('display-window');
	var targetClass = 'condensed';
	if(targetElement.classList.contains(targetClass))
	{
		targetElement.classList.remove(targetClass);	
	}
	else
	{
		targetElement.classList.add(targetClass);	
	}
}
