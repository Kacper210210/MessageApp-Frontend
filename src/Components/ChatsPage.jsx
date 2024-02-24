import React, { useEffect, useId, useState } from "react";
import "../Components - CSS/ChatsPage.css";

import Store from "../Store";

import { useLocation } from "react-router-dom";

import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/esm/Button";
import Badge from "react-bootstrap/Badge";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import { faArrowDown, faPaperclip } from "@fortawesome/free-solid-svg-icons";

let prevMessages = undefined;

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
    const [messages, setMessages] = useState([]);

    const [pageCounter, setPageCounter] = useState(undefined);

    const [elementScrollIntoView, setElementScrollIntoView] = useState(undefined);

    const [lastCheckedTimestamp, setLastCheckedTimestamp] = useState(undefined);

    const [scrollAdjustment, setScrollAdjustment] = useState(0);

    const [onLoad, setOnLoad] = useState(false);

    const [tempReadTill, setTempReadTill] = useState(undefined);

    const [unreadMessages, setUnreadMessages] = useState(0);

    const fetchReadTill = async (userId = undefined) => {
        if(userId === undefined) userId = currentUser.id;

        let fetchedReadTill; // Number of milliseconds since the epoch

        try {
            const response = await fetch(`${Store.getState().baseUrl}/api/private_messages/read_till/${userId}`, {
                method: 'GET',
                credentials: 'include'
            });
    
            const result = await response.json();
    
            //console.log(result);
    
            if(response.status === 404) {
                fetchedReadTill = 0;
            } else if(response.status === 200) {
                fetchedReadTill = result.read_till;
            } else throw new Error("Could not determine 'readTill'!");

            setReadTill(fetchedReadTill);
        } catch(err) {
            console.log(err);

            return err;
        }

        return fetchedReadTill;
    }

    const fetchMessages = async (page = 1, userId = undefined, readTill = undefined) => {
        if(userId === undefined) userId = currentUser.id;

        if(typeof page === 'number') {
            try {
                const response = await fetch(`${Store.getState().baseUrl}/api/user/${userId}/${page}`, {
                    method: 'GET',
                    credentials: 'include'
                });

                if(response.status != 200) throw new Error(`Could not load page: ${page}!`);
        
                const result = await response.json();
    
                result.reverse();

                /*console.log([
                    ...result,
                    ...messages
                ]);*/
        
                setMessages([
                    ...result,
                    ...messages
                ]);

                if(result.length != 0) {
                    setPageCounter(page + 1);
                }
            } catch(err) {
                console.log(err);
            }
        } else if(page === 'readTill') {
            try {
                if(readTill === undefined) readTill = readTill;

                let pageCounter = 1;

                let tempMessages = [];

                let lastMessageTimestamp;
                
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
                } while(lastMessageTimestamp >= readTill);

                //console.log(readTill, tempMessages);

                for(const tempMessage of tempMessages) {
                    const date = new Date(tempMessage.timestamp);

                    if(date.getTime() < readTill) break;
                    else {
                        setElementScrollIntoView(`message-${tempMessage.message_id}`);
                    }
                }

                tempMessages.reverse();

                setMessages(tempMessages);

                setPageCounter(pageCounter);
            } catch(err) {
                console.log(err);
            }
        } else if(page === 'readTillDisplay') {
            const messagesDisplay = document.querySelector("#messagesDisplay");
            const messageDisplayTop = 145;

            const messageHeight = 64;
            const messageGap = 15;

            let tempReadTillDisplay = undefined;

            for(const message of messages) {
                const messageEl = document.getElementById(`message-${message.message_id}`);
    
                const messageRect = messageEl.getBoundingClientRect();

                const messageTop = messageRect.top - messageDisplayTop;
                const messageBottom = messageRect.bottom - messageDisplayTop;

                if(messageTop >= 0 && messageBottom <= messagesDisplay.offsetHeight) {
                    const date = new Date(message.timestamp);

                    tempReadTillDisplay = date.getTime() + 1;

                    break;
                }
            }

            //console.log(tempReadTillDisplay);

            let tempScrollAdjustment = 0;

            let pageCounter = 1;

            let tempMessages = [];

            let lastMessageTimestamp;

            let unreadMessages = 0;

            let newMessages = 0;

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
                        for(const message of pageResult) {
                            const date = new Date(message.timestamp);

                            if(date.getTime() >= readTill) {
                                unreadMessages++;
                            } else break;

                            if(date.getTime() >= readTill && (lastCheckedTimestamp === undefined || date.getTime() >= lastCheckedTimestamp)) {
                                newMessages++;
                            }
                        }

                        const date = new Date(pageResult[pageResult.length - 1].timestamp);

                        lastMessageTimestamp = date.getTime();
                    }

                    pageCounter++;
                } catch(err) {
                    throw new Error(err);
                }
            } while(lastMessageTimestamp >= tempReadTillDisplay);

            //console.log(newMessages);

            tempScrollAdjustment += newMessages * (messageHeight + messageGap);

            if(newMessages === tempMessages.length) tempScrollAdjustment -= messageGap;

            if(unreadMessages != 0) setElementScrollIntoView(`message-${tempMessages[unreadMessages - 1].message_id}`);

            tempMessages.reverse();

            setMessages(tempMessages);

            //console.log(pageCounter);

            setPageCounter(pageCounter);

            if(tempMessages.length != 0) {
                const date = new Date(tempMessages[tempMessages.length - 1].timestamp);

                setLastCheckedTimestamp(date.getTime() + 1);
            }

            //console.log(tempScrollAdjustment);

            setScrollAdjustment(tempScrollAdjustment);

            setUnreadMessages(unreadMessages);
        }
    }

    const fetchReadTillMessages = async () => {
        const fetchedReadTill = await fetchReadTill();

        if(typeof fetchedReadTill === "number") {
            await fetchMessages('readTillDisplay', currentUser.id, fetchedReadTill);
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

        fetchUser(location.pathname.split('/')[3]);

        const fetchInitialMessages = async (userId) => {
            const fetchedReadTill = await fetchReadTill(userId);

            if(typeof fetchedReadTill === "number") {
                await fetchMessages('readTill', location.pathname.split('/')[3], fetchedReadTill);
            }
        }

        fetchInitialMessages(location.pathname.split('/')[3]);

        return () => {
            prevMessages = undefined;
        }
    }, []);

    useEffect(() => {
        if(currentUser != undefined && messages.length != undefined) {
            interval = setInterval(async () => {
                await fetchReadTillMessages();
            }, 1000);

            return () => {
                clearInterval(interval);

                interval = undefined;
            }
        }
    }, [currentUser, messages]);

    const millisecondsToString = (milliseconds) => {
        const date = new Date(milliseconds);

        return `${date.getFullYear()}-${getWithLeadingZero(date.getMonth() + 1)}-${getWithLeadingZero(date.getDate())} ${getWithLeadingZero(date.getHours())}:${getWithLeadingZero(date.getMinutes())}:${getWithLeadingZero(date.getSeconds())}.${date.getMilliseconds()}`;
    }

    const onScroll = async (event = undefined) => {
        const messagesDisplay = document.querySelector("#messagesDisplay");

        if(event != undefined) {
            if(messagesDisplay.scrollTop === 0) {
                await fetchMessages(pageCounter);

                return;
            }
        }

        const messageDisplayTop = 145;

        let tempReadTill = undefined;

        const messagesReversed = JSON.parse(JSON.stringify(messages));

        messagesReversed.reverse();

        for(const message of messagesReversed) {
            const date = new Date(message.timestamp);

            if(message.from === state.user.id) {
                tempReadTill = Math.max(date.getTime() + 1, tempReadTill === undefined ? 0 : tempReadTill);

                break;
            }

            if(date.getTime() >= readTill) {
                const messageEl = document.getElementById(`message-${message.message_id}`);

                const messageRect = messageEl.getBoundingClientRect();

                const messageTop = messageRect.top - messageDisplayTop;
                const messageBottom = messageRect.bottom - messageDisplayTop;

                if(messageTop >= 0 && messageBottom <= messagesDisplay.offsetHeight) {
                    tempReadTill = date.getTime() + 1; // +1ms
                }
            }
        }

        //console.log(tempReadTill, millisecondsToString(tempReadTill));

        setTempReadTill(tempReadTill);
    }

    useEffect(() => {
        const messagesDisplay = document.querySelector("#messagesDisplay");

        if(prevMessages === undefined && typeof messages === 'object') {
            messagesDisplay.scrollBy({
                top: messagesDisplay.scrollHeight - messagesDisplay.offsetHeight,
                behavior: 'instant'
            });
        }

        //console.log(messagesDisplay.scrollHeight, messagesDisplay.scrollTop, messagesDisplay.offsetHeight);

        if(Math.abs(messagesDisplay.scrollHeight - messagesDisplay.scrollTop - messagesDisplay.offsetHeight) <= 1 && elementScrollIntoView != undefined) {
            document.getElementById(elementScrollIntoView).scrollIntoView({ behavior: 'instant' });
        }

        if(Math.abs(messagesDisplay.scrollHeight - messagesDisplay.scrollTop - messagesDisplay.offsetHeight) > 1) {
            messagesDisplay.scrollBy({
                top: -scrollAdjustment,
                behavior: 'instant'
            });
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

            onScroll();

            messagesDisplay.addEventListener("scroll", onScroll);

            return () => {
                messagesDisplay.removeEventListener("scroll", onScroll);
            }
        }
    }, [onLoad, pageCounter, messages]);

    useEffect(() => {
        const setFetchReadTill = async () => {
            if(tempReadTill != undefined) {
                try {
                    console.log(tempReadTill);

                    const response = await fetch(`${Store.getState().baseUrl}/api/private_messages/read_till`, {
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

                    if(result.response === true) setReadTill(tempReadTill);
                } catch(err) {
                    console.log(err);
                }
            }
        }

        setFetchReadTill();
    }, [tempReadTill]);

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
        return `${getWithLeadingZero(date.getHours())}:${getWithLeadingZero(date.getMinutes())}:${getWithLeadingZero(date.getSeconds())}, ${getWithLeadingZero(date.getDate())}.${getWithLeadingZero(date.getMonth() + 1)}.${date.getFullYear()}`;
    }

    const onKeyDown = async (event) => {
        const keyCode = event.keyCode;

        //console.log(keyCode);

        if(message.length != 0 && keyCode === 13) {
            await sendMessage();
        }
    }

    const onScrollDown = () => {
        const messagesDisplay = document.querySelector("#messagesDisplay");

        if(unreadMessages != 0) {
            messagesDisplay.scrollBy({
                top: messagesDisplay.scrollHeight - messagesDisplay.offsetHeight,
                behavior: 'smooth'
            });
        }
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
                                        {message.from === state.user.id && <Badge bg="secondary" style={{ marginRight: '5px', opacity: `${date.getTime() >= readTill ? 1 : 0}` }}>New</Badge>}By {message.from === currentUser.id ? currentUser.username : 'You'} &#9679; {dateToString(date)}{message.from != state.user.id && <Badge bg="secondary" style={{ marginLeft: '5px', opacity: `${date.getTime() >= readTill ? 1 : 0}` }}>New</Badge>}
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
            {/*<div id="unreadMessages" style={unreadMessages === 0 ? { visibility: 'hidden' } : { visibility: 'visible', cursor: 'pointer' }} onClick={() => onScrollDown()}>
                    You have {unreadMessages} unread messages!
                    <FontAwesomeIcon icon={faArrowDown} style={{ marginLeft: '5px' }} />
            </div>*/}
            <div id="sendMessage">
                <InputGroup id="message">
                    <InputGroup.Text>
                        <FontAwesomeIcon icon={faPaperclip} />
                    </InputGroup.Text>
                    <Form.Control type="text" name="message" placeholder="Enter message..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={async (e) => await onKeyDown(e)} />
                </InputGroup>
                <Button variant="info" disabled={message.length === 0 ? true : false} onClick={async () => await sendMessage()}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                </Button>
            </div>
        </div>
    </>);
}

export default ChatsPage;