// lib/wow-constants.ts

export type Role = 'Tank' | 'Healer' | 'Melee' | 'Ranged' | 'Augmentation';
export type CharacterType = 'main' | 'alt';

// ===== MAJOR BUFFS/DEBUFFS =====
export type BuffProvider = {
    class: string;
    specs?: readonly string[];
};

export interface BuffDefinition {
    id: string;
    name: string;
    icon: string;
    providers: readonly BuffProvider[];
}

// ===== MAJOR BUFFS/DEBUFFS =====
export const BUFFS = {
    INTELLECT: { id: 'intellect', name: 'Arcane Intellect', icon: '🧠', providers: [{ class: 'Mage' }] },
    ATTACK_POWER: { id: 'ap', name: 'Battle Shout', icon: '⚔️', providers: [{ class: 'Warrior' }] },
    STAMINA: { id: 'stamina', name: 'Power Word: Fortitude', icon: '❤️', providers: [{ class: 'Priest' }] },
    DR_3: { id: 'devo', name: '3% DR (Devo Aura)', icon: '🛡️', providers: [{ class: 'Paladin' }] },
    PHYS_5: { id: 'phys_vuln', name: '5% Physical', icon: '👊', providers: [{ class: 'Monk' }] },
    MAGIC_3: { id: 'magic_3', name: '3% Magic', icon: '✨', providers: [{ class: 'Demon Hunter' }] },
    VERS_3: { id: 'vers', name: '3% Versatility', icon: '🐾', providers: [{ class: 'Druid' }] },
} as const;

// ===== UTILITY =====
export const UTILITIES = {
    // Core Utility
    BLOODLUST: {
        id: 'lust', name: 'Bloodlust', icon: '🔥',
        providers: [{ class: 'Shaman' }, { class: 'Mage' }, { class: 'Evoker' }]
    },
    COMBAT_RES: {
        id: 'brez', name: 'Combat Res', icon: '💀',
        providers: [{ class: 'Death Knight' }, { class: 'Druid' }, { class: 'Warlock' }, { class: 'Paladin' }]
    },
    BURST_SPEED: {
        id: 'speed', name: 'Burst Speed', icon: '💨',
        providers: [{ class: 'Druid' }, { class: 'Shaman' }, { class: 'Evoker' }]
    },

    // Warlock Utility
    LOCK_UTILITY: { id: 'lock', name: 'HS/Gate/Curse', icon: '🚪', providers: [{ class: 'Warlock' }] },

    // Class-Specific Utility
    MASS_DISPEL: {
        id: 'mdispel', name: 'Mass Dispel', icon: '🌀',
        providers: [{ class: 'Priest' }, { class: 'Monk', specs: ['Mistweaver'] }]
    },
    INNERVATE: { id: 'innerv', name: 'Innervate', icon: '💙', providers: [{ class: 'Druid' }] },
    GRIP_AMZ: { id: 'grip', name: 'Death Grip/AMZ', icon: '🪦', providers: [{ class: 'Death Knight' }] },
    BOP: { id: 'bop', name: 'Blessing of Protection', icon: '🙏', providers: [{ class: 'Paladin' }] },
    RALLYING_CRY: { id: 'rally', name: 'Rallying Cry', icon: '📣', providers: [{ class: 'Warrior' }] },
    DARKNESS: { id: 'dark', name: 'Darkness', icon: '🌑', providers: [{ class: 'Demon Hunter' }] },
    IMMUNITIES: {
        id: 'immu', name: 'Immunities', icon: '⭐',
        providers: [{ class: 'Paladin' }, { class: 'Mage' }, { class: 'Hunter' }]
    },
    SKYFURY: { id: 'sky', name: 'Skyfury', icon: '🌪️', providers: [{ class: 'Shaman' }] },
    BOSS_DR: { id: 'bossdr', name: 'Boss DR', icon: '📉', providers: [{ class: 'Rogue' }] },
    DRAGONS: { id: 'dragon', name: 'Dragons', icon: '🐉', providers: [{ class: 'Evoker' }] },
    EXECUTE_DMG: {
        id: 'exec', name: 'Execute Damage', icon: '💀',
        providers: [
            { class: 'Warrior' }, { class: 'Priest' }, { class: 'Paladin' }, { class: 'Hunter' },
            { class: 'Mage', specs: ['Fire'] }, { class: 'Rogue', specs: ['Assassination'] }
        ]
    },
    ATK_SPEED_REDUCE: {
        id: 'atkslow', name: 'Atk Speed Reduction', icon: '🐌',
        providers: [{ class: 'Hunter' }, { class: 'Warrior' }, { class: 'Death Knight' }]
    },
    CAST_SPEED_REDUCE: {
        id: 'castslow', name: 'Cast Speed Reduction', icon: '🔇',
        providers: [{ class: 'Warlock' }, { class: 'Rogue' }]
    },
} as const;

// ===== DEBUFFS/UTILITY (Right side of Excel) =====
export const DEBUFFS = {
    KNOCKBACK: {
        id: 'knock', name: 'Knock Up/Back', icon: '⬆️',
        providers: [
            { class: 'Shaman' }, { class: 'Druid' }, { class: 'Hunter' },
            { class: 'Evoker' }, { class: 'Monk' }, { class: 'Mage' }
        ]
    },
    MORTAL_STRIKE: {
        id: 'ms', name: 'Mortal Strike', icon: '💔',
        providers: [{ class: 'Warrior' }, { class: 'Hunter' }, { class: 'Rogue' }, { class: 'Monk' }]
    },
    SOOTHE: {
        id: 'soothe', name: 'Soothe', icon: '😌',
        providers: [{ class: 'Druid' }, { class: 'Hunter' }, { class: 'Evoker' }, { class: 'Monk' }]
    },
    PURGE: {
        id: 'purge', name: 'Purge', icon: '🧹',
        providers: [{ class: 'Shaman' }, { class: 'Priest' }, { class: 'Mage' }, { class: 'Hunter' }]
    },
    POWER_INFUSION: { id: 'pi', name: 'Power Infusion', icon: '⚡', providers: [{ class: 'Priest' }] },
    EXTRA_SHIELD_DMG: {
        id: 'shield', name: 'Extra Shield Dmg', icon: '🛡️',
        providers: [{ class: 'Warrior' }, { class: 'Evoker' }]
    },
    CHEAT_DEATH: {
        id: 'cheat', name: 'Cheat Death', icon: '💫',
        providers: [
            { class: 'Rogue' }, { class: 'Death Knight', specs: ['Blood'] },
            { class: 'Demon Hunter', specs: ['Vengeance'] }, { class: 'Mage', specs: ['Fire'] },
            { class: 'Evoker', specs: ['Augmentation'] }, { class: 'Priest', specs: ['Holy'] }
        ]
    },
    BOS: { id: 'bos', name: 'Blessing of Spellwarding', icon: '✝️', providers: [{ class: 'Paladin' }] },
} as const;

// ===== CLASS DEFINITIONS =====
export const CLASSES = {
    WARRIOR: {
        name: 'Warrior',
        color: '#C79C6E',
        specs: ['Arms', 'Fury', 'Protection'],
        roles: { Protection: 'Tank', Arms: 'Melee', Fury: 'Melee' } as Record<string, Role>,
        armorType: 'Plate',
    },
    PALADIN: {
        name: 'Paladin',
        color: '#F58CBA',
        specs: ['Holy', 'Protection', 'Retribution'],
        roles: { Protection: 'Tank', Holy: 'Healer', Retribution: 'Melee' } as Record<string, Role>,
        armorType: 'Plate',
    },
    HUNTER: {
        name: 'Hunter',
        color: '#ABD473',
        specs: ['Beast Mastery', 'Marksmanship', 'Survival'],
        roles: { 'Beast Mastery': 'Ranged', Marksmanship: 'Ranged', Survival: 'Melee' } as Record<string, Role>,
        armorType: 'Mail',
    },
    ROGUE: {
        name: 'Rogue',
        color: '#FFF569',
        specs: ['Assassination', 'Outlaw', 'Subtlety'],
        roles: { Assassination: 'Melee', Outlaw: 'Melee', Subtlety: 'Melee' } as Record<string, Role>,
        armorType: 'Leather',
    },
    PRIEST: {
        name: 'Priest',
        color: '#FFFFFF',
        specs: ['Discipline', 'Holy', 'Shadow'],
        roles: { Discipline: 'Healer', Holy: 'Healer', Shadow: 'Ranged' } as Record<string, Role>,
        armorType: 'Cloth',
    },
    DEATH_KNIGHT: {
        name: 'Death Knight',
        color: '#C41F3B',
        specs: ['Blood', 'Frost', 'Unholy'],
        roles: { Blood: 'Tank', Frost: 'Melee', Unholy: 'Melee' } as Record<string, Role>,
        armorType: 'Plate',
    },
    SHAMAN: {
        name: 'Shaman',
        color: '#0070DE',
        specs: ['Elemental', 'Enhancement', 'Restoration'],
        roles: { Elemental: 'Ranged', Enhancement: 'Melee', Restoration: 'Healer' } as Record<string, Role>,
        armorType: 'Mail',
    },
    MAGE: {
        name: 'Mage',
        color: '#40C7EB',
        specs: ['Arcane', 'Fire', 'Frost'],
        roles: { Arcane: 'Ranged', Fire: 'Ranged', Frost: 'Ranged' } as Record<string, Role>,
        armorType: 'Cloth',
    },
    WARLOCK: {
        name: 'Warlock',
        color: '#8787ED',
        specs: ['Affliction', 'Demonology', 'Destruction'],
        roles: { Affliction: 'Ranged', Demonology: 'Ranged', Destruction: 'Ranged' } as Record<string, Role>,
        armorType: 'Cloth',
    },
    MONK: {
        name: 'Monk',
        color: '#00FF96',
        specs: ['Brewmaster', 'Mistweaver', 'Windwalker'],
        roles: { Brewmaster: 'Tank', Mistweaver: 'Healer', Windwalker: 'Melee' } as Record<string, Role>,
        armorType: 'Leather',
    },
    DRUID: {
        name: 'Druid',
        color: '#FF7D0A',
        specs: ['Balance', 'Feral', 'Guardian', 'Restoration'],
        roles: { Guardian: 'Tank', Restoration: 'Healer', Balance: 'Ranged', Feral: 'Melee' } as Record<string, Role>,
        armorType: 'Leather',
    },
    DEMON_HUNTER: {
        name: 'Demon Hunter',
        color: '#A330C9',
        specs: ['Havoc', 'Vengeance', 'Devourer'],
        roles: { Vengeance: 'Tank', Havoc: 'Melee', Devourer: 'Ranged' } as Record<string, Role>,
        armorType: 'Leather',
    },
    EVOKER: {
        name: 'Evoker',
        color: '#33937F',
        specs: ['Augmentation', 'Devastation', 'Preservation'],
        roles: { Augmentation: 'Augmentation', Devastation: 'Ranged', Preservation: 'Healer' } as Record<string, Role>,
        armorType: 'Mail',
    }
} as const;

// Get all class names as array
export const CLASS_NAMES = Object.values(CLASSES).map(c => c.name);