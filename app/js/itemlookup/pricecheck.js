const priceCheckIpc = require('electron').ipcRenderer;


var priceCheckResultTemplate = QS('#price-check-result-template');
if(priceCheckResultTemplate) priceCheckResultTemplate.remove();

var searchFilterTemplate = QS('#search-filter-template');
if(searchFilterTemplate) searchFilterTemplate.remove();

let lastdate = 0;
async function priceCheck()
{
    try{
        copyTextToClipboard('');
        await copyAdvancedItemText();
        const clipboardText = await getClipboardData();
        if(clipboardText.includes('Item Class:'))
        {
            let copiedItem = new CopiedItem(clipboardText);
            priceCheckIpc.send('price-check',copiedItem);
        }    
        else
        {
            priceCheckIpc.send('price-check-message','Timed out waiting for clipboard to get item data.');
        }
    }
    catch (e)
    {
        priceCheckIpc.send('price-check-message','Timed out waiting for clipboard to get item data.');
    }
}

priceCheckIpc.on('start-price-check', (event) => { 
    priceCheck();
});

priceCheckIpc.on('price-check-message', (event,messageText) => { 
    QS('.price-check-results').innerHTML = messageText;   
    QS('.result-count').innerHTML = ''; 
    QS('#filters').innerHTML = '';     
    QS('.search-slug').innerHTML = '';
});

priceCheckIpc.on('price-check', (event,copiedItem) => {    
    let itemText = QS('.copied-item-text');
    itemText.innerHTML = '';
    itemText.append(CopiedItem.copiedItemToElement(copiedItem));
    let filters = buildFilters(copiedItem);    
    QS('#title').innerHTML = `Price check for ${copiedItem.itemName}`;   
    let query = buildSearchQuery(filters);    
    QS('.price-check-results').innerHTML = '';   
    QS('.result-count').innerHTML = ''; 
    executeSearch(query);
});

function getItemQuery()
{
    return {
        query: {
            status: {
                option: "online"
            },
            stats: [],
            filters: 
            {
                trade_filters: {
                    filters: {
                        collapse: {
                            option: 'true'
                        },
                        price: {
                            min: 0.1
                        }
                    },
                    disabled: false
                }
            }
        },
        sort: {
            price: 'asc'
        }
    };
}

class ItemFilter
{
    displayName;
    path;
    value;
    enabled;
    displayValue;
    constructor(displayName,path,enabled,value,displayValue)
    {
        this.displayName = displayName;
        this.path = path;
        this.enabled = enabled;
        this.value = value;
        this.displayValue = displayValue;
    }
}
// Normal, Magic, Rare, Unique
function buildFilters(copiedItem)
{
    QS('.filters').innerHTML = '';
    let filters = [];
    let rarity = copiedItem.itemProperties.get('Rarity');
    let spread = .1;
    let itemClass = copiedItem.itemProperties.get('Item Class');
    let mapTier = copiedItem.itemProperties.get('Map Tier');
    let isGem = rarity === 'Gem';
    let isJewel = itemClass == 'Jewels';
    if(itemClass && itemClassLookUp.get(itemClass))
    {        
        let original = itemClass;
        itemClass = itemClassLookUp.get(itemClass);
        if(copiedItem.itemType && copiedItem.itemType.includes('Cluster Jewel'))
        {
            original = 'Cluster Jewel';
            itemClass = 'jewel.cluster';
        }
        filters.push(new ItemFilter(
            'Item Class',
            'query.filters.type_filters.filters.category.option',
            true,
            itemClass,
            original
            ));
    }
    if(rarity != 'Rare' || isJewel)
    {
        if(rarity == 'Unique')
        {
            filters.push(new ItemFilter('Item Name','query.name',true,copiedItem.itemName));
        }
        let path = isGem ||  copiedItem.itemType.includes('Blighted') ? 'query.term' : 'query.type';
        filters.push(new ItemFilter('Item Type',path,true,copiedItem.itemType));
    }
    else
    {
        filters.push(new ItemFilter('Item Type','query.type', mapTier ? true : false,copiedItem.itemType));
    }
    let corruptedFilter = new ItemFilter(
        'Is Corrupted?',
        'query.filters.misc_filters.filters.corrupted.option',
        true,
        copiedItem.isCorrupted,
        copiedItem.isCorrupted ? 'Yes' : 'No');
    if(copiedItem.itemProperties.get('Item Level'))
    {
        if(!mapTier)
        {
            filters.push(new ItemFilter(
                            'ilvl',
                            'query.filters.misc_filters.filters.ilvl.min',
                            ['Normal','Magic'].includes(rarity),
                            parseInt(copiedItem.itemProperties.get('Item Level'))));
        }
        filters.push(corruptedFilter);
    }

    if(isGem)
    {
        let isAwakened = copiedItem.itemType.includes('Awakened');
        filters.push(corruptedFilter);
        let gemLevel = copiedItem.itemProperties.get('Gem Level').replaceAll(' (Max)','');
        filters.push(new ItemFilter(
                            'Gem Level',
                            'query.filters.misc_filters.filters.gem_level',
                            !isAwakened,
                            {min: gemLevel, current: gemLevel, max: gemLevel}
        ));
        let quality = copiedItem.itemProperties.get('Quality');
        if(quality)
        {
            quality = parseInt(quality.replaceAll('% (augmented)','').replaceAll('+',''));
            if(quality > 10)
            {
                let min = quality >= 20 ? quality : 10;
                filters.push(new ItemFilter(
                    'Gem Quality',
                    'query.filters.misc_filters.filters.quality',
                    !isAwakened || copiedItem.isCorrupted,
                    {min: min, current: quality, max: null}
                ));
            }
        }
    }
    
    if(copiedItem.isWeapon)
    {
        let aps = parseFloat(copiedItem.itemProperties.get('Attacks per Second'));
        if(aps > 1.55)
        {
            filters.push(new ItemFilter(
                            'Attacks Per Seconds',
                            'query.filters.weapon_filters.filters.aps.min',
                            true,
                            (aps * .95).toFixed(2)));  
        }
        let crit = parseFloat(copiedItem.itemProperties.get('Critical Strike Chance'));
        if(crit > 5.5)
        {        
            filters.push(new ItemFilter(
                            'Crit',
                            'query.filters.weapon_filters.filters.crit.min',
                            true,
                            (crit * .95).toFixed(2)));   
        }
        let physical = copiedItem.itemProperties.get('Physical Damage');
        if(physical)
        {
            physical = physical.replaceAll(' (augmented)','').split('-');
            let total = 0.0;
            for (const part of physical)
            {
                total += parseFloat(part);
            }
            physical = total / physical.length;
            let pdps = physical * aps;
            if (pdps > 250)
            {
                let filterValue = {
                    current: pdps,
                    min: (pdps * .95).toFixed(2),
                    max: (pdps * 1.3).toFixed(2)
                };
                filters.push(new ItemFilter(
                                'Physical DPS',
                                'query.filters.weapon_filters.filters.pdps',
                                true,
                                filterValue)); 
            }
        }
        
        let elemental = copiedItem.itemProperties.get('Elemental Damage');
        if(elemental)
        {
            elemental = elemental.replaceAll(' (augmented)','').split('-');
            let total = 0.0;
            for (const part of elemental)
            {
                total += parseFloat(part);
            }
            elemental = total / elemental.length;
            let edps = elemental * aps;
            if (edps > 250)
            {
                filters.push(new ItemFilter(
                                'Elemental DPS',
                                'query.filters.weapon_filters.filters.edps.min',
                                true,
                                (edps * .95).toFixed(2))); 
            }
        }
    }

    if(mapTier)
    {
        filters.push(new ItemFilter(
            'Map Tier',
            'query.filters.map_filters.filters.map_tier',
            true,
            {min: mapTier, current: mapTier, max: mapTier}));  
    }

    if(copiedItem.socketCount > 5 && copiedItem.linkedSockets < 6)
    {
        filters.push(new ItemFilter(
            'Min Sockets',
            'query.filters.socket_filters.filters.sockets.min',
            true,
            copiedItem.socketCount));  
    }

    if(copiedItem.linkedSockets > 4)
    {
        filters.push(new ItemFilter(
            'Min Links',
            'query.filters.socket_filters.filters.links.min',
            true,
            copiedItem.linkedSockets));
    }
    for (let [itemStatName, itemStat] of copiedItem.itemStats.entries())
    {
        if(itemStat.filter)
        {
            let filterValue = {};
            let value = itemStat.value;
            let enabled = mapTier && !itemStat.isImplicit ? false : true;
            enabled = copiedItem.isWatchstone ? false : enabled;
            enabled = isJewel && itemStat.isImplicit ? false : enabled;
            filterValue.id = itemStat.filter.id;
            
            let tmpSpread = spread;
            if(itemStat.filter.type == 'enchant')
            {                 
                tmpSpread = 0.0;
                if(!['jewel.cluster','armour.helmet','armour.boots'].includes(itemClass))
                {
                    enabled = false;
                }
            }
            
            if(itemStat.value)
            {
                if(itemStat.value.option)
                {
                    filterValue.value = itemStat.value;
                }
                else
                {
                    let value = parseFloat(itemStat.value);
                    let min = value >= 0 ? value * (1.0-tmpSpread) : value * (1.0+tmpSpread);
                    let max = value >= 0 ? value * (1.0+ (2*tmpSpread)) : value * (1.0-(tmpSpread * .5));
                    filterValue.value = {
                        current: value,
                        min: parseFloat(min.toFixed(3)),
                        max: parseFloat(max.toFixed(3))
                    }
                    if(itemStat.bestTier > 4 || ignoredMods.includes(itemStat.name))
                    {
                        enabled = false;
                    }  
                }                  
            }

            if(!excludedMods.includes(itemStat.name))
            {
                let filter = new ItemFilter(
                    itemStat.filter.text,
                    'stats.filter',
                    enabled,
                    filterValue);
                    filter.isEnchant = itemStat.isEnchant;
                    filter.isImplicit = itemStat.isImplicit;
                filters.push(filter);   
            }        
        }
    }

    for (const influenceFilter of copiedItem.influenceFilters)
    {
        filters.push(new ItemFilter(influenceFilter.displayName,
                                    'stats.filter',
                                    true,
                                    {id : influenceFilter.id}
                                    ));    
    }

    filters.push(new ItemFilter(
        'Listed in',
        'query.filters.trade_filters.filters.price.option',
        false,
        'chaos',
        'Chaos'));  

    filters.push(new ItemFilter(
                        'Include Offline?',
                        'query.status.option',
                        false,
                        'any',
                        'Yes'));  
    
    for (const filter of filters)
    {
        displayFilter(filter);
    }

    return filters;
}

function displayFilter(filter)
{
    let filterRow = searchFilterTemplate.cloneNode(true);
    filterRow.id = null;
    filterRow.classList.add('filter-row');
    filterRow.setAttribute('data',JSON.stringify(filter));    
    filterRow.querySelector('input[type=checkbox').checked = filter.enabled;
    filterRow.querySelector('.filter-display-name').innerHTML = filter.displayName;

    if(filter.path == 'stats.filter')
    {
        if(filter.isEnchant)
        {
            filterRow.classList.add('enchant-mods');
        }
        else if (filter.isImplicit)
        {
            filterRow.classList.add('implicit-mods');
        }
        else
        {
            filterRow.classList.add('explicit-mods');
        }
    }
    
    let displayValue = filter.value;
    while(displayValue && displayValue.value)
    {
        displayValue = displayValue.value;
    }
    if(displayValue.option)
    {
        QS('.filter-value',filterRow).innerHTML = '';
    }
    else if(displayValue.min)
    {
        QS('.filter-current',filterRow).innerHTML = displayValue.current;
        QS('.filter-min',filterRow).value = displayValue.min;
        QS('.filter-max',filterRow).value = displayValue.max;
    }
    else
    {
        displayValue = JSON.stringify(displayValue).replaceAll('"','');
        displayValue = displayValue.includes('{id:') ? '' : displayValue;
        if(filter.displayValue)
        {
            displayValue = filter.displayValue;
        }
        
        filterRow.querySelector('.filter-value').innerHTML = displayValue;
    }
    QS('.filters').append(filterRow);
}

function buildSearchQuery(filters)
{
    let requestBody = getItemQuery();
    let statFilters = [];

    for(const filter of filters)
    {
        if(filter.path === 'stats.filter')
        {
            statFilters.push(filter);
        }
        else
        {
            if(filter.enabled)
            {
                setValueOnObject(requestBody, filter.value, filter.path);
            }        
        }
    }

    if(statFilters.length > 0)
    {
        let formattedFilters = [];
        for(const statFilter of statFilters)
        {
            let formattedFilter = new Object();
            formattedFilter.id = statFilter.value.id;
            if(statFilter.value)
            {
                if(statFilter.value.value)
                {
                    if(statFilter.value.value.option)
                    {
                        formattedFilter.value = statFilter.value.value;
                    }
                    else
                    {
                        formattedFilter.value = new Object();
                        if(statFilter.value.value.min)
                        {
                            formattedFilter.value.min = statFilter.value.value.min;
                        }
                        if(statFilter.value.value.max)
                        {
                            formattedFilter.value.max = statFilter.value.value.max;
                        }
                    }
                }
                else
                {
                    formattedFilter.value = statFilter.value;
                }
            }
            formattedFilter.disabled = !statFilter.enabled;
            formattedFilters.push(formattedFilter);

        }
        let andStatFilter = {
            type : 'and',
            filters : formattedFilters
        };
        setValueOnObject(requestBody, [andStatFilter], 'query.stats');
    }
    
    return requestBody;
}

function executeSearch(requestBody,callback)
{
    QS('#show-in-aggregator').setAttribute('slug',null);
    callback = callback || displayResults;
    fetch(`https://www.pathofexile.com/api/trade/search/${selectedLeague}`, {
        method: 'POST',
        headers: 
        {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    })
    .then(response => response.json())
    .then(data => {
        QS('.error-msg').innerHTML = '';
        QS('.result-count').innerHTML = data.total ? data.total : 0;
        callback(data);
        if(data.id)
        {
            QS('.search-slug').innerHTML = data.id;            
            QS('#show-in-aggregator').setAttribute('slug',data.id);
        }
    })
    .catch((error) => {
        QS('.error-msg').innerHTML = error;
    });
}

function showInAggregator()
{    
    let query = buildSearchQuery(getFiltersFromHtml());
    executeSearch(query, (data)=>{
        setTimeout(()=>{
            newPoeSearch(data.id);
        },500);
        
    });
}

function displayResults(data)
{
    let result = data.result;
    if(result && result.length > 0)
    {
        let cheapest = [];
        for (let i = 0; i < result.length && i < 10; i++)
        {
            cheapest.push(result[i]);
        }
        fetch(`https://www.pathofexile.com/api/trade/fetch/${cheapest}?query=${data.id}`, {
        method: 'GET',
        headers: 
        {
            'Content-Type': 'application/json',
        },
        })
        .then(response => response.json())
        .then(data => {
            QS('.price-check-results').innerHTML = '';
            JSON.stringify(data);
            for(const result of data.result)
            {
                var resultTemplate = priceCheckResultTemplate.cloneNode(true);
                resultTemplate.id = '';
               
                for (let replaceTarget of QSA('[data-placeholder]',resultTemplate))
                {
                    let target = replaceTarget.getAttribute('data-placeholder');
                    replaceTarget.innerHTML = '';
                    let value = findValueFromPath(result,target);
                    if(target == 'listing.indexed')
                    {
                        value = `Listed ${timeFromNow(new Date(value))}`;
                    }

                    if(target == 'listing.account.online')
                    {
                        let tmp = 'Offline';
                        if(value != null)		{
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
                    replaceTarget.append(newNode);
                }
                QS('.price-check-results').append(resultTemplate);
            }
        })
        .catch((error) => {
            QS('.error-msg').innerHTML = error;
        });
    }
    else
    {
        QS('.price-check-results').innerHTML = 'No results found';
    }
}

function getFiltersFromHtml()
{
    let filters = [];
    let filterRows = QSA('.filter-row');
    for (const filterRow of filterRows)
    {
        let enabled = filterRow.querySelector('input[type=checkbox]').checked;
        let tmpFilter = JSON.parse(filterRow.getAttribute('data'));
        tmpFilter.enabled = enabled;
        let min = QS('.filter-min',filterRow);
        let max = QS('.filter-max',filterRow); 
        if(min && min.value.length > 0)
        {
            if(tmpFilter.value.min)
            {
                tmpFilter.value.min = min.value;
            }
            else
            {
                tmpFilter.value.value.min = min.value;
            }
        }
        if(max && max.value.length > 0)
        {
            if(tmpFilter.value.max)
            {
                tmpFilter.value.max = max.value;
            }
            else
            {
                tmpFilter.value.value.max = max.value;
            }
        }
        filters.push(tmpFilter);
    }
    return filters;
}

function rerunPriceLookup()
{    
    QS('.price-check-results').innerHTML = '';   
    QS('.result-count').innerHTML = ''; 
    let query = buildSearchQuery(getFiltersFromHtml());
    executeSearch(query);
}

function setExactValue(exactValue)
{
    let value = exactValue.innerHTML;
    let filterRow = exactValue.parentNode;
    while(filterRow && !filterRow.classList.contains('filter-value'))
    {
        filterRow = filterRow.parentNode;
    }
    if(filterRow)
    {        
        value != QS('.filter-min',filterRow).value ? 
            QS('.filter-min',filterRow).value = value :  QS('.filter-max',filterRow).value = value;
    }
}