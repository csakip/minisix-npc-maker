import { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { db } from "../database/dataStore";

const SelectNpcDialog = ({ selectedCharacterId, setSelectedCharacter, open, setOpen }) => {
  const [npcs, setNpcs] = useState([]);
  console.log("selectedCharacterId", selectedCharacterId);

  useEffect(() => {
    async function getNpcs() {
      const storedNpcs = await db.npcs.find().exec();
      setNpcs(storedNpcs.map((x) => x.toMutableJSON()));
    }
    getNpcs();
  }, [open]);

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString("hu-HU");
  }

  return (
    <Modal show={open} onHide={() => setOpen(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Njk lista</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {npcs.length === 0 && <p>Nincs njk elmentve.</p>}
        <ListGroup>
          {npcs.map((npc) => (
            <ListGroup.Item
              action
              className={npc.id === selectedCharacterId ? "list-group-item-info" : ""}
              key={npc.id}
              onClick={() => {
                setSelectedCharacter(npc);
                setOpen(false);
              }}>
              <Row>
                <Col>{npc.name}</Col>
                <Col className='text-end'>{formatDate(npc.updated)}</Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={() => setOpen(false)} className='float-start'>
          Bezár
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SelectNpcDialog;
