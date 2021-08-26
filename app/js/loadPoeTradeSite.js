var initialized = false;
function loadPoeWebsite()
{	
	var url = !initialized ? 'https://www.pathofexile.com/trade/search' : null;
	initialized = true;
	loadOfficialTradeWebsite(url);
	
}

function loadOfficialTradeWebsite(url)
{
	var id = 'poe-search-window';
	hide('trade-url-overlay');
	var views = document.querySelectorAll('.view-tab');
	for (var i = 0; i < views.length; i++)
	{
		var view = views[i];
		view.classList.add('hidden');
		if(view.id && view.id == id)
		{
			view.classList.remove('hidden');
			currentWindow = view;
		}
	}
	var poetrade = document.getElementById('poe-webview');
	var sessionId = document.getElementById('poesessionid').value;
	if(sessionId != null && url)
	{
		var options = {
			extraHeaders : 'cookie: POESESSID=' + sessionId
		};
		poetrade.loadURL(url,options);
	}
}

function displayTradeUrlPart(urlPart)
{
	var display = document.getElementById('trade-url-part');
	display.innerHTML = urlPart;
	show('save-trade-button');
	show('trade-url-overlay');
}

function show(id)
{
	var element = document.getElementById(id);
	element.classList.remove('hidden');	
}

function hide(id)
{
	var element = document.getElementById(id);
	element.classList.add('hidden');
}

function saveTrade()
{
	var newSearchRow = document.getElementById('new-search-row');

	var searchControls = newSearchRow.querySelectorAll('.search-control');
	for(var i = 0; i < searchControls.length; i++)
	{
		var searchControl = searchControls[i];
		if(searchControl.getAttribute('type') == 'text')
		{
			searchControl.value = '';
			if(searchControl.classList.contains('search-url'))
			{
				searchControl.value = document.getElementById('trade-url-part').innerHTML;
			}
		}
	}
	openSearchesModal();
}