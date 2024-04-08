import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { parseDice, roll } from "../dice";

const AddCharacterDialog = ({ editedCharacter, setEditedCharacter, characters, setCharacters }) => {
  return (
    <Modal show={editedCharacter} onHide={() => setEditedCharacter(undefined)}>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          // Update if id matches, create and add if not
          const index = characters.findIndex((c) => c.id === editedCharacter?.id);
          editedCharacter.type = editedCharacter.roll ? "npc" : "pc";
          if (index !== -1) {
            const newCharacters = [...characters];
            newCharacters[index] = editedCharacter;
            setCharacters(newCharacters);
          } else {
            setCharacters([...characters, { ...editedCharacter }]);
          }
          setEditedCharacter(undefined);
        }}>
        <Modal.Header closeButton>
          <Modal.Title>Kezdeményezés</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col>
              <Form.Group controlId='characterName'>
                <Form.Control
                  type='text'
                  placeholder='Név'
                  value={editedCharacter?.name ?? ""}
                  autoFocus
                  onChange={(e) => setEditedCharacter({ ...editedCharacter, name: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId='characterRoll'>
                <Form.Control
                  type='text'
                  placeholder='Dobás'
                  value={editedCharacter?.roll ?? ""}
                  onChange={(e) => {
                    setEditedCharacter({
                      ...editedCharacter,
                      roll: e.target.value,
                      initiative: roll(parseDice(e.target.value)),
                    });
                  }}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className='justify-content-between'>
          <Button
            variant='secondary'
            onClick={() => setEditedCharacter(undefined)}
            className='float-start'>
            Bezár
          </Button>
          <Button variant='primary' type='submit'>
            Ment
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddCharacterDialog;
