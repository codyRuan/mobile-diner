import React from 'react';
import { Link } from 'react-router-dom';
import './MenuBar.css';

const MenuBar = ({ user, handleLogout }) => {
    return (
        <div className="menu-bar">
            <nav>
                <ul>
                    {/* <li><Link to="/">Home</Link></li> */}
                    <li><Link to="/map">Map</Link></li>
                    <li><Link to="/addVendor">Add Vendor</Link></li>
                    <li><Link to="/editVendors">Edit Vendor</Link></li>
                </ul>
            </nav>
            {user && (
                <div className="user-info">
                    {/* <span>{user.display_name}</span> */}
                    <Link to="/" className="user-button">{user.display_name}</Link>
                    <button className="logout-button" onClick={handleLogout}>Logout</button>
                </div>
            )}
        </div>
    );
};

export default MenuBar;
