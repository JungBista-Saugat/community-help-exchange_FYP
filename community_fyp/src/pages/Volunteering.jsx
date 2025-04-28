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
        if (!token) {
          throw new Error('No token found. Please log in.');
        }

        const response = await axios.get('http://localhost:5000/api/admin/public/volunteer-posts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Volunteer Opportunities:', response.data);
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
      if (!token) {
        throw new Error('Please log in to apply');
      }

      await axios.post(
        `http://localhost:5000/api/admin/volunteer-posts/${opportunityId}/apply`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the UI to show that the user has applied
      setOpportunities((prevOpportunities) =>
        prevOpportunities.map((opp) =>
          opp._id === opportunityId ? { ...opp, hasApplied: true, applicationStatus: 'pending' } : opp
        )
      );

      // Show success message
      alert('Application submitted successfully! The admin will review your application.');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to apply for this opportunity';
      alert(errorMessage);
      console.error('Error applying:', err);
    } finally {
      setApplyingId(null);
    }
  };

  // Helper to format date strings
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge style based on application status
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'status-badge approved';
      case 'rejected':
        return 'status-badge rejected';
      default:
        return 'status-badge pending';
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
                    <strong>Date:</strong> {formatDate(opportunity.date)}
                  </p>
                  <p>
                    <strong>Points Awarded:</strong> {opportunity.pointsAwarded}
                  </p>
                  <div className="tag-container">
                    {opportunity.requiredSkills && opportunity.requiredSkills.map((skill, index) => (
                      <span className="tag" key={index}>
                        {skill}
                      </span>
                    ))}
                  </div>
                  {opportunity.hasApplied ? (
                    <div className="application-status">
                      <p>
                        <span className={getStatusBadgeClass(opportunity.applicationStatus)}>
                          Application Status: {opportunity.applicationStatus.charAt(0).toUpperCase() + opportunity.applicationStatus.slice(1)}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <button
                      className="btn btn-primary help-card-button"
                      onClick={() => handleApply(opportunity._id)}
                      disabled={applyingId === opportunity._id}
                    >
                      {applyingId === opportunity._id ? 'Applying...' : 'Apply Now'}
                    </button>
                  )}
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