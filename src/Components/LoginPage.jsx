import React, { useState, useEffect } from "react";
import "../Components - CSS/LoginPage.css";

import { passwordMinLength } from "./RegisterPage";
import AlertBox from "./AlertBox";
import PasswordInput from "./PasswordInput";

import { redirect, useSubmit, useActionData, Link } from "react-router-dom";

import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

const DefaultIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z"/></svg>`;

/*
    await fetch('http://localhost:3000/api/get_image', {
            method: 'GET'
        });
*/

export const loginAction = async ({ request }) => {
    const json = await request.json();

    const newJson = {
        username: json.username,
        password: json.password
    }

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newJson)
        });

        const result = await response.json();

        if(result.response === true) {
            if(Object.keys(json).includes('setImage')) {
                const defaultIconBlob = new Blob([DefaultIcon], {
                    type: 'text/html'
                });

                const defaultIconBlobText = await defaultIconBlob.text();

                console.log(defaultIconBlobText);
    
                //const formData = new FormData();
                //formData.append('image', defaultIconBlob);
    
                const response = await fetch('http://localhost:3000/api/change_image', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: defaultIconBlobText
                });
    
                const result = await response.json();
            }

            return redirect("/messageApp/home");
        }

        return result.response;
    } catch(err) {
        console.log(err);

        return false;
    }
}

const LoginPage = () => {
    const submit = useSubmit();

    const [userSettings, setUserSettings] = useState({
        username: '',
        password: ''
    });

    const [isPasswordValid, setIsPasswordValid] = useState(false);

    const [onValidate, setOnValidate] = useState(false);

    const [alertMessage, setAlertMessage] = useState('');

    const errors = useActionData();

    useEffect(() => {
        if(errors === undefined) return;

        if(errors === false || errors === 'false') {
            setAlertMessage("Could not login! Try again.");
        } else {
            setAlertMessage(errors);
        }

        setOnValidate(false);
    }, [errors]);

    const onButtonClick = () => {
        setOnValidate(true);

        if(isPasswordValid) {
            submit(JSON.stringify(userSettings), {
                method: 'post',
                encType: 'application/json'
            });
        } else {
            setAlertMessage(`Password must be at least ${passwordMinLength} characters long!`);

            setOnValidate(false);
        }
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
            <AlertBox variant="danger" dismissible={true} alertMessage={alertMessage} setAlertMessage={setAlertMessage} style={{ position: 'absolute' }} />
        </div>
        <Form className="mtp">
            <h1 className="headline">Login</h1>
            <Row className="mb-3">
                <Form.Group as={Col}>
                    <Form.Label>Email address/Username: </Form.Label>
                    <Form.Control type="text" name="username" placeholder="Enter email or username..." value={userSettings.username} onChange={(event) => {
                        setUserSettings({
                            ...userSettings,
                            username: event.target.value
                        });
                    }} />
                </Form.Group>
            </Row>
            <Row className="mb-3">
                <PasswordInput userSettings={userSettings} setUserSettings={setUserSettings} isPasswordValid={isPasswordValid} setIsPasswordValid={setIsPasswordValid} />
                <Form.Text id="passwordReset">
                    <Link to='/passwordReset'>Reset password</Link>
                </Form.Text>
            </Row>
            <div className="contentCenter">
                <Button variant="info" onClick={() => onButtonClick()} disabled={onValidate}>Login</Button>
            </div>
        </Form>
    </>);
}

export default LoginPage;