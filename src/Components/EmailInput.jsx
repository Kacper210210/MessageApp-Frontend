import React from "react";

import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

const EmailInput = ({ userSettings, setUserSettings, isEmailValid, setIsEmailValid }) => { // userSettings - Object
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    const onChange = (event) => {
        setUserSettings({
            ...userSettings,
            email: event.target.value
        });

        if(event.target.value.match(emailRegex) === null) {
            setIsEmailValid(false);
        } else setIsEmailValid(true);
    }

    return (<>
        <Form.Group as={Col}>
            <Form.Label>Adres email: </Form.Label>
            <InputGroup>
                <Form.Control type="email" name="email" placeholder="Wpisz adres email..." value={userSettings.email} onChange={(event) => onChange(event)} />
                <InputGroup.Text style={isEmailValid ? { backgroundColor: 'green' } : { backgroundColor: 'red' }}>
                    {isEmailValid ? <FontAwesomeIcon icon={faCheck} style={{ color: 'white' }} /> : <FontAwesomeIcon icon={faXmark} style={{ color: 'white' }} />}
                </InputGroup.Text>
            </InputGroup>
        </Form.Group>
    </>);
}

export default EmailInput;