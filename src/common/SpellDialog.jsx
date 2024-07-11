import { Table, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { Fragment, useEffect, useState } from "react";
import { fuzzyMatch } from "./utils";
import spellsList from "../assets/spells.json";

const SpellDialog = ({ open, setOpen, characterSpells, callback }) => {
  const [filter, setFilter] = useState("");
  const [spells, setSpells] = useState(spellsList);
  const [books, setBooks] = useState(["Rifts"]);
  const [selectedSpells, setSelectedSpells] = useState(characterSpells || []);

  useEffect(() => {
    console.log("open", open, characterSpells);
    setSelectedSpells(characterSpells);
  }, [open]);

  function close() {
    setFilter("");
    setOpen(false);
  }

  useEffect(() => {
    let filteredList = {};
    Object.keys(spellsList).forEach((level) => {
      const filteredLevel = spellsList[level].filter((spell) => {
        if (filter.trim() !== "") {
          return fuzzyMatch(filter, spell.name) && books.includes(spell.book);
        } else {
          return books.includes(spell.book);
        }
      });
      if (filteredLevel.length > 0) filteredList[level] = filteredLevel;
    });

    setSpells(filteredList);
  }, [filter, books]);

  function scroll(id) {
    document
      .getElementById("scrollableBody")
      .scrollTo({ top: document.getElementById(id).offsetTop - 110, behavior: "smooth" });
  }

  function scrollToSpell(e, spellName) {
    e.preventDefault();
    Object.keys(spells).forEach((level) => {
      spells[level].forEach((spell, idx) => {
        if (spell.name === spellName) {
          const table = document.getElementById("table_" + level);
          const row = table.children[1].children[idx];
          const posY = table.offsetTop + row.offsetTop - 250;
          document.getElementById("scrollableBody").scrollTo({ top: posY, behavior: "smooth" });
        }
      });
    });
  }

  function closeAndReturn() {
    close();
    callback(selectedSpells);
  }

  return (
    <>
      <Modal show={open} onHide={close} size='xl'>
        <Modal.Body>
          <>
            <Button
              type='button'
              className='btn-close'
              aria-label='Close'
              style={{ position: "absolute", right: "1em", backgroundColor: "unset" }}
              onClick={close}></Button>
            <Row>
              <Col className='align-self-center'>
                <Form.Control
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder='Keresés'
                  className='mb-3'
                  size='sm'
                />
              </Col>
              <Col>
                <ToggleButtonGroup
                  name='tags'
                  size='sm'
                  value={books}
                  onChange={setBooks}
                  type='checkbox'>
                  <ToggleButton id='Rifts' value='Rifts' variant='secondary'>
                    Rifts
                  </ToggleButton>
                  <ToggleButton id='FoM' value='FoM' variant='secondary'>
                    FoM
                  </ToggleButton>
                </ToggleButtonGroup>
                <Button
                  variant='warning'
                  size='sm'
                  onClick={() => setSelectedSpells([])}
                  className='ms-2'>
                  <i className='bi bi-trash'></i>
                </Button>
              </Col>
            </Row>
            {!Object.keys(spells).length && <h4 className='text-center'>Nincs találat</h4>}
            <Row>
              <Col className='d-flex gap-2'>
                {Object.keys(spells).map((level) => (
                  <Button
                    variant='outline-secondary'
                    size='sm'
                    className='py-0 mb-1'
                    onClick={() => scroll("level_" + level)}
                    key={level}>
                    {level}
                  </Button>
                ))}
              </Col>
            </Row>
            <div
              id='scrollableBody'
              className='overflow-auto scrollable-menu'
              style={{ height: "70vh" }}>
              {Object.keys(spells).map((level) => (
                <Fragment key={level}>
                  <h5 id={"level_" + level}>Level {level}</h5>
                  <Table striped hover id={"table_" + level}>
                    <thead>
                      <tr>
                        <th>Spell name</th>
                        <th className='text-center'>PPE</th>
                        <th>Range</th>
                        <th>Duration</th>
                        <th>Effect</th>
                        <th>Book</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spells[level].map((spell) => {
                        const cls = selectedSpells.includes(spell.name) ? "bg-success" : "";
                        return (
                          <tr
                            role='button'
                            key={spell.name}
                            onClick={() => {
                              if (selectedSpells.includes(spell.name)) {
                                setSelectedSpells(selectedSpells.filter((s) => s !== spell.name));
                              } else {
                                setSelectedSpells([...selectedSpells, spell.name]);
                              }
                            }}>
                            <td className={cls}>{spell.name}</td>
                            <td className={cls + " text-center"}>{spell.PPE}</td>
                            <td className={cls}>{spell.range}</td>
                            <td className={cls}>{spell.duration}</td>
                            <td className={cls}>{spell.effect}</td>
                            <td className={cls}>
                              {spell.book} {spell.page}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Fragment>
              ))}
            </div>
          </>
        </Modal.Body>
        <Modal.Footer>
          <Col className='d-flex flex-wrap column-gap-2'>
            {Object.keys(spellsList).map((level) => {
              return spellsList[level].map((spell) => {
                if (selectedSpells.includes(spell.name)) {
                  return (
                    <a
                      key={spell.name}
                      onClick={(e) => scrollToSpell(e, spell.name)}
                      href='#'
                      className='text-nowrap'>
                      {spell.name} ({spell.PPE})
                    </a>
                  );
                }
              });
            })}
          </Col>
          <Col xs='1' className='d-flex justify-content-end'>
            <Button variant='secondary' onClick={closeAndReturn} className='float-start'>
              Mentés
            </Button>
          </Col>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SpellDialog;
