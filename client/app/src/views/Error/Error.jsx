import React from "react";
import { Link } from "react-router-dom";

const ErrorPage = () => {
    return (
        <div className="error-container">
            <h1>404 - Page introuvable</h1>
            <p>Cette page n'existe pas....</p>
            <Link to="/" className="error-link">Retourner au menu</Link>
        </div>
    );
};

export default ErrorPage;

// npm test -- --coverage test/views/Error/Error.test.jsx --env=jsdom
