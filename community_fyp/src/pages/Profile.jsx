import React, { useState } from 'react';
import '../styles/common.css';
import Layout from '../components/Layout';

const Profile = () => {
  const [profile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: 'January 2023',
    stats: {
      helpProvided: 15,
      helpReceived: 8,
      volunteerHours: 24,
      points: 150
    },
    badges: ['Helper Star', 'Quick Responder', 'Community Champion'],
    skills: ['Mathematics', 'Computer Science', 'Physics']
  });

  return (
    <Layout>
      <div className="page-container">
        <div className="form-card">
          <div className="help-card-header">
            <h1 className="page-title">{profile.name}</h1>
            <p>{profile.email}</p>
            <p>Member since {profile.joinDate}</p>
          </div>

          <div className="content-wrapper">
            <div className="help-grid">
              <div className="help-card">
                <h3 className="help-card-title">{profile.stats.helpProvided}</h3>
                <p className="help-card-description">Help Provided</p>
              </div>
              <div className="help-card">
                <h3 className="help-card-title">{profile.stats.helpReceived}</h3>
                <p className="help-card-description">Help Received</p>
              </div>
              <div className="help-card">
                <h3 className="help-card-title">{profile.stats.volunteerHours}</h3>
                <p className="help-card-description">Volunteer Hours</p>
              </div>
              <div className="help-card">
                <h3 className="help-card-title">{profile.stats.points}</h3>
                <p className="help-card-description">Points Earned</p>
              </div>
            </div>

            <div className="form-group">
              <h2 className="page-title">Badges</h2>
              <div className="tag-container">
                {profile.badges.map((badge, index) => (
                  <span className="tag" key={index}>{badge}</span>
                ))}
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;