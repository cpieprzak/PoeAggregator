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
	var searchFilter = document.getElementById('search-filter');
	searchFilter.onkeyup = filterSearches;
	searchFilter.onblur = filterSearches;
	searchFilter.onclick = clearSearchFilter;
	loadCurrency();
	clientLogPathInput.onchange = updateClientLogPath;
	updateClientLogPath();
}

callAjax('https://api.pathofexile.com/leagues', init);