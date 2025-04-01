import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/common.css';
import Layout from '../components/Layout';

const OfferHelp = () => {
  const [helpRequests, setHelpRequests] = useState([]);

  useEffect(() => {
    const fetchHelpRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/help-requests', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setHelpRequests(response.data);
      } catch (error) {
        console.error('Error fetching help requests:', error);
        alert(error.response?.data?.message || 'Failed to fetch help requests');
      }
    };

    fetchHelpRequests();
  }, []);

  const handleOfferHelp = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:5000/api/help-requests/${requestId}/offer-help`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update the local state to reflect the offered help
      setHelpRequests(helpRequests.map(request => {
        if (request._id === requestId) {
          return response.data;
        }
        return request;
      }));

      alert('Help offered successfully!');
    } catch (error) {
      console.error('Error offering help:', error);
      alert(error.response?.data?.message || 'Failed to offer help');
    }
  };

  return (
    <Layout>
      <div className="page-container bg-gradient">
        <div className="content-wrapper">
          <h1 className="page-title">Offer Help</h1>
          <div className="help-grid">
            {helpRequests.map((request) => (
              <div className="help-card" key={request._id}>
                <div className="help-card-header">
                  <h2 className="help-card-title">{request.title}</h2>
                  <div className="tag-container">
                    <span className={`tag tag-${request.category.toLowerCase()}`}>
                      {request.category}
                    </span>
                    <span className={`tag tag-${request.emergencyLevel}`}>
                      {request.emergencyLevel.charAt(0).toUpperCase() + request.emergencyLevel.slice(1)}
                    </span>
                  </div>
                </div>
                <p className="help-card-description">{request.description}</p>
                <p className="help-card-user">
                  Posted by: {request.requestedBy ? request.requestedBy.name : 'Unknown'}
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