import useLocalStorageState from "use-local-storage-state";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { db } from "../database/dataStore";
import AddCharacterDialog from "./AddCharacterDialog";
import ControlButtons from "./ControlButtons";
import DetailsPane from "./DetailsPane";
import InitiativeList from "./InitiativeList";
import { useDiceRoller } from "../common/DiceRoller";
import { Button } from "react-bootstrap";

const Initiatives = () => {
  const [whoseTurn, setWhoseTurn] = useLocalStorageState("whoseTurn", {
    defaultValue: 0,
  });
  const [editedCharacter, setEditedCharacter] = useState();
  const [selectedCharacterId, setSelectedCharacterId] = useState();
  const [round, setRound] = useState(
    parseInt(localStorage.getItem("minisix-npc-generator-round") ?? "1") || 1
  );

  const { DiceRoller, rollDice } = useDiceRoller();

  const characters = useLiveQuery(() => db.characters.orderBy("order").toArray());

  function newRound(value) {
    const newValue = round + value || 1;
    setRound(newValue);
    localStorage.setItem("minisix-npc-generator-round", newValue);
    setWhoseTurn(0);
  }

  function stepWhosTurn() {
    if (whoseTurn >= characters.length - 1) {
      newRound(1);
      setWhoseTurn(0);
    } else {
      setWhoseTurn(whoseTurn + 1);
    }
  }

  function setWhoseTurnToCharacter(character) {
    setWhoseTurn(characters.indexOf(character));
  }

  return (
    <Container fluid className='px-3 initiatives'>
      <Row className='pt-2'>
        <Col xs='1'>
          <ControlButtons
            setEditedCharacter={setEditedCharacter}
            characters={characters}
            newRound={newRound}
          />
        </Col>
        <Col>
          <h5>
            <Button size='sm' className='me-3 py-0' variant='info' onClick={stepWhosTurn}>
              <i className='bi bi-arrow-down'></i>
            </Button>
            {round}. kör{" "}
          </h5>
          <InitiativeList
            {...{ characters, selectedCharacterId, setSelectedCharacterId, whoseTurn }}
          />
        </Col>
        <Col xs='6'>
          <div className='scrollable-menu'>
            {selectedCharacterId && (
              <DetailsPane
                {...{
                  selectedCharacterId,
                  setSelectedCharacterId,
                  setEditedCharacter,
                  characters,
                  rollDice,
                  setWhoseTurnToCharacter,
                }}
              />
            )}
          </div>
        </Col>
      </Row>
      <AddCharacterDialog
        editedCharacter={editedCharacter}
        setEditedCharacter={setEditedCharacter}
      />
      <DiceRoller />
    </Container>
  );
};
export default Initiatives;
