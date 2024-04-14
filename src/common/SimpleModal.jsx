import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { useEffect, useState } from "react";

function SimpleModal({
  open,
  title = "Biztosan?",
  body = <p>Megerősíted?</p>,
  okButton = "Igen",
  cancelButton,
  input,
  onClose = () => {},
}) {
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    setInputText("");
  }, [open]);

  function submitForm(e) {
    e.preventDefault();
    onClose(inputText);
  }
  return (
    <Modal show={open} onHide={() => onClose(undefined)}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {body}
        {input && (
          <Form onSubmit={submitForm}>
            <Form.Group className='mt-2'>
              <Form.Control
                type='text'
                placeholder={input}
                autoFocus
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer className='d-flex justify-content-between'>
        {cancelButton && (
          <Button variant='secondary' onClick={() => onClose(false)}>
            {cancelButton}
          </Button>
        )}

        <Button variant='primary' onClick={() => onClose(inputText || true)}>
          {okButton}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SimpleModal;
