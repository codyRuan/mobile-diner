// GeocodeExample.js
import React, { useState } from 'react';
import {
  setKey,
  setLanguage,
  setRegion,
  fromAddress,
  geocode,
  RequestType,
} from "react-geocode";

// Set the Google Maps Geocoding API key
console.log(process.env.REACT_APP_GOOGLE_MAPS_API_KEY)
setKey(process.env.REACT_APP_GOOGLE_MAPS_API_KEY); // Replace with your actual API key

// Set default language and region
setLanguage('zh-TW'); // Set language to Chinese (Taiwan)
setRegion('tw'); // Set region to Taiwan

function GeocodeExample() {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });

  const handleGeocode = () => {
    fromAddress(address)
      .then(({ results }) => {
        const { lat, lng } = results[0].geometry.location;
        setCoordinates({ lat, lng });
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('找不到該地址的位置，請嘗試其他地址。');
      });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>地理编码示例</h1>
      <div>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="输入地址"
          style={{ width: '300px', padding: '10px' }}
        />
        <button onClick={handleGeocode} style={{ marginLeft: '10px', padding: '10px' }}>
          查找经纬度
        </button>
      </div>
      {coordinates.lat && coordinates.lng && (
        <div style={{ marginTop: '20px' }}>
          <h3>坐标：</h3>
          <p>纬度: {coordinates.lat}</p>
          <p>经度: {coordinates.lng}</p>
        </div>
      )}
    </div>
  );
}

export default GeocodeExample;
