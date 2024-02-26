import React, { useEffect, useState } from "react";
import "../Components - CSS/MessageAppPage.css";

import Store from "../Store";
import SearchUsersModal from "./SearchModal";

import { useNavigate, useLocation, Outlet } from "react-router-dom";

import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";

import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import Button from "react-bootstrap/Button";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import { faPlus } from "@fortawesome/free-solid-svg-icons";

let interval = undefined;

const MessageAppPage = () => {
    const navigate = useNavigate();

    const location = useLocation();

    const [startedConversations, setStartedConversations] = useState([]); // [{ user: {}, firstMessage: {} }]
    const [newStartedConversations, setNewStartedConversations] = useState([]);

    const [chats, setChats] = useState([]); // [{ chat: {}, firstMessage: {} }]
    const [newChats, setNewChats] = useState([]);

    const [searchText, setSearchText] = useState('');

    const [search, setSearch] = useState(false);

    const [searchUsersChecked, setSearchUsersChecked] = useState([]);

    const [isPrivateChat, setIsPrivateChat] = useState(true);

    const fetchChatReadTill = async (chatId) => {
        const response = await fetch(`${Store.getState().baseUrl}/api/chat/${chatId}`, {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();

        if(response.status != 200) throw new Error("Could not fetch 'chatReadTill'!");

        return result.readtill;
    }

    const fetchChatMessages = async (chatId, page = 1) => {
        const response = await fetch(`${Store.getState().baseUrl}/api/chats/${chatId}/${page}`, {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();

        if(response.status != 200) throw new Error("Could not fetch 'chatMessages'!");

        return result;
    }

    const fetchChats = async () => {
        try {
            const response = await fetch(`${Store.getState().baseUrl}/api/chats`, {
                method: 'GET',
                credentials: 'include'
            });

            const result = await response.json();

            if(response.status != 200) throw new Error("Could not fetch chats!");

            //console.log(result.chats);

            const tempChatGroups = [];

            for(const chat of result.chats) {
                const chatId = chat.id;

                const fetchedChatReadTill = await fetchChatReadTill(chatId);

                const fetchedChatMessages = await fetchChatMessages(chatId);

                //console.log(fetchedChatReadTill, fetchedChatMessages);

                let firstChatMessage = {
                    content: '',
                    timestamp: 0
                }

                if(fetchedChatMessages.length != 0) {
                    firstChatMessage = {
                        content: fetchedChatMessages[0].content,
                        timestamp: (new Date(fetchedChatMessages[0].timestamp)).getTime()
                    }

                    if((new Date(fetchedChatMessages[0].timestamp)).getTime() >= fetchedChatReadTill && fetchedChatMessages[0].member_id != Store.getState().user.id) {
                        firstChatMessage.content = `<strong>${firstChatMessage.content}</strong>`;
                    }
                }

                tempChatGroups.push({
                    chat,
                    firstMessage: firstChatMessage
                });
            }

            tempChatGroups.sort((a, b) => {
                return a.firstMessage.timestamp >= b.firstMessage.timestamp;
            });

            //console.log(tempChatGroups);

            setChats(tempChatGroups);

            onChange(searchText, tempChatGroups, false);
        } catch(err) {
            console.log(err);
        }
    }

    const fetchUser = async (userId) => {
        const response = await fetch(`${Store.getState().baseUrl}/api/user/${userId}`, {
            method: 'GET',
            credentials: 'include'
        });

        const result = await response.json();

        if(response.status != 200) throw new Error(`Could not fetch user: ${userId}!`);

        return result;
    }

    const fetchImage = async (userId) => {
        const response = await fetch(`${Store.getState().baseUrl}/api/get_image_of_user/${userId}`, {
            method: 'GET',
            credentials: 'include'
        });
    
        const result = await response.json();
    
        if(response.status != 200) throw new Error(`Could not fetch image: ${userId}!`);
        
        return result.image;
    }

    const fetchReadTill = async (userId) => {
        let fetchedReadTill; // Number of milliseconds since the epoch

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

        return fetchedReadTill;
    }

    const fetchMessages = async (userId, page = 1) => {
        const response = await fetch(`${Store.getState().baseUrl}/api/user/${userId}/${page}`, {
            method: 'GET',
            credentials: 'include'
        });

        if(response.status != 200) throw new Error(`Could not load page: ${page}!`);

        const result = await response.json();

        return result;
    }

    const fetchStartedConversations = async () => {
        try {
            const response = await fetch(`${Store.getState().baseUrl}/api/started_conversations`, {
                method: 'GET',
                credentials: 'include'
            });

            const result = await response.json();

            if(response.status != 200) throw new Error("Could not fetch 'startedConversations'!");

            //console.log(result.recentChats);

            const tempStartedConversations = [];

            for(const userId of result.recentChats) {
                const user = await fetchUser(userId);

                const image = await fetchImage(userId);

                //console.log(image);

                const fetchedReadTill = await fetchReadTill(userId);

                const fetchedMessages = await fetchMessages(userId);

                //console.log(fetchedReadTill, fetchedMessages);

                const firstMessage = {
                    content: fetchedMessages[0].content,
                    timestamp: (new Date(fetchedMessages[0].timestamp)).getTime()
                }

                if((new Date(fetchedMessages[0].timestamp)).getTime() >= fetchedReadTill && fetchedMessages[0].from != Store.getState().user.id) {
                    firstMessage.content = `<strong>${firstMessage.content}</strong>`;
                }

                tempStartedConversations.push({
                    user,
                    image,
                    firstMessage
                });
            }

            tempStartedConversations.sort((a, b) => {
                return a.firstMessage.timestamp >= b.firstMessage.timestamp;
            });

            //console.log(tempStartedConversations);

            setStartedConversations(tempStartedConversations);

            onChange(searchText, tempStartedConversations);
        } catch(err) {
            console.log(err);
        }
    }

    useEffect(() => {
        interval = setInterval(async () => {
            if(Store.getState().user.id != undefined) {
                await fetchStartedConversations();

                await fetchChats();
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        }
    }, [searchText]);

    const onSearch = (event) => {
        const tempSearchText = event.target.value;

        setSearchText(tempSearchText);

        if(tempSearchText.length != 0) {
            if(isPrivateChat) {
                onChange(tempSearchText, startedConversations);
            } else onChange(tempSearchText, chats, false);
        }
    }

    const onChange = (searchValue, tempStartedConversations, searchPrivateChat = true) => {
        if(searchValue === undefined) searchValue = searchText;
        if(tempStartedConversations === undefined) tempStartedConversations = startedConversations;

        const tempNewStartedConversations = [];

        for(const startedConversation of tempStartedConversations) {
            let matchProperties = ['email', 'username', 'nameSurname'];

            if(!searchPrivateChat) matchProperties = ['name'];

            let foundMatchProperty = false;

            for(let i = 0; i < matchProperties.length; i++) {
                let matchProperty;

                if(searchPrivateChat) {
                    if(i < 2) matchProperty = startedConversation.user[matchProperties[i]];
                    else matchProperty = startedConversation.user.name + ' ' + startedConversation.user.surname;
                } else matchProperty = startedConversation.chat.name;

                for(let j = 0; j < matchProperty.length; j++) {
                    let tempLongestMatch = 0;

                    while(j + tempLongestMatch < matchProperty.length && tempLongestMatch < searchValue.length && matchProperty[j + tempLongestMatch] === searchValue[tempLongestMatch]) {
                        tempLongestMatch++;
                    }

                    if(tempLongestMatch === searchValue.length) {
                        tempNewStartedConversations.push(startedConversation);

                        foundMatchProperty = true;

                        break;
                    }
                }

                if(foundMatchProperty) break;
            }
        }

        if(searchPrivateChat) {
            setNewStartedConversations(tempNewStartedConversations);
        } else setNewChats(tempNewStartedConversations);
    }

    const onCreateGroupChat = async () => {
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

    const addUserToChatGroup = async (chatId, userId) => {
        const response = await fetch(`${Store.getState().baseUrl}/api/chats/${chatId}/add_user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId
            }),
            credentials: 'include'
        });

        if(response.status != 200) throw new Error("Could not add user to chat group!");
    }

    const createGroupChat = async () => {
        console.log("Create group chat!");

        try {
            const response = await fetch(`${Store.getState().baseUrl}/api/chats/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            const result = await response.json();

            if(response.status === 200) {
                const chatId = result.chat.id;

                //console.log(chatId);

                for(const userId of Object.keys(searchUsersChecked)) {
                    const user = searchUsersChecked[userId];

                    if(user.checked) {
                        await addUserToChatGroup(chatId, userId);
                    }
                }
            }
        } catch(err) {
            console.log(err);
        }

        onHide();
    }

    const createPrimaryButton = () => {
        let searchUsersCheckedCount = 0;

        for(const key of Object.keys(searchUsersChecked)) {
            if(searchUsersChecked[key].checked) searchUsersCheckedCount++;
        }

        if(searchUsersCheckedCount === 0) return <Button variant="primary" disabled>Create Group Chat</Button>;
        else return <Button variant="primary" onClick={async () => await createGroupChat()}>Create Group Chat</Button>;
    }

    const onHide = () => {
        setSearch(false);

        setSearchUsersChecked([]);
    }

    const onClick = (userId) => {
        navigate(`chats/${userId}`);
    }

    const onChatClick = (chatId) => {

    }

    const renderTooltip = (props, content) => {
        return (
            <Tooltip {...props}>
                {content}
            </Tooltip>
        );
    }

    const returnChatType = () => {
        if(searchText.length === 0) {
            const mix = [...startedConversations, ...chats];

            mix.sort((a, b) => {
                return a.firstMessage.timestamp >= b.firstMessage.timestamp;
            });

            return mix;
        } else if(isPrivateChat) {
            return newStartedConversations;
        } else return newChats;
    }

    return (<>
        <style>
            {`
                .App {
                    width: 100%;
                    min-height: 100vh;
                    background-color: #ccffff;
                }
            `}
        </style>
        <div style={{
            height: 'calc(100vh - 95px)',
            marginTop: '20px',
            display: 'flex'
        }}>
            <div id="chatList">
                <InputGroup id="searchInput" className="mb-3">
                        <Form.Control type="text" name="searchText" value={searchText} onChange={(e) => onSearch(e)} />
                        <InputGroup.Text>
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </InputGroup.Text>
                </InputGroup>
                <Form.Group id="chatType" className="mb-3">
                    <Form.Label>Search for chat type: </Form.Label>
                    <Form.Group>
                        <Form.Check.Input
                            type="radio"
                            id="privateChat"
                            name="chatTypes"
                            defaultChecked
                            onClick={() => setIsPrivateChat(true)}
                        />
                        <Form.Check.Label htmlFor="privateChat">
                            Private Chat
                        </Form.Check.Label>
                    </Form.Group>
                    <Form.Group>
                        <Form.Check.Input
                            type="radio"
                            id="groupChat"
                            name="chatTypes"
                            onClick={() => setIsPrivateChat(false)}
                        />
                        <Form.Check.Label htmlFor="groupChat">
                            Group Chat
                        </Form.Check.Label>
                    </Form.Group>
                </Form.Group>
                <Button variant="info" id="createGroupChat" className="mb-3" onClick={async () => await onCreateGroupChat()}>
                    <FontAwesomeIcon icon={faPlus} /> Create Group Chat
                </Button>
                <div id="chat">
                    {
                        returnChatType().map((startedConversation) => {
                            if(Object.keys(startedConversation).includes('user')) {
                                return (<>
                                    <div className="chatEntry" onClick={() => onClick(startedConversation.user.id)} style={location.pathname.split('/')[3] == startedConversation.user.id ? { backgroundColor: '#00e6e6' } : {}}>
                                        <img src={startedConversation.image} className="profileImg" />
                                        <div>
                                            <OverlayTrigger
                                                placement="right"
                                                delay={{ show: 250, hide: 400 }}
                                                overlay={(props) => renderTooltip(props, `${startedConversation.user.email} (${startedConversation.user.username})`)}
                                            >
                                                <div className="username">
                                                    {startedConversation.user.email} ({startedConversation.user.username})
                                                </div>
                                            </OverlayTrigger>
                                            <div className="firstMessage">
                                                {startedConversation.firstMessage.content}
                                            </div>
                                        </div>
                                    </div>
                                </>);
                            } else {
                                return (<>
                                    <div className="chatEntry" onClick={() => onChatClick(startedConversation.chat.id)} style={location.pathname.split('/')[3] == startedConversation.chat.id ? { backgroundColor: '#00e6e6' } : {}}>
                                        <div>
                                            <div className="username">
                                                {startedConversation.chat.name}
                                            </div>
                                            <div className="firstMessage">
                                                {startedConversation.firstMessage.content}
                                            </div>
                                        </div>
                                    </div>
                                </>);
                            }
                        })
                    }
                </div>
            </div>
            <SearchUsersModal search={search} searchUsersChecked={searchUsersChecked} setSearchUsersChecked={setSearchUsersChecked} createPrimaryButton={createPrimaryButton} onCleanup={onHide} />
            <Outlet />
        </div>
    </>);
}

export default MessageAppPage;