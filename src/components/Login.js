import React from 'react';

const Login = () => {
    const googleLogin = () => {
        window.location.href = 'http://127.0.0.1:5000/login/google';
    };

    const facebookLogin = () => {
        window.location.href = 'http://127.0.0.1:5000/login/facebook';
    };

    return (
        <div>
            <h2>Login</h2>
            <button onClick={googleLogin}>Login with Google</button>
            <button onClick={facebookLogin}>Login with Facebook</button>
        </div>
    );
};

export default Login;
