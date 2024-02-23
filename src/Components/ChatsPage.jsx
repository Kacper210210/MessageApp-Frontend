import React, { useEffect, useState } from "react";
import "../Components - CSS/ChatsPage.css";

import Store from "../Store";

import { useLocation } from "react-router-dom";

import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/esm/Button";
import Badge from "react-bootstrap/Badge";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";

let interval = undefined;

const ChatsPage = () => {
    const state = Store.getState();

    const location = useLocation();

    const [currentUser, setCurrentUser] = useState({
        id: undefined,
        email: undefined,
        username: undefined,
        name: undefined,
        surname: undefined
    });

    const [message, setMessage] = useState('');

    const [readTill, setReadTill] = useState(undefined);
    const [messages, setMessages] = useState(undefined);

    const [elementScrollIntoView, setElementScrollIntoView] = useState(undefined);

    const [onLoad, setOnLoad] = useState(false);

    const fetchMessages = async (page = 1, userId = undefined) => {
        if(userId === undefined) userId = currentUser.id;

        setMessages([]);

        if(typeof page === 'number') {
            try {
                const response = await fetch(`${Store.getState().baseUrl}/api/user/${userId}/${page}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if(response.status != 200) throw new Error(`Could not load page: ${page}!`);
        
                const result = await response.json();
    
                result.reverse();
    
                //console.log(result);
        
                setMessages(result);
            } catch(err) {
                console.log(err);
            }
        } else if(page === 'readTill') {
            let tempReadTill = undefined; // Number of milliseconds since the epoch

            try {
                const response = await fetch(`${Store.getState().baseUrl}/api/private_messages/read_till/${userId}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                const result = await response.json();

                //console.log(result);

                if(response.status === 404) {
                    tempReadTill = 0;
                } else if(response.status === 200) {
                    const date = new Date(result.read_till);

                    tempReadTill = date.getTime();
                } else throw new Error("Could not determine 'readTill'!");

                let lastMessageTimestamp;

                let pageCounter = 1;

                let tempMessages = [];
                
                do {
                    try {
                        const pageResponse = await fetch(`${Store.getState().baseUrl}/api/user/${userId}/${pageCounter}`, {
                            method: 'GET',
                            credentials: 'include'
                        });

                        if(pageResponse.status != 200) throw new Error(`Could not load page: ${pageCounter}!`);
                
                        const pageResult = await pageResponse.json();

                        //console.log(pageResult);
                
                        tempMessages = [...tempMessages, ...pageResult];

                        if(pageResult.length === 0) break;
                        else {
                            const date = new Date(pageResult[pageResult.length - 1].timestamp);

                            lastMessageTimestamp = date.getTime();
                        }

                        pageCounter++;
                    } catch(err) {
                        throw new Error(err);
                    }
                } while(lastMessageTimestamp >= tempReadTill);

                console.log(tempReadTill, tempMessages);

                for(const tempMessage of tempMessages) {
                    const date = new Date(tempMessage.timestamp);

                    if(date.getTime() < tempReadTill) break;
                    else {
                        setElementScrollIntoView(`message-${tempMessage.message_id}`);
                    }
                }

                tempMessages.reverse();

                setReadTill(tempReadTill);
                setMessages(tempMessages);
            } catch(err) {
                console.log(err);
            }
        }
    }

    useEffect(() => {
        const fetchUser = async (userId) => {
            try {
                const response = await fetch(`${Store.getState().baseUrl}/api/user/${userId}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                const result = await response.json();

                setCurrentUser(result);
            } catch(err) {
                console.log(err);
            }
        }

        //console.log(location.pathname);

        fetchUser(location.pathname.split('/')[3]);

        fetchMessages('readTill', location.pathname.split('/')[3]);

        // Fetch messages every 0.5s
        /*interval = setInterval(() => {
            fetchMessages(1, location.pathname.split('/')[3]);
        }, 500);

        return () => {
            clearInterval(interval);
        }*/
    }, []);

    const millisecondsToString = (milliseconds) => {
        const date = new Date(milliseconds);

        return `${date.getFullYear()}-${getWithLeadingZero(date.getMonth() + 1)}-${getWithLeadingZero(date.getDate())} ${getWithLeadingZero(date.getHours())}:${getWithLeadingZero(date.getMinutes())}:${getWithLeadingZero(date.getSeconds())}.${date.getMilliseconds()}`;
    }

    const onScroll = async () => {
        const messagesDisplay = document.querySelector("#messagesDisplay");

        const messageDisplayTop = 145;

        let tempReadTill = undefined;

        for(const message of messages) {
            const date = new Date(message.timestamp);

            if(date.getTime() >= readTill) {
                const messageEl = document.getElementById(`message-${message.message_id}`);

                const messageRect = messageEl.getBoundingClientRect();

                const messageTop = messageRect.top - messageDisplayTop;
                const messageBottom = messageRect.bottom - messageDisplayTop;

                if(messageTop >= 0 && messageBottom <= messagesDisplay.offsetHeight) {
                    tempReadTill = date.getTime() + 1000; // +1ms
                }
            }
        }

        if(tempReadTill != undefined) {
            console.log(tempReadTill, millisecondsToString(tempReadTill));

            try {
                /*const response = await fetch(`${Store.getState().baseUrl}/api/private_messages/read_till`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        to_user: currentUser.id,
                        date: tempReadTill
                    }),
                    credentials: 'include'
                });

                const result = await response.json();

                console.log(result);*/
            } catch(err) {
                console.log(err);
            }
        }
    }

    let prevMessages = undefined;

    useEffect(() => {
        const messagesDisplay = document.querySelector("#messagesDisplay");

        if(prevMessages === undefined && typeof messages === 'object') {
            messagesDisplay.scrollBy({
                top: messagesDisplay.scrollHeight - messagesDisplay.offsetHeight,
                behavior: 'instant'
            });
        }

        //console.log(messagesDisplay.scrollHeight, messagesDisplay.scrollTop, messagesDisplay.offsetHeight);

        if(Math.abs(messagesDisplay.scrollHeight - messagesDisplay.scrollTop - messagesDisplay.offsetHeight) < 1 && elementScrollIntoView != undefined) {
            document.getElementById(elementScrollIntoView).scrollIntoView({ behavior: 'instant' });
        }

        if(prevMessages === undefined && typeof messages === 'object') { // onLoad
            onScroll();

            setTimeout(() => {
                setOnLoad(true);
            }, 500);
        }

        prevMessages = messages;
    }, [messages]);

    useEffect(() => {
        if(onLoad) {
            const messagesDisplay = document.querySelector("#messagesDisplay");

            messagesDisplay.addEventListener("scroll", onScroll);

            return () => {
                messagesDisplay.removeEventListener("scroll", onScroll);
            }
        }
    }, [onLoad]);

    const sendMessage = async () => {
        try {
            const response = await fetch(`${Store.getState().baseUrl}/api/user/${currentUser.id}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: message
                }),
                credentials: 'include'
            });

            const result = await response.json();

            if(result.response === true) setMessage('');
        } catch(err) {
            console.log(err);
        }
    }

    const getWithLeadingZero = (value) => {
        return value < 10 ? `0${value}` : value;
    }

    const dateToString = (date) => {
        return `${getWithLeadingZero(date.getHours())}:${getWithLeadingZero(date.getMinutes())}, ${getWithLeadingZero(date.getDate())}.${getWithLeadingZero(date.getMonth() + 1)}.${date.getFullYear()}`;
    }

    return (<>
        <div id="conversation">
            <div id="username">
                {`${currentUser.email} (${currentUser.username})`}
            </div>
            <div id="messagesDisplay">
                <div id="messages">
                    {
                        messages != undefined && messages.map((message) => {
                            const date = new Date(message.timestamp);

                            return (
                                <div className={`message ${message.from === state.user.id && 'ownMessage'}`} id={`message-${message.message_id}`}>
                                    <Form.Text className="text-muted">
                                        {message.from === state.user.id && date.getTime() >= readTill && <Badge bg="secondary" style={{ marginRight: '5px' }}>New</Badge>}By {message.from === currentUser.id ? currentUser.username : 'You'} &#9679; {dateToString(date)}{message.from != state.user.id && date.getTime() >= readTill && <Badge bg="secondary" style={{ marginLeft: '5px' }}>New</Badge>}
                                    </Form.Text>
                                    <span className="messageText">
                                        {message.content}
                                    </span>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
            <div id="sendMessage">
                <InputGroup id="message">
                    <InputGroup.Text>
                        <FontAwesomeIcon icon={faPaperclip} />
                    </InputGroup.Text>
                    <Form.Control type="text" name="message" placeholder="Enter message..." value={message} onChange={(e) => setMessage(e.target.value)} />
                </InputGroup>
                <Button variant="info" disabled={message.length === 0 ? true : false} onClick={async () => await sendMessage()}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                </Button>
            </div>
        </div>
    </>);
}

export default ChatsPage;