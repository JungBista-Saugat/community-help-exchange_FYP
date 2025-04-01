import React, { useState } from 'react';
import axios from 'axios';

const UpdateHelpRequest = ({ opportunity, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: opportunity.title,
    description: opportunity.description,
    category: opportunity.category,
    emergencyLevel: opportunity.emergencyLevel
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:5000/api/help-requests/${opportunity._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      onUpdate(response.data);
    } catch (error) {
      console.error('Error updating help request:', error);
      alert(error.response?.data?.message || 'Failed to update help request');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="Academic">Academic</option>
          <option value="Technical">Technical</option>
          <option value="General">General</option>
        </select>
      </div>
      <div>
        <label>Emergency Level</label>
        <select
          name="emergencyLevel"
          value={formData.emergencyLevel}
          onChange={handleChange}
          required
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <button type="submit">Update</button>
    </form>
  );
};

export default UpdateHelpRequest;