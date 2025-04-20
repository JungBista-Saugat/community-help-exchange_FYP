import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar'; 
import UpdateHelpRequest from '../UpdateHelpRequest';
import '../../styles/admin.css';

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
          <div className="opportunities-grid">
            {opportunities.map((opportunity) => (
              <div key={opportunity._id} className="opportunity-card">
                <h3>{opportunity.title}</h3>
                <p className="opportunity-description">{opportunity.description}</p>
                <div className="opportunity-details">
                  <p><strong>Category:</strong> {opportunity.category}</p>
                  <p><strong>Emergency Level:</strong> {opportunity.emergencyLevel}</p>
                  <p><strong>Points Deducted:</strong> {opportunity.pointsDeducted}</p>
                  {opportunity.requiredSkills && opportunity.requiredSkills.length > 0 && (
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
                  <button 
                    className="update-button" 
                    onClick={() => setEditingOpportunity(opportunity)}
                  >
                    Update
                  </button>
                  <button 
                    className="delete-button" 
                    onClick={() => handleDelete(opportunity._id)}
                  >
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
