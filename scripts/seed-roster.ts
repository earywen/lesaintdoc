// scripts/seed-roster.ts
// Usage: npx tsx scripts/seed-roster.ts

import 'dotenv/config';
import { db } from '../src/db';
import { rosterEntries, user } from '../src/db/schema';
import { randomUUID } from 'crypto';

// Mock roster covering all classes/specs for buff coverage
const mockRoster = [
    // TANKS (2)
    { name: "Tankmaster", class: "Warrior", spec: "Protection" },
    { name: "Brewbelly", class: "Monk", spec: "Brewmaster" },

    // HEALERS (4)
    { name: "HolyLight", class: "Paladin", spec: "Holy" },
    { name: "Leafweaver", class: "Druid", spec: "Restoration" },
    { name: "Mistcaller", class: "Monk", spec: "Mistweaver" },
    { name: "Shadowmend", class: "Priest", spec: "Discipline" },

    // MELEE DPS (6)
    { name: "Bladestorm", class: "Warrior", spec: "Fury" },
    { name: "Backstabber", class: "Rogue", spec: "Assassination" },
    { name: "Felrage", class: "Demon Hunter", spec: "Havoc" },
    { name: "Frostblade", class: "Death Knight", spec: "Frost" },
    { name: "Windpuncher", class: "Monk", spec: "Windwalker" },
    { name: "Stormhammer", class: "Shaman", spec: "Enhancement" },

    // RANGED DPS (7)
    { name: "Pyroblast", class: "Mage", spec: "Fire" },
    { name: "Voidweaver", class: "Priest", spec: "Shadow" },
    { name: "Demonologist", class: "Warlock", spec: "Demonology" },
    { name: "Starfall", class: "Druid", spec: "Balance" },
    { name: "Thunderzap", class: "Shaman", spec: "Elemental" },
    { name: "Snipeshot", class: "Hunter", spec: "Marksmanship" },
    { name: "Devourion", class: "Demon Hunter", spec: "Devourer" }, // Custom spec!

    // AUGMENTATION (1) - Special support role
    { name: "Chronoweave", class: "Evoker", spec: "Augmentation" },
];

async function main() {
    console.log("🌱 Seeding database with mock roster...\n");

    for (const player of mockRoster) {
        const uniqueId = randomUUID();
        const email = `${player.name.toLowerCase()}@mock.wow`;

        // Create mock user
        await db.insert(user).values({
            id: uniqueId,
            name: player.name,
            email: email,
            emailVerified: true,
            role: "member",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Create roster entry
        await db.insert(rosterEntries).values({
            userId: uniqueId,
            patchId: "Midnight",
            mainClass: player.class,
            mainSpec: player.spec,
            status: "confirmed",
            isLockedIn: true,
        });

        console.log(`  ✓ ${player.name} - ${player.class} (${player.spec})`);
    }

    console.log(`\n✅ Added ${mockRoster.length} mock players to the roster!`);
    console.log("\nBuff Coverage:");
    console.log("  🧠 Intellect: Mage ✓");
    console.log("  ❤️ Stamina: Priest ✓");
    console.log("  ⚔️ Battle Shout: Warrior ✓");
    console.log("  🛡️ Devotion Aura: Paladin ✓");
    console.log("  🐾 Mark of the Wild: Druid ✓");
    console.log("  👊 Mystic Touch: Monk ✓");
    console.log("  ✨ Chaos Brand: Demon Hunter ✓");
    console.log("  🔥 Bloodlust: Shaman/Mage ✓");
    console.log("  🌪️ Windfury: Shaman ✓");

    process.exit(0);
}

main().catch(console.error);
