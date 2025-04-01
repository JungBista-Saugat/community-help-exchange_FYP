import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar'; 
import '../../styles/admin.css';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    requiredSkills: '',
    pointsAwarded: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  // Handle changes in the form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Create a new volunteer post
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      const token = localStorage.getItem('token');
      const requiredSkills = formData.requiredSkills
        ? formData.requiredSkills.split(',').map(skill => skill.trim())
        : [];

      const response = await axios.post(
        'http://localhost:5000/api/admin/volunteer-posts',
        { ...formData, requiredSkills },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Navigate to the volunteer opportunities page after successful creation
      navigate('/admin/volunteer-opportunities');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create volunteer post');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="page-container">
        <h2>Create Volunteer Opportunity</h2>
        {formError && <p className="error-message">{formError}</p>}
        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              required 
              rows="4" 
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input 
              type="text" 
              name="location" 
              value={formData.location} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              name="date" 
              value={formData.date} 
              onChange={handleInputChange} 
              required 
            />
          </div>
          <div className="form-group">
            <label>Required Skills (comma-separated)</label>
            <input 
              type="text" 
              name="requiredSkills" 
              value={formData.requiredSkills} 
              onChange={handleInputChange} 
              placeholder="e.g. Cooking, Driving, Teaching" 
            />
          </div>
          <div className="form-group">
            <label>Points Awarded</label>
            <input 
              type="number" 
              name="pointsAwarded" 
              value={formData.pointsAwarded} 
              onChange={handleInputChange} 
              required 
              min="1" 
              max="10" 
            />
          </div>
          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Opportunity'}
          </button>
        </form>
      </div>
    </>
  );
};

export default CreatePost;