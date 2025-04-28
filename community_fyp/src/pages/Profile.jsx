import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/common.css';
import Layout from '../components/Layout';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="form-card">
          <div className="help-card-header">
            <h1 className="page-title">{profile.name}</h1>
            <p>{profile.email}</p>
            <p>Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="content-wrapper">
            <div className="help-grid">
              <div className="help-card">
                <h3 className="help-card-title">{profile.points}</h3>
                <p className="help-card-description">Points Earned</p>
              </div>
              <div className="help-card">
                <h3 className="help-card-title">{profile.skills.length}</h3>
                <p className="help-card-description">Skills</p>
              </div>
              <div className="help-card">
                <h3 className="help-card-title">{profile.interests.length}</h3>
                <p className="help-card-description">Interests</p>
              </div>
            </div>

            <div className="form-group">
              <h2 className="page-title">Skills</h2>
              <div className="tag-container">
                {profile.skills.map((skill, index) => (
                  <span className="tag" key={index}>{skill}</span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <h2 className="page-title">Interests</h2>
              <div className="tag-container">
                {profile.interests.map((interest, index) => (
                  <span className="tag" key={index}>{interest}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;