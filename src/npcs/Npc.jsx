import {
  Button,
  ButtonGroup,
  Col,
  Container,
  Dropdown,
  Form,
  InputGroup,
  ListGroup,
  Row,
} from "react-bootstrap";
import skillTree from "../assets/skillTree.json";
import React, { useCallback, useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import SelectNpcDialog from "../common/SelectNpcDialog";
import { db } from "../database/dataStore";
import { v4 as uuid } from "uuid";
import TextareaAutosize from "react-textarea-autosize";
import CharacterSheet from "../common/CharacterSheet";
import {
  displayAsDiceCode,
  displayCharValue,
  findAttr,
  generateRandomDescription,
} from "../common/utils";
import NpcSidebar from "./NpcSidebar";
import { useSimpleDialog } from "../common/SimpleDialog";
import useLocalStorageState from "use-local-storage-state";
import { debounce } from "lodash";

function Npc() {
  const [currentNpc, setCurrentNpc] = useLocalStorageState("minisix-npc-generator-currentnpc", {
    defaultValue: {},
  });

  const [attrs, setAttrs] = useState(
    currentNpc?.attrs ||
      skillTree.attributes.filter((a) => !a.showAsSkill).map((a) => ({ name: a.name, value: 6 }))
  );
  const [charName, setCharName] = useState(currentNpc?.charName || "");
  const [charNotes, setCharNotes] = useState(currentNpc?.charNotes || "");
  const [charId, setCharId] = useState(currentNpc?.id);
  const [showSpec, setShowSpec] = useState(false);
  const [showSelectNpcDialog, setShowSelectNpcDialog] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const { openModal, SimpleDialog } = useSimpleDialog();

  // Load character if id is set in query
  useEffect(() => {
    async function setFromSearchParams() {
      const url = new URL(window.location.href);
      const id = url.searchParams.get("id");
      if (id) {
        // Remove id from url
        const url = window.location.href.split("?")[0];
        const hash = window.location.hash.split("#")[1];
        const urlPath = url + "#" + hash;
        window.history.pushState(null, "", urlPath);

        // Load npc by id
        const npc = await db.npcs.get(id);
        if (npc) {
          setSelectedCharacter(npc);
        }
      }
    }
    setFromSearchParams();
  }, []);

  const storeCurrentNpc = useCallback(
    debounce(
      (attrs, charName, charNotes, charId) => setCurrentNpc({ attrs, charName, charNotes, charId }),
      1000
    ),
    []
  );

  // Save attrs to local storage with debounce
  useEffect(() => {
    storeCurrentNpc(attrs, charName, charNotes, charId);
  }, [attrs, charName, charNotes, charId]);

  function attrButton(item, step = 1, className = "") {
    const selected = findAttr(attrs, item.name)?.value ? "selected" : "";
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

    // Middle button resets to 0
    if (e.button === 1) {
      setAttrs(attrs.filter((attr) => attr.name != name));
      return;
    }

    // Add or subtract 1 or 3 depending on the ctrl key
    const add = e.button === 0 ? (e.ctrlKey ? 3 * step : step) : e.ctrlKey ? -3 * step : -step;

    // Increase the value of the attr with the same name as "name"
    let a = findAttr(attrs, name);
    // If the attr doesn't exist, add it
    if (!a) attrs.push((a = { name: name, value: 0 }));

    // Add add to the value, with minimum of 0
    a.value = a.value + add;

    // remove if it has no value
    const newAttrs = attrs.filter((attr) => attr.value != 0);
    setAttrs(newAttrs.map((attr) => (attr.name === name ? a : attr)));
  }

  // Finds the entry in the skill tree in attributes or skills or specs
  function findInSkillTree(name) {
    // return attribute if found
    for (let a = 0; a < skillTree.attributes.length; a++) {
      const attr = skillTree.attributes[a];
      if (attr.name === name) {
        return { attribute: attr };
      }
      // return skill if found
      for (let s = 0; s < (attr.skills?.length ?? 0); s++) {
        const skill = attr.skills[s];
        if (skill.name === name) {
          return { attribute: attr, skill };
        }
        // return spec if found
        for (let sp = 0; sp < (skill.specs?.length ?? 0); sp++) {
          const spec = skill.specs[sp];
          if (spec.name === name) {
            return { attribute: attr, skill, spec };
          }
        }
      }
    }
  }

  function resetChar() {
    setCharName("");
    setCharNotes("");
    setCharId(undefined);
    setAttrs(
      skillTree.attributes.filter((a) => !a.showAsSkill).map((a) => ({ name: a.name, value: 6 }))
    );
  }

  function calculateCost() {
    let attrCost = 0;
    let skillCost = 0;

    // Do the specs
    Object.values(attrs).forEach((attr) => {
      const asc = findInSkillTree(attr.name);
      if (asc?.spec) {
        skillCost += attr.value / 3;
      } else if (asc?.skill) {
        skillCost += attr.value;
      } else if (asc?.attribute) {
        attrCost += attr.value;
      }
    });

    return (
      <div className='d-flex gap-3'>
        <h5>Tulajdonság: {displayAsDiceCode(attrCost)}</h5>
        <h5>Képzettség: {displayAsDiceCode(Math.ceil(skillCost))}</h5>
      </div>
    );
  }

  function copyToClipboard(e, target) {
    try {
      let content;
      if (target === "statBlock") {
        const charDisplay = document.getElementById("char-display");
        content = charDisplay.innerHTML;
      }
      if (target === "url") {
        const hash = window.location.href.split("#");
        const url = hash[0].split("?")[0];
        content = url + "?id=" + charId + "#" + hash[1];
      }
      console.log(charName, content);
      copyToClip(content);
      // Add success class to button
      const copyButton = e.target;
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
  function confirmStoreNpc() {
    if (charId) {
      openModal({
        title: "Felülírod?",
        cancelButton: "Mégse",
        okButton: "Igen",
        body: "Biztosan rámented?",
        onClose: (confirmed) => confirmed && storeNpc(false),
      });
    } else {
      storeNpc(false);
    }
  }

  function storeNpc(saveAs = false) {
    console.log("Saving npc", saveAs, charId);
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
    <>
      <Container fluid className='ps-1 npc-generator'>
        <Row>
          <div className='pe-0' style={{ width: "17rem" }}>
            <div className='scrollable-menu position-relative'>
              <div className='position-absolute top-0 end-0 mt-1' style={{ width: "2.3rem" }}>
                <Button
                  title='Specializaciók'
                  className='position-fixed btn-sm px-2 py-0 z-1'
                  onClick={() => setShowSpec(!showSpec)}>
                  {showSpec ? (
                    <i className='bi bi-chevron-contract'></i>
                  ) : (
                    <i className='bi bi-chevron-expand'></i>
                  )}
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
                            {showSpec && skill.specs && (
                              <ListGroup>{skill.specs.map((spec) => attrButton(spec))}</ListGroup>
                            )}
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
                    {charId && (
                      <Button
                        title='Vágólapra'
                        onClick={(e) => copyToClipboard(e, "url")}
                        variant='secondary'>
                        <i className='bi bi-link'></i>
                      </Button>
                    )}
                  </InputGroup>
                </Col>
                <Col className='align-content-center'>{calculateCost()}</Col>
                <Col className='gap-2 d-flex align-items-baseline justify-content-end' xs={2}>
                  <Button onClick={() => setShowSelectNpcDialog(true)} title='Kiválasztás'>
                    <i className='bi bi-search'></i>
                  </Button>
                  <Dropdown as={ButtonGroup}>
                    <Button
                      onClick={() => confirmStoreNpc()}
                      title='Mentés'
                      variant='warning'
                      className='pe-1'>
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
                  <Button
                    onClick={() => setShowSidebar(!showSidebar)}
                    title='Menü'
                    variant='secondary'>
                    <i className='bi bi-list'></i>
                  </Button>
                </Col>
              </Row>
              <Row>
                <InputGroup>
                  <InputGroup.Text>Egyéb</InputGroup.Text>
                  <Form.Control
                    as={TextareaAutosize}
                    value={charNotes}
                    onChange={(e) => setCharNotes(e.target.value)}
                  />
                </InputGroup>
              </Row>
              <Row>
                <Col>
                  <Button
                    onClick={addRandomDescription}
                    size='sm'
                    variant='secondary'
                    className='mt-2'>
                    Véletlen leíró
                  </Button>
                </Col>
              </Row>
              <ListGroup horizontal className='d-flex gap-2 mt-2'>
                {skillTree.calculated.map((c) =>
                  attrButton({ name: c.name }, c.name === "Mega páncél" ? 10 : 1, "calculated")
                )}
              </ListGroup>
              <Row className='pt-2'>
                {skillTree.attributes
                  .filter((a) => !a.showAsSkill)
                  .map(
                    (attribute) =>
                      attrs && (
                        <Col key={attribute.name}>
                          {displayCharValue(attrs, attribute.name)}
                          {attribute.skills && (
                            <ListGroup className='py-1'>
                              {attribute.skills.map((skill) => (
                                <ListGroup.Item
                                  key={skill.name}
                                  className='border-0 py-0 ms-2 pe-0'>
                                  {displayCharValue(attrs, skill.name, attribute.name)}
                                  {skill.specs && (
                                    <ListGroup className='py-0 ms-2'>
                                      {skill.specs.map((spec) => (
                                        <ListGroup.Item
                                          key={spec.name}
                                          className='border-0 py-0 ms-2 pe-0'>
                                          {displayCharValue(
                                            attrs,
                                            spec.name,
                                            attribute.name,
                                            skill.name
                                          )}
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
                  {skillTree.attributes
                    .filter((a) => a.showAsSkill)
                    .map((a) => (
                      <div key={a.name}>{displayCharValue(attrs, a.name)}</div>
                    ))}
                </Col>
              </Row>
              <Row>
                <Col>
                  <CharacterSheet attrs={attrs} charName={charName} charNotes={charNotes} />
                  <Button
                    title='Vágólapra'
                    onClick={(e) => copyToClipboard(e, "statBlock")}
                    className='mt-2 btn-sm'
                    variant='secondary'>
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
      <SimpleDialog />
    </>
  );
}

export default Npc;
