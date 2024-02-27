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

    const [tempReadTill, setTempReadTill] = useState(undefined);
    const [readTill, setReadTill] = useState(undefined);

    const [messages, setMessages] = useState(undefined);

    const [onInitialMessagesLoad, setOnInitialMessagesLoad] = useState(false);

    const [prevPageCounter, setPrevPageCounter] = useState(undefined);
    const [pageCounter, setPageCounter] = useState(undefined);

    const [notLoadNewPage, setNotLoadNewPage] = useState(false);

    const [newScrollPosition, setNewScrollPosition] = useState(undefined);

    const [scrollElementIntoView, setScrollElementIntoView] = useState(undefined); // 'id'

    const [scrollAdjustment, setScrollAdjustment] = useState(0);

    const [lastCheckedTimestamp, setLastCheckedTimestamp] = useState(undefined);

    const [onLoad, setOnLoad] = useState(false);

    const [unreadMessages, setUnreadMessages] = useState(0);

    const [isWindowFocused, setIsWindowFocused] = useState(true);

    const fetchReadTill = async (userId = undefined) => {
        if(userId === undefined) userId = currentUser.id;

        let fetchedReadTill; // Number of milliseconds since the epoch

        try {
            const response = await fetch(`${Store.getState().baseUrl}/api/private_messages/read_till/${userId}`, {
                method: 'GET',
                credentials: 'include'
            });
    
            const result = await response.json();
    
            if(response.status === 200) {
                fetchedReadTill = result.read_till;
            } else if(response.status === 404) {
                fetchedReadTill = 0;
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

                const result = await response.json();

                if(response.status != 200) throw new Error(`Could not load page: ${page}!`);
    
                result.reverse();
        
                setMessages([
                    ...result,
                    ...messages
                ]);

                if(result.length != 0) {
                    setPrevPageCounter(page);

                    setPageCounter(page + 1);
                }
            } catch(err) {
                console.log(err);
            }
        } else if(page === 'readTill') {
            try {
                let tempPageCounter = 1;

                let tempMessages = [];

                let lastMessageTimestamp;
                
                do {
                    try {
                        const pageResponse = await fetch(`${Store.getState().baseUrl}/api/user/${userId}/${tempPageCounter}`, {
                            method: 'GET',
                            credentials: 'include'
                        });

                        if(pageResponse.status != 200) throw new Error(`Could not load page: ${tempPageCounter}!`);
                
                        const pageResult = await pageResponse.json();
                
                        tempMessages = [...tempMessages, ...pageResult];

                        if(pageResult.length === 0) break;
                        else {
                            const date = new Date(pageResult[pageResult.length - 1].timestamp);

                            lastMessageTimestamp = date.getTime();
                        }

                        tempPageCounter++;
                    } catch(err) {
                        throw new Error(err);
                    }
                } while(lastMessageTimestamp >= readTill);

                //console.log(JSON.parse(JSON.stringify(tempMessages)));

                let tempScrollElementIntoView = undefined;

                for(const tempMessage of tempMessages) {
                    const date = new Date(tempMessage.timestamp);

                    if(date.getTime() >= readTill) {
                        tempScrollElementIntoView = `message-${tempMessage.message_id}`;
                    }
                }

                setScrollElementIntoView(tempScrollElementIntoView);

                tempMessages.reverse();

                setMessages(tempMessages);

                // prevPageCounter
                setPrevPageCounter(pageCounter);

                setPageCounter(tempPageCounter);
            } catch(err) {
                console.log(err);
            }
        } else if(page === 'readTillDisplay') {
            const messagesDisplay = document.querySelector("#messagesDisplay");
            const messageDisplayTop = 145;

            const messageHeight = 54;
            const messageGap = 15;

            const pageHeight = 2070;

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

            let tempPageCounter = 1;

            let tempMessages = [];

            let lastMessageTimestamp;

            let unreadMessages = 0;

            let newMessages = 0;

            do {
                try {
                    const pageResponse = await fetch(`${Store.getState().baseUrl}/api/user/${userId}/${tempPageCounter}`, {
                        method: 'GET',
                        credentials: 'include'
                    });

                    if(pageResponse.status != 200) throw new Error(`Could not load page: ${tempPageCounter}!`);
            
                    const pageResult = await pageResponse.json();
            
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

                    tempPageCounter++;
                } catch(err) {
                    throw new Error(err);
                }
            } while(lastMessageTimestamp >= tempReadTillDisplay);

            //console.log(JSON.parse(JSON.stringify(tempMessages)));

            let tempScrollElementIntoView = undefined;

            for(const tempMessage of tempMessages) {
                const date = new Date(tempMessage.timestamp);

                if(date.getTime() >= readTill) {
                    tempScrollElementIntoView = `message-${tempMessage.message_id}`;
                }
            }

            //console.log(tempScrollElementIntoView);

            tempMessages.reverse();

            setMessages(tempMessages);

            // prevPageCounter
            setPrevPageCounter(pageCounter);

            setPageCounter(tempPageCounter);

            if(tempPageCounter < pageCounter && messagesDisplay.scrollHeight - messagesDisplay.scrollTop != messagesDisplay.offsetHeight) {
                setNotLoadNewPage(true);

                let tempScrollPosition = messagesDisplay.scrollTop;

                //tempNewScrollPosition -= (pageCounter - tempPageCounter) * pageHeight;

                messagesDisplay.scroll({
                    top: 0,
                    behavior: 'instant'
                });

                setNewScrollPosition({
                    scrollPosition: tempScrollPosition,
                    messagesDisplayHeight: messagesDisplay.scrollHeight
                });
            }

            if(messagesDisplay.scrollHeight - messagesDisplay.scrollTop === messagesDisplay.offsetHeight) setScrollElementIntoView(tempScrollElementIntoView);

            // scrollAdjustment
            let tempScrollAdjustment = newMessages * (messageHeight + messageGap);

            if(newMessages === tempMessages.length) tempScrollAdjustment -= messageGap;

            setScrollAdjustment(-tempScrollAdjustment);

            if(tempMessages.length != 0) {
                const date = new Date(tempMessages[tempMessages.length - 1].timestamp);

                setLastCheckedTimestamp(date.getTime() + 1);
            }

            setUnreadMessages(unreadMessages);
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

        if(currentUser.id != undefined && currentUser.id != location.pathname.split('/')[3]) {
            setOnInitialMessagesLoad(false);
        }
    }, [location.pathname.split('/')[3]]);

    const onFocus = () => {
        setIsWindowFocused(true);
    }

    const onBlur = () => {
        setIsWindowFocused(false);
    }

    useEffect(() => {
        const fetchInitialReadTillMessages = async (userId) => {
            const fetchedReadTill = await fetchReadTill(userId);

            if(typeof fetchedReadTill === "number") {
                await fetchMessages('readTill', userId, fetchedReadTill);
            }
        }

        fetchInitialReadTillMessages(location.pathname.split('/')[3]);

        //console.log("fetchInitialReadTillMessages");

        window.addEventListener("focus", onFocus);
        window.addEventListener("blur", onBlur);

        return () => {
            window.removeEventListener("focus", onFocus);
            window.removeEventListener("blur", onBlur);
        }
    }, []);

    useEffect(() => {
        if(onInitialMessagesLoad) {
            console.log("onInitialMessagesLoad");

            const messagesDisplay = document.querySelector("#messagesDisplay");

            messagesDisplay.scrollBy({
                top: messagesDisplay.scrollHeight - messagesDisplay.offsetHeight,
                behavior: 'instant'
            });

            //console.log(messagesDisplay.scrollHeight, messagesDisplay.scrollTop, messagesDisplay.offsetHeight, scrollElementIntoView);

            if(messagesDisplay.scrollHeight - messagesDisplay.scrollTop === messagesDisplay.offsetHeight && scrollElementIntoView != undefined) {
                document.getElementById(scrollElementIntoView).scrollIntoView({
                    behavior: 'instant'
                });
            }

            onScroll();

            setTimeout(() => {
                setOnLoad(true);
            }, 500);
        }
    }, [onInitialMessagesLoad]);

    useEffect(() => {
        if(messages != undefined) setOnInitialMessagesLoad(true);

        if(onInitialMessagesLoad) {
            const messagesDisplay = document.querySelector("#messagesDisplay");

            //console.log(messagesDisplay.scrollHeight, messagesDisplay.scrollTop, messagesDisplay.offsetHeight, scrollElementIntoView);

            if(scrollElementIntoView != undefined) {
                document.getElementById(scrollElementIntoView).scrollIntoView({
                    behavior: 'instant'
                });
            }

            if(newScrollPosition != undefined) {
                const tempNewScrollPosition = newScrollPosition.scrollPosition - (newScrollPosition.messagesDisplayHeight - messagesDisplay.scrollHeight);

                //console.log(tempNewScrollPosition);

                messagesDisplay.scroll({
                    top: tempNewScrollPosition,
                    behavior: 'instant'
                });

                setNewScrollPosition(undefined);
            }

            if(messagesDisplay.scrollHeight - messagesDisplay.scrollTop != messagesDisplay.offsetHeight && scrollAdjustment != 0) {
                //console.log(scrollAdjustment);

                messagesDisplay.scrollBy({
                    top: scrollAdjustment,
                    behavior: 'instant'
                });
            }
        }
    }, [messages]);

    const fetchReadTillMessages = async () => {
        const fetchedReadTill = await fetchReadTill();

        if(typeof fetchedReadTill === "number") {
            await fetchMessages('readTillDisplay', currentUser.id, fetchedReadTill);
        }
    }

    useEffect(() => {
        if(currentUser != undefined && messages != undefined) {
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
            //console.log(notLoadNewPage);

            if(messagesDisplay.scrollTop === 0) {
                if(!notLoadNewPage) {
                    await fetchMessages(pageCounter);
                } else setNotLoadNewPage(false);
                
                return;
            }
        }

        if(!isWindowFocused) return;

        const messageDisplayTop = 145;

        let tempReadTill = undefined;

        const messagesReversed = JSON.parse(JSON.stringify(messages));

        messagesReversed.reverse();

        for(const message of messagesReversed) {
            const date = new Date(message.timestamp);

            if(message.from === state.user.id) {
                if(tempReadTill === undefined && (readTill === undefined || date.getTime() + 1 > readTill)) {
                    tempReadTill = date.getTime() + 1;
                }

                break;
            }

            if(date.getTime() >= readTill) {
                const messageEl = document.getElementById(`message-${message.message_id}`);

                const messageRect = messageEl.getBoundingClientRect();

                const messageTop = messageRect.top - messageDisplayTop;
                const messageBottom = messageRect.bottom - messageDisplayTop;

                if(messageTop >= 0 && messageBottom <= messagesDisplay.offsetHeight && tempReadTill === undefined) {
                    tempReadTill = date.getTime() + 1; // + 1ms
                }
            }
        }

        //console.log(tempReadTill, millisecondsToString(tempReadTill), readTill);

        setTempReadTill(tempReadTill);
    }

    useEffect(() => {
        if(onLoad) {
            const messagesDisplay = document.querySelector("#messagesDisplay");

            onScroll();

            messagesDisplay.addEventListener("scroll", onScroll);

            return () => {
                messagesDisplay.removeEventListener("scroll", onScroll);
            }
        }
    }, [onLoad, messages, pageCounter, notLoadNewPage, isWindowFocused]);

    useEffect(() => {
        const setFetchReadTill = async () => {
            if(tempReadTill != undefined) {
                try {
                    //console.log(tempReadTill);

                    const response = await fetch(`${Store.getState().baseUrl}/api/private_messages/read_till/${currentUser.id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
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

        if(message.length != 0 && keyCode === 13) {
            await sendMessage();
        }
    }

    const onScrollDown = () => {

    }

    return (<>
        <div id="conversation">
            <div id="username">
                {`${currentUser.name} ${currentUser.surname} <${currentUser.email}> (${currentUser.username})`}
            </div>
            <div id="messagesDisplay">
                <div id="messages">
                    {
                        messages != undefined && messages.map((message) => {
                            const date = new Date(message.timestamp);

                            return (
                                <div className={`message ${message.from === state.user.id && 'ownMessage'}`} id={`message-${message.message_id}`}>
                                    <Form.Text className="text-muted">
                                        {message.from === state.user.id && <Badge bg="secondary" style={{ marginRight: '5px', opacity: `${date.getTime() >= readTill ? 1 : 0}` }}>Nowy</Badge>}Od {message.from === currentUser.id ? currentUser.username : 'Ty'} &#9679; {dateToString(date)}{message.from != state.user.id && <Badge bg="secondary" style={{ marginLeft: '5px', opacity: `${date.getTime() >= readTill ? 1 : 0}` }}>Nowy</Badge>}
                                    </Form.Text>
                                    <div>
                                        <span className="messageText">
                                            {message.content}
                                        </span>
                                    </div>
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
                    <Form.Control type="text" name="message" placeholder="Wpisz wiadomość..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={async (e) => await onKeyDown(e)} />
                </InputGroup>
                <Button variant="info" disabled={message.length === 0 ? true : false} onClick={async () => await sendMessage()}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                </Button>
            </div>
        </div>
    </>);
}

export default ChatsPage;