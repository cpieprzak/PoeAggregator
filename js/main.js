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
			for(var i = 0; i < providedSearches.length; i++)
			{
				var searchInfo = providedSearches[i];
				var webSocketUrl = socketUrl + searchInfo.searchUrlPart;
				var searchSocket = new WebSocket(webSocketUrl);
				searchSocket.searchInfo = searchInfo;
				searchSocket.onopen = function(event)
				{
					openSockets++;
					document.getElementById('socket-count').value = openSockets + '/' + providedSearches.length;
				};
				searchSocket.onerror = function(event)
				{
					var errorMsg = this.searchpart + ' has experienced an error.';
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
		dView(result, searchInfo, display);
	}
} 

function ItemMod(modName, modTier, modRangeString)
{
	this.modName = modName;
	this.modTier = modTier;
	this.modRangeString = modRangeString;
	this.affixType = '';
	if(modTier != null)
	{
		if(modTier.startsWith('P'))
		{
			this.affixType ='prefix';
		}
		else if(modTier.startsWith('S'))
		{
			this.affixType ='suffix';
		}
		else if(modTier.startsWith('R'))
		{
			this.affixType ='crafted';
		}
	}
}

function CompositeMod(modType, displayText)
{
	this.modType = modType;
	this.displayText = displayText;
	this.compositeModKey = '';
	this.mods = [];
}

function getMods(item, modType)
{
	var veiledHashes = [];
	var fullMods = [];
	if(item[modType + 'Mods'])
	{
		var basicModText = item[modType + 'Mods'];
		if(basicModText != null && basicModText.length && basicModText.length > 0)
		{
			var hashToMod = [];
			for(var i = 0; i < basicModText.length; i++)
			{
				var displayText = basicModText[i];
				fullMods.push(new CompositeMod(modType,displayText));
			}
			if(item.extended)
			{
				if(item.extended.hashes)
				{
					var hashes = item.extended.hashes;
					if(hashes[modType])
					{
						for(var i = 0; i < hashes[modType].length; i++)
						{		
							fullMods[i].compositeModKey = hashes[modType][i][0];
							hashToMod[fullMods[i].compositeModKey] = fullMods[i];
						}
					}
				}
				if(item.extended.mods)
				{
					if(item.extended.mods[modType])
					{
						var moreModInfoListing = item.extended.mods[modType];
						if(moreModInfoListing != null && moreModInfoListing.length > 0)
						{
							for(var i = 0; i < moreModInfoListing.length; i++)
							{		
								var moreModInfo = moreModInfoListing[i];
								var modName = moreModInfo.name;
								var modTier = moreModInfo.tier;
								
								if(moreModInfo.magnitudes)
								{
									var modMagnitudes = moreModInfo.magnitudes;
									if(modMagnitudes != null && modMagnitudes.length > 0)
									{
										var keyToCompositeMods = [];
										for(var v = 0; v < modMagnitudes.length; v++)
										{	
											var modHashKey = modMagnitudes[v].hash;
											var modMin = modMagnitudes[v].min;
											var modMax = modMagnitudes[v].max;
											var modRange = '';
											if(modMin != modMax)
											{
												modRange = '('+ modMin + '-' + modMax + ')';
												
											}

											if(modMin != 0 || modMax != 0)
											{
												var itemMod = keyToCompositeMods[modHashKey];
												
												if(itemMod == null)
												{
													var itemMod = new ItemMod(modName, modTier, modRange);
													try
													{
														hashToMod[modHashKey].mods.push(itemMod);
													}
													catch(err)
													{
														console.log(err);
													}
													keyToCompositeMods[modHashKey] = itemMod;
												}
												else
												{
													if(modRange != '')
													{
														itemMod.modRangeString += ' - ' + modRange;
													}
												}	
											}										
										}
									}
									else if (modType == "veiled")
									{
										var modHashKey = veiledHashes[i]
										var modRange = '';
										var itemMod = new ItemMod(modName, modTier, modRange);
										hashToMod[modHashKey].mods.push(itemMod);
								}
								}
							}
						}
					}
				}
			}
		}			
	}
	return fullMods;
}

function buildCopyButton(buttonText, textToCopy)
{

	var inputElement = document.createElement('input');
	inputElement.type = "button"
	inputElement.className = "button"
	inputElement.value = buttonText;
	inputElement.addEventListener('click', function(event){
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
