import { env } from "@/env";

type DiscordEmbed = {
    title: string;
    description: string;
    color: number; // Decimal color
    fields?: { name: string; value: string; inline?: boolean }[];
    timestamp?: string;
};

const COLORS = {
    GREEN: 5763719, // #57F287
    ORANGE: 15105570, // #E67E22
    BLUE: 3447003, // #3498DB
};

async function sendWebhook(embed: DiscordEmbed) {
    if (!env.DISCORD_WEBHOOK_URL) return;

    try {
        await fetch(env.DISCORD_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                embeds: [embed],
            }),
        });
    } catch (error) {
        console.error("Failed to send Discord webhook:", error);
    }
}

export async function sendRosterJoin(userName: string, mainClass: string, mainSpec: string) {
    await sendWebhook({
        title: "👋 Nouveau Raider !",
        description: `**${userName}** vient de rejoindre le roster.`,
        color: COLORS.GREEN,
        fields: [
            { name: "Classe", value: mainClass, inline: true },
            { name: "Spécialisation", value: mainSpec, inline: true },
        ],
        timestamp: new Date().toISOString(),
    });
}

export async function sendRosterUpdate(
    userName: string,
    changes: string[]
) {
    if (changes.length === 0) return;

    await sendWebhook({
        title: "🔄 Mise à jour Roster",
        description: `**${userName}** a mis à jour ses informations.`,
        color: COLORS.ORANGE,
        fields: [
            { name: "Modifications", value: changes.join("\n"), inline: false },
        ],
        timestamp: new Date().toISOString(),
    });
}
