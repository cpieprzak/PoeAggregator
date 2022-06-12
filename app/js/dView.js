var influenceMods = new Map();
// Shaper
influenceMods['The Shaper\'s'] = 'shadper-mod';
influenceMods['of Shaping'] = 'shadper-mod';
influenceMods['Elevated Shaper\'s'] = 'shadper-mod';
influenceMods['of Elevated Shaping'] = 'shadper-mod';
// Elder
influenceMods['Eldritch'] = 'elder-mod';
influenceMods['of the Elder'] = 'elder-mod';
influenceMods['Elevated Eldritch'] = 'elder-mod';
influenceMods['of the Elevated Elder'] = 'elder-mod';
// Crusader
influenceMods['Crusader\'s'] = 'crusader-mod';
influenceMods['of the Crusade'] = 'crusader-mod';
influenceMods['Elevated Crusader\'s'] = 'crusader-mod';
influenceMods['of the Elevated Crusade'] = 'crusader-mod';
// Redeemer
influenceMods['Redeemer\'s'] = 'redeemer-mod';
influenceMods['of Redemption'] = 'redeemer-mod';
influenceMods['Elevated Redeemer\'s'] = 'redeemer-mod';
influenceMods['of Elevated Redemption'] = 'redeemer-mod';
// Hunter
influenceMods['Hunter\'s'] = 'hunter-mod';
influenceMods['of the Hunt'] = 'hunter-mod';
influenceMods['Elevated Hunter\'s'] = 'hunter-mod';
influenceMods['of the Elevated Hunt'] = 'hunter-mod';
// Warlord
influenceMods['Warlord\'s'] = 'warlord-mod';
influenceMods['of the Conquest'] = 'warlord-mod';
influenceMods['Elevated Warlord\'s'] = 'warlord-mod';
influenceMods['of the Elevated Conquest'] = 'warlord-mod';

function dView(result, searchInfo)
{
	if(!result) return;
	var template = document.getElementById('item-template');
	var newNode = template.cloneNode(true);
	var overrides = [];
	var icon = document.createElement('img');
	let league = document.getElementById('league').value;	
	icon.result = result;
	icon.onclick = function(){console.log(this.result);};
	icon.src = result.item.icon;
	overrides['icon'] = icon;
	newNode.id = result.id;

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
					let msg = `@${acctName} Hi, I'd like to buy your ${stackSize} ${itemName} for my ${totalPrice} ${currencyType} Orb in ${league}.`;
					result.listing.whisper = msg;
				}
				else
				{
					let separator = ' ******************************************************************************************** ';
	
					let msg = `. ${separator} ===============> WTB ${stackSize} ${itemName} for  ${totalPrice} ${currencyType}  ${separator}`;
	
					result.listing.whisper += msg;
				}				
			}
		}
		else
		{
			return;
		}
	}

	var whisperButtonText = 'Whisper';
	overrides['copy-item-button'] = buildCopyButton('Copy Item', atob(result.item.extended.text));
	overrides['watch-item-button'] = buildWatchButton(result.id,searchInfo);
	overrides['listing.price.currency.img'] = '';
	overrides['listing.price.chaos.equiv'] = '';
	overrides['item.total-sum'] = '';
	overrides['item.sum-per-chaos'] = '';
    var chaosEquiv = null;

	overrides['item.sum-per-chaos'] = '';
	overrides['listing-time'] = '';
	
	if(result.listing)
	{
		var indexedTime = result.listing.indexed;
		try
		{
			var indexDate = new Date(indexedTime);
			var day = indexDate.getDate();
			var monthIndex = indexDate.getMonth() + 1;
			var year = indexDate.getFullYear();
			var hours = indexDate.getHours();
			var minutes = indexDate.getMinutes();
			var ampm = 'AM';
			if(hours >= 12)
			{
				ampm = 'PM';
				hours -= 12;
			}		
			if(hours == 0)
			{
				hours = 12;
			}
			var timeString = monthIndex + '/' + day + '/' + year + ' ' + hours + ':' + minutes;
			timeString += ampm;
			overrides['listing-time'] = timeString;
		}
		catch(error)
		{
			overrides['listing-time'] = result.listing.indexed;
		}		
	}

	if(result.listing.price)
	{
		var currencyType = result.listing.price.currency;
		var currencyAmount = result.listing.price.amount;
		if(currencyType && currencyAmount && currencyAmount > 0)
		{
			var currencyImg = document.createElement('img');
			currencyImg.title = currencyType;
			currencyImg.classList.add('currency-img');
			currencyImg.src = currencyImages[currencyType];
			if(currencyImg.src == null || currencyImg.src.length < 1)
			{
				overrides['listing.price.currency.img'] = currencyType;
			}
			else
			{
				overrides['listing.price.currency.img'] = currencyImg;
			}
			if(result.listing.price.amount && currencyRatios[currencyType] != null)
			{
				chaosEquiv = currencyRatios[currencyType].value * result.listing.price.amount;
				chaosEquiv = +chaosEquiv.toFixed(2);
				var equivPanel = document.createElement('span');
				var equivText = document.createElement('span');
				equivText.appendChild(document.createTextNode('(~' + chaosEquiv));
				equivPanel.appendChild(equivText);
				var chaosImg = document.createElement('img');
				chaosImg.title = 'chaos';
				chaosImg.classList.add('currency-img');
				chaosImg.src = currencyImages['chaos'];
				equivPanel.appendChild(chaosImg);
				equivText = document.createElement('span');
				equivText.appendChild(document.createTextNode(')'));
				equivPanel.appendChild(equivText);				
				
				overrides['listing.price.chaos.equiv'] = equivPanel;				
			}
			else if(currencyType == 'chaos')
			{
				chaosEquiv = result.listing.price.amount;
			}
		}
		else
		{
			var unpriced = document.createElement('span');
			unpriced.classList.add('default-text');
			unpriced.appendChild(document.createTextNode('Unpriced'));
			overrides['listing.price.type'] = unpriced;
		}
		newNode.chaosEquiv = chaosEquiv;
	}
	overrides['item.total-sum-per-chaos'] = '';
	if(result.item.pseudoMods)
	{
		var pseudoMods = result.item.pseudoMods;
		var totalSum = 0;
		for(var i = 0; i < pseudoMods.length; i++)
		{
			var pseudoMod = pseudoMods[i];
			var sumName = 'Sum: ';
			if(pseudoMod.indexOf(sumName) > -1)
			{
				pseudoMod = pseudoMod.replace(sumName,'');
				totalSum += Number.parseFloat(pseudoMod);
			}
		}
		overrides['item.total-sum'] = +totalSum.toFixed(2);
		newNode.totalSum = totalSum;
		if(chaosEquiv != null)
		{
			newNode.totalItemValue = totalSum / chaosEquiv;
			overrides['item.total-sum-per-chaos'] = +(newNode.totalItemValue).toFixed(2);
		}
	}
	if(result.listing.account)
	{
		var online = result.listing.account.online;
		var accountStatus = document.createElement('span');
		var msgText = 'Offline';
		var statusPanel = document.createElement('span');
		if(online != null)
		{
			msgText = 'Online';
			if(online.league)
			{
				statusPanel.title = online.league;
			}
			if(online.status)
			{
				msgText = online.status;
			}
		}
		statusPanel.appendChild(document.createTextNode(msgText));
		accountStatus.classList.add('account-status');
		accountStatus.classList.add(msgText.toLowerCase());
		accountStatus.appendChild(statusPanel);
		
		overrides['account-status'] = accountStatus;
	}
	if(result.listing.account.name)
	{
		whisperButtonText += ' ' + result.listing.account.lastCharacterName;
		overrides['account-profile'] = buildAccountLink(result.listing.account.name);
	}
	overrides['whisper-button'] = buildCopyButton(whisperButtonText, result.listing.whisper);
	overrides['whisper-to-poe-button'] = buildCopyButton('↩', result.listing.whisper, true);	
	overrides['item.corrupted'] = '';
	overrides['item.mirrored'] = '';
	overrides['search-comment'] = '';
	overrides['item.influences'] = '';
	
	if(searchInfo != null)
	{
		overrides['search-comment'] = searchInfo.searchComment;
		var searchLink = document.createElement('a');	
		var searchLink = document.createElement('span');
		searchLink.classList.add('link');
		searchLink.appendChild(document.createTextNode(searchInfo.searchUrlPart));
		searchLink.url = 'https://www.pathofexile.com/trade/search/' + league + '/' + searchInfo.searchUrlPart;
		searchLink.addEventListener('click', (e)=> {loadOfficialTradeWebsite(e.target.url);});
		overrides['searchinfo'] = searchLink;

		var colorIndicator = document.createElement('div');
		if(searchInfo.color && searchInfo.color.length > 0)
		{
			colorIndicator.style.backgroundColor = searchInfo.color;
		}
		overrides['searchcolor'] = colorIndicator;
	}

	if(result.item)
	{
		if(result.item.influences)
		{
			var influences = Object.keys(result.item.influences);

			var influencePanel = document.createElement('span');
			for (var i = 0; i < influences.length; i++)
			{
				var influence = document.createElement('span');
				var infName = influences[i];
				var formatted = '';
				var infNamelist = infName.split(' ');
				for(var j = 0; j < infNamelist.length; j++)
				{
					var namePart = infNamelist[j];
					if(j > 0)
					{
						formatted += ' ';
					}
					formatted += namePart.charAt(0).toUpperCase() + namePart.substring(1);
				}
				influence.innerHTML = '{' + formatted + '}';
				influence.classList.add('inf-' + infName.trim().replace(' ','-'));
				influencePanel.appendChild(influence);
			}
			overrides['item.influences'] = influencePanel;
		}
		var resultItem = result.item;
		
		var timeInfo = document.createElement('div');
		timeInfo.createDate = new Date();
		timeInfo.classList.add('create-date');
		timeInfo.appendChild(document.createTextNode('A few seconds ago'));
		overrides['search-time'] = timeInfo;
		
		overrides['item.sockets'] = '';
		if(result.item.sockets)
		{
			var itemSockets = result.item.sockets;
			var socketPanel = document.createElement('span');
			socketPanel.classList.add('socket-panel');		
			
			var socketInfo = document.createElement('span');
			socketInfo.appendChild(document.createTextNode('( '));
			
			var totalSockets = document.createElement('span');
			var socketText = itemSockets.length + 'S';
			totalSockets.appendChild(document.createTextNode(socketText));
			totalSockets.classList.add('s-' + socketText);
			socketInfo.appendChild(totalSockets);
			
			socketInfo.appendChild(document.createTextNode(' / '));
			socketInfo.classList.add('data-value');
			socketPanel.appendChild(socketInfo);
			
			var currentSocketGroup = 0;
			var startSocketGroup = document.createElement('span');
			startSocketGroup.appendChild(document.createTextNode(' {'));

			var socketLink = document.createElement('span');
			socketLink.classList.add('socket-link');
			socketLink.appendChild(document.createTextNode('='));
			
			var endSocketGroup = document.createElement('span');
			endSocketGroup.appendChild(document.createTextNode('}'));
			socketPanel.appendChild(startSocketGroup.cloneNode(true));
			var isFirstInGroup = true;
			var maxLinks = 1;
			var linkCounter = 1;
			for(var s = 0; s < itemSockets.length; s++)
			{
				var itemSocket = itemSockets[s];
				var itemSocketGroup = itemSocket.group;

				if(itemSocketGroup != currentSocketGroup)
				{
					socketPanel.appendChild(endSocketGroup.cloneNode(true));
					socketPanel.appendChild(startSocketGroup.cloneNode(true));
					currentSocketGroup = itemSocketGroup;
					isFirstInGroup = true;
					linkCounter = 1;
				}
				if(linkCounter > maxLinks)
				{
					maxLinks = linkCounter;
				}
				
				if(isFirstInGroup)
				{
					isFirstInGroup = false;
				}
				else
				{
					socketPanel.appendChild(socketLink.cloneNode(true));					
				}
				var itemSocketColor = itemSocket.sColour;
				var socketNode = document.createElement('span');
				var socketCssClass = 'socket-' + itemSocketColor;
				socketNode.classList.add(socketCssClass);
				socketNode.appendChild(document.createTextNode(itemSocketColor));
				socketPanel.appendChild(socketNode);
				linkCounter++;
			}
			socketPanel.appendChild(endSocketGroup.cloneNode(true));

			
			var maxLinksBox = document.createElement('span');
			var linkText = maxLinks + 'L';
			maxLinksBox.appendChild(document.createTextNode(linkText));
			maxLinksBox.classList.add('l-' + linkText);
			socketInfo.appendChild(maxLinksBox);				
			socketInfo.appendChild(document.createTextNode(')'));
			overrides['item.sockets'] = socketPanel;		
		}
		if(result.item.scourgeMods)
		{
			overrides['item.scourgeMods'] = makeModList(getMods(result.item, 'scourge'), 'scourge');
		}
		if(result.item.implicitMods)
		{
			overrides['item.implicitMods'] = makeModList(getMods(result.item, 'implicit'), 'implicit');
		}
		if(result.item.fracturedMods)
		{				
			overrides['item.fracturedMods'] = makeModList(getMods(result.item, 'fractured'), 'fractured');
		}

		if(result.item.notableProperties)
		{
			var notables = result.item.notableProperties;
			var ul = document.createElement('ul');
			for(var i = 0; i < notables.length; i++)
			{
				var notable = notables[i];
				var li = document.createElement('li');
				var header = document.createElement('div');
				header.innerHTML = notable.name;
				header.classList.add('header');
				li.append(header);
				var values = notable.values;
				if(values)
				{
					var valueList = document.createElement('ul');
					for(var j = 0; j < values.length; j++)
					{
						var value = values[j];
						var vli = document.createElement('li');
						vli.innerHTML = value[0];
						valueList.append(vli);
					}
					li.append(valueList);
				}
				ul.append(li);
			}
			
			overrides['item.notableProperties'] = ul;
		}

		var modCountPanel = document.createElement('span');
		
		if(result.item.explicitMods)
		{
			var explicits = getMods(result.item, 'explicit');
			overrides['item.explicitMods'] = makeModList(explicits, 'explicit');	
			var prefixCount = document.createElement('span');
			prefixCount.classList.add('at-prefix');
			prefixCount.appendChild(document.createTextNode('' + explicits.prefixCount));
			var suffixCount = document.createElement('span');
			suffixCount.classList.add('at-suffix');
			suffixCount.appendChild(document.createTextNode('' + explicits.suffixCount));
			newNode.openPrefix = 0;
			newNode.openSuffix = 0;
			newNode.isCrafted = 0;
			if(explicits.prefixCount > 0 || explicits.suffixCount > 0)
			{
				modCountPanel.appendChild(prefixCount);
				modCountPanel.appendChild(suffixCount);
				
				var maxAffix = 3;
				if(result.item.typeLine)
				{
					if(result.item.typeLine.endsWith('Jewel'))
					{
						maxAffix = 2;
					}
				}
				var isMagicItem = false;
				if(result.item.frameType && result.item.frameType == 1)
				{
					maxAffix = 1;
				}				

				if(explicits.prefixCount < maxAffix)
				{
					newNode.openPrefix = 1;
				}

				if(explicits.suffixCount < maxAffix)
				{
					newNode.openSuffix = 1;
				}
			}
		}
		if(result.item.craftedMods)
		{
			newNode.isCrafted = 1;
			var mods = getMods(result.item, 'crafted');
			overrides['item.craftedMods'] = makeModList(mods, 'crafted');	
			var cCount = document.createElement('span');
			cCount.classList.add('crafted-mods');
			cCount.appendChild(document.createTextNode('C'));
			modCountPanel.appendChild(cCount);				
		}
		if(result.item.enchantMods)
		{
			overrides['item.enchantMods'] = makeModList(getMods(result.item, 'enchant'), 'enchant');		
		}
		if(result.item.veiledMods)
		{
			overrides['item.veiledMods'] = makeModList(getMods(result.item, 'veiled'), 'veiled');
		}

		overrides['item.modCount'] = modCountPanel;	
		if(result.item.properties)
		{
			for(var k = 0; k < result.item.properties.length; k++)
			{
				var property = result.item.properties[k];
				if(property != null && property.name)
				{
					var propertyName = property.name;
					var overrideKey = 'item.properties.' + propertyName;
					var propertyValues = '';
					if(property.values)
					{
						var propValues = property.values;
						propertyValues = outputPropertyValues(propValues);
					}
					overrides[overrideKey] = propertyValues;
				}
			}				
		}
		if(result.item.additionalProperties)
		{
			for(var k = 0; k < result.item.properties.length; k++)
			{
				var property = result.item.properties[k];
				if(property != null && property.name)
				{
					var propertyName = property.name;
					var overrideKey = 'item.additionalProperties.' + propertyName;
					var propertyValues = '';
					if(property.values)
					{
						var propValues = property.values;
						propertyValues = outputPropertyValues(propValues);
					}
					overrides[overrideKey] = propertyValues;
				}
			}				
		}
		overrides['requirements.label'] = '';
		if(result.item.requirements)
		{
			overrides['requirements.label'] = 'Requires';
			for(var k = 0; k < result.item.requirements.length; k++)
			{
				var property = result.item.requirements[k];
				if(property != null && property.name)
				{
					var propertyName = property.name;
					var overrideKey = 'item.requirements.' + propertyName;
					var propertyValues = '';
					if(property.values)
					{
						var propValues = property.values;
						propertyValues = outputPropertyValues(propValues);
					}
					overrides[overrideKey] = propertyValues;
				}
			}				
		}	
		if(result.item.additionalProperties)
		{
			for(var k = 0; k < result.item.additionalProperties.length; k++)
			{
				var property = result.item.additionalProperties[k];
				if(property != null && property.name)
				{
					var propertyName = property.name;
					var overrideKey = 'item.additionalProperties.' + propertyName;
					var propertyValues = '';
					if(property.values)
					{
						var propValues = property.values;
						propertyValues = outputPropertyValues(propValues);
					}
					overrides[overrideKey] = propertyValues;
				}
			}				
		}					

		if(result.item.corrupted)
		{
			overrides['item.corrupted'] = '(Corrupted)';
			newNode.classList.add('is-corrupted');					
		}
		
		if(result.item.duplicated)
		{
			overrides['item.mirrored'] = '(Mirrored)';	
			newNode.classList.add('is-mirrored');				
		}
	}
	var itemNamePlate = document.createElement('span');
	itemNamePlate.appendChild(document.createTextNode(result.item.name));
	overrides['item.name'] = itemNamePlate;
	if(result.item.verified)
	{
		newNode.classList.add('verified');
	}
	else
	{
		newNode.classList.add('not-verified');
	}
	var fields = newNode.querySelectorAll('.template-field');
	
	var refreshButton = document.createElement('div');
	refreshButton.classList.add('button');
	refreshButton.gggid = result.id;
	refreshButton.searchInfo = searchInfo.cloneNode(true);
	refreshButton.refreshTarget = newNode;
	refreshButton.title = 'Refresh';
	refreshButton.appendChild(document.createTextNode('Refresh'));
	refreshButton.onclick = function ()
	{
		var msg = this.gggid + ' ' + this.searchInfo.searchUrlPart;

		this.searchInfo.refreshTarget = this.refreshTarget;
		var itemUrl = 'https://www.pathofexile.com/api/trade/fetch/' + this.gggid;
		itemUrl += '?query=' + this.searchInfo.searchUrlPart;
		
		callAjax(itemUrl, refreshItem, this.searchInfo);
	}
	overrides['refresh-button'] = refreshButton;
	
	if(fields != null && fields.length > 0)
	{
		for(var fieldIndex = 0; fieldIndex < fields.length; fieldIndex++)
		{
			var field = fields[fieldIndex];
			var resultPath = field.getAttribute('tf');
			var aTmpResult = null;
			if(overrides[resultPath])
			{
				aTmpResult = overrides[resultPath];
			}
			else
			{
				aTmpResult = findValue(result,resultPath);
			}	
			if(aTmpResult != null && aTmpResult != '' && aTmpResult != 'null')
			{
				var defaultFields = field.querySelectorAll('.default-text'); 
				for(var p = 0; p < defaultFields.length; p++)
				{
					var defaultField = defaultFields[p];
					defaultField.parentNode.removeChild(defaultField);
				}					
				var dataTargets = field.querySelectorAll('.data-target'); 
				if(dataTargets != null  && dataTargets.length > 0)
				{
					for(var p = 0; p < dataTargets.length; p++)
					{
						var dataTarget = dataTargets[p];
						if(typeof aTmpResult === 'string' ||
								aTmpResult instanceof String ||
								typeof aTmpResult === 'number')
						{
							var textWrapper = document.createElement('span');
							textWrapper.appendChild(document.createTextNode(aTmpResult));							
							dataTarget.appendChild(textWrapper);
						}
						else
						{
							dataTarget.appendChild(aTmpResult.cloneNode(true));
						}
					}	
				}
				else
				{
					if(typeof aTmpResult === 'string' ||
							aTmpResult instanceof String ||
							typeof aTmpResult === 'number')
					{
						var textWrapper = document.createElement('span');
						textWrapper.appendChild(document.createTextNode(aTmpResult));
						
						field.appendChild(textWrapper);
					}
					else
					{
						field.appendChild(aTmpResult);
					}
				}
			}
			else
			{
				var presentFields = field.querySelectorAll('.if-present'); 
				for(var p = 0; p < presentFields.length; p++)
				{
					var presentField = presentFields[p];
					presentField.parentNode.removeChild(presentField);
				}									
			}				
		}
	}
	if(result.item.frameType)
	{
		var rarity = frameType[result.item.frameType];
		var rarityElements = newNode.querySelectorAll('.item-rarity');
		if(rarityElements != null)
		{
			for(var i = 0; i < rarityElements.length; i++)
			{
				rarityElements[i].classList.add('r-'+rarity);
			}
		}
	}
	var gggId = 'ggg-id-' + result.id;
	if(searchInfo.viewId == 'main-display-window')
	{
		var oldVersions = document.querySelectorAll('.' + gggId);
		for(var p = 0; p < oldVersions.length; p++)
		{
			oldVersions[p].classList.add('outdated');
		}
		/*
		newNode.classList.add('unviewed');
		newNode.onmouseover = function(event)
		{
			this.classList.remove('unviewed');
			this.onmouseover = null;
		}*/
	}
	
	newNode.allText = JSON.stringify(newNode).toLowerCase() + getTextFromNode(newNode).toLowerCase();
	filterItem(newNode);

	newNode.classList.add(gggId);
	var stats = new TrackedStats();
	stats.setTrackedStats(result);
	newNode.trackedStats = stats;
	
	return newNode;
}

function makeModList(compositeMods, affixListType)
{
	var modlist = '';
	var veiledHashes = [];
	if(compositeMods != null && compositeMods.length > 0)
	{
		var modlist = document.createElement('ul');
		for(var i = 0; i < compositeMods.length; i++)
		{
			var compositeMod = compositeMods[i];
			var li = document.createElement('li');
			var compositeModPanel = document.createElement('span');
			compositeModPanel.classList.add('composite-mod-panel');
			var compositeText = document.createElement('span');
			compositeText.classList.add('composite-display-text');
			var compositeModDisplayText = compositeMod.displayText;
			if(compositeModDisplayText)
			{
				var modCssClass = compositeModDisplayText.toLowerCase().trim();
				modCssClass = modCssClass.replace(/[^a-zA-Z]/gi, '_');
				modCssClass = modCssClass.replace(/_+/g,'-');
				if(modCssClass.startsWith('-'))
				{
					modCssClass = modCssClass.substring(1);
				}
				if(modCssClass.endsWith('-'))
				{
					modCssClass = modCssClass.substring(0,modCssClass.length-1);
				}
				
				compositeText.classList.add(modCssClass);
			}
			if(affixListType == 'veiled')
			{
				compositeModDisplayText = 'Veiled ' + compositeModDisplayText;
			}
			compositeText.appendChild(document.createTextNode(compositeModDisplayText));
			compositeModPanel.appendChild(compositeText);
			

			var detailModPanel = document.createElement('span');
			detailModPanel.classList.add('detail-mod-panel');			
			
			if(compositeMod.mods && compositeMod.mods.length && compositeMod.mods.length > 0)
			{
				var itemMods = compositeMod.mods;
				for(var j = 0; j < itemMods.length; j++)
				{
					var itemMod = itemMods[j];
					var modBox = document.createElement('span');
					if(itemMod.affixType != null  && itemMod.affixType.length > 0)
					{
						modBox.classList.add('at-' + itemMod.affixType);
					}
					if(itemMod.modTier != '' || itemMod.modName != ' ' || itemMod.modRangeString != null)
					{
						modBox.classList.add('mod-box');
						if(itemMod.modTier  != null && itemMod.modTier  != '')
						{
							var modTier = document.createElement('span');
							modTier.classList.add('mod-tier');							
							modTier.appendChild(document.createTextNode(' (' + itemMod.modTier + ') '));
							modBox.classList.add(itemMod.modTier);
							modBox.appendChild(modTier);
						}
						if(itemMod.modName  != null && itemMod.modName  != '')
						{
							var modName = document.createElement('span');
							modName.classList.add('mod-name');							
							if(itemMod.modName && influenceMods[itemMod.modName.trim()]){
								modName.classList.add(influenceMods[itemMod.modName.trim()]);
								modName.classList.add('influence-mod');
							}
							modName.appendChild(document.createTextNode(itemMod.modName));
							modBox.appendChild(modName);
						}
						if(itemMod.modRangeString  != null && itemMod.modRangeString  != '')
						{
							var modRange = document.createElement('span');
							modRange.classList.add('mod-range');
							modRange.appendChild(document.createTextNode(' ' + itemMod.modRangeString));
							modBox.appendChild(modRange);
						}
						detailModPanel.appendChild(modBox);
					}
				}
			}
			
			compositeModPanel.appendChild(detailModPanel);
			li.appendChild(compositeModPanel);
			modlist.appendChild(li);
		}
	}	
	
	return modlist;	
}

function findValue(object, objectPath)
{
	return findValueFromPath(object, objectPath);
}

function outputPropertyValues(propValues)
{
	var returnValue = '';
	var isFirst = true;
	for(var index = 0; index < propValues.length; index++)
	{
		var value = propValues[index];
		if(isFirst)
		{
			isFirst = !isFirst;
		}
		else
		{
			returnValue += ',';
		}
		if(value != null)
		{
			returnValue += value[0];
		}
	}
	returnValue += '';
	
	return returnValue;
}



function ItemMod(modName, modTier, modRangeString, modType)
{
	this.modName = modName;
	this.modTier = modTier;
	this.modRangeString = modRangeString;
	this.affixType = '';
	if(modTier != null)
	{
		if(modTier.startsWith('P'))
		{
			this.affixType ='prefix';
		}
		else if(modTier.startsWith('S'))
		{
			this.affixType ='suffix';
		}
		else if(modTier.startsWith('R'))
		{
			if(modType == 'veiled')
			{
				this.affixType ='veiled';
			}
			else
			{
				this.affixType ='crafted';
			}
		}
	}
}

function CompositeMod(modType, displayText)
{
	this.modType = modType;
	this.displayText = displayText;
	this.compositeModKey = '';
	this.mods = [];
	this.prefixCount = 0;
	this.suffixCount = 0;
}

function getMods(item, modType)
{
	var veiledHashes = [];
	var fullMods = [];

	var prefixCount = 0;
	var suffixCount = 0;
	
	if(item[modType + 'Mods'])
	{
		var basicModText = item[modType + 'Mods'];
		if(basicModText != null && basicModText.length && basicModText.length > 0)
		{
			var hashToMod = [];
			for(var i = 0; i < basicModText.length; i++)
			{
				var displayText = basicModText[i];
				fullMods.push(new CompositeMod(modType,displayText));
			}
			if(item.extended)
			{
				if(item.extended.hashes)
				{
					var hashes = item.extended.hashes;
					if(hashes[modType])
					{
						for(var i = 0; i < hashes[modType].length; i++)
						{	
							try
							{
								fullMods[i].compositeModKey = hashes[modType][i][0];
								hashToMod[fullMods[i].compositeModKey] = fullMods[i];
							}
							catch(error)
							{
								console.log("unknown extended error");
								console.log(item);
							}
							if (modType == "veiled")
							{
								veiledHashes.push(hashes[modType][i][0]);
							}
						}
					}
				}
				if(item.extended.mods)
				{
					if(item.extended.mods[modType])
					{
						var moreModInfoListing = item.extended.mods[modType];
						if(moreModInfoListing != null && moreModInfoListing.length > 0)
						{							
							for(var i = 0; i < moreModInfoListing.length; i++)
							{
								var moreModInfo = moreModInfoListing[i];
								var modName = moreModInfo.name;
								var modTier = moreModInfo.tier;
								if(modTier)
								{
									if(modTier.startsWith('P'))
									{
										prefixCount++;
									}
									else if(modTier.startsWith('S'))
									{
										suffixCount++;										
									}
								}
								
								if(moreModInfo.magnitudes)
								{
									var modMagnitudes = moreModInfo.magnitudes;
								    if(modMagnitudes != null && modMagnitudes.length > 0)
								    {
										var keyToCompositeMods = [];
										for(var v = 0; v < modMagnitudes.length; v++)
										{  
										    var modHashKey = modMagnitudes[v].hash;											
										    var modMin = modMagnitudes[v].min;
										    var modMax = modMagnitudes[v].max;
											if (modMax < 0)
											{
												var temp = modMin;
												modMin = -modMax;
												modMax = -temp;
											}											
										    var modRange = '';
										    if(modMin != modMax)
										    {
										        modRange = '('+ modMin + '-' + modMax + ')';										       
										    }
					 
										    if(modMin != 0 || modMax != 0)
										    {
										        var itemMod = keyToCompositeMods[modHashKey];
										       
										        if(itemMod == null)
										        {
										            var itemMod = new ItemMod(modName, modTier, modRange);
													try
													{
											            hashToMod[modHashKey].mods.push(itemMod);
										            }
													catch(err)
													{
														console.log("no mod for hash:"); 
														console.log(item);
													}
										            keyToCompositeMods[modHashKey] = itemMod;
										        }
										        else
										        {
										            if(modRange != '')
										            {
										                itemMod.modRangeString += ' - ' + modRange;
										            }
										        }  
										    }                                      
										}
									}
								}
								else if (modType == "veiled")
								{
									var modHashKey = veiledHashes[i]
									var modRange = '';
									var itemMod = new ItemMod(modName, modTier, modRange, modType);
									hashToMod[modHashKey].mods.push(itemMod);
								}
							}
						}
					}
				}
			}
		}			
	}

	fullMods.prefixCount = prefixCount;
	fullMods.suffixCount = suffixCount;
	
	return fullMods;
}

function scrollToTop()
{
	document.getElementById('main-display-window').scrollTo(0, 0);
}

function refreshItem(data, searchInfo) 
{
	var json = JSON.parse(data);
	var results = json.result;
	for(var i = 0; i < results.length; i++)
	{	
		var result = results[i];
		updateItem(result,searchInfo);
	}
}

function updateItem(result,searchInfo)
{
	var oldNode = searchInfo.refreshTarget;
	var viewId = searchInfo.viewId;
	var display = document.getElementById(viewId);
	var content = display.querySelector('.content-pane');
	display = content ? content : display;
	var refreshedItem = dView(result, searchInfo);
	var origCreateDate = oldNode.querySelector('.create-date');
	var refreshedCreateDate = refreshedItem.querySelector('.create-date');
	refreshedCreateDate.innerHTML = '';
	refreshedCreateDate.appendChild(document.createTextNode('Refreshing...'));
	refreshedCreateDate.createDate = origCreateDate.createDate;
	try{
		display.insertBefore(refreshedItem, oldNode);
	}
	catch(e){
		console.log(refreshedItem);
		console.log(e);
		display.append(refreshedItem);
	}
	if(lastItem == oldNode)
	{
		lastItem = refreshedItem;
	}		
	oldNode.remove();
	if(viewId == 'main-display-window')
	{
		allDisplayedItems.push(refreshedItem);
	}
}

function getTextFromNode(node)
{
	var text = '';
	if(node.children && node.children.size > 0)
	{
		var children = node.children;
		for(var i = 0; i < children.length; i++)
		{
			text += getTextFromNode(children[i]);
		}
	}
	if(node.textContent)
	{
		text += node.textContent.trim();
	}
	return text;
}

function buildCopyButton(buttonText, textToCopy, sendToPoe)
{
	var inputElement = document.createElement('input');
	inputElement.type = "button";
	inputElement.className = "button";
	inputElement.value = buttonText;
	if(sendToPoe)
	{
		inputElement.addEventListener('click', function(event)
		{
			copyTextToClipboard(textToCopy);
			sendClipboardTextToPoe();
			event.target.classList.add('copied');
		});
	}
	else
	{
		inputElement.addEventListener('click', function(event)
		{
			copyTextToClipboard(textToCopy);
			event.target.classList.add('copied');
		});
	}

	return inputElement;
}

function buildAccountLink(accountName)
{
	var panel = document.createElement('span');
	var inputElement = document.createElement('span');
	inputElement.classList.add('link');
	inputElement.appendChild(document.createTextNode(accountName));
	inputElement.accountName = accountName;
	inputElement.addEventListener('click', function(event)
	{
	    var url = 'https://www.pathofexile.com/account/view-profile/' + this.accountName;
	    openBrowserWindow(url);
	});
	
	panel.appendChild(document.createTextNode('Account: '));
	panel.appendChild(inputElement);
	
	return panel;
}

function buildWatchButton(itemId,searchInfo)
{
	var viewId = '';
	if(searchInfo != null)
	{
		viewId = searchInfo.viewId;
	}
	var inputElement = document.createElement('input');
	inputElement.type = 'button';
	inputElement.className = 'button';
	inputElement.itemId = itemId;
	if(viewId == 'watched-display-window')
	{
		inputElement.value = 'Stop Watching';
		inputElement.addEventListener('click', function(event)
		{
			watchedItemManager.removeItem(this.itemId);
		});
	}
	else
	{
		inputElement.value = 'Watch Item';
		inputElement.addEventListener('click', function(event)
		{
			watchedItemManager.addItem(this.itemId);
		});
	}

	return inputElement;
}