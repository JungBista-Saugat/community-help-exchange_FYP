import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/common.css';
import Layout from '../components/Layout';

const Volunteering = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/help-requests', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOpportunities(response.data);
      } catch (err) {
        setError('Failed to load volunteer opportunities');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const handleApply = async (opportunityId) => {
    try {
      setApplyingId(opportunityId);
      const token = localStorage.getItem('token');
      
      await axios.post(`http://localhost:5000/api/help-requests/${opportunityId}/apply`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the local state to reflect the application
      setOpportunities(opportunities.map(opp => {
        if (opp._id === opportunityId) {
          return {
            ...opp,
            hasApplied: true
          };
        }
        return opp;
      }));

      setApplyingId(null);
    } catch (err) {
      setError('Failed to apply for this opportunity');
      console.error(err);
      setApplyingId(null);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <Layout>
      <div className="page-container">
        <h1 className="page-title">Volunteer Opportunities</h1>
        <div className="help-grid">
          {opportunities.map((opportunity) => (
            <div className="help-card" key={opportunity._id}>
              <div className="help-card-header">
                <h3 className="help-card-title">{opportunity.title}</h3>
                <p className="help-card-description">{opportunity.description}</p>
                <p><strong>Location:</strong> {opportunity.location}</p>
                <p><strong>Duration:</strong> {opportunity.duration}</p>
                <p><strong>Time Commitment:</strong> {opportunity.commitment}</p>
                <div className="tag-container">
                  {opportunity.tags.map((tag, index) => (
                    <span className="tag" key={index}>{tag}</span>
                  ))}
                </div>
                <button 
                  className="btn btn-primary help-card-button" 
                  onClick={() => handleApply(opportunity._id)}
                  disabled={applyingId === opportunity._id}
                >
                  {applyingId === opportunity._id ? 'Applying...' : 'Apply Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Volunteering;