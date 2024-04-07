import { addRxPlugin, createRxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration-schema";
import { characterSchema } from "./schemas";
import { RxDBCleanupPlugin } from "rxdb/plugins/cleanup";

addRxPlugin(RxDBCleanupPlugin);
addRxPlugin(RxDBMigrationPlugin);

import.meta.env.MODE === "development" && addRxPlugin(RxDBDevModePlugin);

export const db = await createRxDatabase({
  name: "minisix-npc-maker",
  storage: getRxStorageDexie(),
  ignoreDuplicate: true, // To fix hot reload
});

await db.addCollections({
  characters: {
    schema: characterSchema,
    migrationStrategies: {
      // 1 means, this transforms data from version 0 to version 1
      1: function (oldDoc) {
        oldDoc.type = "npc";
        return oldDoc;
      },
    },
  },
});

export function cleanupDb() {
  db.characters.cleanup();
}
