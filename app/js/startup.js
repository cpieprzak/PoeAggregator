var watchedItemManager = new WatchedItemManager();
var requestManager = new RequestManager();
var init = function(data, parameters)
{
	loadLocalData();
	try
	{
		loadLeagues(data, parameters);
	}
	catch(e)
	{
		console.log(e);
	}
	updateQueue();
}

callAjax('https://api.pathofexile.com/leagues', init);
watchedItemManager.initialize();