class ItemStat
{
    name;
    value; 
    filter;
    modPart;
    bestTier;
    isEnchant;
    isImplicit;
    constructor(modPart)
    {
        let tier = modPart.tier;
        if(tier)
        {
            this.bestTier = parseInt(tier);
        }
        this.isEnchant = modPart.isEnchant;
        this.isImplicit = modPart.isImplicit;
        this.modPart = modPart;
        this.name = modPart.statName;
        this.value = modPart.hasOptions ? modPart.value : modPart.value ? parseFloat(modPart.value) : null;
        this.filter = modPart.searchFilter;
        
        let resistMultiplier = totalElementalResistMods.get(modPart.statName);
        if(resistMultiplier)
        {
            this.name = 'to-elemental-resistances';
            this.value = this.value * resistMultiplier;
            this.filter =  {
                id: 'pseudo.pseudo_total_elemental_resistance',
                text: '+#% total Elemental Resistance'
            };
        }
    }
    combineWith(itemStat)
    {
        if(itemStat)
        {
            this.value = this.value ? (itemStat.value + this.value) : itemStat.value;
            if(itemStat.value)
            {
                if(this.bestTier == null)
                {
                    this.bestTier = itemStat.bestTier;
                }
                else if (itemStat.bestTier != null)
                {
                    this.bestTier = this.bestTier < itemStat.bestTier ? this.bestTier : itemStat.bestTier;
                }
            }
        }
        return this;
    }
}