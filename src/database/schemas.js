export const characterSchema = {
  title: "character schema",
  version: 1,
  type: "object",
  primaryKey: "id",
  properties: {
    id: {
      type: "string",
      primary: true,
      maxLength: 100,
    },
    name: {
      type: "string",
      maxLength: 100,
    },
    type: {
      type: "string",
      default: "npc",
    },
    initiative: {
      type: "number",
    },
    roll: {
      type: "string",
    },
    tags: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          length: { type: "number" },
          effect: { type: "string" },
          notes: { type: "string" },
        },
      },
    },
    notes: {
      type: "string",
    },
  },
  required: ["id"],
  indexes: ["name"],
};

// object with name, notes and an array attributes object that have name and value
export const npcSchema = {
  title: "npc schema",
  version: 0,
  type: "object",
  primaryKey: "id",
  properties: {
    id: {
      type: "string",
      primary: true,
      maxLength: 100,
    },
    name: {
      type: "string",
      maxLength: 100,
    },
    notes: {
      type: "string",
    },
    attrs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          value: { type: "number" },
        },
      },
    },
    updated: {
      type: "number",
    },
  },
  required: ["id"],
  indexes: ["name"],
};
