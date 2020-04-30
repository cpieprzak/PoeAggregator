function RequestManager()
{
	this.itemRequests = [];
	this.queueBox = document.getElementById('queue-count');
	this.addRequest = function(newRequest)
	{	
		var listings = newRequest.listings;
		if(listings != null && listings.length > 0)
		{
			var filteredListing = [];
			
			for(var i = 0; i < listings.length; i++)
			{
				var listing = newRequest.listings[i];
				if(!filteredListing.includes(listing))
				{
					filteredListing.push(listing);
				}
				if(filteredListing.length == 10)
				{
					var tmpRequest = newRequest.clone();
					tmpRequest.listings = filteredListing;
					this.itemRequests.push(tmpRequest);		
					filteredListing = [];
				}
			}
			
			if(filteredListing.length > 0)
			{
				var tmpRequest = newRequest.clone();
				tmpRequest.listings = filteredListing;			
				this.itemRequests.push(tmpRequest);
			}			

			this.queueBox.value = requestManager.itemRequests.length;
		}		
	}
	this.getNextItem = function()
	{
		if(this.itemRequests.length > 0 && ItemFetchManager.canFetch())
		{
			var itemRequest = this.itemRequests.shift();
			this.queueBox.value = this.itemRequests.length;	
			var listings = itemRequest.listings;
			
			var foundItem = false;
			for(var i = 0; i < listings.length; i++)
			{
				var listing = listings[i];
				if(listing != null && listing.length > 0)
				{
					foundItem = true;
					break;
				}
			}
			
			if(foundItem)
			{
				this.processItem(itemRequest);	
			}
		}
	};
	this.processItem = function (itemRequest)
	{
		ItemFetchManager.fetch(itemRequest);
	};
}