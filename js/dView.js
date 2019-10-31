function dView(result, searchInfo)
{
	var template = document.getElementById('item-template');
	var newNode = template.cloneNode(true);
	//console.log(result);
	var overrides = [];
	var icon = document.createElement('img');
	icon.src = result.item.icon;
	overrides['icon'] = icon;

	var whisperButtonText = 'Whisper';
	overrides['copy-item-button'] = buildCopyButton('Copy Item', atob(result.item.extended.text));
	overrides['listing.price.currency.img'] = '';
	overrides['listing.price.chaos.equiv'] = '';
	overrides['item.total-sum'] = '';
	overrides['item.sum-per-chaos'] = '';
    var chaosEquiv = null;
	if(result.listing.price)
	{
		var currencyType = result.listing.price.currency;
		if(currencyType)
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
	
	if(result.listing.account.name)
	{
		whisperButtonText += ' ' + result.listing.account.lastCharacterName;
		var profileLink = document.createElement('a');
		profileLink.href = 'https://www.pathofexile.com/account/view-profile/' + result.listing.account.name;
		profileLink.appendChild(document.createTextNode(result.listing.account.name));
		profileLink.target = '_blank';
		overrides['account-profile'] = profileLink;
	}
	overrides['whisper-button'] = buildCopyButton(whisperButtonText, result.listing.whisper);
	overrides['item.corrupted'] = '';
	overrides['item.mirrored'] = '';
	overrides['item.shaper'] = '';
	overrides['item.elder'] = '';
	overrides['search-comment'] = '';
	
	if(searchInfo != null)
	{
		overrides['search-comment'] = searchInfo.searchComment;
		var searchLink = document.createElement('a');
		var league = document.getElementById('league').value;
		searchLink.href = 'https://www.pathofexile.com/trade/search/' + league + '/' + searchInfo.searchUrlPart;
		var searchText = searchInfo.searchUrlPart;
		searchLink.appendChild(document.createTextNode(searchText));
		searchLink.target = '_blank';
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
		
		if(result.item.shaper)
		{
			overrides['item.shaped'] = '(Shaped)';
		}		
		if(result.item.elder)
		{
			overrides['item.elder'] = '(Elder)';
		}
		var resultItem = result.item;
		var itemKeys = Object.keys(resultItem);
		var itemKeyPanel = document.createElement('div');
		var keyTitle = document.createElement('div');
		keyTitle.appendChild(document.createTextNode('keys'));
		itemKeyPanel.appendChild(keyTitle);
		keyTitle.onclick = showHide;
		var itemKeyBody = document.createElement('div');
		
		var timeInfo = document.createElement('div');
		timeInfo.createDate = new Date();
		timeInfo.classList.add('create-date');
		timeInfo.appendChild(document.createTextNode('A few seconds ago'));
		overrides['search-time'] = timeInfo;

		itemKeyBody.classList.add('hidden');
		itemKeyPanel.appendChild(itemKeyBody);
		keyTitle.showHideTarget = itemKeyBody;
		var showHideTarget = showHideTarget;
		for (var keyIndex = 0; keyIndex < itemKeys.length; keyIndex++)
		{
			var ikey = itemKeys[keyIndex];
			var keyHeader = document.createElement('div');
			keyHeader.classList.add('key-header');
			keyHeader.appendChild(document.createTextNode(ikey));
			keyHeader.onclick = showHide;
			itemKeyBody.appendChild(keyHeader);

			var keyValue = document.createElement('div');
			keyValue.classList.add('key-value');
			keyValue.classList.add('hidden');
			keyValue.appendChild(document.createTextNode(JSON.stringify(resultItem[ikey])));
			itemKeyBody.appendChild(keyValue);
			keyHeader.showHideTarget = keyValue;
		}
		overrides['itemKeyPanel'] = itemKeyPanel;
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
		if(result.item.implicitMods)
		{
			overrides['item.implicitMods'] = makeModList(getMods(result.item, 'implicit'), 'implicit');
		}
		if(result.item.fracturedMods)
		{				
			overrides['item.fracturedMods'] = makeModList(getMods(result.item, 'fractured'), 'fractured');
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
		}
		
		if(result.item.duplicated)
		{
			overrides['item.mirrored'] = '(Mirrored)';					
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
	newNode.id = 'tmp-id';
	var fields = newNode.querySelectorAll('.template-field');
	newNode.id = '';
	
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
				aTmpResult = findValue(field, result,resultPath,0);
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
	var oldVersions = document.querySelectorAll('.' + gggId);
	for(var p = 0; p < oldVersions.length; p++)
	{
		oldVersions[p].classList.add('outdated');
	}
	
	newNode.allText = JSON.stringify(newNode).toLowerCase() + getTextFromNode(newNode).toLowerCase();
	filterItem(newNode);
	

	newNode.classList.add(gggId);
	newNode.classList.add('unviewed');
	newNode.onmouseover = function(event)
	{
		this.classList.remove('unviewed');
		this.onmouseover = null;
	}
	
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

function findValue(field, object, objectPath, depth)
{
	var objectValue = object;
	var objectParts = objectPath.split('.');
	if(objectParts != null && objectParts.length > 0)
	{
		for(var i = 0; i < objectParts.length; i++)
		{
			var varName = objectParts[i];
			if(objectValue != null)
			{
				objectValue = objectValue[varName];		

				if(typeof objectValue === 'undefined')
				{
					objectValue = '';
					break;
				}
			}
			else
			{
				objectValue = '';
				break;
			}
		}
	}
	return objectValue;
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
	document.getElementById('display-window').scrollTo(0, 0);
}

function refreshItem(data, searchInfo) 
{
	var json = JSON.parse(data);
	var display = document.getElementById('display-window');
	var results = json.result;
	var oldNode = searchInfo.refreshTarget;
	for(var resultIndex = 0; resultIndex < results.length; resultIndex++)
	{	
		var result = results[resultIndex];
		var refreshedItem = dView(result, searchInfo);

		var origCreateDate = oldNode.querySelector('.create-date');
		var refreshedCreateDate = refreshedItem.querySelector('.create-date');
		refreshedCreateDate.innerHTML = '';
		refreshedCreateDate.appendChild(document.createTextNode('Refreshing...'));
		refreshedCreateDate.createDate = origCreateDate.createDate;
		display.insertBefore(refreshedItem, oldNode);
		if(lastItem == oldNode)
		{
			lastItem = refreshedItem;
		}		
		oldNode.parentNode.removeChild(oldNode);
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