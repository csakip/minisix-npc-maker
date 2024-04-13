import { db } from "./database/dataStore";

export function updateCharacters(chars) {
  if (!chars) return;
  db.characters.bulkUpdate(chars.map((c) => ({ key: c.id, changes: { ...c } })));
}
