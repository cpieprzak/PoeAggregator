function WatchedItemManager()
{
	this.items = [];
	this.input = document.getElementById('watched-items');
	this.view = document.getElementById('watched-display-window');

	this.initialize = function()
	{
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
}