import { useObservable } from "dexie-react-hooks";
import { Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import { db } from "../database/dataStore";

export default function TopMenu(props) {
  const user = useObservable(db.cloud.currentUser);

  const isAuthorized = user.name !== "Unauthorized";

  return (
    <>
      <Navbar className='py-0 border-bottom'>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='me-auto'>
            <Nav.Link as={Link} to='/'>
              Kezdeményezés
            </Nav.Link>
            <Nav.Link as={Link} to='/npc'>
              NJK generátor
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <Navbar.Collapse className='justify-content-end me-2'>
          <Navbar.Text>
            {isAuthorized ? (
              <a href='#' title='Kijelentkezés' onClick={() => db.cloud.logout()}>
                <i className='bi bi-box-arrow-right h5'></i>
              </a>
            ) : (
              <a href='#' title='Bejelentkezés' onClick={() => db.cloud.login()}>
                <i className='bi bi-box-arrow-in-right h5'></i>
              </a>
            )}
          </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
      {isAuthorized ? props.children : null}
    </>
  );
}
