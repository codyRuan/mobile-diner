import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindowF } from '@react-google-maps/api';
import Autosuggest from 'react-autosuggest';
import { Box, Typography, TextField } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import './Map.css';

const containerStyle = {
    width: '100%',
    height: 'calc(100vh - 100px)', // Subtract space for controls
};

const initialCenter = {
    lat: 25.0330, // Taipei coordinates
    lng: 121.5654,
};

function adjustToLocalTime(date) {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
}

const Map = () => {
    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [mapCenter, setMapCenter] = useState(initialCenter);
    const [selectedDate, setSelectedDate] = useState(adjustToLocalTime(new Date()));

    useEffect(() => {
        fetchVendors(selectedDate);
    }, [selectedDate]);

    const handleDateChange = (newValue) => {
        if (newValue) {
            setSelectedDate(adjustToLocalTime(newValue));
        } else {
            setSelectedDate(null);
        }
    };

    const fetchVendors = (date) => {
        const dateString = date.toISOString().split('T')[0];
        fetch(`${process.env.REACT_APP_BACKEND_URI}/api/get_vendors?date=${dateString}`)
            .then(response => response.json())
            .then(data => setVendors(data))
            .catch(error => console.error('Error fetching vendors:', error));
    };

    const onSuggestionsFetchRequested = ({ value }) => {
        setSuggestions(getSuggestions(value));
    };

    const onSuggestionsClearRequested = () => {
        setSuggestions([]);
    };

    const getSuggestions = (value) => {
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;

        return inputLength === 0 ? [] : vendors.filter(vendor =>
            vendor.name.toLowerCase().includes(inputValue)
        );
    };

    const getSuggestionValue = (suggestion) => suggestion.name;

    const renderSuggestion = (suggestion) => (
        <div className="suggestion-item">
            {suggestion.name}
        </div>
    );

    const onSuggestionSelected = (event, { suggestion }) => {
        setSelectedVendor(suggestion);
        setSearchTerm(suggestion.name);
        setMapCenter({ lat: suggestion.latitude, lng: suggestion.longitude }); // Center map on selected marker
    };

    const handleMarkerClick = (vendor) => {
        setSelectedVendor(vendor);
        setMapCenter({ lat: vendor.latitude, lng: vendor.longitude }); // Center map on selected marker
    };

    const handleInfoWindowCloseClick = () => {
        setSelectedVendor(null);
    };

    const formatDateTime = (date, time) => {
        const dateTime = new Date(`${date}T${time}`);
        return dateTime.toLocaleString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // Set to true if you want 12-hour format with AM/PM
        });
    };

    return (
        <Box className="map-container">
            <Box className="controls-container">
                <Box className="search-bar-container">
                    <Autosuggest
                        suggestions={suggestions}
                        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                        onSuggestionsClearRequested={onSuggestionsClearRequested}
                        getSuggestionValue={getSuggestionValue}
                        renderSuggestion={renderSuggestion}
                        inputProps={{
                            placeholder: 'Search vendors...',
                            value: searchTerm,
                            onChange: (e, { newValue }) => setSearchTerm(newValue),
                            className: 'autosuggest__input',
                        }}
                        onSuggestionSelected={onSuggestionSelected}
                        theme={{
                            container: 'autosuggest__container',
                            suggestionsContainer: 'autosuggest__suggestions-container',
                            suggestionsList: 'autosuggest__suggestions-list',
                            suggestion: 'autosuggest__suggestion',
                            suggestionHighlighted: 'autosuggest__suggestion--highlighted',
                        }}
                    />
                </Box>
                <Box className="date-picker-container">
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Select Date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            renderInput={(props) => <TextField {...props} />}
                            className="date-picker"
                        />
                    </LocalizationProvider>
                </Box>
            </Box>
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={mapCenter}
                    zoom={selectedVendor ? 15 : 12}
                >
                    {vendors.map((vendor) => (
                        <Marker
                            key={vendor.id}
                            position={{ lat: vendor.latitude, lng: vendor.longitude }}
                            onClick={() => handleMarkerClick(vendor)}
                            title={vendor.name}
                        />
                    ))}

                    {selectedVendor && (
                        <InfoWindowF
                            position={{ lat: selectedVendor.latitude, lng: selectedVendor.longitude }}
                            onCloseClick={handleInfoWindowCloseClick}
                        >
                            <div>
                                <Typography variant="h6">{selectedVendor.name}</Typography>
                                <Typography variant="body2">
                                    <a href={selectedVendor.link} target="_blank" rel="noopener noreferrer">Click here to order</a>
                                </Typography>
                                <Typography variant="body2">
                                    {`Open from ${formatDateTime(selectedVendor.start_date, selectedVendor.start_time)} to ${formatDateTime(selectedVendor.end_date, selectedVendor.end_time)}`}
                                </Typography>
                            </div>
                        </InfoWindowF>
                    )}
                </GoogleMap>
            </LoadScript>
        </Box>
    );
};

export default Map;
