import { db } from "../database/dataStore";
import { parseDice, roll } from "../dice";

export function updateCharacters(chars) {
  if (!chars) return;
  db.characters.bulkUpdate(chars.map((c) => ({ key: c.id, changes: { ...c } })));
}

export function sortCharacters(chars) {
  const newOrder = [...chars].sort(
    (a, b) => (b.initiative?.reduced || 0) - (a.initiative?.reduced || 0)
  );
  newOrder.forEach((c, i) => {
    c.order = i;
  });
  updateCharacters(newOrder);
}

export function rollInitiative(id, characters) {
  characters.forEach((character) => {
    if ((id === undefined || character.id === id) && character.roll) {
      character.initiative = roll(parseDice(character.roll));
    }
    if (id === undefined && !character.roll) {
      character.initiative = undefined;
    }
  });
  sortCharacters(characters);
}
