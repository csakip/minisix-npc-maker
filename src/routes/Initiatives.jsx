import { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import { Button, Col, Container, ListGroup, Row, InputGroup, Form } from "react-bootstrap";
import { parseDice, roll } from "../dice";

const sortableOptions = {
  animation: 150,
  fallbackOnBody: true,
  swapThreshold: 0.65,
  ghostClass: "ghost",
  group: "shared",
};

const Initiatives = () => {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState();

  useEffect(() => {
    setCharacters(
      [
        { name: "Character 1", id: 1, initiative: 0, roll: "2d+2" },
        { name: "Character 2", id: 2, initiative: 0, roll: "1d+2" },
        { name: "Character 3", id: 3, initiative: 0, roll: "3d" },
      ].map((c) => {
        c.initiative = roll(parseDice(c.roll));
        return c;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sortCharacters(chars) {
    if (!chars) chars = characters;
    setCharacters([...chars].sort((a, b) => a.initiative.sum - b.initiative.sum));
  }

  function rollInitiative(id) {
    characters.forEach((character) => {
      if ((id === undefined || character.id === id) && character.roll) {
        character.initiative = roll(parseDice(character.roll));
      }
    });
    sortCharacters(characters);
  }

  function setInitiative(id, value) {
    characters.forEach((character) => {
      if (character.id === id) {
        character.initiative = { sum: value, reduced: value, rolls: ["no"] };
      }
    });
    sortCharacters(characters);
  }

  return (
    <Container fluid className='px-3 initiatives'>
      <Row className='pt-2'>
        <Col xs='2'>
          <div className='scrollable-menu buttons d-flex flex-column'>
            <Button
              size='sm'
              variant='secondary'
              className='d-block'
              onClick={() => rollInitiative()}>
              Kezdeményezés dobás
            </Button>
            <Button size='sm' variant='secondary' onClick={() => sortCharacters()}>
              Sorrendbe
            </Button>
          </div>
        </Col>
        <Col>
          <ListGroup>
            <ReactSortable list={characters} setList={setCharacters} {...sortableOptions}>
              {characters.map((character) => (
                <ListGroup.Item
                  key={character.id}
                  className={selectedCharacter?.id === character.id ? "selected p-0" : "p-0"}>
                  <Row onClick={() => setSelectedCharacter(character)} className='p-2'>
                    <Col xs='1' className='pe-0'>
                      <Button
                        size='sm'
                        className='py-0 px-1 text-nowrap'
                        variant={
                          character.initiative.rolls[0] === 6
                            ? "success"
                            : character.initiative.rolls[0] === 1
                            ? "danger"
                            : "secondary"
                        }
                        onClick={() => rollInitiative(character.id)}>
                        {character.initiative.reduced} ({character.roll})
                      </Button>
                    </Col>
                    <Col>
                      <span className='ps-2'>{character.name}</span>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ReactSortable>
          </ListGroup>
        </Col>
        <Col xs='3'>
          <Row>
            <Col className='scrollable-menu'>
              {selectedCharacter && (
                <>
                  <Row>
                    <Col>
                      <h3>{selectedCharacter.name}</h3>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <InputGroup>
                        <InputGroup.Text>Kezdeményezés</InputGroup.Text>
                        <Form.Control
                          value={selectedCharacter.initiative.sum}
                          onChange={(e) => setInitiative(selectedCharacter.id, e.target.value)}
                        />
                        <InputGroup.Text key={selectedCharacter.initiative?.sum}>
                          <Button
                            size='sm'
                            className='py-0 px-1 text-nowrap'
                            variant='secondary'
                            onClick={() => rollInitiative(selectedCharacter.id)}>
                            {selectedCharacter.roll}
                          </Button>
                        </InputGroup.Text>
                      </InputGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className='pt-2'>
                      Rolls:{" "}
                      {(selectedCharacter.initiative?.rolls?.map((r) => r) || ["-"]).join(", ")}
                    </Col>
                  </Row>
                </>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};
export default Initiatives;
