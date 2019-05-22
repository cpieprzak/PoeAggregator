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
	this.active = '1';
	this.searchUrlPart = '';
	this.searchComment = '';
	this.soundId = '';
	this.soundVolume = 0.25;
	this.color = '#1c1e23';
	
	if(listingString != null)
	{
		var variables = [ null, 'active', 'searchUrlPart', 'searchComment', 'soundId', 'soundVolume', 'color', 'grouping'];
		var searchParts = listingString.trim().split('[');
		for (var i = 0; i < searchParts.length; i++)
		{
			var searchPart = searchParts[i].replace('[','').replace(']','').trim();
			if(searchPart != null)
			{	
				if(variables[i] != null)
				{
					this[variables[i]] = searchPart;
				}
			}		
		}
	}
	this.cloneNode = function()
	{
		var clonedNode = new SearchListing();
		clonedNode.active = this.active;
		clonedNode.searchUrlPart = this.searchUrlPart;
		clonedNode.searchComment = this.searchComment;
		clonedNode.soundId = this.soundId;
		clonedNode.soundVolume = this.soundVolume;
		clonedNode.color = this.color;
		
		return clonedNode;
	}
}

var searchFilter = document.getElementById('search-filter');
function clearSearchFilter()
{
	searchFilter.value =  '';
	var searchTable = document.getElementById('all-searches-table');
	var searchRows = searchTable.querySelectorAll('.search-row');
	for(var i = 0; i < searchRows.length; i++)
	{
		var row = searchRows[i];
		row.classList.remove('hidden');
	}
}

function filterSearches()
{
	var searchTable = document.getElementById('all-searches-table');
	var searchRows = searchTable.querySelectorAll('.search-row');
	var filterText = searchFilter.value.toLowerCase();
	for(var i = 0; i < searchRows.length; i++)
	{
		var row = searchRows[i];
		var commentInput = row.querySelector('.search-comment');
		var commentText = commentInput.value.toLowerCase();
		if (commentText.indexOf(filterText) > -1)
		{
			row.classList.remove('hidden');
		}
		else
		{
			row.classList.add('hidden');
		}
	}
};

function sortActiveSearches()
{
	var searchTable = document.getElementById('all-searches-table');
	var actives = [];
	var inactives = [];
	var searchRows = searchTable.querySelectorAll('.search-row');
	for(var i = 0; i < searchRows.length; i++)
	{
		var row = searchRows[i];
		var activeInput = row.querySelector('.search-active');
		if (activeInput.checked)
		{
			actives.push(row);
		}
		else
		{
			inactives.push(row);
		}
	}
	for(var i = 0; i < actives.length; i++)
	{
		searchTable.append(actives[i]);
	}
	for(var i = 0; i < inactives.length; i++)
	{
		searchTable.append(inactives[i]);
	}
}

function addNewSearchRow()
{
	var searchesTable =  document.getElementById('all-searches-table');
	var newRow = document.getElementById('new-search-row');
	var searchRow = newRow.cloneNode(true);
	searchRow.id = '';
	if(searchRow.querySelector('.search-url').value.trim() != '')
	{
		var addNewButton = searchRow.querySelector('.add-new-button');
		replaceWithRemoveButton(addNewButton, searchRow);	
		
		var soundVolume = searchRow.querySelector('.search-control.search-volume');
		if(soundVolume.value != '')
		{
			if(soundVolume.value > 1)
			{
				soundVolume.value = 1;
			}
			else if(soundVolume.value < 0.1)
			{
				soundVolume.value = 0.1;
			}
		}
		
		makeDraggable(searchRow,'search-row');
		searchesTable.append(searchRow);
	}
	else
	{
		alert('A Url is required for a search entry');
	}
}

function testSound(element)
{
	var parent = element.parentNode;
	while(!parent.classList.contains('search-row'))
	{
		parent = parent.parentNode;
	}
	var soundSelect = parent.querySelector('.search-sounds');
	var soundVolume = parent.querySelector('.search-volume');
	playSound(soundSelect.value, soundVolume.value);
}

function openTradeWebsite(element)
{
	var parent = element.parentNode;
	while(!parent.classList.contains('search-row'))
	{
		parent = parent.parentNode;
	}
	var urlBox = parent.querySelector('.search-url');
	if(urlBox.value != null && urlBox.value.trim().length > 0)
	{
		var league = document.getElementById('league').value;
		var url = 'https://www.pathofexile.com/trade/search/' + league + '/' + urlBox.value;
		
		window.open(url, '_blank');
	}	
}

function openSearchesModal()
{
	var searchId = 'search-string-builder';
	var searchBuilder = document.getElementById(searchId);
	searchBuilder.classList.remove('hidden');
	
	var searchString = document.getElementById('searches').value;
	var manager = new ListingManager(searchString);
	var allSearchesTable = document.getElementById('all-searches-table');
	var oldRows = allSearchesTable.querySelectorAll('.search-row');
	for(var i = 0; i < oldRows.length; i++)
	{
		allSearchesTable.removeChild(oldRows[i]);
	}
	
	var searches = manager.searches;
	for(var i = 0; i < searches.length; i++)
	{
		var search = searches[i];
		var searchesTable =  document.getElementById('all-searches-table');
		var newRow = document.getElementById('new-search-row');
		var searchRow = newRow.cloneNode(true);
		searchRow.id = '';
		var activeBox = searchRow.querySelector('.search-active');
		activeBox.checked = true;
		if(search.active != 1)
		{
			activeBox.checked = false;
		}		

		var urlBox = searchRow.querySelector('.search-url');
		urlBox.value = search.searchUrlPart;

		var commentBox = searchRow.querySelector('.search-comment');
		commentBox.value = search.searchComment;

		var soundSelect = searchRow.querySelector('.search-sounds');
		soundSelect.value = search.soundId;

		var soundVolumeBox = searchRow.querySelector('.search-volume');
		soundVolumeBox.value = search.soundVolume;

		var colorBox = searchRow.querySelector('.search-color');
		colorBox.value = search.color;

		var addNewButton = searchRow.querySelector('.add-new-button');
		replaceWithRemoveButton(addNewButton, searchRow);	
		makeDraggable(searchRow,'search-row');

		searchesTable.append(searchRow);
	}
}

function replaceWithRemoveButton(newButton, row)
{
	var parent = newButton.parentNode;
	var removeButton = document.createElement('div');
	removeButton.classList.add('button');
	removeButton.append(document.createTextNode('Remove'));
	removeButton.removeTarget = row;
	removeButton.onclick = function()
	{
		this.removeTarget.parentElement.removeChild(this.removeTarget);
	}
	parent.insertBefore(removeButton, newButton);
	parent.removeChild(newButton);
}

function copySearchString()
{
	var text = generateSearchString();
	copyTextToClipboard(text);
}

function saveSearchString()
{
	var searchInput = document.getElementById('searches');
	searchInput.value = generateSearchString();
	saveLocalData('search-wrapper');
	showHide('search-string-builder');
}

function generateSearchString()
{
	var searchString = '';
	var searchesTable =  document.getElementById('all-searches-table');
	var searchRows = searchesTable.querySelectorAll('.search-row');
	var isFirstRow = true;
	for(var i = 0; i < searchRows.length; i++)
	{
		var searchRow = searchRows[i];
		if(!searchRow.classList.contains('search-header-row'))
		{
			if(isFirstRow)
			{
				isFirstRow = false;
			}
			else
			{
				searchString += ',\n';
			}
			var inputs = searchRow.querySelectorAll('.search-control');
			var rowString = '';
			for(var j = 0; j < inputs.length; j++)
			{
				rowString += '[';
				if(inputs[j].type =='checkbox')
				{
					if(inputs[j].checked)
					{
						rowString += '1';
					}
					else
					{
						rowString += '0';
					}
				}
				else
				{
					if(inputs[j].classList.contains('search-volume'))
					{
						if(inputs[j].value != '')
						{
							if(inputs[j].value > 1)
							{
								inputs[j].value = 1;
							}
							else if(inputs[j].value < 0.1)
							{
								inputs[j].value = 0.1;
							}
						}
					}
					rowString += inputs[j].value;
				}
				rowString += ']';
			}
			searchString += rowString;
		}
	}
	return searchString;
}