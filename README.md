# Mini Six GM helper

There are 2 main parts of this app:

1. NPC creator. An easy to use UI to make an npc and generate a stat block to copy to a doc. It saves npcs in a local database.
2. Initiative tracker. You can add PCs, the created NPCs from the database or other NPCs to an initiative tracker. It can track statuses (i.e. wounded) and rounds.

It is for a Hungarian mod for Mini Six based Rifts, but it's fed from a json file so other Mini Six games are not hard to implement.

## Development

```
yarn
yarn dev
```

## Deployment

```
yarn deploy
```

This will deploy it to https://csakip.github.io/minisix-npc-maker/
