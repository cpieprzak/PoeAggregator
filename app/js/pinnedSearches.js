let addNewcategoryRow = document.querySelector('#add-new-pinned-category-row');
let configureNewcategoryRow = document.querySelector('#configure-new-pinned-category-row');
let newCategoryNameInput = document.querySelector('#new-category-name');
let categoryTemplate = document.querySelector('#category-template');
let pinnedSearchTemplate = document.querySelector('.pinned-search-row');
pinnedSearchTemplate.remove();
let pinnedCategories = document.querySelector('#pinned-categories');
let searchRowTemplate = document.querySelector('#pinned-search-modal .searches-table .us-table-row');
searchRowTemplate.remove();
let ENTER = 13;
categoryTemplate.id = '';
categoryTemplate.remove();

let pinnedSearchFilter = document.querySelector('#pinned-search-modal .text-filter');
pinnedSearchFilter.onkeyup = filterPinnedSearches;
pinnedSearchFilter.onblur = filterPinnedSearches;
pinnedSearchFilter.onclick = clearPinnedSearchFilter;

let catagories = [];

newCategoryNameInput.onkeyup = (key) => {
    if(key.keyCode === ENTER) try{ approveNewCategory(); } catch (e) { console.log(e); }
};

function configureNewPinnedCategory() {
    addNewcategoryRow.classList.add('hidden');
    configureNewcategoryRow.classList.remove('hidden');
    newCategoryNameInput.focus();
}


function approveNewCategory() {
    let name = newCategoryNameInput.value.trim();
    addNewCategory(name);
    saveCatagories();
    hideCategoryConfiguration();
}

function addNewCategory(name) {
    if(name && !catagories[name]) {
        catagories[name] = [];
        let newCategory = categoryTemplate.cloneNode(true);
        newCategory.querySelector('.category-name').innerHTML = name;
        let body = newCategory.querySelector('.pinned-search-body');
        newCategory.querySelector('.delete-category-button').onclick = () => { 
            newCategory.remove(); 
            delete catagories[name];
            saveCatagories();
        };
        newCategory.querySelector('.new-search-button').onclick = () => {
            pinnedSearchFilter.value = '';
            let manager = new ListingManager(document.getElementById('searches').value);
            let modalBody = document.querySelector('#pinned-search-modal .modal-body .searches-table');
            modalBody.innerHTML = '';
            for(let search of manager.searches) {
                let searchRow = searchRowTemplate.cloneNode(true);
                let dataRows = searchRow.querySelectorAll('div[data],span[data]');
                let addButton = searchRow.querySelector('.add-search-button');
                addButton.onclick = () => { buildPinnedSearchRow(searchRow,search,newCategory); }
                for(let dataRow of dataRows) {
                    let data = dataRow.getAttribute('data');
                    if(data == 'searchComment') dataRow.innerHTML = search.searchComment;
                }
                modalBody.appendChild(searchRow);
            }
            toggleModal('pinned-search-modal');
            pinnedSearchFilter.focus();
        };
        
        let expands = newCategory.querySelectorAll('.expand-category');        
        for(let element of expands) element.onclick = () => { 
            newCategory.classList.toggle('expanded'); 
            body.classList.toggle('hidden'); 
        };  
        
        newCategory.classList.remove('hidden');
        pinnedCategories.appendChild(newCategory);
        return newCategory;
    }
}

const cancelNewCategory = () => hideCategoryConfiguration();

function hideCategoryConfiguration() {
    newCategoryNameInput.value = '';
    pinnedSearchFilter.value = '';
    addNewcategoryRow.classList.remove('hidden');
    configureNewcategoryRow.classList.add('hidden');
}

function clearPinnedSearchFilter() {
	pinnedSearchFilter.value =  '';
    let searchTable = document.querySelector('#pinned-search-modal .searches-table');
    let searchRows = searchTable.querySelectorAll('.us-table-row');
    for(var i = 0; i < searchRows.length; i++) {
        let row = searchRows[i];
        row.classList.remove('hidden');
    }
}

function filterPinnedSearches(e) {
    let searchTable = document.querySelector('#pinned-search-modal .searches-table');
    let searchRows = searchTable.querySelectorAll('.us-table-row');
	let filterText = pinnedSearchFilter.value.toLowerCase();
	if(e.key === "Escape") {
		pinnedSearchFilter.value = '';
		filterText = '';
    }
	for(let row of searchRows) {
		let commentInput = row.querySelector('div[data=searchComment],span[data=searchComment]');
		let commentText = commentInput.innerHTML.toLowerCase();
		if(shouldShowSearch(filterText, commentText)) row.classList.remove('hidden');
		else row.classList.add('hidden');
	}
};

function shouldShowSearch(filterText, commentText) {
    if(!filterText.startsWith('~')) return commentText.indexOf(filterText) > -1;
    else {
        filterText = filterText.substring(1);
        let textParts = filterText.split(' ');
        let show = true;
        for(let i = 0; i < textParts.length; i++) {
            let textPart = textParts[i];
            let isNot = textPart.startsWith('!');
            if(isNot) {
                textPart = textPart.substring(1);
                if(textPart.length > 0 && commentText.indexOf(textPart) >= 0) { show = false; break; }
            }
            else if(commentText.indexOf(textPart) < 0) { show = false; break; }		
        }
        return show;
    }
}

function buildPinnedSearchRow(searchRow,search,category) {
    addSearchToCategory(search,category);    
    saveCatagories();
    searchRow.remove();
}

function makeSearchName(search) {
    return search.searchComment + (search.minQuantity ? ` (${search.minQuantity}+)` : '');
}

function addSearchToCategory (search,category) {
    let categoryName = category.querySelector('.category-name').innerHTML;
    let searchTable = category.querySelector('.pinned-search-table');
    let row = pinnedSearchTemplate.cloneNode(true);
    let searchName = makeSearchName(search);
    let alreadyExists = false;
    catagories[categoryName].forEach((search) => {
        if(searchName == makeSearchName(search)) alreadyExists = true;
    });
    if(alreadyExists) return;
    catagories[categoryName].push(search);
    row.querySelector('.search-comment').innerHTML = searchName;
    row.querySelector('.delete-button').onclick = () => {
        catagories[categoryName] = catagories[categoryName].filter(function(search) {
             return searchName != makeSearchName(search); 
        }); 
        saveCatagories();
        row.remove();
    };
    let runInAggButton = row.querySelector('.run-in-agg-button');
    runInAggButton.onclick = () => {
        if(runInAggButton.classList.contains('disabled')) return;
        disableRunButtons(3000);
        let sort = { price : 'asc'};
        search.soundId = '';
		runSortedSearch(search, sort, outputToView);
        setCurrentWindow('main-display-window');
     };
     let runInPoeButton = row.querySelector('.run-in-poe-button');
     runInPoeButton.onclick = () => {
        if(runInPoeButton.classList.contains('disabled')) return;
        disableRunButtons(500);
        let league = document.getElementById('league').value;
		let url = 'https://www.pathofexile.com/trade/search/' + league + '/' + search.searchUrlPart;
		loadOfficialTradeWebsite(url);
     };
     let runInNewWindowButton = row.querySelector('.run-in-new-window-button');
     runInNewWindowButton.onclick = () => {
        if(runInNewWindowButton.classList.contains('disabled')) return;
        disableRunButtons(3000);
        runSearchInNewWindowFromSearchInfo(search);
     };
    searchTable.appendChild(row);
}

function disableRunButtons(timeout) {
    let buttons = document.querySelectorAll('.run-button');
    for(let button of buttons) button.classList.add('disabled');
    setTimeout(enableRunButtons, timeout);
}

function enableRunButtons() {
    let buttons = document.querySelectorAll('.run-button');
    for(let button of buttons) button.classList.remove('disabled');
}

function saveCatagories() {
    let catagoriesToSave = [];
    for (const [key, value] of Object.entries(catagories)) {
        let catagoryToSave = {
            catagoryName : key,
            searches : value
        };
        catagoriesToSave.push(catagoryToSave);
    }
    localStorage.setItem('pinned-catagories',JSON.stringify(catagoriesToSave));
}

function loadCatagories() {
    let loadedCatagories = localStorage.getItem('pinned-catagories');
    if(loadedCatagories) {
        loadedCatagories = JSON.parse(loadedCatagories);
        loadedCatagories.forEach(catagory => {
            let newCategory = addNewCategory(catagory.catagoryName);
            catagory.searches.forEach(search => {
                search = new SearchListing().copyFrom(search);
                addSearchToCategory(search,newCategory);
            });
        });
    }
}

loadCatagories();