import React from "react";
import "../Components - CSS/MainNavbar.css";

import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-regular-svg-icons";

import { Link, NavLink, Outlet } from "react-router-dom";

const MainNavbar = () => {
    return (<>
        <Navbar id="homeNavbar" sticky="top">
            <Container>
                <Link to='/'>
                    <Navbar.Brand id="brand">
                        <FontAwesomeIcon icon={faComments} />
                        <span style={{
                            marginLeft: '15px'
                        }}>Message App</span>
                    </Navbar.Brand>
                </Link>
                <Container className="btns">
                    <NavLink to='/register'>
                        <div className="btnUnderline">
                            Register
                            <div></div>
                        </div>
                    </NavLink>
                    <NavLink to='/login'>
                        <div className="btnUnderline">
                            Login
                            <div></div>
                        </div>
                    </NavLink>
                </Container>
            </Container>
        </Navbar>
        <Outlet />
    </>);
}

export default MainNavbar;