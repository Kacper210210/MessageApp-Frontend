import React, { useState, useEffect } from "react";
import "../Components - CSS/SearchModal.css";

import Store from "../Store";

import parse from "html-react-parser";

import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const SearchUsersModal = ({ search, searchUsersChecked, setSearchUsersChecked, filterList, createPrimaryButton, createMessageInput, onCleanup }) => {
    const state = Store.getState();

    const [searchValue, setSearchValue] = useState('');

    const [onFocus, setOnFocus] = useState(false);

    const [pageCounter, setPageCounter] = useState(1);

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

    const onScroll = async () => {
        const userListDisplay = document.querySelector("#userListDisplay");

        //console.log(userListDisplay.scrollHeight, userListDisplay.offsetHeight, userListDisplay.scrollTop);

        if(userListDisplay.scrollHeight - userListDisplay.offsetHeight === userListDisplay.scrollTop) {
            try {
                const result = await fetchUserlistPage(searchValue, pageCounter + 1);

                //console.log(result);

                const usersArray = [];

                for(const key of Object.keys(result)) {
                    usersArray.push(result[key]);
                }

                console.log(usersArray);

                if(usersArray.length != 0) {
                    setPageCounter(pageCounter + 1);

                    Store.dispatch({ type: 'SET_USER_LIST', payload: [...Store.getState().userList, ...usersArray] });
                }
            } catch(err) {
                console.log(err);
            }
        }
    }

    useEffect(() => {
        if(onFocus) {
            const userListDisplay = document.querySelector("#userListDisplay");

            userListDisplay.addEventListener("scroll", onScroll);

            return () => {
                userListDisplay.removeEventListener("scroll", onScroll);
            }
        }
    }, [onFocus, pageCounter]);

    useEffect(() => {
        //console.log(pageCounter);

        if(pageCounter > 1) {
            //console.log("Fetch new page!");
        }
    }, [pageCounter]);

    const fetchUserlistPage = async (tempSearchValue, page = 1) => {
        const requestBody = {
            search: tempSearchValue
        }

        if(filterList) {
            requestBody.exc_list = filterList;
        }

        const response = await fetch(`${Store.getState().baseUrl}/api/userlist/${page}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
            credentials: 'include'
        });

        const result = await response.json();

        if(response.status === 200) return result;
        else throw new Error("Could not fetch 'userListPage'!");
    }

    const onChange = async (event) => {
        setPageCounter(1);

        const tempSearchValue = event.target.value;

        setSearchValue(tempSearchValue);

        try {
            const result = await fetchUserlistPage(tempSearchValue);

            //console.log(result);

            const usersArray = [];

            for(const key of Object.keys(result)) {
                usersArray.push(result[key]);
            }

            //console.log(usersArray);

            Store.dispatch({ type: 'SET_USER_LIST', payload: usersArray });
        } catch(err) {
            console.log(err);
        }
    }

    const onFormCheckChange = (event, searchUser) => {
        setSearchUsersChecked({
            ...searchUsersChecked,
            [event.target.getAttribute("id")]: {
                ...searchUser,
                checked: event.target.checked
            }
        });
    }

    const onHide = () => {
        onCleanup();
    }

    return (<>
        <Modal show={search} onHide={() => onHide()} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Szukaj</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Control type="text" name="username" placeholder="Wyszukuj po email, nazwie użytkownika, lub imieniu i nazwisku..." onFocus={() => setOnFocus(true)} onChange={async (e) => await onChange(e)} />
                <div className="contentCenter" style={{ position: 'relative', marginTop: '5px' }}>
                    <div id="userListDisplay" style={onFocus ? { display: 'block' } : { display: 'none' }}>
                        <div id="userListOuterDisplay"></div>
                        <div id="userList">
                            {
                                state.userList.map((searchUser) => {
                                    const email = searchUser.email;
                                    const username = searchUser.username;

                                    if(filterList) {
                                        //console.log(filterList, searchUser.id);

                                        if(filterList.includes(searchUser.id)) return <></>;
                                    }

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
                                        <Form.Check type="switch" id={searchUser.id} checked={Object.keys(searchUsersChecked).includes(`${searchUser.id}`) && searchUsersChecked[searchUser.id].checked ? true : false} onChange={(e) => onFormCheckChange(e, searchUser)} style={{ position: 'relative', zIndex: 2 }} />
                                    </div>;
                                })
                            }
                        </div>
                    </div>
                </div>
                {createMessageInput ? createMessageInput() : <></>}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => onHide()}>
                    Anuluj
                </Button>
                {createPrimaryButton()}
            </Modal.Footer>
        </Modal>
    </>);
}

export default SearchUsersModal;