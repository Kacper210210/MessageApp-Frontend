import React, { useState } from "react";
import "../Components - CSS/MessageAppHomePage.css";

import Store from "../Store";

import SearchUsersModal from "./SearchModal";

import { useNavigate } from "react-router-dom";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-regular-svg-icons";

const MessageAppHomePage = () => {
    const navigate = useNavigate();

    const [search, setSearch] = useState(false);

    const [searchUsersChecked, setSearchUsersChecked] = useState([]);

    const [message, setMessage] = useState('');

    const onSearch = async () => {
        setSearch(true);

        const response = await fetch(`${Store.getState().baseUrl}/api/userlist`, {
            method: 'POST',
            credentials: 'include'
        });

        const result = await response.json();

        const usersArray = [];

        for(const key of Object.keys(result)) {
            usersArray.push(result[key]);
        }

        //console.log(usersArray);

        Store.dispatch({ type: 'SET_USER_LIST', payload: usersArray });
    }

    const createMessageInput = () => {
        let searchUsersCheckedCount = 0;

        for(const key of Object.keys(searchUsersChecked)) {
            if(searchUsersChecked[key].checked) searchUsersCheckedCount++;
        }

        if(searchUsersCheckedCount > 1) {
            return <>
                <Form.Control type="text" id="messageInput" placeholder="Wpisz wiadomość masową..." value={message} onChange={(e) => setMessage(e.target.value)} />
                <Form.Text className="text-muted">
                    Send bulk message to:
                    <ul>
                        {
                            Object.keys(searchUsersChecked).map((userId) => {
                                const user = searchUsersChecked[userId];

                                if(user.checked) {
                                    return <>
                                        <li>{user.email} ({user.username})</li>
                                    </>;
                                }
                            })
                        }
                    </ul>
                </Form.Text>
            </>;
        }
    }

    const startNewConversation = () => {
        navigate(`/messageApp/chats/${Object.keys(searchUsersChecked)[0]}`);
    }

    const sendBulkMessage = async () => {
        for(const key of Object.keys(searchUsersChecked)) {
            if(searchUsersChecked[key].checked) {
                await fetch(`${Store.getState().baseUrl}/api/user/${key}/send`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: message
                    }),
                    credentials: 'include'
                });
            }
        }

        setMessage('');
    }

    const createPrimaryButton = () => {
        let searchUsersCheckedCount = 0;

        for(const key of Object.keys(searchUsersChecked)) {
            if(searchUsersChecked[key].checked) searchUsersCheckedCount++;
        }

        if(searchUsersCheckedCount === 0) return <Button variant="primary" disabled>Zacznij nową konwersację</Button>;
        else if(searchUsersCheckedCount === 1) return <Button variant="primary" onClick={() => startNewConversation()}>Zacznij nową konwersację</Button>;
        else return <Button variant="primary" disabled={message.length === 0 ? true : false} onClick={async () => await sendBulkMessage()}>Wyślij wiadomość masową</Button>;
    }

    const onHide = () => {
        setSearch(false);

        setSearchUsersChecked([]);

        setMessage('');
    }

    return (<>
        <div id="startConversation">
            <FontAwesomeIcon icon={faCommentDots} style={{ 
                width: '25%',
                minWidth: '100px',
                maxWidth: '200px',
                height: 'auto',
                marginBottom: '5px',
                color: '#00e6e6'
             }} />
            <div style={{
                marginBottom: '25px',
                fontSize: '20px',
                letterSpacing: '2.5px',
                textAlign: 'center',
                color: '#00e6e6'
            }}>
                Zacznij nową<br />konwersację...
            </div>
            <Button variant="info" onClick={async () => await onSearch()}>Szukaj</Button>
            <SearchUsersModal search={search} searchUsersChecked={searchUsersChecked} setSearchUsersChecked={setSearchUsersChecked} createPrimaryButton={createPrimaryButton} createMessageInput={createMessageInput} onCleanup={onHide} />
        </div>
    </>);
}

export default MessageAppHomePage;