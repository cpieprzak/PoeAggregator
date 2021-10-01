class ItemModifier
{
    original;
    modParts;
    modType;
    modName;
    tier;
    isCrafted = false;

    constructor(line, modParts)
    {
        this.original = line;
        this.modType = lookupModType(line);
        line.includes('Master Crafted') ? this.isCrafted = true : '';
        if(this.isCrafted)
        {
            this.modName = line.includes('Suffix') ? 'of the Order' : 'Upgraded';
        }
        if(line.includes('(Tier: '))
        {
            const parts = line.split('(Tier: ');
            this.tier = parts[1].split(')')[0].trim();
            this.modName = parts[0] .replaceAll('{','')
                                    .replaceAll('Prefix','')
                                    .replaceAll('Suffix','')                                    
                                    .replaceAll('Modifier ','')                                  
                                    .replaceAll('"','').trim();
        }
        for (const modPart of modParts)
        {
            modPart.tier = this.tier;
        }
        this.modParts = modParts;
    }
}