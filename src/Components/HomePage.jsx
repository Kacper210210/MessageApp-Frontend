import React from "react";
import "../Components - CSS/HomePage.css";

import { Link } from "react-router-dom";

import Button from "react-bootstrap/Button";

const HomePage = () => {
    return (<>
        <div id="mainContainer">
            <div id="banner">
                <div id="img"></div>
                <span id="text">
                    Don't have an account yet?
                    <Link to='/register'>
                        <Button variant="info">Register</Button>
                    </Link>
                </span>
            </div>
        </div>
    </>);
}

export default HomePage;