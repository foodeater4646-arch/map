/**
 * npcGenerator.js — Procedural NPC Generation
 *
 * Generates fantasy NPCs with names, races, jobs, personalities,
 * appearance, ability scores, and daily routines.
 */

// ── Name Parts ──────────────────────────────────────────────────
const FIRST_NAMES_MALE = [
    'Throlvi', 'Galedor', 'Fromrun', 'Gromlind', 'Barin', 'Aldric',
    'Fenwick', 'Haerxruaz', 'Thandril', 'Orik', 'Voss', 'Caelum',
    'Draven', 'Elden', 'Faelan', 'Garrick', 'Hadwin', 'Ivor',
    'Jormund', 'Kael', 'Leoric', 'Maldric', 'Norven', 'Osric',
    'Pellin', 'Quillan', 'Roderic', 'Soren', 'Theron', 'Ulric',
];

const FIRST_NAMES_FEMALE = [
    'Majurixenor', 'Burlia', 'Atyre', 'Feanedeth', 'Liradwe',
    'Aelindra', 'Brielle', 'Calista', 'Daenya', 'Eirlys',
    'Fiora', 'Gwenith', 'Helaine', 'Isolde', 'Jynara',
    'Kiralyn', 'Lysara', 'Miriel', 'Nalora', 'Oriana',
    'Perenna', 'Roswyn', 'Seraphine', 'Thessaly', 'Ulara',
    'Velindra', 'Wynessa', 'Ysolde', 'Zephyrine', 'Aranwen',
];

const LAST_NAMES = [
    'Heavyseam', 'Zincmight', 'Quickdust', 'Alzarin', 'Eytherdlues',
    'Maernanea', 'Maernvirrea', 'Gemshovel', 'Ironforge', 'Stoneward',
    'Brighthollow', 'Ashfall', 'Duskwalker', 'Frostmantle', 'Goldvein',
    'Hawkridge', 'Kettleblack', 'Longstride', 'Moonwhisper', 'Nightvale',
    'Oakenshield', 'Pinebrook', 'Ravensong', 'Silverbrook', 'Thornwall',
    'Underhill', 'Valorcrest', 'Windhollow', 'Yewbark', 'Copperleaf',
];

const RACES = [
    { name: 'Human', weight: 40 },
    { name: 'Dwarf', weight: 15 },
    { name: 'Elf', weight: 12 },
    { name: 'Half-Elf', weight: 10 },
    { name: 'Halfling', weight: 10 },
    { name: 'Gnome', weight: 5 },
    { name: 'Half-Orc', weight: 5 },
    { name: 'Tiefling', weight: 3 },
];

const JOBS = [
    'Bartender', 'Blacksmith', 'Merchant', 'Guard', 'Farmer',
    'Baker', 'Tailor', 'Cook', 'Locksmith', 'Carpenter',
    'Alchemist', 'Herbalist', 'Bard', 'Scholar', 'Priest',
    'Hunter', 'Fisher', 'Jeweler', 'Scribe', 'Tanner',
    'Mason', 'Brewer', 'Stable Hand', 'Sailor', 'Miner',
    'Apothecary', 'Enchanter', 'Cartographer', 'Innkeeper', 'Courier',
];

const PERSONALITY_TRAITS = [
    'introverted', 'extroverted', 'friendly', 'suspicious', 'generous',
    'greedy', 'brave', 'cautious', 'creative', 'methodical',
    'optimistic', 'pessimistic', 'loyal', 'independent', 'humble',
    'proud', 'patient', 'impulsive', 'witty', 'stoic',
    'compassionate', 'cold', 'curious', 'traditionalist', 'adventurous',
];

const GOALS = [
    'to amass a fortune', 'to find true love', 'to avenge a fallen friend',
    'to have fun', 'to discover ancient knowledge', 'to protect the settlement',
    'to become the best at their craft', 'to retire peacefully',
    'to explore the world', 'to start a family', 'to gain political power',
    'to uncover a conspiracy', 'to find a legendary artifact',
    'to build a lasting legacy', 'to repay a debt',
];

const HAIR_COLORS = ['black', 'brown', 'auburn', 'blonde', 'red', 'grey', 'white', 'platinum'];
const HAIR_STYLES = ['cropped, curly', 'long, straight', 'short, wavy', 'braided', 'shaved', 'messy, unkempt', 'tied back'];
const EYE_COLORS = ['brown', 'blue', 'green', 'hazel', 'grey', 'amber', 'violet'];
const SKIN_TONES = ['pale', 'fair', 'light bronze', 'tanned', 'olive', 'brown', 'dark brown', 'ebony'];
const BUILDS = ['slight', 'average', 'athletic', 'stocky', 'large', 'muscular', 'lean', 'heavyset'];

const BUILDING_TYPES = [
    { type: 'Inn', icon: '🍺', rooms: ['Bar', 'Kitchen', 'Common Room', 'Private Room', 'Office'] },
    { type: 'Shop', icon: '🛒', rooms: ['Storefront', 'Back Room', 'Storage'] },
    { type: 'Temple', icon: '⛪', rooms: ['Nave', 'Altar Room', 'Study', 'Living Quarters'] },
    { type: 'Blacksmith', icon: '⚒️', rooms: ['Forge', 'Showroom', 'Storage'] },
    { type: 'Residence', icon: '🏠', rooms: ['Living Room', 'Kitchen', 'Bedroom', 'Master Bedroom'] },
    { type: 'Market', icon: '🏪', rooms: ['Stall Area', 'Storage'] },
    { type: 'Barracks', icon: '🛡️', rooms: ['Armory', 'Bunk Room', 'Training Yard', 'Office'] },
    { type: 'Library', icon: '📚', rooms: ['Reading Hall', 'Archives', 'Study', 'Curator Office'] },
    { type: 'Tavern', icon: '🍻', rooms: ['Main Hall', 'Kitchen', 'Cellar', 'Private Booth'] },
    { type: 'Guild Hall', icon: '⚔️', rooms: ['Meeting Hall', 'Treasury', 'Training Room', 'Office'] },
];

const BUILDING_NAME_PREFIXES = [
    'The', 'Old', 'Golden', 'Silver', 'Iron', 'Red', 'Blue', 'Green',
    'Black', 'White', 'Royal', 'Lucky', 'Rusty', 'Grand', 'Noble',
];

const BUILDING_NAME_SUFFIXES_INN = [
    'Mage and Imp', 'Dragon\'s Rest', 'Sleeping Giant', 'Wanderer\'s Haven',
    'Gilded Goblet', 'Roaring Hearth', 'Silver Stag', 'Broken Compass',
    'Crimson Lantern', 'Drunken Dwarf', 'Emerald Chalice', 'Laughing Fox',
];

const BUILDING_NAME_SUFFIXES_SHOP = [
    'Emporium', 'Trading Post', 'Goods & Wares', 'Curiosities',
    'Fine Crafts', 'Supply Co.', 'Provisions', 'Sundries',
];

const DISTRICT_NAMES = [
    'Market District', 'Temple District', 'Slums', 'Noble Quarter',
    'Artisan Ward', 'Harbor District', 'Military Ward', 'Gate District',
    'Old Town', 'Foreign Quarter'
];

const DISTRICT_COLORS = [
    'rgba(239, 68, 68, 0.4)',   // Red
    'rgba(59, 130, 246, 0.4)',  // Blue
    'rgba(16, 185, 129, 0.4)',  // Green
    'rgba(245, 158, 11, 0.4)',  // Yellow
    'rgba(139, 92, 246, 0.4)',  // Purple
    'rgba(236, 72, 153, 0.4)',  // Pink
    'rgba(20, 184, 166, 0.4)',  // Teal
    'rgba(249, 115, 22, 0.4)',  // Orange
];

const FACTIONS_TEMPLATES = [
    { type: 'Thieves Guild', roles: ['Guildmaster', 'Footpad', 'Smuggler', 'Fence'] },
    { type: 'Mages Circle', roles: ['Archmage', 'Scholar', 'Apprentice'] },
    { type: 'Merchant Consortium', roles: ['Trade Baron', 'Merchant', 'Guard'] },
    { type: 'City Watch', roles: ['Captain', 'Sergeant', 'Guard'] },
    { type: 'Cult', roles: ['High Priest', 'Acolyte', 'Zealot'] },
    { type: 'Fighters Guild', roles: ['Guildmaster', 'Mercenary', 'Brawler'] },
    { type: 'Assassins Brotherhood', roles: ['Grandmaster', 'Assassin', 'Informant'] },
];

// ── Shop Economy Data ───────────────────────────────────────────
const SHOP_ITEMS = {
    'Shop': [
        { name: 'Healing Potion', category: 'Potions', basePrice: 50, rarity: 'common' },
        { name: 'Rope (50 ft)', category: 'Adventuring Gear', basePrice: 1, rarity: 'common' },
        { name: 'Torch (10)', category: 'Adventuring Gear', basePrice: 1, rarity: 'common' },
        { name: 'Rations (1 day)', category: 'Food', basePrice: 0.5, rarity: 'common' },
        { name: 'Backpack', category: 'Adventuring Gear', basePrice: 2, rarity: 'common' },
        { name: 'Bedroll', category: 'Adventuring Gear', basePrice: 1, rarity: 'common' },
        { name: 'Tinderbox', category: 'Adventuring Gear', basePrice: 0.5, rarity: 'common' },
        { name: 'Waterskin', category: 'Adventuring Gear', basePrice: 0.2, rarity: 'common' },
        { name: 'Scroll of Identify', category: 'Scrolls', basePrice: 25, rarity: 'uncommon' },
        { name: 'Antitoxin', category: 'Potions', basePrice: 50, rarity: 'uncommon' },
        { name: 'Potion of Greater Healing', category: 'Potions', basePrice: 150, rarity: 'rare' },
        { name: 'Bag of Holding', category: 'Wondrous Items', basePrice: 500, rarity: 'rare' },
    ],
    'Market': [
        { name: 'Flour (5 lbs)', category: 'Food', basePrice: 0.02, rarity: 'common' },
        { name: 'Salt (1 lb)', category: 'Food', basePrice: 0.05, rarity: 'common' },
        { name: 'Ale (gallon)', category: 'Drink', basePrice: 0.2, rarity: 'common' },
        { name: 'Fine Wine', category: 'Drink', basePrice: 10, rarity: 'uncommon' },
        { name: 'Silk Cloth (1 yd)', category: 'Textiles', basePrice: 10, rarity: 'uncommon' },
        { name: 'Linen Cloth (1 yd)', category: 'Textiles', basePrice: 1, rarity: 'common' },
        { name: 'Spices (exotic)', category: 'Food', basePrice: 15, rarity: 'uncommon' },
        { name: 'Gems (assorted)', category: 'Valuables', basePrice: 100, rarity: 'rare' },
    ],
    'Blacksmith': [
        { name: 'Longsword', category: 'Weapons', basePrice: 15, rarity: 'common' },
        { name: 'Shortsword', category: 'Weapons', basePrice: 10, rarity: 'common' },
        { name: 'Dagger', category: 'Weapons', basePrice: 2, rarity: 'common' },
        { name: 'Battleaxe', category: 'Weapons', basePrice: 10, rarity: 'common' },
        { name: 'Shield', category: 'Armor', basePrice: 10, rarity: 'common' },
        { name: 'Chain Mail', category: 'Armor', basePrice: 75, rarity: 'uncommon' },
        { name: 'Plate Armor', category: 'Armor', basePrice: 1500, rarity: 'rare' },
        { name: 'Arrows (20)', category: 'Ammunition', basePrice: 1, rarity: 'common' },
        { name: 'Silvered Weapon', category: 'Weapons', basePrice: 200, rarity: 'rare' },
    ],
};

const RARITY_MULTIPLIERS = { common: 1, uncommon: 1.5, rare: 2.5 };

// ── Utility Functions ───────────────────────────────────────────

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function pickWeighted(items) {
    const total = items.reduce((sum, i) => sum + i.weight, 0);
    let r = Math.random() * total;
    for (const item of items) {
        r -= item.weight;
        if (r <= 0) return item.name;
    }
    return items[0].name;
}

function rollStat() {
    // 4d6 drop lowest
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    rolls.sort((a, b) => a - b);
    return rolls[1] + rolls[2] + rolls[3];
}

function getModifier(score) {
    return Math.floor((score - 10) / 2);
}

function formatMod(mod) {
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

// ── Main Generator ──────────────────────────────────────────────

let nextNpcId = 1;

export function generateNPC(options = {}) {
    const gender = options.gender || (Math.random() > 0.5 ? 'Male' : 'Female');
    const firstName = pick(gender === 'Male' ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE);
    const lastName = pick(LAST_NAMES);
    const race = options.race || pickWeighted(RACES);
    const job = options.job || pick(JOBS);
    const age = Math.floor(Math.random() * 60) + 18;

    // Personality
    const traits = [];
    while (traits.length < 3) {
        const t = pick(PERSONALITY_TRAITS);
        if (!traits.includes(t)) traits.push(t);
    }

    // Appearance
    const appearance = {
        hair: `${pick(HAIR_STYLES)} ${pick(HAIR_COLORS)} hair`,
        eyes: `${pick(EYE_COLORS)} eyes`,
        skin: `${pick(SKIN_TONES)} skin`,
        build: pick(BUILDS),
        height: `${Math.floor(Math.random() * 30) + 150} cm`,
    };

    // Ability Scores
    const str = rollStat(), dex = rollStat(), con = rollStat();
    const int = rollStat(), wis = rollStat(), cha = rollStat();

    const abilityScores = {
        Strength: { score: str, mod: formatMod(getModifier(str)) },
        Dexterity: { score: dex, mod: formatMod(getModifier(dex)) },
        Constitution: { score: con, mod: formatMod(getModifier(con)) },
        Intelligence: { score: int, mod: formatMod(getModifier(int)) },
        Wisdom: { score: wis, mod: formatMod(getModifier(wis)) },
        Charisma: { score: cha, mod: formatMod(getModifier(cha)) },
    };

    const goal = pick(GOALS);

    // Daily Routine (hour-based)
    const routine = generateRoutine(job);

    return {
        id: nextNpcId++,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        gender,
        race,
        age,
        job,
        traits,
        appearance,
        abilityScores,
        goal,
        routine,
        notes: '',
        status: 'Idle',
        currentLocation: null,
        factionId: null,      // Added for factions
        factionRole: null,    // Added for factions
        relationships: [],    // Added for Network Graph
    };
}

function generateRoutine(job) {
    // Returns an object mapping hour (0-23) to { activity, locationType }
    const routine = {};
    for (let h = 0; h < 24; h++) {
        if (h >= 0 && h < 6) {
            routine[h] = { activity: 'Sleeping', locationPreference: 'home' };
        } else if (h >= 6 && h < 7) {
            routine[h] = { activity: 'Waking up', locationPreference: 'home' };
        } else if (h >= 7 && h < 8) {
            routine[h] = { activity: 'Eating breakfast', locationPreference: 'home' };
        } else if (h >= 8 && h < 12) {
            routine[h] = { activity: 'Working', locationPreference: 'work' };
        } else if (h >= 12 && h < 13) {
            routine[h] = { activity: 'Eating lunch', locationPreference: 'tavern' };
        } else if (h >= 13 && h < 17) {
            routine[h] = { activity: 'Working', locationPreference: 'work' };
        } else if (h >= 17 && h < 18) {
            routine[h] = { activity: 'Finishing work', locationPreference: 'work' };
        } else if (h >= 18 && h < 20) {
            routine[h] = { activity: 'Relaxing', locationPreference: 'tavern' };
        } else if (h >= 20 && h < 22) {
            routine[h] = { activity: 'Socializing', locationPreference: 'tavern' };
        } else {
            routine[h] = { activity: 'Sleeping', locationPreference: 'home' };
        }
    }
    return routine;
}

// ── Building Generator ──────────────────────────────────────────

let nextBuildingId = 1;

export function generateBuilding(options = {}) {
    const template = options.template || pick(BUILDING_TYPES);
    const prefix = pick(BUILDING_NAME_PREFIXES);

    let suffix;
    if (template.type === 'Inn' || template.type === 'Tavern') {
        suffix = pick(BUILDING_NAME_SUFFIXES_INN);
    } else if (template.type === 'Shop' || template.type === 'Market') {
        suffix = pick(BUILDING_NAME_SUFFIXES_SHOP);
    } else {
        suffix = `${pick(LAST_NAMES)} ${template.type}`;
    }

    const name = options.name || `${prefix} ${suffix}`;

    return {
        id: nextBuildingId++,
        name,
        type: template.type,
        icon: template.icon,
        rooms: template.rooms.map(r => ({ name: r, occupants: [] })),
        isOpen: true,
        notes: '',
        mapPosition: options.mapPosition || null,
        districtId: null,     // Added for districts
    };
}

// ── Settlement Generator ────────────────────────────────────────

let nextSettlementId = 1;

export function generateSettlement(nameOrSettings, size = 'small') {
    // Accept either a string name or a full settings object
    let settings;
    if (typeof nameOrSettings === 'string') {
        settings = { name: nameOrSettings, size };
    } else {
        settings = nameOrSettings;
    }

    const sizeConfig = {
        small: { buildings: 8, npcs: 15 },
        medium: { buildings: 15, npcs: 30 },
        large: { buildings: 25, npcs: 50 },
        metropolis: { buildings: 80, npcs: 200 },
        'mega-city': { buildings: 200, npcs: 500 },
    };

    const config = sizeConfig[settings.size] || sizeConfig.small;

    // Build race weights from settings
    const raceWeights = settings.races
        ? settings.races.map(r => ({ name: r.name, weight: r.percentage }))
        : RACES;

    const buildings = [];
    // Ensure at least one inn and one shop
    buildings.push(generateBuilding({ template: BUILDING_TYPES.find(b => b.type === 'Inn') }));
    buildings.push(generateBuilding({ template: BUILDING_TYPES.find(b => b.type === 'Shop') }));
    buildings.push(generateBuilding({ template: BUILDING_TYPES.find(b => b.type === 'Temple') }));

    // Add barracks if guard level is high
    if (settings.guardLevel && settings.guardLevel >= 5) {
        buildings.push(generateBuilding({ template: BUILDING_TYPES.find(b => b.type === 'Barracks') }));
    }

    for (let i = buildings.length; i < config.buildings; i++) {
        buildings.push(generateBuilding());
    }

    // ── Generate Shop Inventories ──
    buildings.forEach(b => {
        const itemPool = SHOP_ITEMS[b.type];
        if (itemPool) {
            const itemCount = 3 + Math.floor(Math.random() * (itemPool.length - 3));
            const shuffled = [...itemPool].sort(() => Math.random() - 0.5).slice(0, itemCount);
            b.inventory = shuffled.map(item => {
                const supply = Math.floor(Math.random() * 3); // 0=Low, 1=Normal, 2=High
                const demand = Math.floor(Math.random() * 3);
                const supplyNames = ['Low', 'Normal', 'High'];
                const demandNames = ['Low', 'Normal', 'High'];
                // Price fluctuates: high demand + low supply = expensive
                const demandMod = [0.8, 1.0, 1.3][demand];
                const supplyMod = [1.4, 1.0, 0.75][supply];
                const rarityMod = RARITY_MULTIPLIERS[item.rarity] || 1;
                const currentPrice = Math.max(0.01, +(item.basePrice * demandMod * supplyMod * rarityMod).toFixed(2));
                const stock = supply === 0 ? Math.floor(Math.random() * 3) : supply === 1 ? Math.floor(Math.random() * 8) + 2 : Math.floor(Math.random() * 15) + 5;
                return {
                    ...item,
                    currentPrice,
                    stock,
                    supply: supplyNames[supply],
                    demand: demandNames[demand],
                };
            });
        }
    });

    // ── Generate Districts ──
    const districtCount = settings.districtComplexity === 'Simple' ? 2 : settings.districtComplexity === 'Complex' ? 6 : 4;
    const districts = [];
    const availableDistricts = [...DISTRICT_NAMES].sort(() => Math.random() - 0.5);
    const availableColors = [...DISTRICT_COLORS].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(districtCount, availableDistricts.length); i++) {
        districts.push({
            id: i + 1,
            name: availableDistricts[i],
            buildings: [],
            description: `The ${availableDistricts[i].toLowerCase()} of ${settings.name}.`,
            color: availableColors[i % availableColors.length],
            polygon: [], // Array of {x, y} coordinates for map drawing
        });
    }

    // Assign buildings to districts
    if (districts.length > 0) {
        buildings.forEach((b, i) => {
            const district = districts[i % districts.length];
            b.districtId = district.id;
            district.buildings.push(b.id);
        });
    }

    const npcs = [];
    for (let i = 0; i < config.npcs; i++) {
        const race = pickWeighted(raceWeights);
        const npc = generateNPC({ race });
        // Assign NPC to a random building/room
        const building = pick(buildings);
        const room = pick(building.rooms);
        npc.currentLocation = { buildingId: building.id, room: room.name };
        room.occupants.push(npc.id);
        npcs.push(npc);
    }

    // ── Generate Factions ──
    const factionCount = settings.factionDensity === 'None' ? 0 : settings.factionDensity === 'High' ? 4 : 2;
    const factions = [];
    const availableFactions = [...FACTIONS_TEMPLATES].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(factionCount, availableFactions.length); i++) {
        factions.push({
            id: i + 1,
            name: `${pick(LAST_NAMES)} ${availableFactions[i].type}`,
            type: availableFactions[i].type,
            roles: availableFactions[i].roles,
            members: [],
            description: `A local ${availableFactions[i].type.toLowerCase()} operating in ${settings.name}.`,
            influence: Math.floor(Math.random() * 100) + 1,
        });
    }

    // Assign NPCs to factions
    factions.forEach(f => {
        // pick 2-5 npcs for this faction to make them non-empty
        const membersCount = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < membersCount; i++) {
            const npc = pick(npcs);
            if (!npc.factionId) {
                npc.factionId = f.id;
                npc.factionRole = pick(f.roles);
                f.members.push(npc.id);
            }
        }
    });

    // ── Generate Relationships ──
    npcs.forEach(npc => {
        // Evaluate ties with others
        npcs.forEach(other => {
            if (npc.id === other.id) return;
            if (npc.relationships.some(r => r.id === other.id)) return; // Already related

            // 1. Family Ties
            if (npc.lastName === other.lastName) {
                const isParentChild = Math.abs(npc.age - other.age) >= 18;
                const type = isParentChild ? (npc.age > other.age ? 'Parent' : 'Child') : 'Sibling / Spouse';
                npc.relationships.push({ id: other.id, type, trust: 80 + Math.floor(Math.random() * 20) });
                return;
            }

            // 2. Co-workers / Roommates
            if (npc.currentLocation && other.currentLocation && npc.currentLocation.buildingId === other.currentLocation.buildingId) {
                npc.relationships.push({ id: other.id, type: 'Co-worker / Roommate', trust: 40 + Math.floor(Math.random() * 40) });
                return;
            }

            // 3. Faction Members
            if (npc.factionId && npc.factionId === other.factionId) {
                npc.relationships.push({ id: other.id, type: 'Faction Member', trust: 50 + Math.floor(Math.random() * 40) });
                return;
            }
        });

        // 4. Random Friends / Rivals
        const randomCount = Math.floor(Math.random() * 3);
        const unassigned = npcs.filter(n => n.id !== npc.id && !npc.relationships.some(r => r.id === n.id));
        for (let i = 0; i < Math.min(randomCount, unassigned.length); i++) {
            const other = unassigned[i];
            const type = Math.random() > 0.8 ? 'Rival' : 'Friend';
            const trust = type === 'Rival' ? Math.floor(Math.random() * 30) : 60 + Math.floor(Math.random() * 30);

            npc.relationships.push({ id: other.id, type, trust });
            other.relationships.push({ id: npc.id, type, trust }); // Symmetric
        }
    });

    return {
        id: nextSettlementId++,
        name: settings.name,
        size: settings.size,
        settings: {
            ...settings,
            lifestyle: settings.lifestyle || 'Modest',
            guardLevel: settings.guardLevel || 3,
            roadStyle: settings.roadStyle || 'Cobblestone',
            wallType: settings.wallType || 'None',
            govType: settings.govType || 'Monarchy',
            leaderTitle: settings.leaderTitle || '',
            leaderName: settings.leaderName || '',
            terrain: settings.terrain || 'Plains',
            climate: settings.climate || 'Temperate',
            resources: settings.resources || [],
            primaryReligion: settings.primaryReligion || '',
            waterType: settings.waterType || 'None',
            waterDirection: settings.waterDirection || 'Center',
            districtComplexity: settings.districtComplexity || 'Standard',
            factionDensity: settings.factionDensity || 'Normal',
            daysInWeek: settings.daysInWeek || 7,
            economyLevel: settings.economyLevel || 'Standard',
        },
        buildings,
        districts,
        npcs,
        factions,
        time: { hour: 8, day: 1, totalDays: settings.daysInWeek || 7 },
        notes: '',
    };
}

export { BUILDING_TYPES, JOBS, RACES };
