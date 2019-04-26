function ListingManager(listingString)
{
	this.searches = [];
	if(listingString != null && listingString.length > 0)
	{
		var listedSearches = listingString.split(',');
		for (var i = 0; i < listedSearches.length; i++)
		{
			var newListing = new SearchListing(listedSearches[i]);
			this.searches.push(newListing);
		}
	}
}

function SearchListing(listingString)
{
	this.searchUrlPart = '';
	this.searchComment = '';
	this.soundId = '';
	this.soundVolume = 0.25;
	

	var searchParts = listingString.split('[');
	for (var i = 0; i < searchParts.length; i++)
	{
		var searchPart = searchParts[i].replace('[','').replace(']','');
		if(i == 0)
		{
			this.searchUrlPart = searchPart;
		}
		else if(i == 1)
		{
			this.searchComment = searchPart;
		}
		else if(i == 2)
		{
			this.soundId = searchPart;
		}
		else if(i == 3)
		{
			if(searchPart != null)
			{
				this.soundVolume = searchPart;
			}
		}
	}
}
