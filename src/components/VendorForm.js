import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindowF } from '@react-google-maps/api';
import { Box, Button, TextField, Typography } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
    setKey,
    setLanguage,
    setRegion,
    fromLatLng,
    fromAddress,
} from "react-geocode";

import './VendorForm.css';

const containerStyle = {
    width: '100%',
    height: '400px'
};

const initialCenter = {
    lat: 24.896,
    lng: 121.327
};

// Set the Google Maps Geocoding API key
setKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY); // Replace with your actual API key

// Set default language and region
setLanguage('zh-TW'); // Set language to Chinese (Taiwan)
setRegion('tw'); // Set region to Taiwan

function VendorForm() {
    const [name, setName] = useState('');
    const [link, setLink] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [mapCenter, setMapCenter] = useState(initialCenter);
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [startDateTime, setStartDateTime] = useState(new Date());
    const [endDateTime, setEndDateTime] = useState(new Date());
    const [address, setAddress] = useState('');
    const storedUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URI}/api/get_vendors`);
                const data = await response.json();
                setVendors(data);
            } catch (error) {
                console.error('Error fetching vendors:', error);
            }
        };

        fetchVendors();
    }, []);

    const handleMapClick = (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setLatitude(lat);
        setLongitude(lng);
        setSelectedPosition({ lat, lng });
        setSelectedVendor(null);
        fromLatLng(lat, lng).then(
            ({ results }) => {
                if (results[0]) {
                    setAddress(results[0].formatted_address);
                }
            },
            (error) => {
                console.error('Error fetching address from coordinates:', error);
            }
        );
    };

    const handleMarkerClick = (vendor) => {
        setSelectedVendor(vendor);
        setSelectedPosition(null);
    };

    const formatDateTime = (date) => {
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Adjust dates to the correct timezone
        const adjustToLocalTimezone = (date) => {
            const offset = date.getTimezoneOffset();
            const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
            return adjustedDate.toISOString();
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URI}/api/add_vendor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    link,
                    latitude,
                    longitude,
                    address,
                    start_date: adjustToLocalTimezone(startDateTime),
                    end_date: adjustToLocalTimezone(endDateTime),
                    user_name: storedUser.display_name,
                    user_email: storedUser.email
                })
            });
            if (response.ok) {
                alert('Vendor created successfully!');
                const newVendor = await response.json();
                setVendors([...vendors, newVendor]);
                setMapCenter({ lat: latitude, lng: longitude });
                setSelectedPosition(null);
            } else {
                const errorData = await response.json();
                console.error('Error:', errorData);
                alert(`Failed to create vendor: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(`Failed to create vendor: ${error.message}`);
        }
    };

    const handleAddressChange = (event) => {
        setAddress(event.target.value);
    };

    const handleGeocode = () => {
        fromAddress(address).then(
            ({ results }) => {
                const { lat, lng } = results[0].geometry.location;
                setLatitude(lat);
                setLongitude(lng);
                setMapCenter({ lat, lng });
                setSelectedPosition({ lat, lng });
            },
            (error) => {
                console.error('Error geocoding address:', error);
                alert('Failed to find location from address. Please try a different address.');
            }
        );
    };

    return (
        <Box className="vendor-form-container" sx={{ padding: 2, marginTop: 2 }}>
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={mapCenter}
                    zoom={12}
                    onClick={handleMapClick}
                >
                    {vendors.map(vendor => (
                        <Marker
                            key={vendor.id}
                            position={{ lat: vendor.latitude, lng: vendor.longitude }}
                            onClick={() => handleMarkerClick(vendor)}
                        />
                    ))}
                    {selectedPosition && (
                        <Marker
                            position={selectedPosition}
                            icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                        />
                    )}
                    {selectedVendor && (
                        <InfoWindowF
                            position={{ lat: selectedVendor.latitude, lng: selectedVendor.longitude }}
                            onCloseClick={() => setSelectedVendor(null)}
                        >
                            <Box>
                                <Typography variant="h6">{selectedVendor.name}</Typography>
                                <Typography variant="body2">
                                    <a href={selectedVendor.link} target="_blank" rel="noopener noreferrer">Click here to order</a>
                                </Typography>
                                <Typography variant="body2">
                                    {`Open from ${formatDateTime(new Date(selectedVendor.start_date))} to ${formatDateTime(new Date(selectedVendor.end_date))}`}
                                </Typography>
                            </Box>
                        </InfoWindowF>
                    )}
                </GoogleMap>
            </LoadScript>
            <form className="vendor-form" onSubmit={handleSubmit} style={{ marginTop: 20 }}>
                <Typography variant="h5" gutterBottom>
                    Create New Vendor
                </Typography>
                <Box className="form-group" sx={{ marginBottom: 2 }}>
                    <TextField
                        label="Vendor Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        required
                    />
                </Box>
                <Box className="form-group" sx={{ marginBottom: 2 }}>
                    <TextField
                        label="Order Link"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        fullWidth
                    />
                </Box>
                <Box className="form-group" sx={{ marginBottom: 2 }}>
                    <TextField
                        label="Address"
                        value={address}
                        onChange={handleAddressChange}
                        fullWidth
                    />
                    <Button variant="contained" onClick={handleGeocode} sx={{ marginTop: 2 }}>
                        Find Location
                    </Button>
                </Box>
                <Box className="form-group" sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                            label="Start Date and Time"
                            value={startDateTime}
                            onChange={(newValue) => setStartDateTime(newValue)}
                            renderInput={(props) => <TextField {...props} sx={{ flex: 1, marginRight: 1 }} />}
                        />
                        <DateTimePicker
                            label="End Date and Time"
                            value={endDateTime}
                            onChange={(newValue) => setEndDateTime(newValue)}
                            renderInput={(props) => <TextField {...props} sx={{ flex: 1, marginLeft: 1 }} />}
                        />
                    </LocalizationProvider>
                </Box>
                <Box className="form-group" sx={{ marginBottom: 2 }}>
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Create Vendor
                    </Button>
                </Box>
            </form>
        </Box>
    );
}

export default VendorForm;
