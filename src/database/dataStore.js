import Dexie from "dexie";
import { exportDB, importInto } from "dexie-export-import";

export let db = new Dexie("minisix-npc-maker");

db.version(1).stores({
  characters: "++id, order",
  npcs: "++id, name, order, updated",
});

export function cleanupDb() {
  db.characters.clear();
  db.npcs.clear();
}

export async function exportDatabase() {
  const blob = await exportDB(db);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "minisix-npc-maker.json";
  link.click();
}

export async function importDatabase() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.style.display = "none";
  input.onchange = (e) => {
    cleanupDb();
    const file = e.target.files[0];
    importInto(db, file).then(() => {
      input.remove();
    });
  };
  document.body.appendChild(input);
  input.click();
}
