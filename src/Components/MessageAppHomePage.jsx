import React, { useState, useEffect } from "react";
import "../Components - CSS/MessageAppHomePage.css";

import Store from "../Store";

import parse from "html-react-parser";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-regular-svg-icons";

const MessageAppHomePage = () => {
    const state = Store.getState();

    const [search, setSearch] = useState(false);

    const [onFocus, setOnFocus] = useState(false);

    const [searchUsersList, setSearchUsersList] = useState([]);

    const [userIds, setUserIds] = useState({});

    const [message, setMessage] = useState('');

    useEffect(() => {
        //console.log("addEventListener");

        const onSearchUsersListHide = (event) => {
            //console.log(event.target.tagName, event.target.getAttribute("id"));
    
            if(event.target.tagName != "INPUT" && event.target.getAttribute("id") != "userListOuterDisplay") {
                setOnFocus(false);
            }
        }

        window.addEventListener("click", onSearchUsersListHide);

        return () => {
            //console.log("removeEventListener");

            window.removeEventListener("click", onSearchUsersListHide);
        }
    }, []);

    const onSearch = async () => {
        setSearch(true);

        const response = await fetch(`${Store.getState().baseUrl}/api/userlist`, {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();

        const usersArray = [];

        for(const key of Object.keys(result)) {
            usersArray.push(result[key]);
        }

        Store.dispatch({ type: 'SET_USER_LIST', payload: usersArray });
    }

    const onHide = () => {
        setSearch(false);

        setSearchUsersList([]);

        setUserIds([]);

        setMessage('');
    }

    const onChange = (event) => {
        const searchValue = event.target.value;

        setSearchUsersList([]);

        const newUsersList = [];

        for(const user of state.userList) {
            let searchArray = [];

            const matchProperties = ['email', 'username'];

            for(let i = 0; i < matchProperties.length; i++) {
                for(let j = 0; j < user[matchProperties[i]].length; j++) {
                    let tempLongestMatch = 0;

                    while(j + tempLongestMatch < user[matchProperties[i]].length && tempLongestMatch < searchValue.length && user[matchProperties[i]][j + tempLongestMatch] === searchValue[tempLongestMatch]) {
                        tempLongestMatch++;
                    }

                    if(tempLongestMatch === searchValue.length) {
                        searchArray.push({
                            i,
                            j,
                            longestMatch: tempLongestMatch
                        });
                    }
                }
            }

            if(searchArray.length != 0) {
                newUsersList.push({
                    ...user,
                    searchArray
                });
            }
        }

        newUsersList.sort((a, b) => {
            return a.searchArray.length < b.searchArray.length;
        });

        const tempSearchUsersList = [];

        for(let i = 0; i < Math.min(newUsersList.length, 50); i++) {
            const user = newUsersList[i];

            tempSearchUsersList.push(user);
        }

        console.log(tempSearchUsersList);

        setSearchUsersList(tempSearchUsersList);
    }

    const onFormCheckChange = (event, searchUser) => {
        setUserIds({
            ...userIds,
            [event.target.getAttribute("id")]: {
                ...searchUser,
                checked: event.target.checked
            }
        });
    }

    const createMessageInput = () => {
        let checkedUserIdsCount = 0;

        for(const key of Object.keys(userIds)) {
            if(userIds[key].checked) checkedUserIdsCount++;
        }

        if(checkedUserIdsCount > 1) {
            return <>
                <Form.Control type="text" id="messageInput" placeholder="Enter bulk message..." value={message} onChange={(e) => setMessage(e.target.value)} />
                <Form.Text className="text-muted">
                    Send bulk message to:
                    <ul>
                        {
                            Object.keys(userIds).map((userId) => {
                                const user = userIds[userId];

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

    const sendBulkMessage = async () => {
        for(const key of Object.keys(userIds)) {
            if(userIds[key].checked) {
                await fetch(`${Store.getState().baseUrl}/api/user/${key}/send`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        content: message
                    })
                });
            }
        }
    }

    const createPrimaryButton = () => {
        let checkedUserIdsCount = 0;

        for(const key of Object.keys(userIds)) {
            if(userIds[key].checked) checkedUserIdsCount++;
        }

        if(checkedUserIdsCount === 0) return <Button variant="primary" disabled>Start new conversation</Button>;
        else if(checkedUserIdsCount === 1) return <Button variant="primary">Start new conversation</Button>;
        else return <Button variant="primary" disabled={message.length === 0 ? true : false} onClick={async () => await sendBulkMessage()}>Send bulk message</Button>;
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
                Start new<br />conversations...
            </div>
            <Button variant="info" onClick={async () => await onSearch()}>Search</Button>
            <Modal show={search} onHide={() => onHide()} backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>Search</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control type="text" name="username" placeholder="Search by email or username..." onFocus={() => setOnFocus(true)} onChange={(e) => onChange(e)} />
                    <div className="contentCenter" style={{ position: 'relative', marginTop: '5px' }}>
                        <div id="userListDisplay" style={onFocus ? { display: 'block' } : { display: 'none' }}>
                            <div id="userListOuterDisplay"></div>
                            <div id="userList">
                                {
                                    searchUsersList.map((searchUser) => {
                                        const email = searchUser.email;
                                        const username = searchUser.username;

                                        let finalStr = '<div class="userInfo"><div class="email">';

                                        for(const letter of email) {
                                            finalStr += `<span>${letter}</span>`;
                                        }

                                        finalStr += '</div><div class="username">(';

                                        for(const letter of username) {
                                            finalStr += `<span>${letter}</span>`;
                                        }

                                        finalStr += ')</div></div>';

                                        return <div className="user">
                                            {parse(finalStr)}
                                            <Form.Check type="switch" id={searchUser.id} checked={Object.keys(userIds).includes(`${searchUser.id}`) && userIds[searchUser.id].checked ? true : false} onChange={(e) => onFormCheckChange(e, searchUser)} style={{ position: 'relative', zIndex: 2 }} />
                                        </div>;
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    {createMessageInput()}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => onHide()}>
                        Cancel
                    </Button>
                    {createPrimaryButton()}
                </Modal.Footer>
            </Modal>
        </div>
    </>);
}

export default MessageAppHomePage;