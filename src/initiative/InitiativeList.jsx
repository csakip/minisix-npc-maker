import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import { ReactSortable } from "react-sortablejs";
import { rollInitiative, setInitiative, updateCharacters } from "../common/utils";
import SimpleModal from "../common/SimpleModal";
import { useState } from "react";

const sortableOptions = {
  animation: 150,
  fallbackOnBody: true,
  swapThreshold: 0.65,
  ghostClass: "ghost",
  group: "shared",
};

function InitiativeList({ characters, selectedCharacterId, setSelectedCharacterId }) {
  const [enterInitiativeOpen, setEnterInitiativeOpen] = useState(false);

  function reorderCharacters(chars) {
    updateCharacters(chars.map((c, i) => ({ ...c, order: i })));
  }

  function setInitiativeForSelectedCharacter(value) {
    if (value && !isNaN(parseInt(value))) {
      setInitiative(selectedCharacterId, parseInt(value), characters);
    }
    setEnterInitiativeOpen(false);
  }

  return (
    <>
      <ListGroup>
        <ReactSortable list={characters || []} setList={reorderCharacters} {...sortableOptions}>
          {characters?.map((character) => (
            <ListGroup.Item
              key={character.id}
              className={selectedCharacterId === character.id ? "selected p-0" : "p-0"}>
              <Row
                onClick={() =>
                  setSelectedCharacterId(
                    selectedCharacterId === character.id ? undefined : character.id
                  )
                }
                className='p-2'>
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
                        setEnterInitiativeOpen(true);
                      }}>
                      {character.initiative?.reduced ?? <i className='bi bi-pencil px-1'></i>}
                    </Button>
                  )}
                </Col>
                <Col xs='2'>
                  <span className='character-name'>{character.name}</span>
                </Col>
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
      <SimpleModal
        open={enterInitiativeOpen}
        onClose={setInitiativeForSelectedCharacter}
        title='Kezdeményezés'
        body={<></>}
        okButton='OK'
        cancelButton='Bezár'
        input=' '
      />
    </>
  );
}

export default InitiativeList;
