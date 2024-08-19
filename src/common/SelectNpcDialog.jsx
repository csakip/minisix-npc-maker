import { Badge, InputGroup, ListGroup } from "react-bootstrap";
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
  const [tags, setTags] = useState(new Set(["archived"]));
  const [selectedTags, setSelectedTags] = useState([]);
  const [excludedTags, setExcludedTags] = useState(["archived"]);
  const [multiSelect, setMultiSelect] = useState(false);
  const [multiselected, setMultiselected] = useState([]);

  useEffect(() => {
    if (open) {
      setSelectedTags(selectedTags.filter((t) => t !== "archived"));
      setExcludedTags(["archived"]);
      setMultiSelect(false);
      setMultiselected([]);
    }
  }, [open]);

  const npcs = useLiveQuery(
    () =>
      db.npcs
        .orderBy("updated")
        .filter((npc) => {
          const textFilterMatch = filter === "" || fuzzyMatch(filter, npc.name);

          let selectedFilterMatch = true;
          if (selectedTags.length) {
            selectedFilterMatch = selectedTags.every((t) => (npc.tags || []).includes(t));
          }

          let excludedFilterMatch = true;
          if (excludedTags.length) {
            excludedFilterMatch = !excludedTags.some((t) => (npc.tags || []).includes(t));
          }

          return textFilterMatch && selectedFilterMatch && excludedFilterMatch;
        })
        .toArray(),
    [filter, selectedTags, excludedTags]
  );

  useEffect(() => {
    if (!npcs) return;
    const readTags = new Set([
      "archived",
      ...npcs
        .map((npc) => npc.tags)
        .flat()
        .filter((t) => t),
    ]);
    setTags(readTags);
    selectedTags.forEach((t) => {
      if (!readTags.has(t)) setSelectedTags(selectedTags.filter((s) => s !== t));
    });
  }, [npcs]);

  function formatDate(timestamp) {
    return new Date(timestamp).toLocaleString("hu-HU");
  }

  function close() {
    setFilter("");
    setCopies(1);
    setOpen(false);
  }

  function addTagToSelecteds(tag) {
    const changes = [];
    if (tag && multiselected.length > 0) {
      npcs.forEach((npc) => {
        if (multiselected.includes(npc.id) && !npc.tags?.includes(tag)) {
          changes.push({ key: npc.id, changes: { tags: [...(npc.tags || []), tag] } });
        }
      });
    }
    if (changes.length > 0) db.npcs.bulkUpdate(changes);
    setMultiSelect(false);
  }

  function removeTagFromSelecteds(tag) {
    const changes = [];
    if (tag && multiselected.length > 0) {
      npcs.forEach((npc) => {
        if (multiselected.includes(npc.id) && npc.tags?.includes(tag)) {
          changes.push({
            key: npc.id,
            changes: { tags: (npc.tags || []).filter((t) => t !== tag) },
          });
        }
      });
    }
    if (changes.length > 0) db.npcs.bulkUpdate(changes);
  }

  function tagClicked(tag) {
    if (tag === "Archív") tag = "archived";
    if (multiSelect) {
      // Add-remove from all selected npcs
      if (multiselected.length === 0) return;
      const everySelectedHasTag = multiselected.every((id) =>
        npcs.find((npc) => npc.id === id).tags?.includes(tag)
      );
      if (everySelectedHasTag) {
        removeTagFromSelecteds(tag);
      } else {
        addTagToSelecteds(tag);
      }
      setMultiSelect(false);
    } else {
      // Archive is a 2 state tag
      if (tag === "archived") {
        if (selectedTags.includes("archived")) {
          setSelectedTags(selectedTags.filter((t) => t !== "archived"));
          setExcludedTags([...excludedTags, "archived"]);
        } else {
          setSelectedTags([...selectedTags, "archived"]);
          setExcludedTags(excludedTags.filter((t) => t !== "archived"));
        }
      } else if (selectedTags.includes(tag)) {
        setSelectedTags(selectedTags.filter((t) => t !== tag));
        setExcludedTags([...excludedTags, tag]);
      } else if (excludedTags.includes(tag)) {
        setExcludedTags(excludedTags.filter((t) => t !== tag));
      } else {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  }

  return (
    <>
      <Modal show={open} onHide={close} dialogClassName='modal-90w'>
        <Modal.Header closeButton>
          <Modal.Title>Njk lista</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <>
            <Row>
              <Col xs={3}>
                <InputGroup size='sm' className='mb-2'>
                  <Form.Control
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder='Keresés'
                    size='sm'
                  />
                  <Button size='sm' onClick={() => setFilter("")} variant='outline-secondary'>
                    <i className='bi bi-x-lg'></i>
                  </Button>
                </InputGroup>
              </Col>
              {showCopies && (
                <Col xs={{ span: 1, offset: 8 }}>
                  <InputGroup size='sm'>
                    <InputGroup.Text>Mennyit?</InputGroup.Text>
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
            </Row>
            <Row>
              <Col className='d-flex gap-1 mb-2'>
                <>
                  {[...tags]?.map((tag) => (
                    <Button
                      key={tag}
                      size='sm'
                      className='me-1 cursor-pointer py-0'
                      variant={
                        selectedTags.includes(tag)
                          ? "primary"
                          : excludedTags.includes(tag)
                          ? "danger"
                          : "secondary"
                      }
                      onClick={() => tagClicked(tag)}>
                      {tag === "archived" ? "Archiv" : tag}
                    </Button>
                  ))}
                  {[...excludedTags]
                    ?.filter((tag) => ![...tags].includes(tag))
                    .map((tag) => (
                      <Button
                        key={tag}
                        size='sm'
                        className='me-1 cursor-pointer py-0'
                        variant='danger'
                        onClick={() => tagClicked(tag)}>
                        {tag === "archived" ? "Archiv" : tag}
                      </Button>
                    ))}
                  {multiSelect && (
                    <Button
                      size='sm'
                      className='me-1 cursor-pointer py-0'
                      onClick={() =>
                        openModal({
                          title: "Új címke",
                          input: "Címke",
                          onClose: addTagToSelecteds,
                        })
                      }>
                      <i className='bi bi-plus-lg'></i>
                    </Button>
                  )}
                </>
              </Col>
            </Row>
            {npcs?.length === 0 && <h4 className='text-center'>Nincs találat</h4>}
            <ListGroup>
              {npcs?.map((npc) => (
                <ListGroup.Item
                  className={npc.id === selectedCharacterId ? "list-group-item-info" : ""}
                  key={npc.id}
                  onClick={() => {
                    if (multiSelect) {
                      setMultiselected(
                        multiselected.includes(npc.id)
                          ? multiselected.filter((id) => id !== npc.id)
                          : [...multiselected, npc.id]
                      );
                    } else {
                      setSelectedCharacter(npc, parseInt(copies));
                      close();
                    }
                  }}>
                  <Row>
                    {multiSelect && (
                      <Col xs={1}>
                        <input type='checkbox' checked={multiselected.includes(npc.id)} readOnly />
                      </Col>
                    )}
                    <Col>{npc.name}</Col>
                    <Col>
                      {npc.tags?.map((tag) => (
                        <Badge key={tag} className='me-1' bg='secondary'>
                          {tag === "archived" ? "Archiv" : tag}
                        </Badge>
                      ))}
                    </Col>
                    <Col className='text-end' xs={5}>
                      {formatDate(npc.updated)}
                    </Col>
                    {!showCopies && (
                      <Col xs={2} className='d-flex gap-1 justify-content-end'>
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
          <Row className='d-flex gap-1 flex-fill flex-nowrap'>
            <Col className='flex-fill'>
              {!showCopies && (
                <Form.Check
                  id='multiSelect'
                  label='Kijelölés'
                  onChange={() => {
                    setMultiSelect(!multiSelect);
                    setMultiselected([]);
                  }}
                  checked={multiSelect}
                />
              )}
            </Col>
            <Col>
              <Button variant='secondary' onClick={close} className='float-start'>
                Bezár
              </Button>
            </Col>
          </Row>
        </Modal.Footer>
      </Modal>
      <SimpleDialog />
    </>
  );
};

export default SelectNpcDialog;
