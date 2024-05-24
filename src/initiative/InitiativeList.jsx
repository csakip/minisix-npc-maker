import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Row from "react-bootstrap/Row";
import { ReactSortable } from "react-sortablejs";
import { rollInitiative, setInitiative, updateCharacters } from "../common/utils";
import { useSimpleDialog } from "../common/SimpleDialog";

const sortableOptions = {
  animation: 150,
  fallbackOnBody: true,
  swapThreshold: 0.65,
  ghostClass: "ghost",
  group: "shared",
};

function InitiativeList({ characters, selectedCharacterId, setSelectedCharacterId }) {
  const { openModal, closeModal, SimpleDialog } = useSimpleDialog();

  function reorderCharacters(chars) {
    updateCharacters(chars.map((c, i) => ({ ...c, order: i })));
  }

  function setInitiativeForCharacter(characterId, value) {
    if (value && !isNaN(parseInt(value))) {
      setInitiative(characterId, parseInt(value), characters);
    }
    closeModal(false);
  }

  return (
    <>
      <ListGroup>
        <ReactSortable list={characters || []} setList={reorderCharacters} {...sortableOptions}>
          {characters?.map((character) => (
            <ListGroup.Item
              key={character.id}
              className={selectedCharacterId === character.id ? "selected p-0" : "p-0"}>
              <Row onMouseDown={() => setSelectedCharacterId(character.id)} className='p-2'>
                <Col xs='1' className='pe-0' style={{ width: "10%" }}>
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
                        openModal({
                          onClose: (value) => setInitiativeForCharacter(character.id, value),
                          title: "Kezdeményezés",
                          body: <></>,
                          okButton: "OK",
                          cancelButton: "Bezár",
                          input: true,
                          defaultInputText: character.initiative?.reduced,
                        });
                      }}>
                      {character.initiative?.reduced ?? <i className='bi bi-pencil px-1'></i>}
                    </Button>
                  )}
                </Col>
                <Col>
                  <span className='character-name me-3'>{character.name}</span>
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
      <SimpleDialog />
    </>
  );
}

export default InitiativeList;
