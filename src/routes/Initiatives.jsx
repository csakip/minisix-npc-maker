import { useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { format, parseDice, roll } from "../dice";
import { db } from "../database/dataStore";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import AddCharacterDialog from "../components/AddCharacterDialog";
import { useLiveQuery } from "dexie-react-hooks";
import SelectNpcDialog from "../components/SelectNpcDialog";
import SimpleModal from "../components/SimpleModal";
import { updateCharacters } from "../utils";
import Tags from "../components/Tags";

const sortableOptions = {
  animation: 150,
  fallbackOnBody: true,
  swapThreshold: 0.65,
  ghostClass: "ghost",
  group: "shared",
};

const Initiatives = () => {
  const [editedCharacter, setEditedCharacter] = useState();
  const [selectedCharacterId, setSelectedCharacterId] = useState();
  const [showSelectNpcDialog, setShowSelectNpcDialog] = useState(false);
  const [simpleModalProps, setSimpleModalProps] = useState({});

  const characters = useLiveQuery(() => db.characters.orderBy("order").toArray());

  function sortCharacters(chars) {
    if (!chars) chars = characters;
    const newOrder = [...chars].sort(
      (a, b) => (b.initiative?.reduced || 0) - (a.initiative?.reduced || 0)
    );
    newOrder.forEach((c, i) => {
      c.order = i;
    });
    updateCharacters(newOrder);
  }

  function reorderCharacters(chars) {
    updateCharacters(chars.map((c, i) => ({ ...c, order: i })));
  }

  function rollInitiative(id) {
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

  function setInitiative(id, value) {
    characters.forEach((character) => {
      if (character.id === id) {
        character.initiative = { sum: value, reduced: value, rolls: ["no"] };
      }
    });
    sortCharacters(characters);
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

  function deleteCharacter(id) {
    db.characters.delete(id);
    // Deselect
    setSelectedCharacterId(undefined);
  }

  function setSelectedNpc(npc) {
    const initiative = npc.attrs.find((a) => a.name === "Ügyesség")?.value || 6;
    console.log(initiative, roll(initiative));
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

  const selectedCharacter = characters?.find((c) => c.id === selectedCharacterId) || null;

  return (
    <Container fluid className='px-3 initiatives'>
      <Row className='pt-2'>
        <Col xs='2'>
          <div className='scrollable-menu buttons d-flex flex-column'>
            <Button size='sm' variant='secondary' onClick={() => rollInitiative()}>
              Kezdeményezés dobás
            </Button>
            <Button size='sm' variant='secondary' onClick={() => sortCharacters()}>
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
        </Col>
        <Col>
          <ListGroup>
            <ReactSortable list={characters || []} setList={reorderCharacters} {...sortableOptions}>
              {characters?.map((character) => (
                <ListGroup.Item
                  key={character.id}
                  className={selectedCharacterId === character.id ? "selected p-0" : "p-0"}>
                  <Row onClick={() => setSelectedCharacterId(character.id)} className='p-2'>
                    <Col xs='1' className='pe-0'>
                      {character.type === "npc" ? (
                        <Button
                          size='sm'
                          className='py-0 px-1 text-nowrap'
                          variant={
                            character.initiative?.rolls[0] === 6
                              ? "success"
                              : character.initiative?.rolls[0] === 1
                              ? "danger"
                              : "secondary"
                          }
                          onClick={() => rollInitiative(character.id)}>
                          {character.initiative?.reduced ?? "-"} ({character.roll})
                        </Button>
                      ) : (
                        <Button
                          size='sm'
                          className='py-0 px-1 text-nowrap'
                          variant='primary'
                          onClick={() => {
                            let init = prompt("Kezdeményezés:", character.initiative?.reduced);
                            if (!isNaN(parseInt(init))) {
                              setInitiative(character.id, parseInt(init));
                            }
                          }}>
                          {character.initiative?.reduced ?? "???"}
                        </Button>
                      )}
                    </Col>
                    <Col>
                      <span className='ps-2 character-name'>{character.name}</span>
                    </Col>{" "}
                    <Col>
                      {character.tags?.map((tag) => (
                        <Badge key={tag.label} className='me-1'>
                          {tag.label} {tag.length}
                        </Badge>
                      ))}
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ReactSortable>
          </ListGroup>
        </Col>
        <Col xs='3'>
          <Row>
            <Col className='scrollable-menu'>
              {selectedCharacterId && (
                <>
                  <Row>
                    <Col>
                      <h3>{selectedCharacter.name}</h3>
                    </Col>
                    <Col className='text-end' xs={3}>
                      <div className='d-flex gap-2 flex-wrap justify-content-end'>
                        <Button onClick={() => setEditedCharacter(selectedCharacter)} size='sm'>
                          <i className='bi bi-pencil'></i>
                        </Button>
                        <Button
                          onClick={() => deleteCharacter(selectedCharacterId)}
                          size='sm'
                          variant='danger'>
                          <i className='bi bi-trash'></i>
                        </Button>
                      </div>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <InputGroup>
                        <InputGroup.Text>Kezdeményezés</InputGroup.Text>
                        <Form.Control
                          value={selectedCharacter.initiative?.reduced ?? "-"}
                          onChange={(e) => setInitiative(selectedCharacter.id, e.target.value)}
                        />
                        <InputGroup.Text key={selectedCharacter.initiative?.reduced}>
                          <Button
                            size='sm'
                            className='py-0 px-1 text-nowrap'
                            variant='secondary'
                            onClick={() => rollInitiative(selectedCharacter.id)}>
                            {selectedCharacter.roll}
                          </Button>
                        </InputGroup.Text>
                      </InputGroup>
                    </Col>
                  </Row>
                  {!!selectedCharacter.initiative?.rolls?.length && (
                    <Row>
                      <Col className='pt-2'>
                        Dobások:{" "}
                        {(selectedCharacter.initiative?.rolls?.map((r) => r) || ["-"]).join(", ")}
                      </Col>
                    </Row>
                  )}
                  {selectedCharacter.notes && (
                    <Row>
                      <Col className='pt-2'>Jegyzetek: {selectedCharacter.notes}</Col>
                    </Row>
                  )}

                  <Tags characters={characters} selectedCharacter={selectedCharacter} />
                </>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
      <AddCharacterDialog
        editedCharacter={editedCharacter}
        setEditedCharacter={setEditedCharacter}
      />
      <SelectNpcDialog
        setSelectedCharacter={setSelectedNpc}
        open={showSelectNpcDialog}
        setOpen={setShowSelectNpcDialog}
      />
      <SimpleModal {...simpleModalProps} />
    </Container>
  );
};
export default Initiatives;
