import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';

const ProfileCompletion = () => {
  const [skills, setSkills] = useState([]);
  const [interests, setInterests] = useState([]);
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserData(response.data);

        // Redirect to dashboard if profile is already completed
        if (response.data.completedProfile) {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interestToRemove) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/users/profile',
        {
          skills,
          interests,
          bio,
          profilePicture,
          completedProfile: true // Mark profile as completed
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.status === 200) {
        navigate('/dashboard'); // Redirect to dashboard after successful update
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!userData) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2>Loading profile...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box profile-completion">
        <h2>Complete Your Profile</h2>
        <p>Add your skills, interests, bio, and profile picture to complete your profile.</p>
        {error && <p className="error">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-section">
            <h3>Skills</h3>
            <div className="tag-input">
              <input
                type="text"
                placeholder="Add a skill (e.g., Cooking, Driving)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <button type="button" onClick={addSkill}>Add</button>
            </div>
            <div className="tags-container">
              {skills.map((skill, index) => (
                <div key={index} className="tag">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}>×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="input-section">
            <h3>Interests</h3>
            <div className="tag-input">
              <input
                type="text"
                placeholder="Add an interest (e.g., Education, Environment)"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
              />
              <button type="button" onClick={addInterest}>Add</button>
            </div>
            <div className="tags-container">
              {interests.map((interest, index) => (
                <div key={index} className="tag">
                  {interest}
                  <button type="button" onClick={() => removeInterest(interest)}>×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="input-section">
            <h3>Bio</h3>
            <textarea
              placeholder="Write a short bio about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="input-section">
            <h3>Profile Picture</h3>
            <input
              type="text"
              placeholder="Enter the URL of your profile picture"
              value={profilePicture}
              onChange={(e) => setProfilePicture(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletion;