import { useState } from "react";
import Button from "react-bootstrap/Button";
import SelectNpcDialog from "../common/SelectNpcDialog";
import { getCalculatedValue, rollInitiative, sortCharacters } from "../common/utils";
import { db } from "../database/dataStore";
import { format, roll } from "../dice";
import { useSimpleDialog } from "../common/SimpleDialog";
import { ButtonGroup } from "react-bootstrap";

function ControlButtons({ setEditedCharacter, characters, newRound, setSelectedCharacterId }) {
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
      if (bodyPoints)
        toSave.counters.push({
          name: bodyPoints.name,
          value: bodyPoints.value,
          max: bodyPoints.value,
        });

      const armourPoints = npc.attrs.find((a) => a.name === "Mega páncél");
      if (armourPoints)
        toSave.counters.push({ name: armourPoints.name, value: armourPoints.value });

      const manaPoints = npc.attrs.find((a) => a.name === "Mana pont");
      if (manaPoints) toSave.counters.push({ name: manaPoints.name, value: manaPoints.value });

      const psiPoints = npc.attrs.find((a) => a.name === "Pszi pont");
      if (psiPoints) toSave.counters.push({ name: psiPoints.name, value: psiPoints.value });

      db.characters.put(toSave).then((ret) => setSelectedCharacterId(ret));
    }
  }

  function startNewRound(increment = 1) {
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
          variant='info'
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
                    characters
                      .filter(
                        (c) =>
                          (c.dontDelete === undefined && c.type === "npc") || c.dontDelete === false
                      )
                      .map((c) => c.id)
                  );
                  db.characters.toCollection().modify({ initiative: undefined });
                  rollInitiative(undefined, characters);
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
