import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/common.css';
import '../styles/volunteering.css';
import Layout from '../components/Layout';
import { FaMapMarkerAlt, FaCalendarAlt, FaCoins, FaCheckCircle } from 'react-icons/fa';

const Volunteering = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
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
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
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
        <div className="volunteer-grid">
          {opportunities.length > 0 ? (
            opportunities.map((opportunity) => (
              <div className="volunteer-card" key={opportunity._id}>
                <div className="volunteer-card-content">
                  <h3 className="volunteer-title">{opportunity.title}</h3>
                  <p className="volunteer-description">{opportunity.description}</p>
                  
                  <div className="volunteer-details">
                    <div className="detail-item">
                      <FaMapMarkerAlt className="detail-icon" />
                      <span>{opportunity.location}</span>
                    </div>
                    <div className="detail-item">
                      <FaCalendarAlt className="detail-icon" />
                      <span>{formatDate(opportunity.date)}</span>
                    </div>
                    <div className="detail-item">
                      <FaCoins className="detail-icon" />
                      <span>{opportunity.pointsAwarded} points</span>
                    </div>
                  </div>
                  
                  {opportunity.requiredSkills && opportunity.requiredSkills.length > 0 && (
                    <div className="skills-container">
                      {opportunity.requiredSkills.map((skill, index) => (
                        <span className="skill-tag" key={index}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="volunteer-card-footer">
                  {opportunity.hasApplied ? (
                    <div className="application-status-container">
                      <FaCheckCircle className={`status-icon ${opportunity.applicationStatus}`} />
                      <span className={getStatusBadgeClass(opportunity.applicationStatus)}>
                        {opportunity.applicationStatus.charAt(0).toUpperCase() + opportunity.applicationStatus.slice(1)}
                      </span>
                    </div>
                  ) : (
                    <button
                      className="apply-button"
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