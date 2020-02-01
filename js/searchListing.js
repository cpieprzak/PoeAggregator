function ListingManager(listingString)
{
	this.searches = [];
	if(listingString != null && listingString.length > 0)
	{
		var listedSearches = listingString.split(',');
		for (var i = 0; i < listedSearches.length; i++)
		{
			var search = listedSearches[i];
			search = search.replace('%2C',',');
			var newListing = new SearchListing(search);
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
	this.searchCategory = '';
	this.viewId = 'display-window';
	
	if(listingString != null)
	{
		var variables = [ null, 'active', 'searchUrlPart', 'searchComment', 'soundId', 'soundVolume', 'color', 'searchCategory'];
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
		clonedNode.searchCategory = this.searchCategory;
		clonedNode.viewId = this.viewId;
		
		return clonedNode;
	}
}

var searchFilter = document.getElementById('search-filter');
searchFilter.onkeyup = filterSearches;
searchFilter.onblur = filterSearches;
searchFilter.onclick = clearSearchFilter;
function clearSearchFilter()
{
	if(searchFilter.value == 'Filter Searches')
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
}

function filterSearches(e)
{
	var searchTable = document.getElementById('all-searches-table');
	var searchRows = searchTable.querySelectorAll('.search-row');
	var filterText = searchFilter.value.toLowerCase();
	if(e.key === "Escape")
	{
		searchFilter.value = '';
		filterText = '';
    }
	for(var i = 0; i < searchRows.length; i++)
	{
		var row = searchRows[i];
		var commentInput = row.querySelector('.search-comment');
		var commentText = commentInput.value.toLowerCase();
		var categoryInput = row.querySelector('.search-category');
		var categoryText = categoryInput.value.toLowerCase();
		var shown = false;
		if (commentText.indexOf(filterText) > -1 || categoryText.indexOf(filterText) > -1)
		{
			shown = true;
		}
		
		if(shown)
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
		searchTable.appendChild(actives[i]);
	}
	for(var i = 0; i < inactives.length; i++)
	{
		searchTable.appendChild(inactives[i]);
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
		searchRow.querySelector('.search-category').addEventListener("blur", function(e){remakeCategories();});
		
		searchesTable.appendChild(searchRow);
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

function runActiveSearches()
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
	}
	for(var i = 0; i < actives.length; i++)
	{
		runSearch(actives[i]);
	}
}

function loadSearchItems(element)
{
	var parent = element.parentNode;
	while(!parent.classList.contains('search-row'))
	{
		parent = parent.parentNode;
	}
	runSearch(parent);
}

function runSearch(searchRow)
{
	var urlBox = searchRow.querySelector('.search-url');
	if(urlBox.value != null && urlBox.value.trim().length > 0)
	{
		var search = urlBox.value;
		var sort = new Object();
		sort.price = 'asc';
		var viewId = 'display-window';
		runSortedSearch(search, sort, outputToView);
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
	var searchCategories = [];
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

		var categoryBox = searchRow.querySelector('.search-category');
		var searchCategory = search.searchCategory;
		categoryBox.value = searchCategory;	
		if(searchCategory != null && searchCategory.length > 0 && searchCategories.indexOf(searchCategory) < 0)
		{
			searchCategories.push(search.searchCategory);
		}
		categoryBox.addEventListener("blur", function(e){remakeCategories();});

		var addNewButton = searchRow.querySelector('.add-new-button');
		replaceWithRemoveButton(addNewButton, searchRow);	
		makeDraggable(searchRow,'search-row');

		searchesTable.appendChild(searchRow);
	}

	var searchCategoriesList = document.getElementById('search-categories');
	searchCategoriesList.innerHTML = '';
	searchCategories.sort();
	for(var i = 0; i < searchCategories.length; i++)
	{
		var category = document.createElement('option');
		category.value = searchCategories[i];
		searchCategoriesList.appendChild(category);
	}
}

function replaceWithRemoveButton(newButton, row)
{
	var parent = newButton.parentNode;
	var removeButton = document.createElement('div');
	removeButton.classList.add('button');
	removeButton.appendChild(document.createTextNode('Remove'));
	removeButton.removeTarget = row;
	removeButton.onclick = function()
	{
		this.removeTarget.parentElement.removeChild(this.removeTarget);
	}
	parent.insertBefore(removeButton, newButton);
	parent.removeChild(newButton);
}

var tmpFileLink = document.createElement('a');
function download(filename, content) 
{
	tmpFileLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
	tmpFileLink.setAttribute('download', filename);
	tmpFileLink.click();
}

function exportSearches()
{
	var searches = generateSearchString();
	var filename = prompt("Please enter a File Name:", 'poe-searches.txt');
	if(filename === null || filename.trim().lenth < 1)
	{
		return;
	}
	download(filename,searches);
}

function saveSearchString()
{
	var searchInput = document.getElementById('searches');
	searchInput.value = generateSearchString();
	saveLocalData('search-wrapper');
	showHide('search-string-builder');
}

function activateSearches()
{
	var searchesTable =  document.getElementById('all-searches-table');
	var searchRows = searchesTable.querySelectorAll('.search-row');
	for(var i = 0; i < searchRows.length; i++)
	{
		var searchRow = searchRows[i];
		if(!searchRow.classList.contains('hidden'))
		{
			var activeBox = searchRow.querySelector('.search-active');
			activeBox.checked = true;	
		}
		
	}
}

function deactivateSearches()
{
	var searchesTable =  document.getElementById('all-searches-table');
	var searchRows = searchesTable.querySelectorAll('.search-row');
	for(var i = 0; i < searchRows.length; i++)
	{
		var searchRow = searchRows[i];
		if(!searchRow.classList.contains('hidden'))
		{
			var activeBox = searchRow.querySelector('.search-active');
			activeBox.checked = false;	
		}
		
	}
}

function sortSearchesByCategory()
{
	var searchesTable =  document.getElementById('all-searches-table');
	var searchRows = searchesTable.querySelectorAll('.search-row');
	var categories = [];
	for(var i = 0; i < searchRows.length; i++)
	{
		var searchRow = searchRows[i];
		var categoryBox = searchRow.querySelector('.search-category');
		var categoryName = categoryBox.value;
		if(categories[categoryName] == null)
		{
			categories[categoryName] = [];
		}	
		categories[categoryName].push(searchRow);
	}
	var categoryNames = Object.keys(categories);
	if(categoryNames != null)
	{
		categoryNames = categoryNames.sort(function(a, b) 
		{
		    if(a === "" || a === null) return 1;
		    if(b === "" || b === null) return -1;
		    if(a === b) return 0;
		    return a < b ? -1 : 1;
		});
	}
	for(var i = 0; i < categoryNames.length; i++)
	{
		var categoryName = categoryNames[i];
		var orderedRows = categories[categoryName];
		for(var j = 0; j < orderedRows.length; j++)
		{
			var orderedRow = orderedRows[j];
			searchesTable.appendChild(orderedRow);
		}
	}
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
				var rowInput = inputs[j];
				rowString += translateInput(rowInput);
			}
			searchString += rowString;
		}
	}
	return searchString;
}

function translateInput(rowInput)
{
	var translated = '[';
	var inputValue = rowInput.value;

	inputValue = inputValue.replace('[','');
	inputValue = inputValue.replace(']','');
	inputValue = inputValue.replace(',','%2C');
	
	if(rowInput.type =='checkbox')
	{
		if(rowInput.checked)
		{
			translated += '1';
		}
		else
		{
			translated += '0';
		}
	}
	else
	{
		if(rowInput.classList.contains('search-volume'))
		{
			if(inputValue != '')
			{
				if(inputValue > 1)
				{
					inputValue = 1;
				}
				else if(inputValue < 0.1)
				{
					inputValue = 0.1;
				}
			}
		}
		translated += inputValue;
	}
	translated += ']';
	
	return translated;
}

function remakeCategories()
{
	var searchesTable =  document.getElementById('all-searches-table');
	var searchRows = searchesTable.querySelectorAll('.search-row');
	var searchCategories = [];
	for(var i = 0; i < searchRows.length; i++)
	{
		var searchRow = searchRows[i];
		var categoryBox = searchRow.querySelector('.search-category');
		var searchCategory = categoryBox.value;	
		if(searchCategory != null && searchCategory.length > 0 && searchCategories.indexOf(searchCategory) < 0)
		{
			searchCategories.push(searchCategory);
		}
	}

	var searchCategoriesList = document.getElementById('search-categories');
	searchCategoriesList.innerHTML = '';
	searchCategories.sort();
	for(var i = 0; i < searchCategories.length; i++)
	{
		var category = document.createElement('option');
		category.value = searchCategories[i];
		searchCategoriesList.appendChild(category);
	}
}

var loadFileInput = document.getElementById('load-searches');

loadFileInput.addEventListener('change', function () 
{
	var searchString = document.getElementById('searches');
	searchString.value = '';
	if (this.files && this.files[0]) 
	{
		var searchFile = this.files[0];
		var reader = new FileReader();
    
		reader.addEventListener('load', function(e) 
		{
			searchString.value += e.target.result;
		});
		
		reader.addEventListener('loadend', function(e) 
		{
			this.loadFileInput = null;
			openSearchesModal();
		});
		
		reader.readAsText(searchFile);
	}   
});