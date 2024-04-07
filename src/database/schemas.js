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
