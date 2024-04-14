import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { useEffect, useRef, useState } from "react";

export function useSimpleModal() {
  const [state, setState] = useState({
    open: false,
    title: "",
    body: undefined,
    okButton: "Ok",
    cancelButton: undefined,
    input: undefined,
    onClose: undefined,
  });

  function openModal({
    title = "",
    body,
    okButton = "Ok",
    cancelButton,
    input,
    defaultInputText,
    onClose = () => {},
  }) {
    setState((prevState) => ({
      ...prevState,
      open: true,
      title,
      body,
      okButton,
      cancelButton,
      input,
      defaultInputText,
      onClose,
    }));
  }

  function closeModal(result) {
    setState((prevState) => ({ ...prevState, open: false }));
    state.onClose && state.onClose(result);
  }

  function SimpleModal() {
    const { open, title, body, okButton, cancelButton, input, defaultInputText } = state;
    const [inputText, setInputText] = useState(defaultInputText || "");
    const inputRef = useRef(null);

    useEffect(() => {
      if (!state.open) return;
      inputRef.current?.focus();
      inputRef.current?.select();
    }, [state.open]);

    function submitForm(e) {
      e.preventDefault();
      closeModal(inputText);
    }

    return (
      <Modal show={open} onHide={() => closeModal(undefined)}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {body}
          {input && (
            <Form onSubmit={submitForm}>
              <Form.Group className='mt-2'>
                <Form.Control
                  ref={inputRef}
                  type='text'
                  placeholder={typeof input === "string" ? input : undefined}
                  autoFocus
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className='d-flex justify-content-between'>
          {cancelButton ? (
            <Button variant='secondary' onClick={() => closeModal(false)}>
              {cancelButton}
            </Button>
          ) : (
            <div></div>
          )}

          <Button variant='primary' onClick={() => closeModal(inputText || true)}>
            {okButton}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return {
    openModal,
    closeModal,
    SimpleModal,
  };
}
