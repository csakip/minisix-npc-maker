import { useState } from "react";
import Button from "react-bootstrap/Button";
import SelectNpcDialog from "../common/SelectNpcDialog";
import SimpleModal from "../common/SimpleModal";
import { rollInitiative, sortCharacters, updateCharacters } from "../common/utils";
import { db } from "../database/dataStore";
import { format, roll } from "../dice";

function ControlButtons({ setEditedCharacter, characters }) {
  const [showSelectNpcDialog, setShowSelectNpcDialog] = useState(false);
  const [simpleModalProps, setSimpleModalProps] = useState({});

  function setSelectedNpc(npc) {
    const initiative = npc.attrs.find((a) => a.name === "Ügyesség")?.value || 6;
    const toSave = {
      name: npc.name,
      roll: format(initiative),
      type: "npc",
      initiative: roll(initiative),
      notes: npc.notes,
      tags: [],
      order: 100000,
    };
    db.characters.put(toSave);
  }

  function newRound() {
    updateCharacters(
      characters.map((character) => {
        // if (character.roll) character.initiative = roll(parseDice(character.roll));
        // if a tag has a length, reduce it. if it reaches 0, remove it
        if (character.tags) {
          character.tags = character.tags
            .map((t) => {
              if (t.length) {
                return { ...t, length: t.length - 1 };
              }
              return t;
            })
            .filter((t) => t.length === undefined || t.length > 0);
        }
        return character;
      })
    );
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
        <Button size='sm' variant='secondary' onClick={() => newRound()}>
          Új kör
        </Button>
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
            setSimpleModalProps({
              open: true,
              title: "Törlés",
              body: "Törlösz minden njk-t és a játékosok kezdeményezését?",
              cancelButton: "Mégse",
              onClose: (ret) => {
                if (ret) {
                  db.characters.bulkDelete(
                    characters.filter((c) => c.type === "npc").map((c) => c.id)
                  );
                  db.characters.toCollection().modify({ initiative: undefined });
                }
                setSimpleModalProps((props) => ({ ...props, open: false }));
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
      />
      <SimpleModal {...simpleModalProps} />
    </>
  );
}

export default ControlButtons;
