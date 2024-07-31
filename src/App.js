// App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MenuBar from './components/MenuBar';
import LineLogin from './components/LineLogin';
import VendorForm from './components/VendorForm';
import Map from './components/Map';
import Home from './components/Home';
import LineCallback from './components/LineCallback';
import UserVendors from './components/UserVendors';
import EditLocationPage from './components/EditLocationPage';

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/home';
    };

    return (
        <Router>
            <div>
                <MenuBar user={user} handleLogout={handleLogout} />
                <Routes>
                    <Route
                        path="/Home"
                        element={
                            user ? <Home user={user}/> : <LineLogin />
                        }
                    />
                    <Route
                        path="/"
                        element={
                            user ? <Navigate to="/Home" /> : <LineLogin />
                        }
                    />
                    <Route path="/line-callback" element={<LineCallback />} />
                    <Route path="/login" element={<LineLogin />} />
                    <Route 
                        path="/map" 
                        element={
                            !user ? <Navigate to="/Home" /> : <Map />
                        }
                    />
                    <Route 
                        path="/addVendor" 
                        element={
                            !user ? <Navigate to="/Home" /> : <VendorForm />
                        }
                    />
                    <Route 
                        path="/editVendors" 
                        element={
                            !user ? <Navigate to="/Home" /> : <UserVendors userEmail={user ? user.email : ''} />
                        }
                    />
                    <Route path="/edit-location" element={<EditLocationPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
