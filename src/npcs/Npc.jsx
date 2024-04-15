import { Button, ButtonGroup, Col, Container, Dropdown, Form, InputGroup, ListGroup, Row } from "react-bootstrap";
import skillTree from "../assets/skillTree.json";
import React, { useEffect, useRef, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import SelectNpcDialog from "../common/SelectNpcDialog";
import { db } from "../database/dataStore";
import { v4 as uuid } from "uuid";
import { randomTables } from "../database/randomTables";
import { d66s } from "../dice";
import TextareaAutosize from "react-textarea-autosize";
import CharacterSheet from "../common/CharacterSheet";
import { displayAsDiceCode, displayCharValue, findAttr, generateRandomDescription } from "../common/utils";
import NpcSidebar from "./NpcSidebar";

const localStored = JSON.parse(localStorage.getItem("minisix-npc-generator"));

function Npc() {
  // get from local storage
  const [attrs, setAttrs] = useState(
    localStored?.attributes ||
      skillTree.attributes.filter((a) => !["Pszi", "Mágia"].includes(a.name)).map((a) => ({ name: a.name, value: 6 }))
  );
  const [charName, setCharName] = useState(localStored?.charName || "");
  const [charNotes, setCharNotes] = useState(localStored?.charNotes || "");
  const [charId, setCharId] = useState(localStored?.id);
  const [showSpec, setShowSpec] = useState(false);
  const [showSelectNpcDialog, setShowSelectNpcDialog] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const localStoreTimerRef = useRef();

  // Save attrs to local storage with debounce
  useEffect(() => {
    if (localStoreTimerRef.current) {
      clearTimeout(localStoreTimerRef.current);
    }

    localStoreTimerRef.current = setTimeout(() => {
      localStorage.setItem("minisix-npc-generator", JSON.stringify({ charName, id: charId, charNotes, attributes: attrs }));
    }, 1000);
  }, [attrs, charName, charNotes, charId]);

  function attrButton(item, step = 1, className = "") {
    const selected = findAttr(attrs, item.name)?.value > 0 ? "selected" : "";
    return (
      <ListGroup.Item
        key={item.name}
        variant={selected}
        className={`py-0 text-nowrap ${selected} ${className}`}
        onMouseDown={(e) => attrButtonClicked(e, item.name, step)}>
        {item.name.split(":")[0]}
        {item.noParent && " *"}
      </ListGroup.Item>
    );
  }

  function attrButtonClicked(e, name, step = 1) {
    e.stopPropagation();
    // e.preventDefault();

    // Add or subtract 1 or 3 depending on the ctrl key
    const add = e.button === 0 ? (e.ctrlKey ? 3 * step : step) : e.ctrlKey ? -3 * step : -step;

    // Increase the value of the attr with the same name as "name"
    let a = findAttr(attrs, name);
    // If the attr doesn't exist, add it
    if (!a) attrs.push((a = { name: name, value: 0 }));

    // Add add to the value, with minimum of 0
    a.value = a.value > 0 || add > 0 ? a.value + add : 0;

    // remove if it has no value
    const newAttrs = attrs.filter((attr) => attr.value > 0);
    setAttrs(newAttrs.map((attr) => (attr.name === name ? a : attr)));
  }

  // Finds the entry in the skill tree in attributes or skills or specs
  // function findInSkillTree(name) {
  //   console.log("findInSkillTree", name);

  //   // return attribute if found
  //   const attr = skillTree.attributes.find((attr) => attr.name === name);
  //   if (attr) return attr;

  //   // return skill if found
  //   const skill = skillTree.attributes
  //     .map((attr) => attr.skills || [])
  //     .flat()
  //     .find((skill) => skill.name === name);
  //   if (skill) {
  //     console.log("skill", name, skill);
  //     return skill;
  //   }

  //   // return spec if found
  //   const spec = skillTree.attributes
  //     .map((attr) => attr.skills || [])
  //     .flat()
  //     .map((skill) => skill.specs || [])
  //     .flat()
  //     .find((spec) => spec.name === name);
  //   if (spec) return spec;
  // }

  function resetChar() {
    setCharName("");
    setCharNotes("");
    setCharId(undefined);
    setAttrs(skillTree.attributes.filter((a) => !["Pszi", "Mágia"].includes(a.name)).map((a) => ({ name: a.name, value: 6 })));
  }

  function calculateCost() {
    let attrCost = 0;
    let skillCost = 0;
    let skipSkillCost = 7 * 3;
    skillTree.attributes.forEach((attribute) => {
      const a = findAttr(attrs, attribute.name);
      if (a) {
        if (["Pszi", "Mágia"].includes(attribute.name)) {
          for (let i = 0; i < a.value; i++) {
            if (i < 6) {
              attrCost++;
            } else {
              if (i < 12 && skipSkillCost > 0) {
                skipSkillCost--;
                continue;
              }
              skillCost += Math.floor((a.value || 0) / 3);
            }
          }
        } else {
          attrCost += a.value;
        }
        // add each skill cost
        attribute.skills?.forEach((skill) => {
          const s = findAttr(attrs, skill.name);
          if (s) {
            // skillCost is calculated by (its value + its parent attribute's value) / 3 for each increment of the value
            for (let i = 0; i < s.value; i++) {
              if (i < 6 && skipSkillCost > 0) {
                skipSkillCost--;
                continue;
              }
              skillCost += Math.floor((s.value + (a.value || 0)) / 3);
            }
          }
          // specs are calculated in the same way, but adding the skill value too for each spec
          skill?.specs?.forEach((spec) => {
            const sp = findAttr(attrs, spec.name);
            if (sp) {
              for (let i = 0; i < sp.value; i++) {
                if (i < 3 && skipSkillCost > 0) {
                  skipSkillCost -= 1 / 3;
                  continue;
                }
                skillCost += Math.floor((sp.value + (s?.value || 0) + (a.value || 0)) / 6);
              }
            }
          });
        });
      }
    });
    return `Tulajdonság: ${displayAsDiceCode(attrCost)} és ${skillCost} Kp`;
  }

  function copyToClipboard() {
    try {
      const charDisplay = document.getElementById("char-display");
      copyToClip(charDisplay.innerHTML);
      // add success class to button
      const copyButton = document.getElementById("copy-button");
      copyButton.classList.add("btn-success");
      setTimeout(() => copyButton.classList.remove("btn-success"), 1000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }

  function copyToClip(str) {
    function listener(e) {
      e.clipboardData.setData("text/html", str);
      e.clipboardData.setData("text/plain", str);
      e.preventDefault();
    }
    document.addEventListener("copy", listener);
    document.execCommand("copy");
    document.removeEventListener("copy", listener);
  }

  function setSelectedCharacter(character) {
    setAttrs(character.attrs);
    setCharName(character.name);
    setCharNotes(character.notes);
    setCharId(character.id);
  }

  // Store to db
  function storeNpc(saveAs = false) {
    console.log(saveAs, charId);
    const toSave = {
      id: saveAs ? uuid() : charId || uuid(),
      name: charName,
      notes: charNotes,
      attrs: attrs,
      updated: Date.now(),
    };
    db.npcs.put(toSave, toSave.id).then((ret) => setCharId(ret));
  }

  function addRandomDescription() {
    const rndDesc = generateRandomDescription();
    setCharNotes(charNotes + "\n" + rndDesc);
  }

  return (
    <Container fluid className='ps-1 npc-generator'>
      <Row>
        <div className='pe-0' style={{ width: "17rem" }}>
          <div className='scrollable-menu position-relative'>
            <div className='position-absolute top-0 end-0 mt-1' style={{ width: "2.3rem" }}>
              <Button
                title='Specializaciók'
                className='position-fixed btn-sm px-2 py-0 z-1'
                onClick={() => setShowSpec(!showSpec)}>
                {showSpec ? <i className='bi bi-chevron-contract'></i> : <i className='bi bi-chevron-expand'></i>}
              </Button>
            </div>
            <ListGroup className='list-group-root skill-tree'>
              {skillTree.attributes.map((attribute) => (
                <React.Fragment key={attribute.name}>
                  {attrButton(attribute)}
                  {attribute.skills && (
                    <ListGroup>
                      {attribute.skills.map((skill) => (
                        <React.Fragment key={skill.name}>
                          {attrButton(skill)}
                          {showSpec && skill.specs && <ListGroup>{skill.specs.map((spec) => attrButton(spec))}</ListGroup>}
                        </React.Fragment>
                      ))}
                    </ListGroup>
                  )}
                </React.Fragment>
              ))}
            </ListGroup>
          </div>
        </div>
        <Col>
          <Container className='main-content' fluid>
            <Row className='pt-2'>
              <Col xs={6}>
                <InputGroup className='mb-2'>
                  <InputGroup.Text>Név</InputGroup.Text>
                  <Form.Control value={charName} onChange={(e) => setCharName(e.target.value)} />
                </InputGroup>
              </Col>
              <Col>
                <h5>{calculateCost()}</h5>
              </Col>
              <Col className='gap-2 d-flex align-items-baseline justify-content-end' xs={2}>
                <Button onClick={() => setShowSelectNpcDialog(true)} title='Kiválasztás'>
                  <i className='bi bi-search'></i>
                </Button>
                <Dropdown as={ButtonGroup}>
                  <Button onClick={() => storeNpc()} title='Mentés' variant='warning' className='pe-1'>
                    <i className='bi bi-floppy'></i>
                  </Button>
                  <Dropdown.Toggle split variant='warning' className='ps-1' />
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => storeNpc(true)}>Másolat mentése</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                <Button onClick={resetChar} title='Új' variant='danger'>
                  <i className='bi bi-eraser'></i>
                </Button>
                <Button onClick={() => setShowSidebar(!showSidebar)} title='Menü' variant='secondary'>
                  <i className='bi bi-list'></i>
                </Button>
              </Col>
            </Row>
            <Row>
              <InputGroup>
                <InputGroup.Text>Egyéb</InputGroup.Text>
                <Form.Control as={TextareaAutosize} value={charNotes} onChange={(e) => setCharNotes(e.target.value)} />
              </InputGroup>
            </Row>
            <Row>
              <Col>
                <Button onClick={addRandomDescription} size='sm' variant='secondary' className='mt-2'>
                  Véletlen leíró
                </Button>
              </Col>
            </Row>
            <div className='d-flex gap-2 mt-2'>
              {skillTree.calculated.map((c) =>
                attrButton({ name: Object.keys(c)[0] }, Object.keys(c)[0] === "Mega páncél" ? 10 : 1, "calculated")
              )}
            </div>
            <Row className='pt-2'>
              {skillTree.attributes.map(
                (attribute) =>
                  !["Pszi", "Mágia"].includes(attribute.name) &&
                  attrs && (
                    <Col key={attribute.name}>
                      {displayCharValue(attrs, attribute.name)}
                      {attribute.skills && (
                        <ListGroup className='py-1'>
                          {attribute.skills.map((skill) => (
                            <ListGroup.Item key={skill.name} className='border-0 py-0 ms-2 pe-0'>
                              {displayCharValue(attrs, skill.name, attribute.name)}
                              {skill.specs && (
                                <ListGroup className='py-0 ms-2'>
                                  {skill.specs.map((spec) => (
                                    <ListGroup.Item key={spec.name} className='border-0 py-0 ms-2 pe-0'>
                                      {displayCharValue(attrs, spec.name, attribute.name, skill.name)}
                                    </ListGroup.Item>
                                  ))}
                                </ListGroup>
                              )}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      )}
                    </Col>
                  )
              )}
              <Col xs={1}>
                <div>{displayCharValue(attrs, "Pszi")}</div>
                <div>{displayCharValue(attrs, "Mágia")}</div>
              </Col>
            </Row>
            <hr />
            <Row>
              <Col>
                <CharacterSheet attrs={attrs} charName={charName} charNotes={charNotes} />
                <Button title='Vágólapra' onClick={copyToClipboard} className='mt-2 btn-sm' id='copy-button' variant='secondary'>
                  <i className='bi bi-clipboard'></i>
                </Button>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
      <SelectNpcDialog
        selectedCharacterId={charId}
        setSelectedCharacter={setSelectedCharacter}
        open={showSelectNpcDialog}
        setOpen={setShowSelectNpcDialog}
      />
      <NpcSidebar
        show={showSidebar}
        setShow={setShowSidebar}
        charName={charName}
        setCharName={setCharName}
        charId={charId}
        setCharId={setCharId}
        charNotes={charNotes}
        setCharNotes={setCharNotes}
        attrs={attrs}
        setAttrs={setAttrs}
      />
    </Container>
  );
}

export default Npc;
