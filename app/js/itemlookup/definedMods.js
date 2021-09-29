const ignoredMods = [];
ignoredMods.push('increased-stun-and-block-recovery');
ignoredMods.push('to-armour');
ignoredMods.push('to-maximum-energy-shield');
ignoredMods.push('to-evasion-rating');
ignoredMods.push('regenerate-life-per-second');
ignoredMods.push('increased-light-radius');
ignoredMods.push('life-gained-on-kill');
ignoredMods.push('mana-gained-on-kill');
ignoredMods.push('chance-to-cause-bleeding-on-hit');
ignoredMods.push('increased-damage-per-power-charge');
ignoredMods.push('of-physical-attack-damage-leeched-as-life');
ignoredMods.push('of-physical-attack-damage-leeched-as-mana');

const totalElementalResistMods = new Map();
totalElementalResistMods.set('to-cold-resistance',1);
totalElementalResistMods.set('to-fire-resistance',1);
totalElementalResistMods.set('to-lightning-resistance',1);
totalElementalResistMods.set('to-all-elemental-resistances',3);
totalElementalResistMods.set('to-fire-and-cold-resistances',2);
totalElementalResistMods.set('to-fire-and-lightning-resistances',2);
totalElementalResistMods.set('to-cold-and-lightning-resistances',2);
totalElementalResistMods.set('to-cold-and-chaos-resistances',1);
totalElementalResistMods.set('to-fire-and-chaos-resistances',1);
totalElementalResistMods.set('to-lightning-and-chaos-resistances',1);

const itemClassLookUp = new Map();

// Armour
itemClassLookUp.set('Any Armour','armour');
itemClassLookUp.set('Body Armours','armour.chest');
itemClassLookUp.set('Boots','armour.boots');
itemClassLookUp.set('Gloves','armour.gloves');
itemClassLookUp.set('Helmets','armour.helmet');
itemClassLookUp.set('Shields','armour.shield');
itemClassLookUp.set('Quivers','armour.quiver');
itemClassLookUp.set('Quivers','armour.quiver');
itemClassLookUp.set('Any Accessory','accessory');
itemClassLookUp.set('Amulets','accessory.amulet');
itemClassLookUp.set('Belts','accessory.belt');
itemClassLookUp.set('Rings','accessory.ring');

// Weapons
itemClassLookUp.set('Any Weapon','weapon');
itemClassLookUp.set('One-Handed Weapon','weapon.one');
itemClassLookUp.set('One-Handed Melee Weapon','weapon.onemelee');
itemClassLookUp.set('Two-Handed Melee Weapon','weapon.twomelee');
itemClassLookUp.set('Bows','weapon.bow');
itemClassLookUp.set('Claws','weapon.claw');
itemClassLookUp.set('Daggers','weapon.dagger');
itemClassLookUp.set('Base Daggers','weapon.basedagger');
itemClassLookUp.set('Rune Daggers','weapon.runedagger');
itemClassLookUp.set('One Hand Axes','weapon.oneaxe');
itemClassLookUp.set('One Hand Maces','weapon.onemace');
itemClassLookUp.set('One Hand Swords','weapon.onesword');
itemClassLookUp.set('Sceptres','weapon.sceptre');
itemClassLookUp.set('Any Staff','weapon.staff');
itemClassLookUp.set('Staves','weapon.staff');
itemClassLookUp.set('Warstaves','weapon.warstaff');
itemClassLookUp.set('Two Hand Axes','weapon.twoaxe');
itemClassLookUp.set('Two Hand Maces','weapon.twomace');
itemClassLookUp.set('Two Hand Swords','weapon.twosword');
itemClassLookUp.set('Wands','weapon.wand');
itemClassLookUp.set('Rods','weapon.rod');

// Gem
itemClassLookUp.set('Any Gem','gem');
itemClassLookUp.set('Active Skill Gems','gem.activegem');
itemClassLookUp.set('Support Skill Gems','gem.supportgem');
itemClassLookUp.set('Awakened Support Skill Gems','gem.supportgemplus');

// Jewel
itemClassLookUp.set('Any Jewel','jewel');
itemClassLookUp.set('Jewels','jewel.base');
itemClassLookUp.set('Cluster Jewel','jewel.cluster');

// Flask
itemClassLookUp.set('Flasks','flask');

// Map
itemClassLookUp.set('Maps','map');
itemClassLookUp.set('Map Fragments','map.fragment');
itemClassLookUp.set('Misc Map Items','map.invitation');
itemClassLookUp.set('Scarabs','map.scarab');
itemClassLookUp.set('Atlas Region Upgrade Items','watchstone');

// Misc
itemClassLookUp.set('Prophecy','prophecy');
itemClassLookUp.set('Divination Cards','card');
itemClassLookUp.set('Captured Beast','monster.beast');
itemClassLookUp.set('Metamorph Samples','monster.sample');
itemClassLookUp.set('Expedition Logbooks','logbook');
itemClassLookUp.set('Stackable Currency','currency');

// Delve
itemClassLookUp.set('Fossil','currency.resonator');
itemClassLookUp.set('Resonator','currency.fossil');

// Heist
itemClassLookUp.set('Contracts','heistmission.contract');
itemClassLookUp.set('Blueprints','heistmission.blueprint');
