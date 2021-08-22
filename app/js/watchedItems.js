function WatchedItemManager()
{
	this.initialized = false;
	this.items = [];
	this.input = document.getElementById('watched-items');
	this.view = document.getElementById('watched-display-window');
	this.interval = 20 * 1000;
	this.getSoundId = function(){return '10';};
	this.getSoundVolume = function(){return 75};

	this.initialize = function()
	{
		if(!this.initialized)
		{
			this.initialized = true;
			var loadedItems = this.input.value.split(',');
			var listings = [];
			for(var i = 0; i < loadedItems.length; i++)
			{
				var itemId = loadedItems[i];
				if(itemId != null && itemId.length > 0)
				{
					this.items.push(itemId);
					listings.push(itemId);
				}
			}
			if(listings.length > 0)
			{
				var searchinfo = new SearchListing();
				searchinfo.viewId = 'watched-display-window';
			    requestManager.addRequest(new ItemRequest(searchinfo,listings));
			}
			var checkItems = function()
			{
				watchedItemManager.refreshItems();
			}
			setInterval(checkItems, this.interval);
		}
	}
	this.addItem = function(itemId)
	{
		var foundItem = false;
		for(var i = 0; i < this.items.length; i++)
		{
			if(this.items[i] == itemId)
			{
				foundItem = true;
				break;
			}
		}
		if(!foundItem)
		{
			this.items.push(itemId);
			this.saveList();
			var listings = [];
			listings.push(itemId);
			var searchinfo = new SearchListing();
			searchinfo.viewId = 'watched-display-window';
		    requestManager.addRequest(new ItemRequest(searchinfo,listings));
		}
	};
	this.removeItem = function(itemId)
	{
		var foundItem = false;
		for(var i = 0; i < this.items.length; i++)
		{
			if(this.items[i] == itemId)
			{
				foundItem = true;
				break;
			}
		}
		if(foundItem)
		{
			for(var i = this.items.length - 1; i >= 0; i--)
			{
				if (this.items[i] == itemId)
				{
					this.items.splice(i, 1);
				}
			}
			this.saveList();
			var itemClass = 'ggg-id-' + itemId;
			var removeList = this.view.querySelectorAll('.' + itemClass);
			for(var i = 0; i < removeList.length; i++)
			{
				var toRemove = removeList[i];
				var parent = toRemove.parentNode;
				parent.removeChild(toRemove);
			}
		}
	};
	this.removeAll = function()
	{
		var tmp = this.items;
		for(var i = tmp.length - 1; i >= 0; i--)
		{
			try
			{
				this.removeItem(tmp[i]);
			}
			catch(err) 
			{
				console.log(err);
			}
		}
		this.items = [];
		saveLocalData(this.input.id);
	};
	this.saveList = function()
	{
		var value = '';
		for(var i = 0; i < this.items.length; i++)
		{
			if(i != 0)
			{
				value += ',';
			}
			value += this.items[i];
		}
		this.input.value = value;
		saveLocalData(this.input.id);
	}
	this.refreshItems = function()
	{
		var listings = [];
		for(var i = 0; i < this.items.length; i++)
		{
			var itemId = this.items[i];
			listings.push(itemId);
		}
		if(listings.length > 0)
		{
			var searchinfo = new SearchListing();
			searchinfo.viewId = 'watched-display-window';
			var itemRequest = new ItemRequest(searchinfo,listings);
			itemRequest.callback = updateWatched;
		    requestManager.addRequest(itemRequest);
		}
	}
}

function updateWatched(data, searchInfo) 
{
	var json = JSON.parse(data);
	var results = json.result;
	var viewId = searchInfo.viewId;
	for(var i = 0; i < results.length; i++)
	{	
		var result = results[i];
		var newNode = dView(result, searchInfo);
		var oldStats = allTrackedStats[newNode.id];
		allTrackedStats[newNode.id] = newNode.trackedStats;
		if(newNode.trackedStats.alert(oldStats))
		{
			var display = document.getElementById('display-window');
			var soundId = document.getElementById('watched-notification-sound').value;
			var soundVolume = document.getElementById('watched-notification-sound-volume').value;
			playSound(soundId, soundVolume);
			remote.getCurrentWindow().flashFrame(true);
			newNode.classList.add('watched-item');
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
		searchInfo.viewId = 'watched-display-window';
		searchInfo.refreshTarget = document.querySelector('#watched-display-window .ggg-id-' + result.id);
		updateItem(result, searchInfo);
	}
}