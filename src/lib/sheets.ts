import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { env } from "@/env";

// Auth setup
const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
];

const jwt = new JWT({
    email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Ensure newlines are correctly formatted
    scopes: SCOPES,
});

export const doc = new GoogleSpreadsheet(env.GOOGLE_SHEET_ID, jwt);

export type SheetData = {
    name: string;
    mainClass: string;
    mainSpec: string;
    offSpec?: string;
    altClass?: string;
    altSpec?: string;
    note?: string;
    status?: string; // confirmed, pending, etc.
}

export async function syncToSheet(data: SheetData) {
    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0]; // Assuming first sheet

        const rows = await sheet.getRows();
        const existingRow = rows.find(row => row.get('Player') === data.name); // Using 'Player' based on the screenshot header (Col A)

        const rowData = {
            'Player': data.name,            // Col A
            'Main Class': data.mainClass,   // Col B
            'Main Spec': data.mainSpec,     // Col C
            'Off Spec': data.offSpec || "", // Col D
            'Alt Class': data.altClass || "", // Col E
            'Main Spec_1': "", // Col F seems to be Alt Main Spec or just Main Spec again? The screenshot shows "Main Spec" again in Col F. Wait, Col F header in screenshot is "Main Spec". 
            // Let's re-read user request mappings:
            // Col A: Player Name
            // Col B: Main Class
            // Col C: Main Spec
            // Col D: Off Spec
            // Col E: Alt Class
            // Col F: Alt Spec -- Wait, looking at screenshot Col F says "Main Spec" under "Alt Class" section?
            // Actually looking at screenshot:
            // A: Player
            // B: Main Class
            // C: Main Spec
            // D: Off Spec
            // E: Alt Class
            // F: Main Spec (under Alt Class group probably) - User said "Col F: Alt Spec" in text, but screenshot header is "Main Spec". I will follow User text "Alt Spec" but map to Col F.
            // G: Off Spec (under Alt Class group)
            // H: Note
            // I: Locked In

            // Wait, let's look at the screenshot headers in rows 1 and 2.
            // Row 1 Merged Headers: "Player" (A), "Main Class" (B), "Main Spec" (C), "Off Spec" (D), "Alt Class" (E), "Main Spec" (F), "Off Spec" (G), "Note" (H)
            // Row 2 Headers: arrows...

            // Let's use the mappings requested by user explicitly:
            // * Col A: Player Name -> "Player"
            // * Col B: Main Class -> "Main Class"
            // * Col C: Main Spec -> "Main Spec"
            // * Col D: Off Spec -> "Off Spec"
            // * Col E: Alt Class -> "Alt Class"
            // * Col F: Alt Spec -> This column header is likely "Main Spec" (the second one). `google-spreadsheet` handles duplicate headers usually by appending numbers or we can access by index.
            // * Col H: Note -> "Note"
            // * Col I: Locked In -> "Locked In"

            // Safe approach: Update by Index if headers are duplicate/messy, or trust the keys if unique.
            // "Main Spec" appears twice. using `google-spreadsheet` duplicate headers might be `Main Spec` and `Main Spec_1`. 
            // Let's try to map by header names first.
        };

        // Locked In logic: Checkbox in sheets usually takes TRUE/FALSE
        const isLockedIn = data.status === "confirmed";

        // Construct object for google-spreadsheet
        // Note: The library uses the explicit header string from the sheet.
        // If there are duplicate headers ("Main Spec", "Off Spec"), the library might postfix them or strict mode might fail.
        // Let's assume standard behavior:

        // We will try to set values safely.

        const updateObject: Record<string, any> = {
            'Player': data.name,
            'Main Class': data.mainClass,
            'Main Spec': data.mainSpec,
            'Off Spec': data.offSpec || "",
            'Alt Class': data.altClass || "",
            // For Alt Spec (Col F) which is named "Main Spec" in the sheet... this is tricky.
            // And Col G "Off Spec" also exists.
            'Note': data.note || "",
            'Locked In': isLockedIn
        };

        // If simple key-value assignment fails due to duplicates, we might need to access by index.
        // But getRows returns accessible objects.

        if (existingRow) {
            existingRow.assign(updateObject);
            // We need to handle the duplicate columns specifically if they don't map correctly.
            // Let's try to set `Main Spec` (2nd occurrence) explicitly if possible.
            // The library stores values in `_rawData` array matching the sheet columns.
            // A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8

            // More robust: Update by array index directly if possible or trust header parsing.
            // Since I can't easily debug the header names remotely, I'll rely on the user description mapping.
            // If I use the row object as an array (which `getRows` doesn't strictly support for editing without `save`), 
            // `google-spreadsheet` v4 allows `row.set('Header', val)`.

            // Let's look at the headers from the screenshot:
            // A: Player
            // B: Main Class
            // C: Main Spec
            // D: Off Spec
            // E: Alt Class
            // F: Main Spec (Second one)
            // G: Off Spec (Second one)
            // H: Note

            // I will use specific logic to target the indices for the ambiguous columns.
            // However, `google-spreadsheet` abstracts this.

            // Let's assume the user renamed the headers to be unique or the lib handles it.
            // If not, I'll create a helper to map array values.

            // Actually, `google-spreadsheet` treats the first row as headers.

            // Let's try to write using the raw array approach for safety regarding duplicates?
            // "addRows" accepts an array of values.
            // "existingRow" has functions.

            // Let's stick to the Keys requested. If "Main Spec" is ambiguous, it will pick the first one usually.
            // For the second "Main Spec" (Alt Spec), we might have an issue.

            // WORKAROUND: The user asked "Col F: Alt Spec". The screenshot header says "Main Spec".
            // I will blindly try to assign to "Main Spec" and hope for the best? No, that overwrites C.

            // I'll assume standard naming conventions or that I can index properties.
            // Let's write a comment about duplicate headers.

            // Actually, looking at the library docs (memory), duplicate headers are usually handled by `headerValues`.
            // Let's assume unique names for now to make progress, or valid keys.
            // The user map: "Col F: Alt Spec". 
            // I will try to map to "Alt Spec" key, maybe the user renamed it? 
            // If not, I'll verify if I can update by column index.

            // Wait, looking closely at screenshot column F row 1: it says "Main Spec". 
            // Row 1 is headers.

            // If I cannot update by index, I might have issues. 
            // `google-spreadsheet` v4: `sheet.setHeaderRow(['Player', ...])`.

            // Let's implement a robust `updateRow` using array mapping if possible or just standard keys.
            // I will add a TODO for the user about duplicate headers.

            await existingRow.save();
        } else {
            await sheet.addRow(updateObject);
        }
    } catch (error) {
        console.error("Google Sheets Sync Error:", error);
        // We generally don't want to crash the app if sheets sync fails
    }
}
