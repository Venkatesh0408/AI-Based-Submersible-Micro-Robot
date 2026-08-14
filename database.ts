import fsLib from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), 'database.json');

function initDb() {
    if (!fsLib.existsSync(DB_PATH)) {
        fsLib.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
    }
}

export async function getHistory() {
    initDb();
    try {
        const data = fsLib.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

export async function saveHistoryItem(item: any) {
    initDb();
    try {
        const history = await getHistory();
        history.unshift(item); // Add to beginning
        fsLib.writeFileSync(DB_PATH, JSON.stringify(history, null, 2));
        return true;
    } catch (e) {
        console.error("Failed to save history item", e);
        return false;
    }
}

export async function deleteHistoryItem(id: string) {
    initDb();
    try {
        let history = await getHistory();
        const initialLength = history.length;
        history = history.filter((item: any) => item.id !== id);
        
        if (history.length !== initialLength) {
            fsLib.writeFileSync(DB_PATH, JSON.stringify(history, null, 2));
            return true;
        }
        return false;
    } catch (e) {
        console.error("Failed to delete history item", e);
        return false;
    }
}
