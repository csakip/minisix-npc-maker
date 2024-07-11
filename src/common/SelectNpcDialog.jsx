import { InputGroup, ListGroup } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { db } from "../database/dataStore";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { useSimpleDialog } from "./SimpleDialog";
import { fuzzyMatch } from "./utils";

const SelectNpcDialog = ({
  selectedCharacterId,
  setSelectedCharacter,
  open,
  setOpen,
  showCopies = false,
}) => {
  const [filter, setFilter] = useState("");
  const [copies, setCopies] = useState(1);
  const { openModal, closeModal, SimpleDialog } = useSimpleDialog();
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (open) setShowArchived(false);
  }, [open]);

  const npcs = useLiveQuery(() => {
    if (filter === "")
      return db.npcs
        .orderBy("updated")
        .filter((npc) =>
          showArchived
            ? (npc.tags || []).includes("archived")
            : !(npc.tags || []).includes("archived")
        )
        .toArray();
    return db.npcs
      .orderBy("updated")
      .filter(
        (npc) =>
          fuzzyMatch(filter, npc.name) &&
          (showArchived
            ? (npc.tags || []).includes("archived")
            : !(npc.tags || []).includes("archived"))
      )
      .toArray();
  }, [filter, showArchived]);

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString("hu-HU");
  }

  function close() {
    setFilter("");
    setCopies(1);
    setOpen(false);
  }

  return (
    <>
      <Modal show={open} onHide={close} size='lg'>
        <Modal.Header closeButton>
          <Modal.Title>Njk lista</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <Row>
              <Col>
                <Form.Control
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder='Keresés'
                  className='mb-3'
                  size='sm'
                />
              </Col>
              {showCopies && (
                <Col xs={2}>
                  <InputGroup size='sm'>
                    <InputGroup.Text>Db</InputGroup.Text>
                    <Form.Control
                      value={copies}
                      onChange={(e) =>
                        setCopies(isNaN(parseInt(e.target.value)) ? 1 : parseInt(e.target.value))
                      }
                      className='text-center'
                      title='Darabszám'
                    />
                  </InputGroup>
                </Col>
              )}
              {!showCopies && (
                <Col xs={2}>
                  <Form.Check
                    label='Archív'
                    reverse
                    value={showArchived}
                    onChange={() => setShowArchived(!showArchived)}
                  />
                </Col>
              )}
            </Row>
            {npcs?.length === 0 && <h4 className='text-center'>Nincs találat</h4>}
            <ListGroup>
              {npcs?.map((npc) => (
                <ListGroup.Item
                  className={npc.id === selectedCharacterId ? "list-group-item-info" : ""}
                  key={npc.id}
                  onClick={() => {
                    setSelectedCharacter(npc, parseInt(copies));
                    close();
                  }}>
                  <Row>
                    <Col>{npc.name}</Col>
                    <Col className='text-end' xs={5}>
                      {formatDate(npc.updated)}
                    </Col>
                    {!showCopies && (
                      <Col xs={2} className='d-flex gap-1 justify-content-end'>
                        <Button
                          title='Archiválás'
                          variant='secondary'
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const isArchive = (npc.tags || []).includes("archived");

                            db.npcs.update(npc.id, {
                              tags: isArchive
                                ? npc.tags.filter((tag) => tag !== "archived")
                                : [...(npc.tags || []), "archived"],
                            });
                          }}
                          size='sm'>
                          <i className='bi bi-archive'></i>
                        </Button>
                        <Button
                          variant='danger'
                          onClick={(e) => {
                            e.preventDefault();
                            openModal({
                              title: "Végleges törlés!",
                              body: `Biztosan törlöd: ${npc.name}?`,
                              okButton: "Törlés",
                              cancelButton: "Mégse",
                              onClose: (ret) => {
                                if (ret) db.npcs.delete(npc.id);
                                closeModal();
                              },
                            });
                          }}
                          size='sm'>
                          <i className='bi bi-trash'></i>
                        </Button>
                      </Col>
                    )}
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
      <SimpleDialog />
    </>
  );
};

export default SelectNpcDialog;
