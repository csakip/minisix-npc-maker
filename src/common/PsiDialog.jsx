import { Table } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { Fragment, useEffect, useState } from "react";
import { fuzzyMatch } from "./utils";
import psiList from "../assets/psi.json";

const PsiDialog = ({ open, setOpen, characterPsis, callback }) => {
  const [filter, setFilter] = useState("");
  const [psis, setPsis] = useState(psiList);
  const [selectedPsis, setSelectedPsis] = useState(characterPsis || []);

  useEffect(() => {
    console.log("open", open, characterPsis);
    setSelectedPsis(characterPsis);
  }, [open]);

  function close() {
    setFilter("");
    setOpen(false);
  }

  useEffect(() => {
    let filteredList = {};
    Object.keys(psiList).forEach((type) => {
      const filteredType = psiList[type].filter((psi) => {
        if (filter.trim() !== "") {
          return fuzzyMatch(filter, psi.name);
        } else {
          return true;
        }
      });
      if (filteredType.length > 0) filteredList[type] = filteredType;
    });

    setPsis(filteredList);
  }, [filter]);

  function scroll(id) {
    document
      .getElementById("scrollableBody")
      .scrollTo({ top: document.getElementById(id).offsetTop - 110, behavior: "smooth" });
  }

  function scrollToName(e, name) {
    e.preventDefault();
    Object.keys(psis).forEach((type) => {
      psis[type].forEach((psi, idx) => {
        if (psi.name === name) {
          const table = document.getElementById("table_" + type);
          const row = table.children[1].children[idx];
          const posY = table.offsetTop + row.offsetTop - 250;
          document.getElementById("scrollableBody").scrollTo({ top: posY, behavior: "smooth" });
        }
      });
    });
  }

  function closeAndReturn() {
    close();
    callback(selectedPsis);
  }

  return (
    <>
      <Modal show={open} onHide={close} size='xl'>
        <Modal.Body>
          <>
            <Button
              type='button'
              className='btn-close'
              aria-label='Close'
              style={{ position: "absolute", right: "1em", backgroundColor: "unset" }}
              onClick={close}></Button>
            <Row>
              <Col className='align-self-center'>
                <Form.Control
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder='Keresés'
                  className='mb-3'
                  size='sm'
                />
              </Col>
              <Col>
                <Button
                  variant='warning'
                  size='sm'
                  onClick={() => setSelectedPsis([])}
                  className='ms-2'>
                  <i className='bi bi-trash'></i>
                </Button>
              </Col>
            </Row>
            {!Object.keys(psis).length && <h4 className='text-center'>Nincs találat</h4>}
            <Row>
              <Col className='d-flex gap-2'>
                {Object.keys(psis).map((type) => (
                  <Button
                    variant='outline-secondary'
                    size='sm'
                    className='py-0 mb-1'
                    onClick={() => scroll("type_" + type)}
                    key={type}>
                    {type}
                  </Button>
                ))}
              </Col>
            </Row>
            <div
              id='scrollableBody'
              className='overflow-auto scrollable-menu'
              style={{ height: "70vh" }}>
              {Object.keys(psis).map((type) => (
                <Fragment key={type}>
                  <h5 id={"type_" + type}>{type}</h5>
                  <Table striped hover id={"table_" + type}>
                    <thead>
                      <tr>
                        <th>Név</th>
                        <th className='text-center'>Pszi pont</th>
                      </tr>
                    </thead>
                    <tbody>
                      {psis[type].map((psi) => {
                        const cls = selectedPsis.includes(psi.name) ? "bg-success" : "";
                        return (
                          <tr
                            role='button'
                            key={psi.name}
                            onClick={() => {
                              if (selectedPsis.includes(psi.name)) {
                                setSelectedPsis(selectedPsis.filter((s) => s !== psi.name));
                              } else {
                                setSelectedPsis([...selectedPsis, psi.name]);
                              }
                            }}>
                            <td className={cls}>{psi.name}</td>
                            <td className={cls + " text-center"}>{psi.cost}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </Fragment>
              ))}
            </div>
          </>
        </Modal.Body>
        <Modal.Footer>
          <Col className='d-flex flex-wrap column-gap-2'>
            {Object.keys(psiList).map((type) => {
              return psiList[type].map((psi) => {
                if (selectedPsis.includes(psi.name)) {
                  return (
                    <a
                      key={psi.name}
                      onClick={(e) => scrollToName(e, psi.name)}
                      href='#'
                      className='text-nowrap'>
                      {psi.name} ({psi.cost})
                    </a>
                  );
                }
              });
            })}
          </Col>
          <Col xs='1' className='d-flex justify-content-end'>
            <Button variant='secondary' onClick={closeAndReturn} className='float-start'>
              Mentés
            </Button>
          </Col>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PsiDialog;
