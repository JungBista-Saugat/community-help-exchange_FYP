import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar'; 
import UpdateHelpRequest from '../UpdateHelpRequest';
import '../../styles/admin.css';
import '../../styles/volunteering.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaCoins, FaPencilAlt, FaTrash, FaLayerGroup } from 'react-icons/fa';

const VolunteerOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const navigate = useNavigate();

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
        setOpportunities(response.data);
      } catch (err) {
        setError('Failed to load volunteer opportunities');
        console.error('Error fetching volunteer opportunities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, [navigate]);

  const handleUpdate = async (opportunityId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/help-requests/${opportunityId}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOpportunities(opportunities.map(opp => opp._id === opportunityId ? response.data : opp));
      setEditingOpportunity(null);
    } catch (err) {
      setError('Failed to update the opportunity');
      console.error(err);
    }
  };

  const handleDelete = async (opportunityId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/help-requests/${opportunityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpportunities(opportunities.filter(opp => opp._id !== opportunityId));
    } catch (err) {
      setError('Failed to delete the opportunity');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <AdminNavbar />
      <div className="page-container">
        <h1>Volunteer Opportunities</h1>
        {error && <p className="error-message">{error}</p>}
        
        {loading ? (
          <p>Loading opportunities...</p>
        ) : opportunities.length === 0 ? (
          <p>No volunteer opportunities available at the moment.</p>
        ) : (
          <div className="volunteer-grid">
            {opportunities.map((opportunity) => (
              <div key={opportunity._id} className="volunteer-card admin-volunteer-card">
                <div className="volunteer-card-content">
                  <h3 className="volunteer-title">{opportunity.title}</h3>
                  <p className="volunteer-description">{opportunity.description}</p>
                  
                  <div className="volunteer-details">
                    <div className="detail-item">
                      <FaMapMarkerAlt className="detail-icon" />
                      <span>{opportunity.location || 'No location specified'}</span>
                    </div>
                    {opportunity.date && (
                      <div className="detail-item">
                        <FaCalendarAlt className="detail-icon" />
                        <span>{formatDate(opportunity.date)}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <FaCoins className="detail-icon" />
                      <span>{opportunity.pointsAwarded || opportunity.pointsDeducted} points</span>
                    </div>
                    {opportunity.category && (
                      <div className="detail-item">
                        <FaLayerGroup className="detail-icon" />
                        <span>Category: {opportunity.category}</span>
                      </div>
                    )}
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
                
                <div className="volunteer-card-footer admin-card-footer">
                  <button 
                    className="admin-action-button edit"
                    onClick={() => setEditingOpportunity(opportunity)}
                  >
                    <FaPencilAlt className="button-icon" />
                    Edit
                  </button>
                  <button 
                    className="admin-action-button delete"
                    onClick={() => handleDelete(opportunity._id)}
                  >
                    <FaTrash className="button-icon" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {editingOpportunity && (
          <UpdateHelpRequest 
            opportunity={editingOpportunity} 
            onUpdate={(updatedOpportunity) => handleUpdate(editingOpportunity._id, updatedOpportunity)} 
          />
        )}
      </div>
    </>
  );
};

export default VolunteerOpportunities;
