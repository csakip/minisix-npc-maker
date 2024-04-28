import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Row from "react-bootstrap/Row";
import { rollInitiative, setInitiative } from "../common/utils";
import { db } from "../database/dataStore";
import Tags from "./Tags";
import CharacterSheet from "../common/CharacterSheet";
import { useCallback, useEffect, useState } from "react";
import reactTextareaAutosize from "react-textarea-autosize";
import { debounce } from "lodash";

function DetailsPane({
  selectedCharacterId,
  setSelectedCharacterId,
  setEditedCharacter,
  characters,
}) {
  const [npc, setNpc] = useState();
  const selectedCharacter = characters?.find((c) => c.id === selectedCharacterId) || null;
  const [charNotes, setCharNotes] = useState(selectedCharacter?.charNotes || "");

  useEffect(() => {
    if (selectedCharacter) {
      setCharNotes(selectedCharacter?.charNotes || "");
      // If it's an npc (by name), load it from db
      db.npcs.where("name").equals(selectedCharacter.name).first().then(setNpc);
    }
  }, [selectedCharacter]);

  function deleteCharacter(id) {
    db.characters.delete(id);
    // Deselect
    setSelectedCharacterId(undefined);
  }

  // Update char notes in db with debounce
  const delayedUpdateCharNotes = useCallback(
    debounce((selectedCharacterId, text) => {
      db.characters.where({ id: selectedCharacterId }).modify({ charNotes: text });
    }, 1000),
    []
  );

  function updateCharNotes(text) {
    setCharNotes(text);
    delayedUpdateCharNotes(selectedCharacterId, text);
  }

  return (
    selectedCharacter && (
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
                onChange={(e) => setInitiative(selectedCharacter.id, e.target.value, characters)}
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
        {npc && (
          <Row>
            <Col className='pt-2'>
              <CharacterSheet attrs={npc.attrs} charNotes={npc.notes} />
            </Col>
          </Row>
        )}

        <Row>
          <Col>
            <Tags characters={characters} selectedCharacter={selectedCharacter} />
          </Col>
        </Row>
        <Row>
          <Col>
            <InputGroup className='mt-2'>
              <Form.Control
                as={reactTextareaAutosize}
                value={charNotes}
                onChange={(e) => updateCharNotes(e.target.value)}
                placeholder='Jegyzetek'
              />
            </InputGroup>
          </Col>
        </Row>
      </>
    )
  );
}

export default DetailsPane;
