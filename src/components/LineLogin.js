import React from 'react';
import './LineLogin.css';

const LineLogin = () => {
    const handleLogin = () => {
        const clientId = process.env.REACT_APP_LINE_LOGIN_CHANNEL_ID;
        const redirectUri = process.env.REACT_APP_REDIRECT_URI;
        // const redirectUri = `http://192.168.0.106:3000/line-callback`;
        const state = 'login';
        const scope = 'openid profile email';

        // 构建 Line 登录 URL
        const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;

        // 重定向到 Line 登录 URL
        window.location.href = lineLoginUrl;
    };

    return (
        <div className="line-login-container">
            <button className="line-login-button" onClick={handleLogin}>
                <img src="btn_base.png" alt="LINE Login" className="line-login-logo" /> {/* Use your LINE Login button image */}
                <span>LINE Login</span>
            </button>
        </div>
    );
};

export default LineLogin;
