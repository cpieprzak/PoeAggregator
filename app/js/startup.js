var watchedItemManager = new WatchedItemManager();
var requestManager = new RequestManager();
loadLocalData();
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
}



callAjax('https://api.pathofexile.com/leagues', init);
watchedItemManager.initialize();