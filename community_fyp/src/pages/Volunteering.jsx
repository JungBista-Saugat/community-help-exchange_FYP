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
        console.log('Token:', token); // Debug the token
        if (!token) {
          throw new Error('No token found. Please log in.');
        }

        const response = await axios.get('http://localhost:5000/api/admin/volunteer-posts', {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure the token is sent in the correct format
          },
        });
        console.log('Volunteer Opportunities:', response.data); // Debug the response
        setOpportunities(response.data);
      } catch (err) {
        setError('Failed to load volunteer opportunities');
        console.error('Error fetching volunteer opportunities:', err);
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

      await axios.post(
        `http://localhost:5000/api/admin/volunteer-posts/${opportunityId}/apply`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOpportunities((prevOpportunities) =>
        prevOpportunities.map((opp) =>
          opp._id === opportunityId ? { ...opp, hasApplied: true } : opp
        )
      );

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
          {opportunities.length > 0 ? (
            opportunities.map((opportunity) => (
              <div className="help-card" key={opportunity._id}>
                <div className="help-card-header">
                  <h3 className="help-card-title">{opportunity.title}</h3>
                  <p className="help-card-description">{opportunity.description}</p>
                  <p>
                    <strong>Location:</strong> {opportunity.location}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date(opportunity.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Points Awarded:</strong> {opportunity.pointsAwarded}
                  </p>
                  <div className="tag-container">
                    {opportunity.requiredSkills.map((skill, index) => (
                      <span className="tag" key={index}>
                        {skill}
                      </span>
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
            ))
          ) : (
            <p>No volunteer opportunities available at the moment.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Volunteering;