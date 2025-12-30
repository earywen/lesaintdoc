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
        const sheet = doc.sheetsByIndex[0];

        // Load the first 100 rows to find a slot (or existing user)
        // Adjust limit if roster is larger
        const rows = await sheet.getRows({ limit: 100 });

        // 1. Try to find existing user
        let targetRow = rows.find(row => row.get('Player') === data.name);

        // 2. If not found, find the first empty slot (where Player is empty)
        if (!targetRow) {
            targetRow = rows.find(row => !row.get('Player') || row.get('Player') === "");
        }

        const isLockedIn = data.status === "confirmed";

        // Mapped values array corresponding to columns A-I
        // A: Player
        // B: Main Class
        // C: Main Spec
        // D: Off Spec
        // E: Alt Class
        // F: Alt Main Spec (Header "Main Spec") -> Index 5
        // G: Alt Off Spec (Header "Off Spec") -> Index 6
        // H: Note
        // I: Locked In

        // Note: google-spreadsheet rows access raw data, but `assign` uses headers.
        // To bypass duplicate headers issue, we can try to set by exact header if distinct,
        // or we have to rely on the library's internal deduplication (usually appends numbers, e.g. "Main Spec_1").
        // Let's check headers first.

        // We will try to set values safely.
        const updateObject: Record<string, any> = {
            'Player': data.name,
            'Main Class': data.mainClass,
            'Main Spec': data.mainSpec,
            'Off Spec': data.offSpec || "",
            'Alt Class': data.altClass || "",
            'Note': data.note || "",
            'Locked In': isLockedIn
        };

        if (targetRow) {
            // Update existing or empty slot
            // To be absolutely safe with formatting and duplicate headers:
            // We use cell loading for this specific row.
            const rowIndex = targetRow.rowNumber; // 1-based index (header is row 1, data starts row 2)

            // Limit the range to Columns A (1) to I (9) for this row
            const range = `A${rowIndex}:I${rowIndex}`;

            await sheet.loadCells(range); // Load only this row's cells

            // Set values by column index (0-based)
            // A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, I=8

            sheet.getCell(rowIndex - 1, 0).value = data.name;           // A: Player
            sheet.getCell(rowIndex - 1, 1).value = data.mainClass;      // B: Main Class
            sheet.getCell(rowIndex - 1, 2).value = data.mainSpec;       // C: Main Spec
            sheet.getCell(rowIndex - 1, 3).value = data.offSpec || "";  // D: Off Spec
            sheet.getCell(rowIndex - 1, 4).value = data.altClass || ""; // E: Alt Class

            // Handle Duplicate Headers safely by Index
            sheet.getCell(rowIndex - 1, 5).value = data.altSpec || "";  // F: Main Spec (Alt)
            sheet.getCell(rowIndex - 1, 6).value = "";                  // G: Off Spec (Alt) - Placeholder

            sheet.getCell(rowIndex - 1, 7).value = data.note || "";     // H: Note
            sheet.getCell(rowIndex - 1, 8).value = isLockedIn;          // I: Locked In

            await sheet.saveUpdatedCells();

        } else {
            // No slots left? Append (fallback if rows > 100)
            // Note: This might break the template if it stops formatting at row 100.
            await sheet.addRow(updateObject);
        }

    } catch (error) {
        console.error("Google Sheets Sync Error:", error);
    }
}
