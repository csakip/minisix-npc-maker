import { Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function TopMenu(props) {
  return (
    <>
      <Navbar className='py-0 border-bottom'>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='mr-auto'>
            <Nav.Link as={Link} to='/'>
              Kezdeményezés
            </Nav.Link>
            <Nav.Link as={Link} to='/npc'>
              NJK generátor
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      {/* eslint-disable react/prop-types */}
      {props.children}
      {/* eslint-enable react/prop-types */}
    </>
  );
}
