import { cloneDeep, isNumber, isObject } from "lodash";
import { displayCharValue, findAttr } from "./utils";
import skillTree from "../assets/skillTree.json";
import React from "react";

function CharacterSheet({ attrs = [], charName, charNotes = "" }) {
  // Returns the calculated value. if the calculator.value is an array, add the values of their attr.value
  function getCalculatedValue(calculated) {
    if (attrs.length === 0) return;
    const { name, value } = calculated;

    // If value is an array, calculate the sum of its values
    if (Array.isArray(value)) {
      return {
        name,
        value:
          value.map((value) => findAttr(attrs, value)?.value || 0).reduce((a, b) => a + b, 0) +
          (findAttr(attrs, name)?.value || 0),
        highlighted: calculated.highlighted,
      };
    }

    // If value is a number, use the attribute, and add value to it
    if (isNumber(value)) {
      const sum = value + (findAttr(attrs, name)?.value || 0);
      if (!sum) return undefined;
      return { name: name, value: sum, highlighted: calculated.highlighted };
    }

    // Calculate body points (Highest skill under Test d*4 + pip + 20)
    if (isObject(value) && value.special === "test") {
      // skill with the highest value
      const testAttribute = skillTree.attributes.find((a) => a.name === "Test");
      const highestTestSkill = testAttribute?.skills?.reduce((a, b) =>
        (findAttr(attrs, a.name)?.value || 0) > (findAttr(attrs, b.name)?.value || 0) ? a : b
      );
      const highestTestSkillValue =
        findAttr(attrs, "Test").value + findAttr(attrs, highestTestSkill.name)?.value || 0;
      const sum =
        Math.floor(highestTestSkillValue / 3) * 4 +
        (highestTestSkillValue % 3) +
        20 +
        (findAttr(attrs, "Test pont")?.value || 0);
      return { name: name, value: sum, highlighted: calculated.highlighted };
    }

    // Calculate psi resistance
    if (isObject(value) && value.special === "pszi") {
      const willpower =
        (findAttr(attrs, "Elme")?.value || 0) + (findAttr(attrs, "Akaraterő")?.value || 0);
      const psi = findAttr(attrs, "Pszi")?.value || 0;
      const psiRes = findAttr(attrs, "Pszi ellenállás")?.value || 0;
      const addNum = Math.floor((Math.floor(willpower / 3) + Math.floor(psi / 3)) / 2) + psiRes;
      return {
        name: name,
        value: "4d" + (addNum ? "+" + addNum : "") + " (vs 20)",
        highlighted: calculated.highlighted,
      };
    }

    // Calculate magic attack
    if (findAttr(attrs, "Mágia") && value.special === "magic") {
      const magic = findAttr(attrs, "Mágia")?.value || 0;
      const magicAttack = findAttr(attrs, "Mágikus erő")?.value || 0;
      const addNum = Math.floor(magic / 3) + magicAttack;
      return {
        name: name,
        value: "6d" + (addNum ? "+" + addNum : "") + " (vs 24)",
        highlighted: calculated.highlighted,
      };
    }
    return;
  }

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

    return attrsStrArray.join(", ") + "\n" + skillsStrArray.join(", ");
  }

  return (
    <div id='char-display'>
      {charName && (
        <>
          <b>{charName}</b>:{" "}
        </>
      )}
      {displaySkills()}
      <br className='mb-2' />
      <span>
        {skillTree.calculated
          .map((c) => getCalculatedValue(c))
          .filter((v) => v)
          .map((v, idx) => (
            <span key={idx} className={`me-1 ${v.highlighted ? "tc-selected" : ""}`}>
              {v.name}: {v.value}
              {idx < skillTree.calculated.length - 1 ? "," : ""}
            </span>
          ))}
      </span>
      <br className='mb-2' />
      {charNotes.split("\n").map((n, idx) => (
        <React.Fragment key={idx}>
          {n}
          <br />
        </React.Fragment>
      ))}
    </div>
  );
}

export default CharacterSheet;
