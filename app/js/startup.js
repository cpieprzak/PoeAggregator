var watchedItemManager = null;
var requestManager = new RequestManager();
var init = function(data, parameters)
{
	try
	{
		loadLeagues(data, parameters);
	}
	catch(e)
	{
		console.log(e);
	}
	loadLocalData();
	watchedItemManager = new WatchedItemManager();
	watchedItemManager.initialize();
	updateQueue();
}

callAjax('https://api.pathofexile.com/leagues', init);