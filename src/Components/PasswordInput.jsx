import React from "react";

import { passwordMinLength } from "./RegisterPage";

import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

const PasswordInput = ({ userSettings, setUserSettings, isPasswordValid, setIsPasswordValid }) => { // userSettings - Object
    const onChange = (event) => {
        setUserSettings({
            ...userSettings,
            password: event.target.value
        });

        if(event.target.value.length < passwordMinLength) {
            setIsPasswordValid(false);
        } else setIsPasswordValid(true);
    }

    return (<>
        <Form.Group as={Col}>
            <Form.Label>Password: </Form.Label>
            <InputGroup>
                <Form.Control type="password" name="password" placeholder="Type password..." value={userSettings.password} onChange={(event) => onChange(event)} minLength={passwordMinLength} />
                <InputGroup.Text style={isPasswordValid ? { backgroundColor: 'green' } : { backgroundColor: 'red' }}>
                    {isPasswordValid ? <FontAwesomeIcon icon={faCheck} style={{ color: 'white' }} /> : <FontAwesomeIcon icon={faXmark} style={{ color: 'white' }} />}
                </InputGroup.Text>
            </InputGroup>
        </Form.Group>
    </>);
}

export default PasswordInput;