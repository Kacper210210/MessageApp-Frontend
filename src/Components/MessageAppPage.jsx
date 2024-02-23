import React, { useState } from "react";
import "../Components - CSS/MessageAppPage.css";

import { Outlet } from "react-router-dom";

import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const MessageAppPage = () => {
    const [searchText, setSearchText] = useState('');

    const onSearch = (event) => {
        setSearchText(event.target.value);
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
                <InputGroup className="mb-3" id="searchInput">
                    <Form.Control type="text" name="searchText" value={searchText} onChange={(e) => onSearch(e)} />
                    <InputGroup.Text>
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </InputGroup.Text>
                </InputGroup>
                <div className="chat">
                    
                </div>
            </div>
            <Outlet />
        </div>
    </>);
}

export default MessageAppPage;