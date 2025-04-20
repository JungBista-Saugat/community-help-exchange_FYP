import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/common.css';
import Layout from '../components/Layout';

const OfferHelp = () => {
  const [helpRequests, setHelpRequests] = useState([]); // All help requests
  const [nearbyRequests, setNearbyRequests] = useState([]); // Nearby help requests
  const [showNearby, setShowNearby] = useState(false); // Toggle for nearby requests

  // Fetch all help requests
  const fetchAllRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/help-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHelpRequests(response.data);
    } catch (error) {
      console.error('Error fetching all requests:', error);
      alert(error.response?.data?.message || 'Failed to fetch requests');
    }
  };

  // Fetch nearby help requests
  const fetchNearbyRequests = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `http://localhost:5000/api/help-requests/nearby?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setNearbyRequests(response.data);
          setShowNearby(true); // Show nearby requests
        } catch (error) {
          console.error('Error fetching nearby requests:', error);
          alert(error.response?.data?.message || 'Failed to fetch nearby requests');
        }
      },
      (err) => {
        alert('Location access is required to fetch nearby requests.');
      }
    );
  };

  // Handle offering help
  const handleOfferHelp = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/help-requests/${requestId}/offer-help`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the local state to reflect the completed help request
      setHelpRequests((prevRequests) =>
        prevRequests.map((request) =>
          request._id === requestId ? response.data.helpRequest : request
        )
      );

      alert(`Help request completed successfully! You earned ${response.data.pointsAwarded} points!`);
    } catch (error) {
      console.error('Error offering help:', error);
      alert(error.response?.data?.message || 'Failed to offer help');
    }
  };

  // Fetch all requests on component mount
  useEffect(() => {
    fetchAllRequests();
  }, []);

  return (
    <Layout>
      <div className="page-container bg-gradient">
        <div className="content-wrapper">
          <h1 className="page-title">Offer Help</h1>
          <button
            className="btn btn-secondary search-bar-button"
            onClick={fetchNearbyRequests}
          >
            Show Nearby Requests
          </button>
          <div className="help-grid">
            {(showNearby ? nearbyRequests : helpRequests)
              .filter(request => request.status === 'open')
              .map((request) => (
                <div className="help-card" key={request._id}>
                  <div className="help-card-header">
                    <h2 className="help-card-title">{request.title}</h2>
                    <div className="tag-container">
                      <span className={`tag tag-${request.category.toLowerCase()}`}>
                        {request.category}
                      </span>
                      <span className={`tag tag-${request.emergencyLevel}`}>
                        {request.emergencyLevel.charAt(0).toUpperCase() +
                          request.emergencyLevel.slice(1)}
                      </span>
                    </div>
                  </div>
                  <p className="help-card-description">{request.description}</p>
                  <p className="help-card-user">
                    Posted by: {request.requestedBy ? request.requestedBy.name : 'Unknown'}
                  </p>
                  <p className="help-card-points">
                    Points Reward: {request.pointsReward}
                  </p>
                  <button
                    className="btn btn-primary help-card-button"
                    onClick={() => handleOfferHelp(request._id)}
                  >
                    Offer Help
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OfferHelp;