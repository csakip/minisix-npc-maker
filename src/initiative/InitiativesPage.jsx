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

const Initiatives = () => {
  const [editedCharacter, setEditedCharacter] = useState();
  const [selectedCharacterId, setSelectedCharacterId] = useState();
  const [round, setRound] = useState(parseInt(localStorage.getItem("minisix-npc-generator-round") ?? "1") || 1);

  const characters = useLiveQuery(() => db.characters.orderBy("order").toArray());

  function newRound(value) {
    const newValue = round + value || 1;
    setRound(newValue);
    localStorage.setItem("minisix-npc-generator-round", newValue);
  }

  return (
    <Container fluid className='px-3 initiatives'>
      <Row className='pt-2'>
        <Col xs='1'>
          <ControlButtons setEditedCharacter={setEditedCharacter} characters={characters} newRound={newRound} />
        </Col>
        <Col>
          <h5>{round}. kör</h5>
          <InitiativeList {...{ characters, selectedCharacterId, setSelectedCharacterId }} />
        </Col>
        <Col xs='5'>
          <Row>
            <Col className='scrollable-menu'>
              {selectedCharacterId && (
                <DetailsPane
                  {...{
                    selectedCharacterId,
                    setSelectedCharacterId,
                    setEditedCharacter,
                    characters,
                  }}
                />
              )}
            </Col>
          </Row>
        </Col>
      </Row>
      <AddCharacterDialog editedCharacter={editedCharacter} setEditedCharacter={setEditedCharacter} />
    </Container>
  );
};
export default Initiatives;
