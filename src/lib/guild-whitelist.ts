// Guild Member Whitelist
// Only these Discord User IDs can access the roster

export const GUILD_WHITELIST = {
    // Admins
    "155437093659607040": { name: "Earywen", role: "admin" },
    "159390867914883083": { name: "Jyke", role: "admin" },
    "219427667257065475": { name: "Vask", role: "admin" },

    // Members
    "341963978232168448": { name: "Erados", role: "member" },
    "245628670994153473": { name: "Erry", role: "member" },
    "190167962336886784": { name: "Farsane", role: "member" },
    "249115783299465218": { name: "Iceyes", role: "member" },
    "299256840078753793": { name: "Ishkar", role: "member" },
    "166516489787146240": { name: "Qulbutokeke", role: "member" },
    "276454481020059659": { name: "Letal", role: "member" },
    "116638404396974088": { name: "Reyeth", role: "member" },
    "224587647090163715": { name: "Dan", role: "member" },
    "230742146255290369": { name: "Moustache", role: "member" },
    "229359837669097472": { name: "Shrektt", role: "member" },
    "239857419969101824": { name: "Xoruk", role: "member" },
    "262733987615735809": { name: "Yuke", role: "member" },
    "227827391047794688": { name: "Anytho", role: "member" },
    "235831386873790465": { name: "Ectazy", role: "member" },
    "203562640109338624": { name: "Kabé", role: "member" },
    "428119964319481857": { name: "Red", role: "member" },
    "182567424170786818": { name: "Serdar", role: "member" },
    "208310832138813450": { name: "Frost", role: "member" },
    "229702840938004480": { name: "Yurikane", role: "member" },
    "293834161473454081": { name: "Zeynith", role: "member" },
    "273825814842441729": { name: "Zodd", role: "member" },
} as const;

export type DiscordId = keyof typeof GUILD_WHITELIST;

export function isWhitelisted(discordId: string): boolean {
    return discordId in GUILD_WHITELIST;
}

export function getMemberInfo(discordId: string) {
    return GUILD_WHITELIST[discordId as DiscordId] || null;
}

export function isAdmin(discordId: string): boolean {
    const member = getMemberInfo(discordId);
    return member?.role === "admin";
}
