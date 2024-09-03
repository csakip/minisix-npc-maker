import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { useEffect, useRef, useState } from "react";

export function useSimpleDialog() {
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

  function closeModal(e, result) {
    if (e && e.preventDefault) e.preventDefault();
    setState((prevState) => ({ ...prevState, open: false }));
    state.onClose && state.onClose(result);
  }

  function SimpleDialog() {
    const { open, title, body, okButton, cancelButton, input, defaultInputText } = state;
    const [inputText, setInputText] = useState(defaultInputText || "");
    const inputRef = useRef(null);

    useEffect(() => {
      if (!state.open) return;
      setTimeout(() => {
        inputRef.current?.select();
        inputRef.current?.focus();
      }, 10);
    }, [state.open]);

    function submitForm(e) {
      e.preventDefault();
      closeModal(e, inputText);
    }

    return (
      <Modal
        show={open}
        onHide={() => {
          closeModal(undefined, undefined);
        }}>
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
            <Button
              variant='secondary'
              onClick={(e) => {
                closeModal(e, false);
              }}>
              {cancelButton}
            </Button>
          ) : (
            <div></div>
          )}

          <Button
            variant='primary'
            onClick={(e) => {
              closeModal(e, inputText || true);
            }}>
            {okButton}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  return {
    openModal,
    closeModal,
    SimpleDialog,
  };
}
