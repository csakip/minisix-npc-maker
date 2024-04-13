import { useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { db } from "../database/dataStore";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import AddCharacterDialog from "./AddCharacterDialog";
import { useLiveQuery } from "dexie-react-hooks";
import { rollInitiative, sortCharacters, updateCharacters } from "../common/utils";
import Tags from "./Tags";
import ControlButtons from "./ControlButtons";

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

  const characters = useLiveQuery(() => db.characters.orderBy("order").toArray());

  function reorderCharacters(chars) {
    updateCharacters(chars.map((c, i) => ({ ...c, order: i })));
  }

  function setInitiative(id, value) {
    characters.forEach((character) => {
      if (character.id === id) {
        character.initiative = { sum: value, reduced: value, rolls: ["no"] };
      }
    });
    sortCharacters(characters);
  }

  function deleteCharacter(id) {
    db.characters.delete(id);
    // Deselect
    setSelectedCharacterId(undefined);
  }

  const selectedCharacter = characters?.find((c) => c.id === selectedCharacterId) || null;

  return (
    <Container fluid className='px-3 initiatives'>
      <Row className='pt-2'>
        <Col xs='2'>
          <ControlButtons setEditedCharacter={setEditedCharacter} characters={characters} />
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
                          onClick={() => rollInitiative(character.id, characters)}>
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
                            onClick={() => rollInitiative(selectedCharacter.id, characters)}>
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
    </Container>
  );
};
export default Initiatives;
