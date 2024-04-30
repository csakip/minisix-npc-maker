import { isNumber, isObject } from "lodash";
import { db } from "../database/dataStore";
import { randomTables } from "../database/randomTables";
import { d66s, parseDice, roll } from "../dice";
import skillTree from "../assets/skillTree.json";

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

export function generateRandomDescription() {
  // make a random description from randomTables
  const desc = randomTables.descriptor[d66s()];
  const personality = randomTables.personality[d66s()].toLowerCase();
  return `${desc} ${personality}`;
}

// Returns the calculated value. if the calculator.value is an array, add the values of their attr.value
export function getCalculatedValue(attrs, calculated) {
  if (attrs.length === 0) return;
  const { name, value } = calculated;

  // If value is an array, calculate the sum of its values
  if (Array.isArray(value)) {
    return {
      name,
      value:
        value.map((value) => findAttr(attrs, value)?.value || 0).reduce((a, b) => a + b, 0) +
        (findAttr(attrs, name)?.value || 0),
      highlighted: calculated.highlighted,
    };
  }

  // If value is a number, use the attribute, and add value to it
  if (isNumber(value)) {
    const sum = value + (findAttr(attrs, name)?.value || 0);
    if (!sum) return undefined;
    return { name: name, value: sum, highlighted: calculated.highlighted };
  }

  // Calculate body points (Highest skill under Test d*4 + pip + 20)
  if (isObject(value) && value.special === "test") {
    // skill with the highest value
    const testAttribute = skillTree.attributes.find((a) => a.name === "Test");
    const highestTestSkill = testAttribute?.skills?.reduce((a, b) =>
      (findAttr(attrs, a.name)?.value || 0) > (findAttr(attrs, b.name)?.value || 0) ? a : b
    );
    const highestTestSkillValue =
      findAttr(attrs, "Test").value + findAttr(attrs, highestTestSkill.name)?.value || 0;
    const sum =
      Math.floor(highestTestSkillValue / 3) * 4 +
      (highestTestSkillValue % 3) +
      20 +
      (findAttr(attrs, "Test pont")?.value || 0);
    return { name: name, value: sum, highlighted: calculated.highlighted };
  }

  // Calculate psi resistance
  if (isObject(value) && value.special === "pszi") {
    const willpower =
      (findAttr(attrs, "Elme")?.value || 0) + (findAttr(attrs, "Akaraterő")?.value || 0);
    const psi = findAttr(attrs, "Pszi")?.value || 0;
    const psiRes = findAttr(attrs, "Pszi ellenállás")?.value || 0;
    const addNum = Math.floor((Math.floor(willpower / 3) + Math.floor(psi / 3)) / 2) + psiRes;
    return {
      name: name,
      value: "4d" + (addNum ? "+" + addNum : "") + " (vs 20)",
      highlighted: calculated.highlighted,
    };
  }

  // Calculate magic attack
  if (findAttr(attrs, "Mágia") && value.special === "magic") {
    const magic = findAttr(attrs, "Mágia")?.value || 0;
    const magicAttack = findAttr(attrs, "Mágikus erő")?.value || 0;
    const addNum = Math.floor(magic / 3) + magicAttack;
    return {
      name: name,
      value: "6d" + (addNum ? "+" + addNum : "") + " (vs 24)",
      highlighted: calculated.highlighted,
    };
  }
  return;
}
