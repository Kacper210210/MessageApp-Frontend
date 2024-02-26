import React, { useState, useEffect } from "react";
import "../Components - CSS/MainNavbar.css";

import Store from "../Store";

import { useNavigate, Link, NavLink, Outlet } from "react-router-dom";

import AlertBox from "./AlertBox";

import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import NavDropdown from "react-bootstrap/NavDropdown";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-regular-svg-icons";
import { faGear, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

const MainNavbar = () => {
    const state = Store.getState();

    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${Store.getState().baseUrl}/api/user`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if(response.status === 200) {
                    if(window.location.pathname === '/login' || window.location.pathname === '/register') {
                        navigate('/messageApp/home');
                    }
                } else {
                    if(window.location.pathname.includes('/messageApp')) {
                        navigate('/login');
                    }
                }
            } catch(err) {
                console.log(err);
            }
        }

        fetchUser();
    }, [window.location.pathname]);

    const [alertMessage, setAlertMessage] = useState('');

    const onLogout = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`${Store.getState().baseUrl}/api/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const result = await response.json();

            console.log(result, result.response);

            if(result.response === true) {
                Store.dispatch({
                    type: 'SET_USER',
                    payload: {
                        id: undefined,
                        email: undefined,
                        username: undefined,
                        name: undefined,
                        surname: undefined
                    }
                });

                navigate('/login');
            } else {
                setAlertMessage("Could not log out! Try again.");
            }
        } catch(err) {
            console.log(err);
        }
    }

    const createImage = () => {
        return <></>;
    }

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
                {state.user.id === undefined ? <Container className="btns">
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
                </Container> : <Container className="btns">
                    <NavDropdown title={<>Hi, {state.user.username}{state.image != undefined ? createImage() : <></>}</>} className="dropdownTitle">
                        <NavDropdown.Item href='/userManagement' className="dropdownItem">
                            <FontAwesomeIcon icon={faGear} />
                            User Management
                        </NavDropdown.Item>
                        <NavDropdown.Item href='/logout' onClick={async (e) => await onLogout(e)} className="dropdownItem" id="logoutItem">
                            <FontAwesomeIcon icon={faRightFromBracket} />
                            Logout
                        </NavDropdown.Item>
                    </NavDropdown>
                </Container>}
            </Container>
        </Navbar>
        <div className="contentCenter" style={{ position: 'relative' }}>
            <AlertBox variant="danger" dismissible={true} alertMessage={alertMessage} setAlertMessage={setAlertMessage} style={{ position: 'absolute', zIndex: 1 }} />
        </div>
        <Outlet />
    </>);
}

export default MainNavbar;