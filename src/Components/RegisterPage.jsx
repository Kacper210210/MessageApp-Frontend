import React, { useState, useEffect } from "react";
import '../Components - CSS/RegisterPage.css';

import { useBlocker, useActionData, useSubmit } from "react-router-dom";

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import AlertBox from "./AlertBox";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";

export const registerAction = async ({ request }) => {
    const json = await request.json();

    try {
        console.log(JSON.stringify(json));

        const response = await fetch('http://127.0.0.1:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(json)
        });

        const result = await response.json();

        if(result.response === 'User succesfully added to database!') { // To change
            return {
                username: json.email,
                password: json.password,
                setImage: true
            }
        }

        return false;
    } catch(err) {
        console.log(err);

        return false;
    }
}

// Password minLength={8}
export const passwordMinLength = 8;

const RegisterPage = () => {
    const blocker = useBlocker(({ currentLocation, nextLocation }) => {
        if(currentLocation.pathname === nextLocation.pathname) return false;

        for(const key of Object.keys(userSettings)) {
            if(userSettings[key].length != 0) return true;
        }

        return false;
    });

    const submit = useSubmit();

    const [userSettings, setUserSettings] = useState({
        email: '',
        password: '',
        username: '',
        name: '',
        surname: ''
    });

    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    const [onValidate, setOnValidate] = useState(false);

    const [alertMessage, setAlertMessage] = useState('');

    const [variant, setVariant] = useState("danger");
    const [dismissible, setDismissible] = useState(true);

    const errors = useActionData();

    useEffect(() => {
        if(errors === undefined) return;

        if(errors === false) {
            setAlertMessage("Could not create user in the database!");

            setOnValidate(false);
        } else {
            setUserSettings({
                email: '',
                password: '',
                username: '',
                name: '',
                surname: ''
            });

            setVariant("success");
            setDismissible(false);

            setAlertMessage("Successfully created user in the database!");

            setTimeout(() => {
                submit(JSON.stringify(errors), {
                    method: 'post',
                    encType: 'application/json',
                    action: '/login'
                });
            }, 500);
        }
    }, [errors]);

    const onChange = (event, property) => {
        if(variant === 'success') return;

        setUserSettings({
            ...userSettings,
            [property]: event.target.value
        });
    }

    const onButtonClick = async () => {
        setOnValidate(true);

        const isValid = validate();

        if(isValid) {
            submit(JSON.stringify(userSettings), {
                method: 'post',
                encType: 'application/json'
            });
        } else {
            setOnValidate(false);
        }
    }

    const validate = () => {
        if(!isEmailValid) {
            setAlertMessage("Email address is not a valid email!");

            return false;
        }

        if(!isPasswordValid) {
            setAlertMessage(`Password must be at least ${passwordMinLength} characters long!`);

            return false;
        }

        for(const key of Object.keys(userSettings)) {
            if(userSettings[key].length === 0) {
                setAlertMessage(`${key[0].toUpperCase() + key.slice(1)} must not be empty!`);

                return false;
            }
        }

        setAlertMessage('');

        return true;
    }

    return (<>
        <style>
            {`
                .App {
                    width: 100%;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background-color: #ccffff;
                }
            `}
        </style>
        <div className="contentCenter" style={{ position: 'relative' }}>
            <AlertBox variant={variant} dismissible={dismissible} alertMessage={alertMessage} setAlertMessage={setAlertMessage} style={{ position: 'absolute' }} />
        </div>
        <Form className="mtp">
            <h1 className="headline">Register</h1>
            <Row className="mb-3">
                <EmailInput userSettings={userSettings} setUserSettings={setUserSettings} isEmailValid={isEmailValid} setIsEmailValid={setIsEmailValid} />
                <PasswordInput userSettings={userSettings} setUserSettings={setUserSettings} isPasswordValid={isPasswordValid} setIsPasswordValid={setIsPasswordValid} />
            </Row>
            <Form.Group className="mb-3">
                <Form.Label>Username: </Form.Label>
                <Form.Control type="text" name="username" placeholder="Enter username..." value={userSettings.username} onChange={(event) => onChange(event, 'username')} />
            </Form.Group>
            <Row className="mb-3">
                <Form.Group as={Col}>
                    <Form.Label>Name: </Form.Label>
                    <Form.Control type="text" name="name" placeholder="Enter name..." value={userSettings.name} onChange={(event) => onChange(event, 'name')} />
                </Form.Group>
                <Form.Group as={Col}>
                    <Form.Label>Surname: </Form.Label>
                    <Form.Control type="text" name="surname" placeholder="Enter surname..." value={userSettings.surname} onChange={(event) => onChange(event, 'surname')} />
                </Form.Group>
            </Row>
            <div className="contentCenter" style={{
                marginTop: '20px'
            }}>
                <Button variant="info" onClick={async () => await onButtonClick()}  disabled={onValidate}>Register</Button>
            </div>
        </Form>
        <Modal show={blocker.state === 'blocked' ? true : false} backdrop="static">
            <Modal.Header>
                <Modal.Title>Leave website?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Do you really want to leave website and unsaved changes?
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => {
                    blocker.reset();
                }}>Cancel</Button>
                <Button variant="primary" onClick={() => {
                    setUserSettings({
                        email: '',
                        password: '',
                        username: '',
                        name: '',
                        surname: ''
                    });

                    blocker.proceed();
                }}>Yes</Button>
            </Modal.Footer>
        </Modal>
    </>);
}

export default RegisterPage;