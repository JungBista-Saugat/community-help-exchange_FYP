import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/dashboard.css';

const AdminDashboard = () => {
  const [posts, setPosts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    requiredSkills: '',
    pointsAwarded: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Fetch user data to check if admin
        const userResponse = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUserData(userResponse.data);

        // Redirect if not admin
        if (userResponse.data.role !== 'admin') {
          navigate('/dashboard');
          return;
        }

        // Fetch volunteer posts created by this admin
        const postsResponse = await axios.get('http://localhost:5000/api/admin/volunteer-posts', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setPosts(postsResponse.data);

        // Fetch pending applications
        const applicationsResponse = await axios.get('http://localhost:5000/api/admin/applications', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setApplications(applicationsResponse.data);
      } catch (err) {
        setError('Failed to load admin data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      const token = localStorage.getItem('token');
      
      // Convert comma-separated skills to array
      const requiredSkills = formData.requiredSkills
        ? formData.requiredSkills.split(',').map(skill => skill.trim())
        : [];

      const response = await axios.post(
        'http://localhost:5000/api/admin/volunteer-posts',
        {
          ...formData,
          requiredSkills
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Add new post to the list
      setPosts([response.data, ...posts]);

      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        requiredSkills: '',
        pointsAwarded: 5
      });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create volunteer post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveApplication = async (postId, applicationId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:5000/api/admin/volunteer-posts/${postId}/applications/${applicationId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update applications list
      setApplications(applications.filter(app => app._id !== applicationId));
    } catch (err) {
      setError('Failed to approve application');
      console.error(err);
    }
  };

  const handleRejectApplication = async (postId, applicationId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:5000/api/admin/volunteer-posts/${postId}/applications/${applicationId}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update applications list
      setApplications(applications.filter(app => app._id !== applicationId));
    } catch (err) {
      setError('Failed to reject application');
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Layout>
        <div className="page-container">
          <h1>Admin Dashboard</h1>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container admin-dashboard">
        <h1>Admin Dashboard</h1>
        {error && <p className="error-message">{error}</p>}

        <div className="admin-tabs">
          <button 
            className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Manage Posts
          </button>
          <button 
            className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications ({applications.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create New Post
          </button>
        </div>

        {activeTab === 'create' && (
          <div className="create-post-section">
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
              
              <button 
                type="submit" 
                className="submit-button" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Opportunity'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="posts-section">
            <h2>Your Volunteer Posts</h2>
            
            {posts.length === 0 ? (
              <p>You haven't created any volunteer posts yet.</p>
            ) : (
              <div className="posts-grid">
                {posts.map((post) => (
                  <div key={post._id} className="post-card">
                    <h3>{post.title}</h3>
                    <p className="post-description">{post.description}</p>
                    <div className="post-details">
                      <p><strong>Location:</strong> {post.location}</p>
                      <p><strong>Date:</strong> {formatDate(post.date)}</p>
                      <p><strong>Points:</strong> {post.pointsAwarded}</p>
                      <p><strong>Status:</strong> {post.status}</p>
                      <p><strong>Applications:</strong> {post.applicants?.length || 0}</p>
                    </div>
                    <div className="post-actions">
                      <button 
                        className={`status-button ${post.status === 'open' ? 'close-button' : 'open-button'}`}
                      >
                        {post.status === 'open' ? 'Close Post' : 'Reopen Post'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="applications-section">
            <h2>Pending Applications</h2>
            
            {applications.length === 0 ? (
              <p>No pending applications at the moment.</p>
            ) : (
              <div className="applications-list">
                {applications.map((app) => (
                  <div key={app._id} className="application-card">
                    <div className="application-info">
                      <h3>Application for: {app.post.title}</h3>
                      <p><strong>Applicant:</strong> {app.user.name}</p>
                      <p><strong>Email:</strong> {app.user.email}</p>
                      <p><strong>Applied on:</strong> {formatDate(app.appliedAt)}</p>
                      <p><strong>Skills:</strong> {app.user.skills?.join(', ') || 'None listed'}</p>
                    </div>
                    <div className="application-actions">
                      <button 
                        className="approve-button"
                        onClick={() => handleApproveApplication(app.post._id, app._id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="reject-button"
                        onClick={() => handleRejectApplication(app.post._id, app._id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;