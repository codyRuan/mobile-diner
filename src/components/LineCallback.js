import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LineCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const fetchUri = `${process.env.REACT_APP_BACKEND_URI}/api/line-callback`;
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        if (code) {
            fetch(fetchUri, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code, state })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        localStorage.setItem('user', JSON.stringify(data.user));
                        console.log(data.user)
                        navigate('/Home');
                    } else {
                        console.error('Error:', data.message);
                        // handle error appropriately
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    // handle error appropriately
                });
        }
    }, [navigate]);

    return <div>Loading...</div>;
};

export default LineCallback;
