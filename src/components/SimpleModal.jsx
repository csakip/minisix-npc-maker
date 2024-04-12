import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function SimpleModal({
  open,
  title = "Biztosan?",
  body = <p>Megerősíted?</p>,
  okButton = "Igen",
  cancelButton,
  onClose = () => {},
}) {
  return (
    <Modal show={open} onHide={() => onClose(undefined)}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer className='d-flex justify-content-between'>
        {cancelButton && (
          <Button variant='secondary' onClick={() => onClose(false)}>
            {cancelButton}
          </Button>
        )}
        <Button variant='primary' onClick={() => onClose(true)}>
          {okButton}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SimpleModal;
