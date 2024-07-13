import { cloneDeep } from "lodash";
import React from "react";
import { Col, OverlayTrigger, Popover, Row } from "react-bootstrap";
import skillTree from "../assets/skillTree.json";
import {
  convertRange,
  convertSpellDuration,
  displayAsDiceCode,
  displayCharValue,
  findAttr,
  findValue,
  getCalculatedValue,
} from "./utils";
import spellsList from "../assets/spells.json";
import psiList from "../assets/psi.json";
import SeparatedList from "./SeparatedList";

function CharacterSheet({
  attrs = [],
  charName,
  charNotes = "",
  formatted = false,
  rollDice,
  spells = [],
  psis = [],
}) {
  function displaySkills() {
    const filteredSkillTree = cloneDeep(skillTree);

    // Delete specs that are not in attrs
    filteredSkillTree.attributes.forEach((attribute) => {
      attribute.skills?.forEach((skill) => {
        skill.specs = skill.specs?.filter((spec) => findAttr(attrs, spec.name));
        if (skill.specs?.length === 0) delete skill.specs;
      });
    });

    // Delete skills that are not in attrs
    filteredSkillTree.attributes.forEach((attribute) => {
      attribute.skills = attribute.skills?.filter(
        (skill) => findAttr(attrs, skill.name) || skill.specs?.length
      );
    });

    filteredSkillTree.attributes = filteredSkillTree.attributes.filter(
      (attribute) => findAttr(attrs, attribute.name) || attribute.skills?.length
    );

    const attrsStrArray = filteredSkillTree.attributes.map((attribute) =>
      displayCharValue(attrs, attribute.name)
    );
    const skillsStrArray = [];
    filteredSkillTree.attributes.forEach((attribute) => {
      attribute.skills?.forEach((skill) => {
        let s = displayCharValue(attrs, skill.name, attribute.name);
        if (skill.specs) {
          const specArray = [];
          skill.specs?.forEach((spec) => {
            specArray.push(displayCharValue(attrs, spec.name, skill.name, attribute.name));
          });
          s += " (" + specArray.join(", ") + ")";
        }
        skillsStrArray.push(s);
      });
    });

    return (
      <>
        <b>{attrsStrArray.join(", ")}</b>, {skillsStrArray.join(", ")}
      </>
    );
  }

  const calculatedValues = skillTree.calculated
    .map((c) => getCalculatedValue(attrs, c))
    .filter((v) => v);
  const psiMagic = [];
  skillTree.attributes
    .filter((a) => a.showAsSkill)
    .forEach((a) => {
      if (findAttr(attrs, a.name)) psiMagic.push(displayCharValue(attrs, a.name));
    });

  function renderSpellTooltip(props, spell) {
    return (
      <Popover {...props}>
        <Popover.Header as='h3'>
          {spell.name} ({spell.PPE})
        </Popover.Header>
        <Popover.Body>
          <b>Szint:</b> {spell.level}
          <br />
          <b>Hatótáv:</b> {convertRange(spell.range)}
          <br />
          <b>Időtartam:</b> {convertSpellDuration(spell.duration)}
          <br />
          <b>Hatás:</b> {spell.effect}
        </Popover.Body>
      </Popover>
    );
  }
  function renderPsiTooltip(props, psi) {
    return (
      <Popover {...props}>
        <Popover.Header as='h3'>
          {psi.name} ({psi.cost})
        </Popover.Header>
        <Popover.Body>
          <b>Típus:</b> {psi.type}
        </Popover.Body>
      </Popover>
    );
  }
  const spellFlatList = Object.keys(spellsList).flatMap((level) => {
    return spellsList[level]
      .map((spell) => {
        if (spells.includes(spell.name)) {
          return { ...spell, level };
        }
      })
      .filter((spell) => spell);
  });

  const psiFlatList = Object.keys(psiList).flatMap((type) => {
    return psiList[type]
      .map((psi) => {
        if (psis.includes(psi.name)) {
          return { ...psi, type };
        }
      })
      .filter((psi) => psi);
  });

  return (
    <div id='char-display'>
      {formatted ? (
        <>
          {charName && (
            <div>
              <b>{charName}</b>
            </div>
          )}
          <Row className='mb-2'>
            {skillTree.attributes
              .filter((a) => !a.showAsSkill)
              .filter((a) => findAttr(attrs, a.name))
              .map((a) => (
                <Col key={a.name}>
                  <div
                    className='text-nowrap cursor-pointer'
                    onClick={() =>
                      rollDice &&
                      rollDice(
                        findValue(attrs, a.name),
                        a.name + ": " + displayAsDiceCode(findValue(attrs, a.name))
                      )
                    }>
                    {displayCharValue(attrs, a.name)}
                  </div>
                  <div>
                    {a.skills?.map((s) => (
                      <div
                        className='ms-2 text-nowrap cursor-pointer'
                        key={s.name}
                        onClick={() =>
                          rollDice &&
                          rollDice(
                            findValue(attrs, s.name, a.name),
                            s.name + ": " + displayAsDiceCode(findValue(attrs, s.name, a.name))
                          )
                        }>
                        {displayCharValue(attrs, s.name, a.name)}
                        <div>
                          {s.specs
                            ?.filter((sp) => findAttr(attrs, sp.name))
                            .map((sp) => (
                              <div
                                className='ms-2 text-nowrap cursor-pointer'
                                key={sp.name}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  rollDice &&
                                    rollDice(
                                      findValue(attrs, sp.name, a.name),
                                      sp.name +
                                        ": " +
                                        displayAsDiceCode(findValue(attrs, sp.name, a.name))
                                    );
                                }}>
                                {displayCharValue(attrs, sp.name, a.name)}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Col>
              ))}
          </Row>
          {psiMagic.length > 0 && <div>{psiMagic.join(", ")}</div>}
          {calculatedValues.map((v, idx) => (
            <span key={idx} className={`me-1 ${v.highlighted ? "tc-selected" : ""}`}>
              {v.name}: {v.value}
              {calculatedValues.length - 1 !== idx && ", "}
            </span>
          ))}
          {charNotes.length > 0 && (
            <>
              <br className='mb-2' />
              {charNotes.split("\n").map((n, idx) => (
                <React.Fragment key={idx}>
                  {n}
                  <br />
                </React.Fragment>
              ))}
            </>
          )}
        </>
      ) : (
        <>
          {charName && (
            <span className='d-none'>
              <b>{charName}</b>
            </span>
          )}
          <div className='d-none'>{displaySkills()}</div>
          {calculatedValues.map((v, idx) => (
            <span key={idx} className={`me-1 ${v.highlighted ? "tc-selected" : ""}`}>
              {v.name}: {v.value}
              {calculatedValues.length - 1 !== idx && ", "}
            </span>
          ))}
          {charNotes.length > 0 && (
            <>
              <br className='mb-2 d-none' />
              <div className='mb-2 d-none'>
                {charNotes.split("\n").map((n, idx) => (
                  <React.Fragment key={idx}>
                    {n}
                    <br />
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
        </>
      )}
      {psiFlatList.length > 0 && (
        <div className='d-flex flex-wrap'>
          <b>Pszi:&nbsp;</b>
          <SeparatedList>
            {psiFlatList.map((psi) => (
              <OverlayTrigger
                key={psi.name}
                placement='top'
                overlay={(e) => renderPsiTooltip(e, psi)}>
                <span className='text-nowrap cursor-pointer'>
                  {psi.name} ({psi.cost})
                </span>
              </OverlayTrigger>
            ))}
          </SeparatedList>
        </div>
      )}
      {spellFlatList.length > 0 && (
        <div className='d-flex flex-wrap'>
          <b>Varázslatok:&nbsp;</b>
          <SeparatedList>
            {spellFlatList.map((spell) => (
              <OverlayTrigger
                key={spell.name}
                placement='top'
                overlay={(e) => renderSpellTooltip(e, spell)}>
                <span className='text-nowrap cursor-pointer'>
                  {spell.name} ({spell.PPE})
                </span>
              </OverlayTrigger>
            ))}
          </SeparatedList>
        </div>
      )}
    </div>
  );
}

export default CharacterSheet;
