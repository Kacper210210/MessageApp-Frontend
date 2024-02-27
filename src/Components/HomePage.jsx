import React from "react";
import "../Components - CSS/HomePage.css";

import { Link } from "react-router-dom";

import Button from "react-bootstrap/Button";

import BgImage from "../assets/environment.jpg"

const HomePage = () => {
    return (<>
        <div id="mainContainer">
            <div id="banner">
                <div id="img"><img alt="Baner powitalny" src={BgImage}></img></div>
                <span id="text">
                    Nie masz jeszcze konta?
                    <Link to='/register'>
                        <Button variant="info">Zarejestruj</Button>
                    </Link>
                </span>
            </div>
        </div>
    </>);
}

export default HomePage;