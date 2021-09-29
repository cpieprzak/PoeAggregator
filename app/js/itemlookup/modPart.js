class ModPart
{
    value;
    original;
    statName;
    hasRange = false;
    hasOptions = false;
    isCrafted;
    isEnchant;
    isImplicit;
    isFractured;
    searchFilter;
    tier;

    constructor(modType,text,copiedItem)
    {
        this.hasRange = text.includes('(') && text.includes('-') && text.includes(')');
        this.original = text;
        this.isCrafted = text.includes('(crafted)');
        this.isFractured = text.includes('(fractured)');
        this.isEnchant = text.includes('(enchant)');
        this.isImplicit = text.includes('(implicit)');
        text = text .replace(' (crafted)','')
                    .replace(' (enchant)','')
                    .replace(' (fractured)','')
                    .replace(' (implicit)','')
                    .replace(' — Unscalable Value','');
        let filterType = 'implicit' == modType ? 'implicit' : 'explicit';
        this.statName = simplifyMod(text);
        let filters = null;
        if(copiedItem.isWeapon)
        {
            filters = weaponFilters.get(`${this.statName}-local`);
        }
        else if(copiedItem.isArmour)
        {
            filters = armourFilters.get(`${this.statName}-local`);
        }
        
        filters = filters == null ? searchFilters.get(this.statName) : filters;
        filters = filters == null ? [] : filters;
        
							if(this.statName.includes('ccupi')){
                                console.log(this.statName,filters);
                            }
        
        for (const filter of filters)
        {
            //console.log(filter);
            if(filter.type == 'enchant' && this.isEnchant)
            {
                this.searchFilter = filter;
                break;
            }
            else if(filter.type == 'fractured' && this.isFractured)
            {
                this.searchFilter = filter;
                break;
            }
            else if(filter.type == 'crafted' && this.isCrafted)
            {
                this.searchFilter = filter;
                break;
            }
            else if(filter.type == 'pseudo')
            {
                this.searchFilter = filter;
            }
            else if(filter.type == filterType && !this.searchFilter)
            {
                this.searchFilter = filter;
            }
        }

        if(this.hasRange)
        {
            this.value = this.parse(text);
        }
        else
        {
            let numbers = numbersFromString(text);
            this.value = numbers && numbers.length == 1 ? parseFloat(numbers[0]).toFixed(3) : null; 
        }
        
        if(this.searchFilter && this.searchFilter.value && this.searchFilter.value.option)
        {
            this.value = this.searchFilter.value;
            this.hasRange = false;
            this.hasOptions = true;
        }
    }

    parse(text) {
        let parts = text.split('(');
        let count = 0;
        let tmpValue = 0;
        for(let i = 0; i < parts.length - 1; i++)
        {
            let part = parts[i];
            if(part.includes(' '))
            {
                let spaceSplit = part.split(' ');
                part = spaceSplit[spaceSplit.length - 1];
            }
            let parsed = parseFloat(part.trim());
            if(parsed)
            {
                tmpValue += parsed;
                count++;
            }
        }
        
        return (tmpValue / count).toFixed(3);
    }
}