const ipc = require('electron').ipcRenderer;
const https = require('https');

var lastItem = null;
var openSockets = 0;
var activeCount = 0;
var socketsToOpen = 0;
var maxItemsDisplayed = 300;
var allDisplayedItems = [];
var hasActiveSockets = false;
var currencyRatios = [];
var genericId = 0;
var currentView = document.getElementById('display-window');
var poesessionid = '';

function openBrowserWindow(url)
{
	ipc.send('loadGH',url);
}

function setCurrentWindow(id)
{
	var views = document.querySelectorAll('.view-tab');
	for (var i = 0; i < views.length; i++)
	{
		var view = views[i];
		view.classList.add('hidden');
		if(view.id && view.id == id)
		{
			view.classList.remove('hidden');
			currentWindow = view;
		}
	}
}

function getItems()
{
	requestManager.getNextItem();
}

var lookupProcess = null;

var updateSpeed = 3000;
function updateQueue(updateSpeed)
{
	if(updateSpeed == null)
	{
		updateSpeed = document.getElementById('queue-update-speed');
	}
	try
	{
		updateSpeed = parseInt(updateSpeed.value);
	}
	catch(e)
	{
		updateSpeed = 3500;
	}
	if(lookupProcess != null)
	{
		clearInterval(lookupProcess);
	}
	console.log('Updating queue speeds to ' + updateSpeed + 'ms.');
	lookupProcess = setInterval(getItems, updateSpeed);
}

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

function callAjax(url, callback, searchInfo)
{
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function()
    {		
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
        {
        	callback(xmlhttp.responseText, searchInfo);
        }		
    }
	xmlhttp.open("GET", url, true);
	xmlhttp.setRequestHeader('User-Agent', "PoeAggregator Version: " + require('electron').remote.app.getVersion())
    xmlhttp.send();
}

function consoleOut(data)
{
	var json = JSON.parse(data);
	console.log(json);
}

function clearDisplay()
{
	var display = document.getElementById('display-window');
	display.innerHTML = '';
	allDisplayedItems = [];
	lastItem = null;
}

function startSockets() 
{	
	if(poesessionid == null || poesessionid.trim().length < 1)
	{
		alert('"poesessionid" must be set in the settings menu.')
		return false;
	}
	if(hasActiveSockets)
	{
		return false;
	}
	else
	{
		activeCount = 0;
		hasActiveSockets = true;		
		var exPrice = document.getElementById('Exalted Orb');
		if(exPrice.value == null || exPrice.value.length < 1)
		{
			loadCurrency();
		}
		var league = document.getElementById('league').value;
		var socketPath = "wss://pathofexile.com:443/api/trade/live/";
		
		var socketUrl = socketPath + league + '/';
		var searchesString = document.getElementById('searches').value;
		var soundId = document.getElementById('notification-sound').value;

		var listingManager = new ListingManager(searchesString);
		var providedSearches = listingManager.searches;

		if(providedSearches != null && providedSearches.length > 0)
		{
			SearchConnectionManager.start(providedSearches, socketUrl);
		}		
	}
} 

function stopSockets() 
{
	hasActiveSockets = false;
	SearchConnectionManager.stop();
	requestManager.itemRequests = [];
	document.getElementById('queue-count').value = requestManager.itemRequests.length;
} 

var frameType = ["Normal","Magic","Rare","Unique","Gem","Currency","DivinationCard","Quest","Prophecy","Relic"];
function addItem(data, searchInfo) 
{
	var json = JSON.parse(data);
	var results = json.result;
	var viewId = searchInfo.viewId;
	var display = document.getElementById(viewId);
	for(var i = 0; i < results.length; i++)
	{	
		var result = results[i];
		var newNode = dView(result, searchInfo);
		display.insertBefore(newNode, display.firstChild);
		if(viewId == 'display-window')
		{
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
			remote.getCurrentWindow().flashFrame(true);
			if(searchInfo.autoCopy == '1')
			{
				copyTextToClipboard(result.listing.whisper);
			}
		}
	}
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
	catch(error) 
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

function updateFontSize()
{
	var body = document.querySelector('body');
	var fontSize = document.getElementById('font-size').value;
	fontSize = Math.ceil(fontSize / 10) * 10;
	var classList = body.classList;
	for(var i = 0; i < classList.length; i++)
	{
		var cssClass = classList[i];
		if(cssClass.startsWith('font-size-'))
		{
			classList.remove(cssClass);
		}
	}
	classList.add('font-size-' + fontSize);
}

function updateMaxItemsDisplayed()
{
	var input = document.getElementById('max-items-displayed-box');
	var maxString = input.value;
	try
	{
		maxItemsDisplayed = parseInt(maxString);
	}
	catch(error)
	{
		maxItemsDisplayed = 300;
	}	
}

function updatePoesessionid()
{
	var input = document.getElementById('poesessionid');
	poesessionid = input.value.trim();
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
		catch(error)
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
minValueBox.onkeyup = filterItems;
	
var filterItems = function()
{
	var minValueString = this.value;
	if(minValueString != null && minValueString.trim().length > 0)
	{
		try
		{
			minValue = parseFloat(minValueString);
		}
		catch(error)
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

	var requiresOpenPrefix = document.getElementById('open-prefix').value;
	if(showItem && requiresOpenPrefix != 'either' && item.openPrefix != null)
	{
		if(requiresOpenPrefix == 'yes' && item.openPrefix != 1)
		{
			showItem = false;
		}
		else if(requiresOpenPrefix == 'no' && item.openPrefix != 0)
		{
			showItem = false;
		}
	}
	var requiresOpenSuffix = document.getElementById('open-suffix').value;
	if(showItem && requiresOpenSuffix != 'either' && item.openSuffix != null)
	{
		if(requiresOpenSuffix == 'yes' && item.openSuffix != 1)
		{
			showItem = false;
		}
		else if(requiresOpenSuffix == 'no' && item.openSuffix != 0)
		{
			showItem = false;
		}
	}
	
	var isCrafted = document.getElementById('is-crafted').value;
	if(showItem && isCrafted != 'either' && item.isCrafted != null)
	{
		if(isCrafted == 'yes' && item.isCrafted != 1)
		{
			showItem = false;
		}
		else if(isCrafted == 'no' && item.isCrafted != 0)
		{
			showItem = false;
		}
	}
	
	if(showItem && item.allText)
	{
		var itemText = item.allText;

		if(filterText.startsWith('~'))
		{
			filterText = filterText.substring(1);
			var textParts = filterText.split(' ');
			for(var i = 0; i < textParts.length; i++)
			{
				if(itemText.indexOf(textParts[i]) < 0)
				{
					showItem = false;
					break;
				}		
			}
		}	
		else if(itemText.indexOf(filterText) < 0)
		{
			showItem = false;
		}			
	}
	if(showItem && minValue > 0)
	{
		if(item.totalItemValue && item.totalItemValue > minValue)
		{
			
		}
		else
		{
			showItem = false;
		}
	}
	if(showItem && minSum > 0)
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
	
	var rowInputs = element.querySelectorAll('input[type="text"],input[type="range"]');
	
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
				parent.appendChild(dragTarget);
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
		displayWindow.appendChild(allDisplayedItems[i]);
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
			displayWindow.appendChild(allDisplayedItems[i]);
		}
}


var outputToView = function(data, parameters)
{
	var viewId = 'display-window';
	var json = JSON.parse(data);
	var loadedItems = json.result;
	
	if(parameters != null)
	{
		viewId = parameters.viewId;
		if(parameters.orgin && parameters.orgin == 'run')
		{
			loadedItems = loadedItems.reverse();
		}
	}
	
	var listings = [];
	for(var i = 0; i < loadedItems.length; i++)
	{
		var itemId = loadedItems[i];
		if(itemId != null && itemId.length > 0)
		{
			listings.push(itemId);
		}
	}
	if(listings.length > 0)
	{
		var searchinfo = new SearchListing();
		if(parameters != null)
		{
			var urlPart = parameters.searchUrlPart;
			if(urlPart != null)
			{
				searchinfo.searchUrlPart = urlPart;
			}
		}
		searchinfo.viewId = viewId;
	    requestManager.addRequest(new ItemRequest(searchinfo,listings));
	}
};

function runSortedSearch(search, sort, callback)
{
	var url = '/api/trade/search/';
	var searchInfo = new SearchListing();
	searchInfo.searchUrlPart = search;
	searchInfo.orgin = 'run';
	url += search;
	var sortsearches = function(data)
	{
		var results =  JSON.parse(data);
		var jsonData = new Object();
		jsonData.query = results.query;
		if(sort != null)
		{
			jsonData.sort = sort;			
		}
		jsonData = JSON.stringify(jsonData);
		var league = document.getElementById('league').value;
		var path = '/api/trade/search/';
		path += league;
		callAjaxWithSession('POST', path, callback, jsonData, searchInfo);
	};
	url += '?q=';
	callAjaxWithSession('GET', url, sortsearches)
}

function callAjaxWithSession(method, path, callback, jsonData, searchInfo)
{
	var myHeaders = 
    {
        'Cookie': cookie.serialize('POESESSID', poesessionid)
    };

	if(jsonData != null)
	{
		myHeaders = 
	    {
	        'Cookie': cookie.serialize('POESESSID', poesessionid),
			'Content-Length': Buffer.byteLength(jsonData),
	      	'Content-Type': 'application/json'
	    };
	}

    const options =
	{
		host: 'www.pathofexile.com',
		port: 443,
		path: path,
  		method: method,
		headers: myHeaders
	};
	
	var data = '';
	const req = https.request(options, res => 
	{
		if(res.statusCode == 200)
		{
			res.setEncoding('utf8');
		  	res.on('data', d => 
			{
		    	data += d;
		  	})
		  	res.on('end', d => 
			{
		    	callback(data, searchInfo);
		  	})
		}
		else
		{
			console.log('Bad request: ' + res.statusCode);
		}
	})

	req.on('error', error => 
	{
  		console.error(error)
	})
	
	if(jsonData != null)
	{
		req.write(jsonData);
	}

	req.end()
}