var watchedItemManager = null;
var requestManager = null;
var searchConnectionManager = null;

document.addEventListener('poeAggTemplateComplete', () => {
	populateSounds();
	callAjax('https://api.pathofexile.com/leagues', init);
});

var init = function(data, parameters)
{
	try { loadLeagues(data, parameters); }
	catch(e) { console.log(e); }
	loadLocalData();
    document.dispatchEvent(new Event('localDataLoaded'));
	requestManager = new RequestManager()
	watchedItemManager = new WatchedItemManager();
	watchedItemManager.initialize();
	updateQueue();
	var searchFilter = document.getElementById('search-filter');
	searchFilter.onkeyup = filterSearches;
	searchFilter.onblur = filterSearches;
	searchFilter.onclick = clearSearchFilter;
	loadCurrency();
	clientLogPathInput = document.getElementById('client-log-path');
	clientLogPathInput.onchange = updateClientLogPath;
	updateClientLogPath();
	searchConnectionManager = new SearchConnectionManager();
}

