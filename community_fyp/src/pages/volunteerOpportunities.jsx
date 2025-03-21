import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/dashboard.css';

const VolunteerOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingId, setApplyingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/volunteer-posts', {
          headers: { Authorization: `Bearer ${token}` }
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
  }, [navigate]);

  const handleApply = async (opportunityId) => {
    try {
      setApplyingId(opportunityId);
      const token = localStorage.getItem('token');
      
      await axios.post(`http://localhost:5000/api/volunteer-posts/${opportunityId}/apply`, {}, {
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Layout>
      <div className="page-container">
        <h1>Volunteer Opportunities</h1>
        {error && <p className="error-message">{error}</p>}
        
        {loading ? (
          <p>Loading opportunities...</p>
        ) : opportunities.length === 0 ? (
          <p>No volunteer opportunities available at the moment.</p>
        ) : (
          <div className="opportunities-grid">
            {opportunities.map((opportunity) => (
              <div key={opportunity._id} className="opportunity-card">
                <h3>{opportunity.title}</h3>
                <p className="opportunity-description">{opportunity.description}</p>
                <div className="opportunity-details">
                  <p><strong>Location:</strong> {opportunity.location}</p>
                  <p><strong>Date:</strong> {formatDate(opportunity.date)}</p>
                  <p><strong>Points:</strong> {opportunity.pointsAwarded}</p>
                  {opportunity.requiredSkills.length > 0 && (
                    <div>
                      <strong>Required Skills:</strong>
                      <ul className="skills-list">
                        {opportunity.requiredSkills.map((skill, index) => (
                          <li key={index}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="opportunity-actions">
                  {opportunity.hasApplied ? (
                    <button className="applied-button" disabled>Applied</button>
                  ) : opportunity.status === 'closed' ? (
                    <button className="closed-button" disabled>Closed</button>
                  ) : (
                    <button 
                      className="apply-button" 
                      onClick={() => handleApply(opportunity._id)}
                      disabled={applyingId === opportunity._id}
                    >
                      {applyingId === opportunity._id ? 'Applying...' : 'Apply'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VolunteerOpportunities;