var lastItem = null;
var sockets = [];
var openSockets = 0;
var activeCount = 0;
var socketsToOpen = 0;
var maxItemsDisplayed = 300;
var allDisplayedItems = [];
var hasActiveSockets = false;
var currencyRatios = [];
var genericId = 0;

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
			var minutesString = 'minutes';
			if(timeInMinutes < 2)
			{
				minutesString = 'minute';
			}
			text = Math.round(timeInMinutes) + ' ' + minutesString + ' ago';
		
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
		activeCount = 0;
		hasActiveSockets = true;
		var socketCounterBox = document.getElementById('socket-count');
		socketCounterBox.classList.add('active');
		
		var exPrice = document.getElementById('Exalted Orb');
		if(exPrice.value == null || exPrice.value.length < 1)
		{
			loadCurrency();
		}
		var league = document.getElementById('league').value;
		var socketUrl = "wss://pathofexile.com/api/trade/live/" + league + '/';
		var searchesString = document.getElementById('searches').value;
		var soundId = document.getElementById('notification-sound').value;

		var listingManager = new ListingManager(searchesString);
		var providedSearches = listingManager.searches;

		if(providedSearches != null && providedSearches.length > 0)
		{
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
					var searchSocket = new WebSocketWrapper(webSocketUrl, searchInfo);		
					searchSocket.connect();
					sockets.push(searchSocket);
				}				
			}
		}		
	}
} 

function callAjax(url, callback, searchInfo)
{
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
		sockets = [];
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
		display.insertBefore(newNode, display.firstChild);
		lastItem = newNode;

		allDisplayedItems.push(lastItem);
		while(allDisplayedItems.length > maxItemsDisplayed)
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

function showCurrencyRatios()
{
	document.getElementById('currency-ratios').classList.remove('hidden');
}

function hideCurrencyRatios()
{
	document.getElementById('currency-ratios').classList.add('hidden');
}


function showHide(elementId)
{
	var element = document.getElementById(elementId);
	if(element != null)
	{
		var classList = element.classList;
		var hidden = 'hidden';
		if(classList.contains(hidden))
		{
			classList.remove(hidden);
		}
		else
		{
			classList.add(hidden);
		}
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

function updateMaxItemsDisplayed()
{
	var input = document.getElementById('max-items-displayed-box');
	var maxString = input.value;
	try
	{
		maxItemsDisplayed = parseInt(maxString);
	}
	catch
	{
		maxItemsDisplayed = 300;
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

var filterBox = document.getElementById('filter-box');
filterBox.onkeyup = function()
{
	for(var i = 0; i < allDisplayedItems.length; i++)
	{
		var item = allDisplayedItems[i];
		filterItem(item);		
	}
};

var minSum = 0;
var minSumBox = document.getElementById('min-sum-box');
minSumBox.onkeyup = function()
{
	var minSumString = this.value;
	if(minSumString != null && minSumString.trim().length > 0)
	{
		try
		{
			minSum = parseFloat(minSumString);
		}
		catch
		{
			minSum = 0;
		}
	}
	else
	{
		minSum = 0;	
	}
	for(var i = 0; i < allDisplayedItems.length; i++)
	{
		var item = allDisplayedItems[i];
		filterItem(item);		
	}
};

var minValue = 0;
var minValueBox = document.getElementById('min-value-box');
minValueBox.onkeyup = function()
{
	var minValueString = this.value;
	if(minValueString != null && minValueString.trim().length > 0)
	{
		try
		{
			minValue = parseFloat(minValueString);
		}
		catch
		{
			minValue = 0;
		}
	}
	else
	{
		minValue = 0;	
	}
	for(var i = 0; i < allDisplayedItems.length; i++)
	{
		var item = allDisplayedItems[i];
		filterItem(item);		
	}
};

function filterItem(item)
{
	var filterText = filterBox.value.toLowerCase().trim();
	var showItem = true;
	if(item.allText)
	{
		var itemText = item.allText;
		if(itemText.indexOf(filterText) < 0)
		{
			showItem = false;
		}			
	}
	if(minValue > 0)
	{
		if(item.totalItemValue && item.totalItemValue > minValue)
		{
			
		}
		else
		{
			showItem = false;
		}
	}
	if(minSum > 0)
	{
		if(item.totalSum && item.totalSum > minSum)
		{
			
		}
		else
		{
			showItem = false;
		}
	}
	
	
	if(showItem)
	{
		item.classList.remove('hidden');
	}
	else
	{
		item.classList.add('hidden');
	}		
}

function makeDraggable(element, dropClass)
{
	if(element.id == null || element.id.length < 1)
	{
		element.id = 'genericId-' + genericId;
		genericId++;
	}	
	element.dropTarget = dropClass;
	element.draggable = true;
	element.ondragstart = dragStart;
	element.ondragover = dragOver;
	element.ondragleave = dragLeave;
	element.ondrop = drop;
	
	var rowInputs = element.querySelectorAll('input[type="text"]');
	for(var i = 0; i < rowInputs.length; i++)
	{
		rowInputs[i].searchRow = element;		
		rowInputs[i].onfocus = function()
		{
			this.searchRow.draggable = false;
		};
		rowInputs[i].addEventListener("blur", function()
		{
			this.searchRow.draggable = true;
		});
	}
}

function dragOver(e)
{
	e.preventDefault();
	var dropDestination = e.target;
	var dropClass = this.dropTarget;
	if (dropClass != null) 
	{
		while (!dropDestination.classList.contains(dropClass) && dropDestination.parentElement != null) 
		{
			dropDestination = dropDestination.parentElement;
		}
	}
	var parent = dropDestination.parentElement;
	var rect = dropDestination.getBoundingClientRect();
	var offsetHeight = dropDestination.offsetHeight;
	var y = e.clientY - rect.top;
	if ((y / offsetHeight) > .5) {
		dropDestination.classList.remove('drop-top');
		dropDestination.classList.add('drop-bottom');
	} else {
		dropDestination.classList.remove('drop-bottom');
		dropDestination.classList.add('drop-top');
	}

}

function dragLeave(e)
{
	e.preventDefault();
	var dropDestination = e.target;
	var dropClass = this.dropTarget;
	if (dropClass != null) 
	{
		while (!dropDestination.classList.contains(dropClass) && dropDestination.parentElement != null) 
		{
			dropDestination = dropDestination.parentElement;
		}
	}

	dropDestination.classList.remove('drop-bottom');
	dropDestination.classList.remove('drop-top');
}
function dragStart(e) 
{
	e.dataTransfer.setData('draggedObjectId', e.target.id);
}

function drop(e) 
{
	e.preventDefault();
	var dropDestination = e.target;
	var dropClass = this.dropTarget;
	var dragTarget = document.getElementById(e.dataTransfer.getData('draggedObjectId'));
	if(dragTarget != null)
	{
		if (dropClass != null)
		{
			while (!dropDestination.classList.contains(dropClass) && dropDestination.parentElement != null) 
			{
				dropDestination = dropDestination.parentElement;
			}
		}
		var parent = dropDestination.parentElement;
		var rect = dropDestination.getBoundingClientRect();
		var offsetHeight = dropDestination.offsetHeight;
		var y = e.clientY - rect.top;
		if ((y / offsetHeight) > .5) 
		{
			var nextSibling = dropDestination.nextSibling;
			if (nextSibling != null) 
			{
				parent.insertBefore(dragTarget, nextSibling);
			} 
			else 
			{
				parent.append(dragTarget);
			}
		} 
		else 
		{
			parent.insertBefore(dragTarget, dropDestination);
		}
	}

	removeAllClass('drop-bottom');
	removeAllClass('drop-top');	
}

function removeAllClass(targetClass)
{
	var targets = document.querySelectorAll('.' + targetClass);
	for(var i = 0; i < targets.length; i++)
	{
		targets[i].classList.remove(targetClass);
	}
}

function orderBySum()
{
	allDisplayedItems.sort(
		function(a, b)
		{
			var returnValue = 0;
			if(a.totalSum && !b.totalSum)
			{
				returnValue = -1;
			}
			else if(!a.totalSum && b.totalSum)
			{
				returnValue = 1;
			}
			else if(a.totalSum && b.totalSum)
			{
				returnValue = b.totalSum - a.totalSum;
			}
			
			return returnValue;
		}
	);
	
	var displayWindow = document.getElementById('display-window');
	for(var i = 0; i < allDisplayedItems.length; i++)
	{
		displayWindow.append(allDisplayedItems[i]);
	}
}

function orderByValue()
{
	allDisplayedItems.sort(
			function(a, b)
			{
				var returnValue = 0;
				if(a.totalItemValue && !b.totalItemValue)
				{
					returnValue = -1;
				}
				else if(!a.totalItemValue && b.totalItemValue)
				{
					returnValue = 1;
				}
				else if(a.totalItemValue && b.totalItemValue)
				{
					returnValue = b.totalItemValue - a.totalItemValue;
				}
				
				return returnValue;
			}
		);
		
		var displayWindow = document.getElementById('display-window');
		for(var i = 0; i < allDisplayedItems.length; i++)
		{
			displayWindow.append(allDisplayedItems[i]);
		}
}