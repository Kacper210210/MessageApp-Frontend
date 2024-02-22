import React, { useState, useEffect } from "react";
import "../Components - CSS/LoginPage.css";

import Store from "../Store";

import { fetchUserImage } from "../App";
import { passwordMinLength } from "./RegisterPage";
import AlertBox from "./AlertBox";
import PasswordInput from "./PasswordInput";

import { redirect, useSubmit, useActionData, Link } from "react-router-dom";

import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import DefaultIcon from "../assets/circle-user.jpg";

export const loginAction = async ({ request }) => {
    const json = await request.json();

    const newJson = {
        username: json.username,
        password: json.password
    }

    try {
        const response = await fetch(`${Store.getState().baseUrl}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newJson)
        });

        const result = await response.json();

        if(result.response === true) {
            if(Object.keys(json).includes('setImage')) {
                const responseImage = await fetch(DefaultIcon);

                const resultImage = await responseImage.text();

                const defaultIconBlob = new Blob([resultImage]);

                const defaultIconBlobText = await defaultIconBlob.text();

                console.log(defaultIconBlobText);
    
                //const formData = new FormData();
                //formData.append('image', defaultIconBlob);
    
                await fetch(`${Store.getState().baseUrl}/api/change_image`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    body: defaultIconBlobText
                });
            }

            await fetchUserImage();

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