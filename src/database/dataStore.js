import Dexie from "dexie";

export const db = new Dexie("minisix-npc-maker");

db.version(1).stores({
  characters: "++id, name, type, initiative, roll, notes, tags, *order",
  npcs: "++id, name, notes, *attrs, updated, uuid",
});

export function cleanupDb() {
  db.characters.clear();
  db.npcs.clear();
}
