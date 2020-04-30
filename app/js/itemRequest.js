function ItemRequest(searchInfo, listings)
{	
	this.listings = listings;
	this.searchInfo = searchInfo;
	this.url = searchInfo.searchUrlPart;
	this.callback = null;
	this.clone = function()
	{
		var clone = new ItemRequest(this.searchInfo, this.listings);
		clone.callback = this.callback;
		return clone;
	}
}