import Dexie from "dexie";

export const db = new Dexie("minisix-npc-maker");

db.version(1).stores({
  characters: "++id",
  npcs: "++id, name",
});

export function cleanupDb() {
  db.characters.clear();
  db.npcs.clear();
}
