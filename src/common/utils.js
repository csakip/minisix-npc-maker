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

export function setInitiative(id, value, characters) {
  characters.forEach((character) => {
    if (character.id === id) {
      character.initiative = { sum: value, reduced: value, rolls: ["no"] };
    }
  });
  sortCharacters(characters);
}

// ----- NPC

export function findAttr(attrs, name) {
  return attrs.find((attr) => attr.name === name);
}

// Returns a string from the value like 2d+1, where value /3 is before the d, the remainder is after the d
export function displayCharValue(attrs, name, add1, add2) {
  let value1 = findAttr(attrs, name)?.value || 0;
  let value2 = 0;
  if (add1) value2 += findAttr(attrs, add1)?.value || 0;
  if (add2) value2 += findAttr(attrs, add2)?.value || 0;
  if (!value1) return "";
  return `${name} ${displayAsDiceCode(value1 + value2)}`;
}

export function displayAsDiceCode(value) {
  // Get the number before the d
  const before = Math.floor(value / 3);
  // Get the number after the d
  const after = value % 3;
  return `${before}d${after === 0 ? "" : "+" + after}`;
}
