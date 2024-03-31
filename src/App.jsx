import { Button, Col, Container, Form, InputGroup, ListGroup, Row } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import skillTree from "./assets/skillTree.json";
import { useEffect, useRef, useState } from "react";
import { cloneDeep, isNumber, isObject } from "lodash";
import "bootstrap-icons/font/bootstrap-icons.min.css";

function App() {
  // get from local storage
  const [attrs, setAttrs] = useState(
    JSON.parse(localStorage.getItem("minisix-npc-generator")) ||
      skillTree.attributes
        .filter((a) => !["Pszi", "Mágia"].includes(a.name))
        .map((a) => ({ name: a.name, value: 6 }))
  );
  const [charName, setCharName] = useState("");
  const [charNotes, setCharNotes] = useState("");
  const [showSpec, setShowSpec] = useState(false);

  const localStoreTimerRef = useRef();

  // Save attrs to local storage with debounce
  useEffect(() => {
    if (localStoreTimerRef.current) {
      clearTimeout(localStoreTimerRef.current);
    }

    localStoreTimerRef.current = setTimeout(() => {
      localStorage.setItem("minisix-npc-generator", JSON.stringify(attrs));
    }, 1000);
  }, [attrs]);

  function findAttr(name) {
    return attrs.find((attr) => attr.name === name);
  }

  // Returns a string from the value like 2d+1, where value /3 is before the d, the remainder is after the d
  function displayCharValue(name, add1, add2) {
    let value1 = findAttr(name)?.value || 0;
    let value2 = 0;
    if (add1) value2 += findAttr(add1)?.value || 0;
    if (add2) value2 += findAttr(add2)?.value || 0;
    if (!value1) return "";
    return `${name} ${displayAsDiceCode(value1 + value2)}`;
  }

  function displayAsDiceCode(value) {
    // Get the number before the d
    const before = Math.floor(value / 3);
    // Get the number after the d
    const after = value % 3;
    return `${before}d${after === 0 ? "" : "+" + after}`;
  }

  function attrButton(item, step = 1) {
    const variant = findAttr(item.name)?.value > 0 ? "primary" : "secondary";
    return (
      <Button
        key={item.name}
        variant={variant}
        size='sm'
        type='button'
        className='py-0 text-nowrap'
        onMouseDown={(e) => attrButtonClicked(e, item.name, step)}>
        {item.name.split(":")[0]}
        {item.noParent && " *"}
      </Button>
    );
  }

  function attrButtonClicked(e, name, step = 1) {
    e.stopPropagation();
    e.preventDefault();

    // Add or subtract 1 or 3 depending on the ctrl key
    const add = e.button === 0 ? (e.ctrlKey ? 3 * step : step) : e.ctrlKey ? -3 * step : -step;

    // Increase the value of the attr with the same name as "name"
    let a = findAttr(name);
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

  function displaySkills() {
    const filteredSkillTree = cloneDeep(skillTree);

    // Delete specs that are not in attrs
    filteredSkillTree.attributes.forEach((attribute) => {
      attribute.skills?.forEach((skill) => {
        skill.specs = skill.specs?.filter((spec) => findAttr(spec.name));
        if (skill.specs?.length === 0) delete skill.specs;
      });
    });

    // Delete skills that are not in attrs
    filteredSkillTree.attributes.forEach((attribute) => {
      attribute.skills = attribute.skills?.filter(
        (skill) => findAttr(skill.name) || skill.specs?.length
      );
    });

    filteredSkillTree.attributes = filteredSkillTree.attributes.filter(
      (attribute) => findAttr(attribute.name) || attribute.skills?.length
    );

    const attrsStrArray = filteredSkillTree.attributes.map((attribute) =>
      displayCharValue(attribute.name)
    );
    const skillsStrArray = [];
    filteredSkillTree.attributes.forEach((attribute) => {
      attribute.skills?.forEach((skill) => {
        let s = displayCharValue(skill.name, attribute.name);
        if (skill.specs) {
          const specArray = [];
          skill.specs?.forEach((spec) => {
            specArray.push(displayCharValue(spec.name, skill.name, attribute.name));
          });
          s += " (" + specArray.join(", ") + ")";
        }
        skillsStrArray.push(s);
      });
    });

    return attrsStrArray.join(", ") + " - " + skillsStrArray.join(", ");
  }

  function resetChar() {
    setCharName("");
    setCharNotes("");
    setAttrs(
      skillTree.attributes
        .filter((a) => !["Pszi", "Mágia"].includes(a.name))
        .map((a) => ({ name: a.name, value: 6 }))
    );
  }

  // Returns the calculated value. if the calculator.value is an array, add the values of their attr.value
  function getCalculatedValue(calculated) {
    const name = Object.keys(calculated)[0];
    const value = Object.values(calculated)[0];
    if (Array.isArray(value)) {
      return (
        name +
        ": " +
        (value.map((value) => findAttr(value)?.value || 0).reduce((a, b) => a + b, 0) +
          (findAttr(name)?.value || 0))
      );
    }
    if (isNumber(value)) {
      const sum = value + (findAttr(name)?.value || 0);
      if (!sum) return undefined;
      return name + ": " + sum;
    }
    // Calculate body points (Highest skill under Test d*4 + pip + 20)
    if (isObject(value) && value.special === "test") {
      // skill with the highest value
      const testAttribute = skillTree.attributes.find((a) => a.name === "Test");
      const highestTestSkill = testAttribute?.skills?.reduce((a, b) =>
        (findAttr(a.name)?.value || 0) > (findAttr(b.name)?.value || 0) ? a : b
      );
      const highestTestSkillValue =
        findAttr("Test").value + findAttr(highestTestSkill.name)?.value || 0;
      const sum =
        Math.floor(highestTestSkillValue / 3) * 4 +
        (highestTestSkillValue % 3) +
        20 +
        (findAttr("Test pont")?.value || 0);
      return name + ": " + sum;
    }
    return "nope";
  }

  function download() {
    const toSave = {
      charName: charName,
      charNotes: charNotes,
      attrs: attrs,
    };
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(toSave))
    );
    element.setAttribute("download", `${charName || "MiniSixNPC"}.m6.json`);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  // Displays a file selector for json files and reads back the same format as the download function
  function upload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = () => {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const json = JSON.parse(reader.result);
        setCharName(json.charName);
        setCharNotes(json.charNotes);
        setAttrs(json.attrs);
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function calculateCost() {
    let attrCost = 0;
    let skillCost = 0;
    let skipSkillCost = 7 * 3;
    skillTree.attributes.forEach((attribute) => {
      const a = findAttr(attribute.name);
      if (a) {
        attrCost += a.value;
        // add each skill cost
        attribute.skills?.forEach((skill) => {
          const s = findAttr(skill.name);
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
            const sp = findAttr(spec.name);
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

  return (
    <Container fluid className='ps-1'>
      <Row>
        <div className='pe-0' style={{ width: "17rem" }}>
          <div className='scrollable-menu' style={{ height: "100vh", overflow: "auto" }}>
            <Button
              title='Specializaciók'
              className='float-end btn-sm px-2 py-0 mt-0'
              onClick={() => setShowSpec(!showSpec)}>
              {showSpec ? (
                <i className='bi bi-chevron-contract'></i>
              ) : (
                <i className='bi bi-chevron-expand'></i>
              )}
            </Button>
            <div className='py-0'>
              {skillTree.attributes.map((attribute) => (
                <div key={attribute.name} className='border-0 py-0 p-0'>
                  {attrButton(attribute)}
                  {attribute.skills && (
                    <div className='py-0'>
                      {attribute.skills.map((skill) => (
                        <div key={skill.name} className='border-0 py-0 ms-4 pe-0'>
                          {attrButton(skill)}
                          {showSpec && skill.specs && (
                            <div className='py-0'>
                              {skill.specs.map((spec) => (
                                <div key={spec.name} className='border-0 py-0 ms-4 pe-0'>
                                  {attrButton(spec)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
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
                <Button onClick={download} title='Letöltés'>
                  <i className='bi bi-floppy'></i>
                </Button>
                <Button onClick={upload} title='Feltöltés'>
                  <i className='bi bi-upload'></i>
                </Button>
                <Button onClick={resetChar} title='Törlés'>
                  <i className='bi bi-x-circle'></i>
                </Button>
              </Col>
            </Row>
            <Row>
              <InputGroup>
                <InputGroup.Text>Egyéb</InputGroup.Text>
                <Form.Control
                  as='textarea'
                  value={charNotes}
                  onChange={(e) => setCharNotes(e.target.value)}
                />
              </InputGroup>
            </Row>
            <div className='d-flex gap-2 mt-2'>
              {skillTree.calculated.map((c) =>
                attrButton(
                  { name: Object.keys(c)[0] },
                  Object.keys(c)[0] === "Mega páncél" ? 10 : 1
                )
              )}
            </div>
            <Row className='pt-2'>
              {skillTree.attributes.map(
                (attribute) =>
                  !["Pszi", "Mágia"].includes(attribute.name) &&
                  attrs && (
                    <Col key={attribute.name}>
                      {displayCharValue(attribute.name)}
                      {attribute.skills && (
                        <ListGroup className='py-1'>
                          {attribute.skills.map((skill) => (
                            <ListGroup.Item key={skill.name} className='border-0 py-0 ms-2 pe-0'>
                              {displayCharValue(skill.name, attribute.name)}
                              {skill.specs && (
                                <ListGroup className='py-0 ms-2'>
                                  {skill.specs.map((spec) => (
                                    <ListGroup.Item
                                      key={spec.name}
                                      className='border-0 py-0 ms-2 pe-0'>
                                      {displayCharValue(spec.name, attribute.name, skill.name)}
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
                <div>{displayCharValue("Pszi")}</div>
                <div>{displayCharValue("Mágia")}</div>
              </Col>
            </Row>
            <hr />
            <Row>
              <p>
                <b>{charName}</b>: {displaySkills()}
                <br />
                {skillTree.calculated
                  .map((c) => getCalculatedValue(c))
                  .filter((v) => v)
                  .join(", ")}
                <br />
              </p>
              <pre>{charNotes}</pre>
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
}

export default App;