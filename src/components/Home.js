import React from 'react';
import './Home.css';

const Home = ({ user }) => {
    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/home';
        window.location.reload();
    };

    return (
        <div className="home-container">
            <div className="profile-card">
                <img className="profile-image" src={user.picture_url} alt="Profile" />
                <h1 className="profile-name">Welcome, {user.display_name}</h1>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
};

export default Home;
