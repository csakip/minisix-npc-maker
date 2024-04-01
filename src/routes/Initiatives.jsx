import { useEffect, useState } from "react";
import { Container, ListGroup } from "react-bootstrap";

const Initiatives = () => {
  const [groups, setGroups] = useState([{ name: "Group 1", id: 1, characters: [] }]);

  useEffect(() => {
    const c = { name: "Character 1", id: 1, initiative: 1 };
    setGroups([{ name: "Group 1", id: 1, characters: [c] }]);
  }, []);

  return (
    <Container>
      <h1>Initiatives</h1>
      <ListGroup>
        {groups.map((group) => (
          <ListGroup.Item key={group.id}>
            {group.name}
            <ListGroup>
              {group.characters.map((character) => (
                <ListGroup.Item key={character.id}>
                  {character.name} {character.initiative}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Container>
  );
};
export default Initiatives;
