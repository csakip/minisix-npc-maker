import { useState } from "react";
import Button from "react-bootstrap/Button";
import SelectNpcDialog from "../common/SelectNpcDialog";
import {
  getCalculatedValue,
  rollInitiative,
  sortCharacters,
  updateCharacters,
} from "../common/utils";
import { db } from "../database/dataStore";
import { format, roll } from "../dice";
import { useSimpleDialog } from "../common/SimpleDialog";
import { ButtonGroup } from "react-bootstrap";

function ControlButtons({ setEditedCharacter, characters, newRound }) {
  const [showSelectNpcDialog, setShowSelectNpcDialog] = useState(false);
  const { openModal, closeModal, SimpleDialog } = useSimpleDialog();

  function setSelectedNpc(npc, copies) {
    for (let i = 0; i < copies; i++) {
      const initiative = npc.attrs.find((a) => a.name === "Ügyesség")?.value || 6;
      const toSave = {
        name: npc.name,
        roll: format(initiative),
        type: "npc",
        initiative: roll(initiative),
        notes: npc.notes,
        tags: [],
        order: 100000,
        charNotes: "",
        counters: [],
      };
      const bodyPoints = getCalculatedValue(npc.attrs, {
        name: "Test pont",
        value: { special: "test" },
      });
      const armourPoints = npc.attrs.find((a) => a.name === "Mega páncél");
      if (bodyPoints)
        toSave.counters.push({
          name: bodyPoints.name,
          value: bodyPoints.value,
          max: bodyPoints.value,
        });
      if (armourPoints)
        toSave.counters.push({ name: armourPoints.name, value: armourPoints.value });
      db.characters.put(toSave);
    }
  }

  function startNewRound(increment = 1) {
    updateCharacters(
      characters.map((character) => {
        // if (character.roll) character.initiative = roll(parseDice(character.roll));
        // if a tag has a length, reduce it. if it reaches 0, remove it
        if (character.tags) {
          character.tags = character.tags
            .map((t) => {
              if (t.length) {
                return { ...t, length: t.length - increment };
              }
              return t;
            })
            .filter((t) => t.length === undefined || t.length > 0);
        }
        return character;
      })
    );
    newRound(increment);
  }

  return (
    <>
      <div className='scrollable-menu buttons d-flex flex-column'>
        <Button size='sm' variant='secondary' onClick={() => rollInitiative(undefined, characters)}>
          Kezd. dobás
        </Button>
        <Button size='sm' variant='secondary' onClick={() => sortCharacters(characters)}>
          Sorrendbe
        </Button>
        <ButtonGroup size='sm'>
          <Button variant='secondary' onClick={() => startNewRound()}>
            Új kör
          </Button>
          <Button variant='outline-secondary' onClick={() => startNewRound(-1)} style={{ flex: 0 }}>
            -1
          </Button>
        </ButtonGroup>
        <hr />
        <Button
          size='sm'
          variant='secondary'
          onClick={() => setEditedCharacter({ name: "", roll: "" })}>
          Új karakter
        </Button>
        <Button size='sm' variant='secondary' onClick={() => setShowSelectNpcDialog(true)}>
          NJK listából
        </Button>
        <Button
          size='sm'
          variant='danger'
          onClick={() => {
            openModal({
              open: true,
              title: "Törlés",
              body: "Törlösz minden njk-t és a játékosok kezdeményezését?",
              cancelButton: "Mégse",
              onClose: (ret) => {
                if (ret) {
                  newRound();
                  db.characters.bulkDelete(
                    characters.filter((c) => c.type === "npc").map((c) => c.id)
                  );
                  db.characters.toCollection().modify({ initiative: undefined });
                }
                closeModal();
              },
            });
          }}>
          Új harc
        </Button>
      </div>
      <SelectNpcDialog
        setSelectedCharacter={setSelectedNpc}
        open={showSelectNpcDialog}
        setOpen={setShowSelectNpcDialog}
        showCopies={true}
      />
      <SimpleDialog />
    </>
  );
}

export default ControlButtons;
