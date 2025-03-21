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
    // TODO: Implement help offer logic
    console.log('Offered help for request:', requestId);
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
                    <span className={`tag tag-${request.urgency}`}>
                      {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                    </span>
                  </div>
                </div>
                <p className="help-card-description">{request.description}</p>
                <p className="help-card-user">Posted by: {request.requestedBy.name}</p>
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