import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NearbyUsers = () => {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNearbyUsers = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
              `http://localhost:5000/api/users/nearby?latitude=${latitude}&longitude=${longitude}&maxDistance=5000`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setNearbyUsers(response.data);
          } catch (error) {
            console.error('Error fetching nearby users:', error);
            setError('Failed to fetch nearby users');
          }
        });
      } else {
        setError('Geolocation is not supported by this browser.');
      }
    };

    fetchNearbyUsers();
  }, []);

  return (
    <div>
      <h1>Nearby Users</h1>
      {error && <p>{error}</p>}
      <ul>
        {nearbyUsers.map((user) => (
          <li key={user._id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default NearbyUsers;