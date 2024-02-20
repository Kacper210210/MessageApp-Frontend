import React, { useState } from "react";
import "../Components - CSS/PasswordResetPage.css";

import EmailInput from "./EmailInput";

import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";

const PasswordResetPage = () => {
    const [userSettings, setUserSettings] = useState({
        email: ''
    });

    const [isEmailValid, setIsEmailValid] = useState(false);

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
        <Form className="mtp">
            <h1 className="headline">Reset Password</h1>
            <Row className="mb-3">
                <EmailInput userSettings={userSettings} setUserSettings={setUserSettings} isEmailValid={isEmailValid} setIsEmailValid={setIsEmailValid} />
            </Row>
            <div className="contentCenter">
                <Button variant="info">Reset Password</Button>
            </div>
        </Form>
    </>);
}

export default PasswordResetPage;