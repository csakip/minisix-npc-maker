import { ListGroup } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { db } from "../database/dataStore";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";

const SelectNpcDialog = ({ selectedCharacterId, setSelectedCharacter, open, setOpen }) => {
  const [filter, setFilter] = useState("");

  const npcs = useLiveQuery(() => {
    if (filter === "") return db.npcs.orderBy("updated").toArray();
    return db.npcs.filter((npc) => npc.name.toLowerCase().includes(filter.toLowerCase())).toArray();
  }, [filter]);

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString("hu-HU");
  }

  function close() {
    setFilter("");
    setOpen(false);
  }

  return (
    <Modal show={open} onHide={close}>
      <Modal.Header closeButton>
        <Modal.Title>Njk lista</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <>
          <Form.Control
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder='Keresés'
            className='mb-3'
          />
          {npcs?.length === 0 && <h4 className='text-center'>Nincs találat</h4>}
          <ListGroup>
            {npcs?.map((npc) => (
              <ListGroup.Item
                action
                className={npc.id === selectedCharacterId ? "list-group-item-info" : ""}
                key={npc.id}
                onClick={() => {
                  setSelectedCharacter(npc);
                  close();
                }}>
                <Row>
                  <Col>{npc.name}</Col>
                  <Col className='text-end' xs={5}>
                    {formatDate(npc.updated)}
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={close} className='float-start'>
          Bezár
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SelectNpcDialog;
