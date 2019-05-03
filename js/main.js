var lastItem = null;
var sockets = [];
var openSockets = 0;
var socketsToOpen = 0;
var maxItemsDisplayed = 300;
var allDisplayedItems = [];
var hasActiveSockets = false;

var currencyImages = [];
currencyImages['alt'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollMagic.png?v=6d9520174f6643e502da336e76b730d3';
currencyImages['fuse'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollSocketLinks.png?v=0ad7134a62e5c45e4f8bc8a44b95540f';
currencyImages['alch'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyUpgradeToRare.png?v=89c110be97333995522c7b2c29cae728';
currencyImages['chaos'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollRare.png?v=c60aa876dd6bab31174df91b1da1b4f9';
currencyImages['gcp'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyGemQuality.png?v=f11792b6dbd2f5f869351151bc3a4539';
currencyImages['exa'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyAddModToRare.png?v=1745ebafbd533b6f91bccf588ab5efc5';
currencyImages['chrom'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollSocketColours.png?v=9d377f2cf04a16a39aac7b14abc9d7c3';
currencyImages['jew'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyRerollSocketNumbers.png?v=2946b0825af70f796b8f15051d75164d';
currencyImages['engineers-orb'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/EngineersOrb.png?v=4b291fd7d6b9022a2d35b34c43c08e87';
currencyImages['chance'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyUpgradeRandomly.png?v=e4049939b9cd61291562f94364ee0f00';
currencyImages['chisel'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyMapQuality.png?v=f46e0a1af7223e2d4cae52bc3f9f7a1f';
currencyImages['scour'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyConvertToNormal.png?v=15e3ef97f04a39ae284359309697ef7d';
currencyImages['blessed'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyImplicitMod.png?v=472eeef04846d8a25d65b3d4f9ceecc8';
currencyImages['regret'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyPassiveSkillRefund.png?v=1de687952ce56385b74ac450f97fcc33';
currencyImages['regal'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyUpgradeMagicToRare.png?v=1187a8511b47b35815bd75698de1fa2a';
currencyImages['divine'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyModValues.png?v=0ad99d4a2b0356a60fa8194910d80f6b';
currencyImages['vaal'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyVaal.png?v=64114709d67069cd665f8f1a918cd12a';
currencyImages['orb-of-annulment'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/AnnullOrb.png?v=f9a0f8b21515c8abf517e9648cfc7455';
currencyImages['orb-of-binding'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/BindingOrb.png?v=6ee0528156592a01c2931262d024f842';
currencyImages['ancient-orb'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/AncientOrb.png?v=3edb14b53b9b05e176124814aba86f94';
currencyImages['orb-of-horizons'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/HorizonOrb.png?v=f3b3343dc61c60e667003bbdbbdb2374';
currencyImages['harbingers-orb'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/HarbingerOrb.png?v=a61bf3add692a2fe74bb5f39213f4d93';
currencyImages['wis'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyIdentification.png?v=1b9b38c45be95c59d8900f91b2afd58b';
currencyImages['port'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyPortal.png?v=728696ea10d4fb1e789039debc5d8c3c';
currencyImages['scr'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyArmourQuality.png?v=251e204e4ec325f75ce8ef75b2dfbeb8';
currencyImages['whe'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyWeaponQuality.png?v=d2ce9167e23a74cef5d8465433e86482';
currencyImages['ba'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyFlaskQuality.png?v=ca8bd0dd43d2adf8b021578a398eb9de';
currencyImages['tra'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyUpgradeToMagic.png?v=333b8b5e28b73c62972fc66e7634c5c8';
currencyImages['aug'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyAddModToMagic.png?v=97e63b85807f2419f4208482fd0b4859';
currencyImages['mir'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyDuplicate.png?v=6fd68c1a5c4292c05b97770e83aa22bc';
currencyImages['ete'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyImprintOrb.png?v=0483ded9ac1f08c320fc21d5ddc208c0';
currencyImages['p'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/CurrencyCoin.png?v=b971d7d9ea1ad32f16cce8ee99c897cf';
currencyImages['silver'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/SilverObol.png?v=93c1b204ec2736a2fe5aabbb99510bcf';
currencyImages['annulment-shard'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/AnnullShard.png?v=502496c41d3da750bcecbb194d0aa3f4';
currencyImages['mirror-shard'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/MirrorShard.png?v=b5b677eece4ae7e8450452e3944f121d';
currencyImages['exalted-shard'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/ExaltedShard.png?v=4945fe24b79868be79870f8ad01f20b0';
currencyImages['binding-shard'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/BindingShard.png?v=b00f27dee8ad94d7f187133a09b872f9';
currencyImages['horizon-shard'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/HorizonShard.png?v=6d0e5b4c1bbaeb06c8cd10c269ad8121';
currencyImages['harbingers-shard'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/HarbingerShard.png?v=2274561da4960ca41bb6742952edc74d';
currencyImages['engineers-shard'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/EngineersShard.png?v=8b69b76b1f42120f72cf7febb76b6a7a';
currencyImages['ancient-shard'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/AncientShard.png?v=e1eb08f64822576bd6d47029cd72d1a9';
currencyImages['chaos-shard'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/ChaosShard.png?v=c206269aeda3a6a7b5a8ac110045afca';
currencyImages['regal-shard'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/RegalShard.png?v=e10a1590d421e4305d8a19ff8c4d9948';
currencyImages['apprentice-sextant'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/AtlasRadiusWhite.png?v=f6512c12b7ee4fc9d4fbaf51d43b31f6';
currencyImages['journeyman-sextant'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/AtlasRadiusYellow.png?v=924e154198125996497d01d1effb28a7';
currencyImages['master-sextant'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/AtlasRadiusRed.png?v=ebadcbe85c704dba334a65389fc31d2a';
currencyImages['blessing-xoph'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/Breach/BreachUpgraderFire.png?v=6c7efd3a8fc9150d4b293d5a5917fd04';
currencyImages['blessing-tul'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/Breach/BreachUpgraderCold.png?v=c25b6df9be1fd051d99616e4bb78066e';
currencyImages['blessing-esh'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/Breach/BreachUpgraderLightning.png?v=ed7bb0e73f5ca907ef62592e48d442dc';
currencyImages['blessing-uul-netol'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/Breach/BreachUpgraderPhysical.png?v=cf3d245db6b6bb796112a952d74543e0';
currencyImages['blessing-chayula'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/Breach/BreachUpgraderChaos.png?v=841360bbd5f81619761a0d16f8c36793';
currencyImages['splinter-xoph'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/Breach/BreachShardFire.png?v=4635e0847323cf1d62c8b4e8101351bf';
currencyImages['splinter-tul'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/Breach/BreachShardCold.png?v=4a7652d6ff5de2493d37768e993c9411';
currencyImages['splinter-esh'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/Breach/BreachShardLightning.png?v=11cd23560f7aa0dda27cc323fa97cb96';
currencyImages['splinter-uul'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/Breach/BreachShardPhysical.png?v=25f31f4a5e1ba4540cb7bfa03b82c1e8';
currencyImages['splinter-chayula'] = 'https://web.poecdn.com/image/Art/2DItems/Currency/Breach/BreachShardChaos.png?v=2c18cbe5384375bbe4643cd8b83ea32d';

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

var filterBox = document.getElementById('filter-box');
filterBox.onkeyup = function()
{
	var filterText = this.value.toLowerCase().trim();
	for(var i = 0; i < allDisplayedItems.length; i++)
	{
		var item = allDisplayedItems[i];
		if(item.allText)
		{
			var itemText = item.allText;
			if(itemText.indexOf(filterText) > -1)
			{
				item.classList.remove('hidden');
			}
			else
			{
				item.classList.add('hidden');
			}			
		}
	}
};
