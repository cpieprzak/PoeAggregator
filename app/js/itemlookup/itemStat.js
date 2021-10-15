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
                text: '(Pseudo) +#% total Elemental Resistance'
            };
        }
    }
}

function combineItemStats(stat1, stat2)
{
    if(!stat1 && !stat2) return null;
    if(!stat1) return stat2;
    if(!stat2) return stat1;

    let combined = stat2;

    combined.value = stat2.value ? (stat1.value + stat2.value) : stat1.value;
    if(stat1.value)
    {
        if(combined.bestTier == null)
        {
            combined.bestTier = stat1.bestTier;
        }
        else if (stat1.bestTier != null)
        {
            combined.bestTier = combined.bestTier < stat1.bestTier ? combined.bestTier : stat1.bestTier;
        }
    }

    return combined;
}