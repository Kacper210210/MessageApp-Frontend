import React from "react";
import "../Components - CSS/AlertBox.css";

import Alert from "react-bootstrap/Alert";

const AlertBox = ({ variant, dismissible, alertMessage, setAlertMessage, style }) => {
    return (<>
        <Alert variant={variant} show={alertMessage.length === 0 ? false : true} onClose={() => setAlertMessage('')} dismissible={dismissible} style={style}>
            <Alert.Heading>{alertMessage}</Alert.Heading>
        </Alert>
    </>);
}

export default AlertBox;