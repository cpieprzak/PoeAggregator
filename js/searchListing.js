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
	this.searchUrlPart = '';
	this.searchComment = '';
	this.soundId = '';
	this.soundVolume = 0.25;
	

	var searchParts = listingString.split('[');
	for (var i = 0; i < searchParts.length; i++)
	{
		var searchPart = searchParts[i].replace('[','').replace(']','');
		if(i == 0)
		{
			this.searchUrlPart = searchPart;
		}
		else if(i == 1)
		{
			this.searchComment = searchPart;
		}
		else if(i == 2)
		{
			this.soundId = searchPart;
		}
		else if(i == 3)
		{
			if(searchPart != null)
			{
				this.soundVolume = searchPart;
			}
		}
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
		var searchRows = this.bodyContent.querySelectorAll('.us-table-row');
		var isFirstRow = true;
		for(var i = 0; i < searchRows.length; i++)
		{
			var searchRow = searchRows[i];
			console.log(searchRow);
			if(!searchRow.classList.contains('search-header-row'))
			{
				if(isFirstRow)
				{
					isFirstRow = false;
				}
				else
				{
					searchString += ',';
				}
				var inputs = searchRow.querySelectorAll('input');
				for(var j = 0; j < inputs.length; j++)
				{
					if(j != 0)
					{
						searchString += '[';
					}
					searchString += inputs[j].value;
					if(j != 0)
					{
						searchString += ']';
					}
				}
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
			ssbBackground.classList.add('ssb-background');
			ssbBackground.onclick = function closeSsb(event)
			{
				ssb.classList.add('hidden');	
			} 
			ssb.append(ssbBackground);
			
			var ssbContent = document.createElement('div');
			ssbContent.classList.add('ssb-content-box');
			var ssbHeader = document.createElement('div');
			ssbHeader.classList.add('ssb-header');
			ssbHeader.append(document.createTextNode('Modify Searches'));
			ssbContent.append(ssbHeader);
			this.reloadContent();
			ssbContent.append(this.bodyContent);

			var newtable = document.createElement('table');
			newtable.classList.add('add-new-search');
			newtable.classList.add('us-table');

			var headerRow = document.createElement('div');
			headerRow.classList.add('search-header-row');
			headerRow.classList.add('us-table-row');
			var headerText = ['Url', 'Comment', 'Sound', 'Volume', ''];
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
			
			var newCell = null
			
			var newUrl = document.createElement('input');
			newUrl.type = 'text';
			newUrl.value = '';
			newUrl.classList.add('search-url');
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(newUrl);
			newRow.append(newCell);
			
			var comment = document.createElement('input');
			comment.type = 'text';
			comment.value = '';
			comment.classList.add('search-comment');
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(comment);
			newRow.append(newCell);
			
			var soundId = document.createElement('input');
			soundId.type = 'text';
			soundId.value = '';
			soundId.classList.add('search-sound-id');
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(soundId);
			newRow.append(newCell);
			
			var soundVolume = document.createElement('input');
			soundVolume.type = 'text';
			soundVolume.value = '';
			soundVolume.classList.add('search-volume');
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(soundVolume);
			newRow.append(newCell);
			
			var addNewButton = document.createElement('div');
			addNewButton.classList.add('button');
			addNewButton.append(document.createTextNode('Add New'));
			addNewButton.cloneTarget = newRow;
			addNewButton.onclick = function()
			{
				var clonedNode = this.cloneTarget.cloneNode(true);
				if(clonedNode.querySelector('input[type="text"]').value.trim() != '')
				{
					var removeButton = document.createElement('div');
					removeButton.classList.add('button');
					removeButton.append(document.createTextNode('Remove'));
					removeButton.removeTarget = clonedNode;
					removeButton.onclick = function()
					{
						this.removeTarget.parentElement.removeChild(this.removeTarget);
					}
					
					var addButton = clonedNode.querySelector('.button');
					addButton.parentNode.append(removeButton);
					addButton.parentElement.removeChild(addButton);
					document.getElementById('search-body-content').querySelector('.us-table').append(clonedNode);
					var fields = this.cloneTarget.querySelectorAll('input[type="text"');
					for(var j = 0; j < fields.length; j++)
					{
						var field = fields[j];
						field.value = '';
					}
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
			ssbFooter.classList.add('ssb-footer');
			ssbContent.append(ssbFooter);			

			var footerButtons = document.createElement('div');
			
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
				var fields = this.newRow.querySelectorAll('input[type="text"');
				for(var j = 0; j < fields.length; j++)
				{
					var field = fields[j];
					field.value ='';
				}
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
				var fields = this.cancelTarget.querySelectorAll('input[type="text"');
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
		this.bodyContent.append(searchTable);
		var headerRow = document.createElement('div');
		headerRow.classList.add('search-header-row');
		headerRow.classList.add('us-table-row');
		var headerText = ['Url', 'Comment', 'Sound', 'Volume', ''];
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
			
			var newCell = null
			
			var newUrl = document.createElement('input');
			newUrl.type = 'text';
			newUrl.value = currentSearch.searchUrlPart;
			newUrl.classList.add('search-url');
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(newUrl);
			newRow.append(newCell);
			
			var comment = document.createElement('input');
			comment.type = 'text';
			comment.value = currentSearch.searchComment;
			comment.classList.add('search-comment');
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(comment);
			newRow.append(newCell);
			
			var soundId = document.createElement('input');
			soundId.type = 'text';
			soundId.value = currentSearch.soundId;
			soundId.classList.add('search-sound-id');
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(soundId);
			newRow.append(newCell);
			
			var soundVolume = document.createElement('input');
			soundVolume.type = 'text';
			soundVolume.value = currentSearch.soundVolume;
			soundVolume.classList.add('search-volume');
			newCell = document.createElement('div');
			newCell.classList.add('us-table-cell');
			newCell.append(soundVolume);
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
			
			searchTable.append(newRow);
		}
	};
}
var buildSearchButton = document.createElement('div');
buildSearchButton.innerHTML = 'Build';
buildSearchButton.searchStringBuilder = searchStringBuilder;
buildSearchButton.classList.add('button');
buildSearchButton.onclick = function tmp(event)
{
	this.searchStringBuilder.buildInterface();	
}

searchBox.parentNode.insertBefore(buildSearchButton, searchBox.nextSibling);