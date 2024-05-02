import { useCallback, useEffect, useState } from "react";
import { Button, Card, Form, InputGroup } from "react-bootstrap";
import { db } from "../database/dataStore";
import { throttle } from "lodash";

function Counter({ characters, counterName, selectedCharacterId }) {
  const character = characters?.find((c) => c.id === selectedCharacterId) || null;
  if (!character.counters) character.counters = [];

  const [editName, setEditName] = useState("");
  const [editValue, setEditValue] = useState(
    character.counters?.find((cnt) => cnt.name === counterName)?.value || 0
  );

  useEffect(() => {
    if (!counterName) return;
    let value;
    try {
      value = parseInt(editValue) || 0;
    } catch (e) {
      value = editValue;
    }
    character.counters = character.counters.map((cnt) =>
      cnt.name === counterName ? { ...cnt, value } : cnt
    );
    storeCounter(character.counters);
  }, [editValue]);

  const storeCounter = useCallback(
    throttle((newCounters) => {
      db.characters.update(character.id, { counters: newCounters });
    }, 1000),
    []
  );

  async function addNewCounter() {
    if (character.counters?.find((cnt) => cnt.name === editName)) {
      alert("Már van ilyen névvel");
      return;
    }
    character.counters?.push({ name: editName, value: 0 });
    storeCounter(character.counters);
    setEditName("");
  }

  async function deleteCounter() {
    character.counters = character.counters.filter((cnt) => cnt.name !== counterName) || [];
    storeCounter(character.counters);
  }

  function handleEditValueChange(e) {
    // Keep only numbers and math operators
    setEditValue(e.target.value.replace(/[^0-9+\-*/.()]/g, ""));
  }

  function handleEditValueKeyDown(e) {
    if (e.keyCode === 13) {
      parseValueAsMathFunction(e.target.value);
    }
  }

  // Parse value as an math expression and execute it
  function parseValueAsMathFunction(value) {
    try {
      const ret = Function(`return ${value}`)();
      setEditValue(ret);
    } catch (e) {
      setEditValue(editValue);
    }
  }

  // Add value to editValue or if ctrl is held, add or subtract 10*value
  function addToEditValue(e, value) {
    if (e.ctrlKey) {
      value *= 10;
    }
    setEditValue((v) => v + value);
  }

  return !counterName ? (
    <Card style={{ width: "6.5rem" }}>
      <Card.Body className='p-2 d-flex flex-column justify-content-between'>
        <div>
          <InputGroup>
            <Form.Control
              placeholder='Új számláló'
              size='sm'
              className='mb-1'
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </InputGroup>
        </div>
        <div className='d-flex gap-1'>
          <Button
            variant='primary flex-grow-1'
            size='sm'
            disabled={!editName.trim().length}
            onClick={addNewCounter}>
            <i className='bi bi-plus'></i>
          </Button>
        </div>
      </Card.Body>
    </Card>
  ) : (
    <Card style={{ width: "min-content" }}>
      <Card.Body className='p-2 d-flex flex-column justify-content-between'>
        <h6 className='text-nowrap'>
          {counterName}
          <Button
            size='sm'
            style={{ backgroundColor: "transparent" }}
            className='p-0 opacity-50 border-0 position-absolute end-0 top-0'
            title='Számláló törlése'
            onClick={deleteCounter}>
            <i className='bi bi-x'></i>
          </Button>
        </h6>
        <div>
          <InputGroup>
            <Form.Control
              className='mb-1 text-center p-0 fs-5'
              value={editValue}
              onChange={handleEditValueChange}
              onKeyDown={handleEditValueKeyDown}
              onBlur={(e) => parseValueAsMathFunction(e.target.value)}
            />
          </InputGroup>
        </div>
        <div className='d-flex gap-1'>
          <Button variant='primary flex-grow-1' size='sm' onClick={(e) => addToEditValue(e, -1)}>
            <i className='bi bi-chevron-down'></i>
          </Button>
          <Button variant='primary flex-grow-1' size='sm' onClick={(e) => addToEditValue(e, 1)}>
            <i className='bi bi-chevron-up'></i>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
export default Counter;
