import { ListGroup, Offcanvas } from "react-bootstrap";
import { exportNpcs, importNpcs } from "../database/dataStore";

function NpcSidebar({
  onclose,
  show,
  setShow,
  charName,
  setCharName,
  charId,
  setCharId,
  charNotes,
  setCharNotes,
  attrs,
  setAttrs,
}) {
  function handleClose() {
    setShow(false);
    onclose && onclose();
  }

  function download() {
    const toSave = {
      charName: charName,
      id: charId,
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
    handleClose();
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
        setCharId(json.id);
        setAttrs(json.attrs);
        handleClose();
      };
      reader.readAsText(file);
    };
    input.click();
  }

  return (
    <Offcanvas show={show} onHide={handleClose} placement='end'>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>NPC menü</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <ListGroup variant='flush' className='d-flex flex-column flush'>
          <ListGroup.Item onClick={download}>
            <i className='bi bi-download me-3'></i>NJK letöltése
          </ListGroup.Item>
          <ListGroup.Item onClick={() => upload(true)}>
            <i className='bi bi-upload me-3'></i>NJK feltöltése
          </ListGroup.Item>
          <ListGroup.Item onClick={() => exportNpcs().then(handleClose)}>
            <i className='bi bi-journal-arrow-down me-3'></i>Adatbázis letöltése
          </ListGroup.Item>
          <ListGroup.Item onClick={() => importNpcs().then(handleClose)}>
            <i className='bi bi-journal-arrow-up me-3'></i>Adatbázis feltöltése
          </ListGroup.Item>
        </ListGroup>
      </Offcanvas.Body>
    </Offcanvas>
  );
}

export default NpcSidebar;
