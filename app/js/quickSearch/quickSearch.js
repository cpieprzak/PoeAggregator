const quickSearchIpc = require('electron').ipcRenderer;

const showInAggregator = () => newPoeSearch(QS('#show-in-aggregator').getAttribute('slug'));
const runAgain = () => executeQuickSearch(currentsearchInfo);
var quickSearchResultTemplate = QS('#quick-search-result-template');

var currentsearchInfo = null;

if(quickSearchResultTemplate) quickSearchResultTemplate.remove();

quickSearchIpc.on('quick-search', (event,searchInfoString) => {
    let searchInfo = JSON.parse(searchInfoString);
    currentsearchInfo = searchInfo;
    QS('#title').innerHTML = `Quick Search Results for ${searchInfo.searchComment}`;
    QSA('[slug]').forEach((element) => { element.setAttribute('slug',searchInfo.searchUrlPart); }); 
    executeQuickSearch(searchInfo);
});

function executeQuickSearch(searchInfo)
{
    QS('.error-msg').innerHTML = '';
    fetch(`https://www.pathofexile.com/api/trade/search/${searchInfo.searchUrlPart}?q=`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => { executeSearch(data, searchInfo); })
    .catch((error) => { QS('.error-msg').innerHTML = error; });
}

function executeSearch(filterCriteria,searchInfo)
{
    filterCriteria.query.status.option = 'online';
    filterCriteria.sort = {price: "asc"};
    getItemIds(filterCriteria,getItemData, searchInfo);
}

function getItemIds(requestBody,callback, searchInfo)
{
    fetch(`https://www.pathofexile.com/api/trade/search/${selectedLeague}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
    })
    .then(response => response.json())
    .then(data => {
        callback(data, searchInfo);
        QS('.error-msg').innerHTML = '';
        QS('.result-count').innerHTML = data.total ? data.total : 0;
    })
    .catch((error) => { QS('.error-msg').innerHTML = error; });
}

function getItemData(data,searchInfo)
{
    let result = data.result;
    let requests = [];
    if(result && result.length > 0)
    {
        QS('.quick-search-results').innerHTML = '';
        let itemsToLookUp = [];
        for (let i = 0; i < result.length; i++)
        {
            itemsToLookUp.push(result[i]);
            if(itemsToLookUp.length >= 10)
            {
                requests.push(itemsToLookUp);
                itemsToLookUp = [];
            }
        } 
        if(itemsToLookUp.length > 0) requests.push(itemsToLookUp);
        lookUpNextTenItems(requests,searchInfo);        
    }
    else QS('.quick-search-results').innerHTML = 'No results found';
}

function lookUpNextTenItems(requests,searchInfo)
{
    if(requests.length == 0) return;
    let itemIds = requests.shift();
    fetch(`https://www.pathofexile.com/api/trade/fetch/${itemIds}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => { displayItemData(data,searchInfo); lookUpNextTenItems(requests,searchInfo); })
    .catch((error) => { QS('.error-msg').innerHTML = error; });
}

const isIterable = (value) => { return Symbol.iterator in Object(value); }

function displayItemData(data,searchInfo)
{
    let hideMirrored = !QS('.show-mirrored').checked;
    let hideCorrupted = !QS('.show-corrupted').checked;
    if(!isIterable(data.result)) return;
    for(let result of data.result)
    {
        result = meetsQuantRequirement(searchInfo, result);
        if(result)
        {
            let resultTemplate = quickSearchResultTemplate.cloneNode(true);
            resultTemplate.id = '';
            let hideResult = false;
            if(result.item.corrupted) 
            {
                resultTemplate.classList.add('is-corrupted'); 
                resultTemplate.title = 'Corrupted';
                if(hideCorrupted) hideResult = true;
            }
                       
            if(result.item.duplicated)
            {
                resultTemplate.classList.add('is-mirrored');
                resultTemplate.title = 'Mirrored';
                if(hideMirrored) hideResult = true;
            } 
            if(hideResult) resultTemplate.classList.add('hidden');
           
            for (let replaceTarget of QSA('[data-placeholder]',resultTemplate))
            {
                let target = replaceTarget.getAttribute('data-placeholder');
                replaceTarget.innerHTML = '';                
                
                QS('.send-whisper',resultTemplate).onclick = () => 
                {
                    copyTextToClipboard(result.listing.whisper);
                    sendClipboardTextToPoe();
                    resultTemplate.remove();
                };          
                
                QS('.close-result',resultTemplate).onclick = () => { resultTemplate.remove(); };
                let value = findValueFromPath(result,target);
                if(target == 'listing.indexed') value = `Listed ${timeFromNow(new Date(value))}`;
                if(target == 'listing.account.online')
                {
                    let tmp = 'Offline';
                    if(value != null) 
                    {
                        tmp = 'Online';
                        if(value.status)
                        {
                            tmp = value.status;
                            tmp = tmp.charAt(0).toUpperCase() + tmp.slice(1);
                        }
                    }
                    value = tmp;
                    replaceTarget.classList.add('account-status');
                    replaceTarget.classList.add(value.toLowerCase());
                }
                let newNode = document.createTextNode(value);
                if(target === 'listing.price.currency')
                {
                    let imgPath = currencyImages[value];
                    if(imgPath)
                    {
                        let img = document.createElement('img');
                        img.src = imgPath;
                        img.title = value;
                        img.classList.add('currency-img');
                        newNode = img;                            
                    }
                }
                if(target == 'item.icon')
                {
                    let img = document.createElement('img');
                        img.src = value;
                        img.classList.add('currency-img');
                        newNode = img;
                }
                replaceTarget.append(newNode);
            }
            QS('.quick-search-results').append(resultTemplate);
        }        
    }
}

function meetsQuantRequirement(searchInfo, result)
{
    if(searchInfo && searchInfo.minQuantity && searchInfo.minQuantity.length > 0 && result.item.stackSize)
	{
		let stackSize = result.item.stackSize;
		let meetsQuantRequirement = result.item.stackSize >= parseInt(searchInfo.minQuantity);

		if(meetsQuantRequirement)
		{
			if(result.listing.price && result.listing.price.amount && stackSize > 1)
			{
				let priceQuant = result.listing.price.amount;
				let totalPrice = stackSize * priceQuant;
				let currencyType = result.listing.price.currency;
				currencyType = currencyType[0].toUpperCase() + currencyType.slice(1);
				let itemName = result.item.baseType;
				let isEnglish = result.listing.whisper.includes('I would like to buy your');
				if (isEnglish)
				{
					let acctName = result.listing.account.lastCharacterName;
					let msg = `@${acctName} Hi, I'd like to buy your ${stackSize} ${itemName} for my ${totalPrice} ${currencyType} Orb in ${selectedLeague}.`;
					result.listing.whisper = msg;
				}
				else
				{
					let separator = ' ******************************************************************************************** ';	
					let msg = `. ${separator} ===============> WTB ${stackSize} ${itemName} for  ${totalPrice} ${currencyType}  ${separator}`;	
					result.listing.whisper += msg;
				}				
			}
            return result;
		}
		return false;
	}
    return result;
}

function updateDisplayedResults()
{
    let showMirrored = QS('.show-mirrored').checked;
    let showCorrupted = QS('.show-corrupted').checked;
    {
        QSA('.quick-search-result').forEach((element)=> {
            let isMirrored = element.classList.contains('is-mirrored');
            let isCorrupted = element.classList.contains('is-corrupted');
            let displayItem = true;
            if(isMirrored && !showMirrored) displayItem = false;
            if(isCorrupted && !showCorrupted) displayItem = false;
            if(displayItem) element.classList.remove('hidden');
            else element.classList.add('hidden');
        });
    }
}