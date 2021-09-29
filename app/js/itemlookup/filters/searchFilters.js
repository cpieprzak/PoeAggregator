const { systemPreferences } = require("electron");

let searchFilters = new Map();
let weaponFilters = new Map();
let armourFilters = new Map();
let searchFilterTypes = Array('pseudo','explicit','implicit','fractured','enchant','crafted','veiled','monster','delve','ultimatum');

function loadSearchFilters()
{
	let host = 'www.pathofexile.com';
	let path = 'https://www.pathofexile.com/api/trade/data/stats';
	
	let myHeaders = 
    {        
		'User-Agent': 'Mozilla/5.0'
    };

    const options =
	{
		host: host,
		port: 443,
		path: path,
  		method: 'GET',
		headers: myHeaders
	};
	
	let data = '';
	const req = https.request(options, res => 
	{
		if(res.statusCode == 200)
		{
			res.setEncoding('utf8');
		  	res.on('data', d => 
			{
		    	data += d;
		  	})
		  	res.on('end', d => 
			{
				let filters = JSON.parse(data).result;
				let missingTypes = [];
				for (const filter of filters)
				{
					for (const entry of filter.entries)
					{
						let tmpEntries = [];
						let isLogging = false;
						if(entry.option && entry.option.options)
						{
							for (const tmpOption of entry.option.options)
							{
								let newFilter = {
									id: entry.id,
									text: entry.text.replace('#',tmpOption.text),
									type: entry.type,
									value: {
										option: tmpOption.id +''
									}
								};
								tmpEntries.push(newFilter);
							}
						}
						else
						{
							tmpEntries.push(entry);
						}
						for(const tmpEntry of tmpEntries)
						{
							let modKey = simplifyMod(tmpEntry.text);
							if(modKey.toLowerCase().includes(`local`)) handleLocal(tmpEntry,modKey);
							if(tmpEntry.type == 'pseudo')
							{
								modKey = modKey.replace('total-','');
								if(!modKey.startsWith('to-')){modKey = 'to-' + modKey;}
								
							}	
							let modTypeLists = searchFilters.get(modKey);
							modTypeLists = modTypeLists == null ? [] : modTypeLists;
							modTypeLists.push(tmpEntry);
							if(!searchFilterTypes.includes(tmpEntry.type) && !missingTypes.includes(tmpEntry.type))
							{
								missingTypes.push(tmpEntry.type)
							};
							
							searchFilters.set(modKey,modTypeLists);
						}
					}
				}
				if(missingTypes.length > 0){console.log(`missingTypes: ${missingTypes}`)};
				
		  	})
		}
		else
		{
			console.log('Bad request: ' + res.statusCode);
		}
	})

	req.on('error', error => 
	{
  		console.error(error)
	})

	req.end()
}

loadSearchFilters();

const weaponKeywords = ['Attack', 'Damage', 'Hit', 'Accuracy'];
function handleLocal(filter,modKey)
{
	let filterMap = armourFilters;
	for (const keyword of weaponKeywords)
	{
		if (filter.text.includes(keyword))
		{
			filterMap = weaponFilters;
			break;
		}
	}

	if(filter.type == 'pseudo')
	{
		modKey = modKey.replace('total-','');
		if(!modKey.startsWith('to-')){modKey = 'to-' + modKey;}
	}	
	let modTypeLists = filterMap.get(modKey);
	modTypeLists = modTypeLists == null ? [] : modTypeLists;
	modTypeLists.push(filter);
	filterMap.set(modKey,modTypeLists);
}