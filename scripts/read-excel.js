const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const filePath = path.join(process.cwd(), 'excel', 'Copie de Raid Roster Template MN WIP.xlsx');

try {
    const workbook = XLSX.readFile(filePath, { cellFormula: true });

    // We expect the main logic in 'roster' sheet
    const sheet = workbook.Sheets['roster'];
    if (!sheet) {
        console.error("No 'roster' sheet found");
        process.exit(1);
    }

    const BUFF_NAMES = [
        'Intellect', 'Attack Power', 'Stamina', '3% DR', '5% Phys', '3% Magic', '3% Vers',
        'Lust', 'Combat Res', 'Burst Speed', 'HS/Gate', 'Mass Dispel', 'Innervate',
        'Grip', 'BoP', 'Rallying Cry', 'Darkness', 'Immunities', 'Skyfury',
        'Boss DR', 'Dragons', 'Execute Damage', 'Atk Speed', 'Cast Speed',
        'Knock', 'MS', 'Soothe', 'Purge', 'PI', 'Shield', 'Cheat Death', 'BoS'
    ];

    console.log("Analyzing 'roster' sheet for buff logic...");

    const getCell = (ref, rOffset, cOffset) => {
        const decoded = XLSX.utils.decode_cell(ref);
        const newAddr = XLSX.utils.encode_cell({ r: decoded.r + rOffset, c: decoded.c + cOffset });
        return sheet[newAddr];
    };

    let foundCount = 0;
    const results = {};

    for (const cellAddress in sheet) {
        if (cellAddress[0] === '!') continue;
        const cell = sheet[cellAddress];

        if (cell.v && typeof cell.v === 'string') {
            const val = cell.v.trim();
            // Fuzzy match buff name
            const matchedBuff = BUFF_NAMES.find(n => val.toLowerCase().includes(n.toLowerCase()));

            if (matchedBuff) {
                // Check neighbors for formulas. 
                // Usually logic is Right (Col +1 or +2) or Below (Row +1).
                // We check a 3x3 area around the label relative to Right/Down

                let formulas = [];

                // Check right (Columns +1 to +3)
                for (let i = 1; i <= 3; i++) {
                    const c = getCell(cellAddress, 0, i);
                    if (c && c.f) formulas.push(`RIGHT+${i}: ${c.f}`);
                }
                // Check below (Rows +1 to +3)
                for (let i = 1; i <= 3; i++) {
                    const c = getCell(cellAddress, i, 0);
                    if (c && c.f) formulas.push(`DOWN+${i}: ${c.f}`);
                }

                if (formulas.length > 0) {
                    results[matchedBuff] = formulas;
                    foundCount++;
                }
            }
        }
    }

    console.log(`\nFound formulas for ${foundCount} buffs. Writing to excel-logic.json...`);
    fs.writeFileSync('excel-logic.json', JSON.stringify(results, null, 2));

} catch (err) {
    console.error("Error:", err);
}
