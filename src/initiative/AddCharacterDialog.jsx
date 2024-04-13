import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { parseDice, roll } from "../dice";
import { db } from "../database/dataStore";

const AddCharacterDialog = ({ editedCharacter, setEditedCharacter }) => {
  return (
    <Modal show={editedCharacter} onHide={() => setEditedCharacter(undefined)}>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          editedCharacter.type = editedCharacter.roll ? "npc" : "pc";
          editedCharacter.order = editedCharacter.order || 100000;
          db.characters.put(editedCharacter, editedCharacter.id);
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
                  autoComplete='off'
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId='characterRoll'>
                <Form.Control
                  type='text'
                  placeholder='Dobás'
                  value={editedCharacter?.roll ?? ""}
                  autoComplete='off'
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
