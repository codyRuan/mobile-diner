import React, { useState, useEffect } from 'react';
import { useMediaQuery, Box, Button, TextField, Typography, Grid } from '@mui/material';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { geocode, RequestType } from 'react-geocode';

const containerStyle = {
    width: '100%',
    height: '400px'
};

const initialCenter = {
    lat: 24.896,
    lng: 121.327
};

const EditLocationPage = () => {
    const isMobile = useMediaQuery('(max-width:600px)');
    const schedule = JSON.parse(localStorage.getItem('editingSchedule'));
    const [latitude, setLatitude] = useState(schedule?.latitude || initialCenter.lat);
    const [longitude, setLongitude] = useState(schedule?.longitude || initialCenter.lng);
    const [mapCenter, setMapCenter] = useState({ lat: latitude, lng: longitude });
    const [address, setAddress] = useState('');
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [selectedAddress, setSelectedAddress] = useState('');

    useEffect(() => {
        if (latitude && longitude) {
            getAddressFromLatLng(latitude, longitude).then(setAddress);
        }
    }, [latitude, longitude]);

    const getAddressFromLatLng = async (lat, lng) => {
        try {
            const response = await geocode(RequestType.LATLNG, `${lat},${lng}`);
            return response.results[0].formatted_address;
        } catch (error) {
            console.error('Error fetching address:', error);
            return 'Address not found';
        }
    };

    const handleMapClick = async (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setLatitude(lat);
        setLongitude(lng);
        setSelectedPosition({ lat, lng });
        const address = await getAddressFromLatLng(lat, lng);
        setSelectedAddress(address);
    };

    const handleAddressChange = (e) => {
        setAddress(e.target.value);
    };

    const handleFindLocation = async () => {
        try {
            const response = await geocode(RequestType.ADDRESS, address);
            const { lat, lng } = response.results[0].geometry.location;
            setLatitude(lat);
            setLongitude(lng);
            setMapCenter({ lat, lng });
            setSelectedPosition({ lat, lng });
            setSelectedAddress(address);
        } catch (error) {
            console.error('Error fetching coordinates:', error);
        }
    };

    const handleSave = () => {
        localStorage.setItem('updatedLocation', JSON.stringify({
            latitude,
            longitude,
            address
        }));
        window.close();
    };

    const handleCancel = () => {
        window.close();
    };

    return (
        <Box sx={{ padding: isMobile ? 2 : 3 }}>
            <Typography variant="h6" gutterBottom>Edit Schedule Location</Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={10}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Address"
                        value={address}
                        onChange={handleAddressChange}
                    />
                </Grid>
                <Grid item xs={12} sm={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleFindLocation}
                        sx={{ mt: isMobile ? 1 : 2 }}
                    >
                        Find Location
                    </Button>
                </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
                <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                    <GoogleMap
                        mapContainerStyle={containerStyle}
                        center={mapCenter}
                        zoom={15}
                        onClick={handleMapClick}
                    >
                        {selectedPosition && (
                            <Marker
                                position={selectedPosition}
                                icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                            />
                        )}
                    </GoogleMap>
                </LoadScript>
            </Box>
            <Box sx={{ mt: isMobile ? 2 : 3 }}>
                <Typography variant="body1" mb={1}>
                    {selectedAddress ? `Selected Address: ${selectedAddress}` : ''}
                </Typography>
                <Box display="flex" justifyContent="flex-end" width="100%">
                    <Button variant="contained" color="primary" onClick={handleSave} sx={{ mr: 1 }}>
                        Save
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default EditLocationPage;
