import React, { useEffect, useState } from "react";
import "../Components - CSS/MessageAppPage.css";

import Store from "../Store";

import { Outlet } from "react-router-dom";

import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const MessageAppPage = () => {
    const [searchText, setSearchText] = useState('');

    const [startedConversations, setStartedConversations] = useState([]);
    const [firstMessages, setFirstMessages] = useState([]);

    const onSearch = (event) => {
        setSearchText(event.target.value);
    }

    const fetchStartedConversations = async () => {
        try {
            const response = await fetch(`${Store.getState().baseUrl}/api/started_conversations`, {
                method: 'GET',
                credentials: 'include'
            });

            const result = await response.json();

            if(response.status === 200) {
                //console.log(result.recentChats);

                setStartedConversations(result.recentChats);
            }
        } catch(err) {
            console.log(err);
        }
    }

    useEffect(() => {
        fetchStartedConversations();
    }, []);

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
                <InputGroup className="mb-3" id="searchInput">
                    <Form.Control type="text" name="searchText" value={searchText} onChange={(e) => onSearch(e)} />
                    <InputGroup.Text>
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </InputGroup.Text>
                </InputGroup>
                <div id="chat">
                    <div className="chatEntry">
                        <div className="img">

                        </div>
                        <div>
                            <div className="username">
                                dfughdfg@fsjg (sdjbfkgsdg)
                            </div>
                            <div className="firstMessage">
                                ddddddddddfjkgdfkffffffffffffffffffdfggggggggggggggggggggggggggggg
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Outlet />
        </div>
    </>);
}

export default MessageAppPage;