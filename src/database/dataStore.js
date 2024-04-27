import Dexie from "dexie";
import { exportDB, importInto } from "dexie-export-import";
import dexieCloud from "dexie-cloud-addon";
import dexieConfig from "./../../dexie-cloud.json";

export let db = new Dexie("minisix-npc-maker", { addons: [dexieCloud] });

db.version(1).stores({
  characters: "@id, order",
  npcs: "id, name, order, updated",

  // Access Control tables
  realms: "@realmId",
  members: "@id", // Optionally, index things also, like "realmId" or "email".
  roles: "[realmId+name]",
});

db.cloud.configure({
  databaseUrl: dexieConfig.dbUrl,
  requireAuth: false,
});

db.cloud.login();

export function cleanupDb() {
  db.characters.clear();
  db.npcs.clear();
}

export async function exportNpcs() {
  const blob = await exportDB(db, {
    filter: (table) => table === "npcs",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "minisix-npc-maker.json";
  link.click();
}

export async function importNpcs() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.style.display = "none";
  input.onchange = (e) => {
    db.npcs.clear();
    const file = e.target.files[0];
    importInto(db, file, {
      filter: (table) => table === "npcs",
    }).then(() => {
      input.remove();
      db.npcs.count().then((count) => alert(`${count} NJK feltöltve.`));
      db.cloud.sync();
    });
  };
  document.body.appendChild(input);
  input.click();
}
