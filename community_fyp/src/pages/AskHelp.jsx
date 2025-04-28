import React, { useState } from 'react';
import axios from 'axios';
import '../styles/common.css';
import Layout from '../components/Layout';

const AskHelp = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    emergencyLevel: 'medium',
    pointsDeducted: 1,
    location: null, // Add location field
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get user's location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const token = sessionStorage.getItem('token') || localStorage.getItem('token');
          const requestData = {
            ...formData,
            location: {
              type: 'Point',
              coordinates: [position.coords.longitude, position.coords.latitude],
            },
          };

          // Submit the help request
          const response = await axios.post('http://localhost:5000/api/help-requests', requestData, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.status === 201) {
            alert('Help request submitted successfully!');
            setFormData({
              title: '',
              description: '',
              category: '',
              emergencyLevel: 'medium',
              pointsDeducted: 1,
              location: null,
            });
          }
        },
        (err) => {
          alert('Location access is required to submit a help request.');
        }
      );
    } catch (error) {
      console.error('Error submitting help request:', error);
      alert(error.response?.data?.message || 'Failed to submit help request');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="form-wrapper compact-form">
          <h1 className="page-title">Ask for Help</h1>
          <div className="form-card">
            <form onSubmit={handleSubmit} className="help-form">
              <div className="form-group">
                <label className="form-label" htmlFor="title">What do you need help with?</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter a clear title for your request"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-input form-textarea"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Provide specific details about what you need help with..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group half-width">
                  <label className="form-label" htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    className="form-input form-select"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Academic">Academic</option>
                    <option value="Technical">Technical</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div className="form-group half-width">
                  <label className="form-label">Urgency</label>
                  <div className="urgency-options">
                    {['Low', 'Medium', 'High'].map((level) => (
                      <label key={level} className="urgency-option">
                        <input
                          type="radio"
                          name="emergencyLevel"
                          value={level.toLowerCase()}
                          checked={formData.emergencyLevel === level.toLowerCase()}
                          onChange={handleChange}
                        />
                        <span className={`urgency-label urgency-${level.toLowerCase()}`}>{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>


              <button type="submit" className="btn btn-primary submit-btn">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AskHelp;