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
		var variables = [ null, 'active', 'searchUrlPart', 'searchComment', 'soundId', 'soundVolume',	'color'];
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

var searchBox = document.getElementById('searches');
var searchStringBuilder = new SearchStringBuilder(searchBox);

function SearchStringBuilder(searchBox)
{
	this.searchBox = searchBox;
	this.bodyContent = document.createElement('div');
	this.bodyContent.id = 'search-body-content';
	this.generateSearchString = function()
	{
		var searchString = '';
		var searchRows = this.bodyContent.querySelectorAll('.search-row');
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
	this.buildInterface = function()
	{
		var ssb = document.getElementById('search-string-builder');
		if(ssb == null)
		{
			ssb = document.createElement('div');
			ssb.id = 'search-string-builder';
			var ssbBackground = document.createElement('div');
			ssbBackground.ssb = ssb;
			ssbBackground.classList.add('modal-background');
			ssbBackground.onclick = function closeSsb(event)
			{
				ssb.classList.add('hidden');	
			} 
			ssb.append(ssbBackground);
			
			var filterPanel = document.createElement('div');
			filterPanel.classList.add('filter-panel');
			var filterInput = document.createElement('input');
			filterInput.type = 'text';
			filterInput.value = 'Filter By Comment';
			filterInput.onclick = function()
			{
				this.value =  '';
			}
			filterInput.onkeyup = function()
			{
				var searchTable = document.getElementById('all-searches-table');
				var searchRows = searchTable.querySelectorAll('.search-row');
				for(var i = 0; i < searchRows.length; i++)
				{
					var filterText = this.value.toLowerCase();
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
			filterPanel.append(filterInput);
			var ssbContent = document.createElement('div');
			ssbContent.classList.add('modal-content-box');
			var ssbHeader = document.createElement('div');
			ssbHeader.classList.add('modal-header');
			ssbHeader.append(document.createTextNode('Modify Searches'));
			ssbHeader.append(filterPanel);
			ssbContent.append(ssbHeader);
			this.reloadContent();
			ssbContent.append(this.bodyContent);

			var newtable = document.createElement('table');
			newtable.classList.add('add-new-search');
			newtable.classList.add('us-table');

			var headerRow = document.createElement('div');
			headerRow.classList.add('search-header-row');
			headerRow.classList.add('us-table-row');
			var headerText = ['Active', 'Url', 'Comment', 'Sound', 'Volume', 'Color', ''];
			for (var i = 0; i < headerText.length; i++)
			{
				var cell = document.createElement('div');
				cell.classList.add('us-table-cell');
				cell.append(document.createTextNode(headerText[i]));
				headerRow.append(cell);
			}
			newtable.append(headerRow);
			var newRow = document.createElement('div');
			newRow.classList.add('us-table-row');
			newRow.classList.add('search-row');
			
			var newCell = null;

			var activeCheckBox = document.createElement('input');
			activeCheckBox.classList.add('search-control');
			activeCheckBox.type = 'checkbox';
			activeCheckBox.value = 1;
			activeCheckBox.checked = true;
			activeCheckBox.classList.add('search-active');
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(activeCheckBox);
			newRow.append(newCell);
			
			var urlPanel = document.createElement('div');
			urlPanel.classList.add('us-table');
			var urlRow = document.createElement('div');
			urlRow.classList.add('us-table-row');
			urlPanel.append(urlRow);
			var urlCell = document.createElement('div');
			urlCell.classList.add('us-table-cell');
			urlRow.append(urlCell);
			
			var newUrl = document.createElement('input');
			newUrl.classList.add('search-control');
			newUrl.type = 'text';
			newUrl.value = '';
			newUrl.classList.add('search-url');
			urlCell.append(newUrl);
			
			var goButton = document.createElement('span');
			goButton.append(document.createTextNode('Go'));
			goButton.classList.add('button');
			goButton.urlBox = newUrl;
			goButton.onclick = function()
			{
				if(this.urlBox.value != null && this.urlBox.value.trim().length > 0)
				{
					var league = document.getElementById('league').value;
					var url = 'https://www.pathofexile.com/trade/search/' + league + '/' + this.urlBox.value;
					
					window.open(url, '_blank');
				}
			};

			urlCell = document.createElement('div');
			urlCell.classList.add('us-table-cell');
			urlCell.append(goButton);
			urlRow.append(urlCell);

			newRow.append(urlPanel);
			
			var comment = document.createElement('input');
			comment.classList.add('search-control');
			comment.type = 'text';
			comment.value = '';
			comment.classList.add('search-comment');
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(comment);
			newRow.append(newCell);
			
			var soundPanel = document.createElement('div');
			soundPanel.classList.add('us-table');
			var soundRow = document.createElement('div');
			soundRow.classList.add('us-table-row');
			soundPanel.append(soundRow);
			var soundCell = document.createElement('div');
			soundCell.classList.add('us-table-cell');
			soundRow.append(soundCell);
			
			
			var soundId = document.getElementById('notification-sound').cloneNode(true);
			soundId.classList.add('search-control');
			soundId.id = '';
			soundId.value = '';
			soundId.classList.add('search-sound-id');
			soundCell.append(soundId);
			
			var soundVolume = document.createElement('input');
			var testSoundButton = document.createElement('div');
			testSoundButton.classList.add('button');
			testSoundButton.classList.add('test-sound-button');
			testSoundButton.append(document.createTextNode('?'));
			testSoundButton.title = 'Test Sound';
			testSoundButton.soundId = soundId;
			testSoundButton.soundVolume = soundVolume;
			testSoundButton.onclick = function()
			{
				playSound(this.soundId.value, this.soundVolume.value);
			};

			var soundCell = document.createElement('div');
			soundCell.classList.add('us-table-cell');
			soundCell.append(testSoundButton);
			soundRow.append(soundCell);
			
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(soundPanel);
			newRow.append(newCell);
			
			soundVolume.classList.add('search-control');
			soundVolume.type = 'text';
			soundVolume.value = '';
			soundVolume.classList.add('search-volume');
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(soundVolume);
			newRow.append(newCell);
			
			var color = document.createElement('input');
			color.classList.add('search-control');
			color.type = 'color';
			color.value = '#1C1E23';
			color.classList.add('search-color');
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(color);
			newRow.append(newCell);
			
			var addNewButton = document.createElement('div');
			addNewButton.classList.add('button');
			addNewButton.classList.add('add-new-button');
			
			addNewButton.append(document.createTextNode('Add New'));
			addNewButton.cloneTarget = newRow;
			addNewButton.onclick = function()
			{
				var clonedNode = this.cloneTarget.cloneNode(true);
				if(clonedNode.querySelector('.search-url').value.trim() != '')
				{				
					var soundId = clonedNode.querySelector('.search-control.search-sound-id');
					soundId.value =  this.cloneTarget.querySelector('.search-control.search-sound-id').value;
					var soundVolume = clonedNode.querySelector('.search-control.search-volume');
					if(soundVolume.value != '')
					{
						if(soundVolume.value > 1)
						{
							soundVolume.value = 1;
						}
						else if(soundVolume.value < 0.1)
						{
							inputs[j].value = 0.1;
						}
					}
					var testSoundButton = clonedNode.querySelector('.button.test-sound-button');
					testSoundButton.soundId = soundId;
					testSoundButton.soundVolume = soundVolume;
					testSoundButton.onclick = function()
					{
						playSound(this.soundId.value, this.soundVolume.value);
					};
					var removeButton = document.createElement('div');
					removeButton.classList.add('button');
					removeButton.append(document.createTextNode('Remove'));
					removeButton.removeTarget = clonedNode;
					removeButton.onclick = function()
					{
						this.removeTarget.parentElement.removeChild(this.removeTarget);
					}
					var addButton = clonedNode.querySelector('.button.add-new-button');

					
					var rowInputs = clonedNode.querySelectorAll('input[type="text"]');
					for(var a = 0; a < rowInputs.length; a++)
					{
						rowInputs[a].searchRow = clonedNode;
						rowInputs[a].onfocus = function()
						{
							this.searchRow.draggable = false;
						};
						rowInputs[a].onblur = function()
						{
							this.searchRow.draggable = true;
						};
					}
					addButton.parentNode.append(removeButton);
					addButton.parentElement.removeChild(addButton);
					document.getElementById('search-body-content').querySelector('.us-table').append(clonedNode);
					var fields = this.cloneTarget.querySelectorAll('.search-control');
					for(var j = 0; j < fields.length; j++)
					{
						var field = fields[j];
						field.value = '';
					}
					
					makeDraggable(clonedNode,'search-row');
				}
				else
				{
					alert('A Url is required for a search entry');
				}
			};
			
			
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.classList.add('button-cell');
			newCell.append(addNewButton);
			newRow.append(newCell);
			
			newtable.append(newRow);
			ssbContent.append(newtable);
			

			var ssbFooter = document.createElement('div');
			ssbFooter.classList.add('modal-footer');
			ssbContent.append(ssbFooter);			

			var footerButtons = document.createElement('div');
			
			var sortButton = document.createElement('input');
			sortButton.type = "button";
			sortButton.className = "button";
			sortButton.value = 'Sort Actives';
			sortButton.addEventListener('click', function(event)
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
			});
			footerButtons.append(sortButton);
			
			var copyButton = document.createElement('input');
			copyButton.type = "button";
			copyButton.className = "button";
			copyButton.value = 'Copy';
			copyButton.addEventListener('click', function(event)
			{
				var text = searchStringBuilder.generateSearchString();
				copyTextToClipboard(text);
			});
			footerButtons.append(copyButton);

			var saveButton = document.createElement('input');
			saveButton.type = "button";
			saveButton.className = "button";
			saveButton.value = 'Save';

			saveButton.newRow = newRow;
			saveButton.addEventListener('click', function(event)
			{
				searchBox.value = searchStringBuilder.generateSearchString();
				var fields = this.newRow.querySelectorAll('input,select');
				for(var j = 0; j < fields.length; j++)
				{
					var field = fields[j];
					field.value = '';
				}				
				saveLocalData();
				ssb.classList.add('hidden');	
			});
			
			footerButtons.append(saveButton);

			var cancelButton = document.createElement('input');
			cancelButton.type = "button";
			cancelButton.className = "button";
			cancelButton.value = 'Cancel';
			cancelButton.cancelTarget = newRow;
			cancelButton.addEventListener('click', function(event)
			{
				var fields = this.cancelTarget.querySelectorAll('input,select');
				for(var j = 0; j < fields.length; j++)
				{
					var field = fields[j];
					field.value ='';
				}
				ssb.classList.add('hidden');	
			});
			
			footerButtons.append(cancelButton);
			ssbFooter.append(footerButtons);
			
			ssb.append(ssbContent);
			
			document.body.append(ssb);
		}
		else
		{
			this.reloadContent();
			ssb.classList.remove('hidden');	
		}
	};
	
	this.reloadContent = function()
	{
		var manager = new ListingManager(this.searchBox.value);
		this.bodyContent.innerHTML = '';
		this.bodyContent.classList.add('all-searches');
		var searchTable = document.createElement('div');
		searchTable.classList.add('us-table');
		searchTable.id = 'all-searches-table';
		this.bodyContent.append(searchTable);
		var headerRow = document.createElement('div');
		headerRow.classList.add('search-header-row');
		headerRow.classList.add('us-table-row');
		var headerText = ['Active', 'Url', 'Comment', 'Sound', 'Volume', 'Color', ''];
		for (var i = 0; i < headerText.length; i++)
		{
			var cell = document.createElement('div');
			cell.classList.add('us-table-cell');
			cell.append(document.createTextNode(headerText[i]));
			headerRow.append(cell);
		}
		searchTable.append(headerRow);
		var currentSearches = manager.searches;
		for (var i = 0; i < currentSearches.length; i++)
		{
			var currentSearch = currentSearches[i];			
			var newRow = document.createElement('div');
			newRow.classList.add('search-row');
			newRow.classList.add('us-table-row');
			
			var newCell = null;
			
			var activeCheckBox = document.createElement('input');
			activeCheckBox.classList.add('search-control');
			activeCheckBox.type = 'checkbox';
			activeCheckBox.value = 1;
			if(currentSearch.active == 1)
			{
				activeCheckBox.checked = true;
			}
			activeCheckBox.classList.add('search-active');
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(activeCheckBox);
			newRow.append(newCell);
			
			var urlPanel = document.createElement('div');
			urlPanel.classList.add('us-table');
			var urlRow = document.createElement('div');
			urlRow.classList.add('us-table-row');
			urlPanel.append(urlRow);
			var urlCell = document.createElement('div');
			urlCell.classList.add('us-table-cell');
			urlRow.append(urlCell);
			
			var newUrl = document.createElement('input');
			newUrl.classList.add('search-control');
			newUrl.type = 'text';
			newUrl.value = currentSearch.searchUrlPart;
			newUrl.classList.add('search-url');
			urlCell.append(newUrl);
			
			var goButton = document.createElement('span');
			goButton.append(document.createTextNode('Go'));
			goButton.classList.add('button');
			goButton.urlBox = newUrl;
			goButton.onclick = function()
			{
				if(this.urlBox.value != null && this.urlBox.value.trim().length > 0)
				{
					var league = document.getElementById('league').value;
					var url = 'https://www.pathofexile.com/trade/search/' + league + '/' + this.urlBox.value;
					
					window.open(url, '_blank');
				}
			};

			urlCell = document.createElement('div');
			urlCell.classList.add('us-table-cell');
			urlCell.append(goButton);
			urlRow.append(urlCell);

			newRow.append(urlPanel);
			
			
			var comment = document.createElement('input');
			comment.classList.add('search-control');
			comment.type = 'text';
			comment.value = currentSearch.searchComment;
			comment.classList.add('search-comment');
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(comment);
			newRow.append(newCell);
			
			var soundPanel = document.createElement('div');
			soundPanel.classList.add('us-table');
			var soundRow = document.createElement('div');
			soundRow.classList.add('us-table-row');
			soundPanel.append(soundRow);
			var soundCell = document.createElement('div');
			soundCell.classList.add('us-table-cell');
			soundRow.append(soundCell);
			
			
			var soundId = document.getElementById('notification-sound').cloneNode(true);
			soundId.classList.add('search-control');
			soundId.id = '';
			soundId.value = currentSearch.soundId;
			soundId.classList.add('search-sound-id');
			soundCell.append(soundId);
			
			var soundVolume = document.createElement('input');
			var testSoundButton = document.createElement('div');
			testSoundButton.classList.add('button');
			testSoundButton.append(document.createTextNode('?'));
			testSoundButton.title = 'Test Sound';
			testSoundButton.soundId = soundId;
			testSoundButton.soundVolume = soundVolume;
			testSoundButton.onclick = function()
			{
				playSound(this.soundId.value, this.soundVolume.value);
			};

			var soundCell = document.createElement('div');
			soundCell.classList.add('us-table-cell');
			soundCell.append(testSoundButton);
			soundRow.append(soundCell);
			
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(soundPanel);
			newRow.append(newCell);
			
			soundVolume.classList.add('search-control');
			soundVolume.type = 'text';
			soundVolume.value = currentSearch.soundVolume;
			soundVolume.classList.add('search-volume');
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(soundVolume);
			newRow.append(newCell);
			
			var color = document.createElement('input');
			color.classList.add('search-control');
			color.type = 'color';
			color.value = currentSearch.color;
			color.classList.add('search-color');
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(color);
			newRow.append(newCell);
			
			var removeButton = document.createElement('div');
			removeButton.classList.add('button');
			removeButton.append(document.createTextNode('Remove'));
			removeButton.removeTarget = newRow;
			removeButton.onclick = function()
			{
				this.removeTarget.parentElement.removeChild(this.removeTarget);
			}
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(removeButton);
			newRow.append(newCell);
			
			var rowInputs = newRow.querySelectorAll('input[type="text"]');
			for(var a = 0; a < rowInputs.length; a++)
			{
				rowInputs[a].searchRow = newRow;
				rowInputs[a].onfocus = function()
				{
					this.searchRow.draggable = false;
				};
				rowInputs[a].onblur = function()
				{
					this.searchRow.draggable = true;
				};
			}
			
			searchTable.append(newRow);
			makeDraggable(newRow,'search-row');
		}
	};
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
	var addNewButton = searchRow.querySelector('.add-new-button');
	replaceWithRemoveButton(addNewButton, searchRow);	
	makeDraggable(searchRow,'search-row');
	searchesTable.append(searchRow);
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