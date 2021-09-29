class CopiedItem {   
    // constants 
    separator = '--------';
    itemLines = [];
    itemProperties = new Map();
    socketCount;
    linkedSockets;
    implicitMods = [];
    prefixMods = [];
    suffixMods = [];
    uniqueMods = [];
    enchantMods = [];
    influenceFilters = [];
    itemStats = new Map();
    isCorrupted = false;
    isWeapon = false;
    isArmour = false;
    itemType;
    rarity;
    isWatchstone;

    constructor(itemText)
    {
        this.itemLines = itemText.split('\n').map(line => line.trim());
        let tmpItemLines = [];
        for(let i = 0; i < this.itemLines.length; i++)
        {
            let line = this.itemLines[i];
            if(line.includes('You cannot use this item. Its stats will be ignored'))
            {
                i++;
            }
            else
            {
                tmpItemLines.push(line);
            }
        }
        this.itemLines = tmpItemLines;
        this.isCorrupted = this.itemLines.includes("Corrupted") ? true : false;
        this.itemName = this.itemLines[2];
        for(let i = 0; i < this.itemLines.length; i++)
        {
            let line = this.itemLines[i];
            if(line.includes('{') && line.includes('}'))
            {
                this.configurePropertyMetadata();
                let modType = lookupModType(line);
                let modParts = [];
                let nextLine = this.itemLines[i+1];
                while(nextLine && !nextLine.includes(this.separator) && !nextLine.includes('{'))
                {
                    let isModExplanation = nextLine.startsWith('(');
                    if(!isModExplanation)
                    {   
                        modParts.push(new ModPart(modType,nextLine,this));
                    }                    
                    i++;
                    nextLine = this.itemLines[i+1];
                }
                let modifier = new ItemModifier(line,modParts);
                switch (modifier.modType)
                {
                    case 'unique'   :   this.uniqueMods.push(modifier); break;
                    case 'implicit' :   this.implicitMods.push(modifier); break;
                    case 'prefix'   :   this.prefixMods.push(modifier); break;
                    case 'suffix'   :   this.suffixMods.push(modifier); break;
                    default : break;
                }
            }
            else if(line.includes(' (enchant)'))
            {
                this.enchantMods.push(new ItemModifier(line,[new ModPart('enchant',line,this)]));
            }
            else if(line.includes(': '))
            {
                let parts = line.split(': ').map(part => part.trim());
                let key = parts[0];
                let value = parts[1];
                if(key && value)
                {
                    this.itemProperties.set(key,value);
                }
            }
        }
        this.calculateItemType();
        this.configureItemStats();
        this.configureInfluenceFilters();
        console.log('Price checking: ',this);
    }

    configureInfluenceFilters()
    {
        for (const line of this.itemLines)
        {
            switch (line)
            {
                case 'Shaper Item' : this.influenceFilters.push(
                        new InfluenceFilter('pseudo.pseudo_has_shaper_influence', 'Shaper Influence'));
                    break;
                case 'Elder Item' : this.influenceFilters.push(
                        new InfluenceFilter('pseudo.pseudo_has_elder_influence', 'Elder Influence'));
                    break;                
                case 'Warlord Item' : this.influenceFilters.push(
                    new InfluenceFilter('pseudo.pseudo_has_warlord_influence', 'Warlord Influence'));
                    break;
                case 'Redeemer Item' : this.influenceFilters.push(
                        new InfluenceFilter('pseudo.pseudo_has_redeemer_influence', 'Redeemer Influence'));
                    break;
                case 'Hunter Item' : this.influenceFilters.push(
                        new InfluenceFilter('pseudo.pseudo_has_hunter_influence', 'Hunter Influence'));
                    break;                
                case 'Crusader Item' : this.influenceFilters.push(
                    new InfluenceFilter('pseudo.pseudo_has_crusader_influence', 'Crusader Influence'));
                    break;
            }
        }
    }

    calculateItemType()
    {
        this.rarity = this.itemProperties.get('Rarity');
        for (const line of this.itemLines)
        {
            if(line == this.separator)
            {
                break;
            }
            this.itemType = line;
        }
        if(this.itemType)
        {
            this.itemType = this.itemType.replace('Superior ','');
        }
        if(this.rarity === 'Gem')
        {
            let inFirstBlock = false;
            for (const line of this.itemLines)
            {
                if(line == this.separator)
                {
                    inFirstBlock = true;
                }
                if(inFirstBlock  && line.includes('Level: '))
                {
                    let value = line.replace('Level: ','');
                    this.itemProperties.set('Gem Level',value);
                    break;
                }
            }
        }
        
        this.isWatchstone = this.itemType.includes('Watchstone');
        if(this.rarity === 'Magic')
        {
            let mods = [].concat(this.prefixMods).concat(this.suffixMods);
            for(const mod of mods)
            {
                this.itemType = this.itemType.replaceAll(mod.modName,'').trim();
            }
        }
        this.itemType = this.itemType.replaceAll('Synthesised ','').trim();
    }

    configurePropertyMetadata()
    {
        this.isWeapon = this.itemProperties.get('Attacks per Second') != null;
        this.isArmour = this.itemProperties.get('Energy Shield') != null ||
                        this.itemProperties.get('Armour') != null ||
                        this.itemProperties.get('Evasion Rating') != null ||
                        this.itemProperties.get('Ward') != null;
        let sockets = this.itemProperties.get('Sockets');
        if(sockets)
        {
            this.linkedSockets = 0;
            let socketGroups = sockets.split(' ');
            socketGroups.forEach(socketGroup => {
                let innerLinkCount = (socketGroup.match(/-/g) || []).length + 1;
                this.linkedSockets = innerLinkCount > this.linkedSockets ? innerLinkCount : this.linkedSockets;
            });
            this.socketCount = socketGroups.length + sockets.split('-').length - 1;
        }                                       
    }

    configureItemStats()
    {
        let modGroups = [];
        modGroups.push(this.enchantMods); 
        modGroups.push(this.implicitMods);
        modGroups.push(this.prefixMods);
        modGroups.push(this.suffixMods);
        modGroups.push(this.uniqueMods);       
        
        for(const modGroup of modGroups)
        {
            for(const mod of modGroup)
            {
                for(const modPart of mod.modParts)
                {
                    let itemStat = new ItemStat(modPart);
                    let storedItemStat = this.itemStats.get(itemStat.name);
                    if(storedItemStat) itemStat.combineWith(storedItemStat);
                    this.itemStats.set(itemStat.name, itemStat);
                }
            }
        }
    }

    static copiedItemToElement(copiedItem)
    {
        let element = document.createElement('div');
        for(let i = 0; i < copiedItem.itemLines.length; i++)
        {
            let line = copiedItem.itemLines[i];
            let div = document.createElement('div');
            div.innerHTML = line;
            element.append(div);
        }
        return element;
    }
}

class InfluenceFilter
{
    id;
    displayName;
    constructor(id,displayName)
    {
        this.id = id;
        this.displayName = displayName;
    }
}