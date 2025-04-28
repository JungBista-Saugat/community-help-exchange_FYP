const VolunteerPost = require('../models/VolunteerPost');
const User = require('../models/userModel');
const Application = require('../models/applicationModel'); // Correct import path
const { createNotification } = require('./notificationController');

const getVolunteerPosts = async (req, res) => {
  try {
    const posts = await VolunteerPost.find();
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching volunteer posts:', error);
    res.status(500).json({ message: 'Failed to fetch volunteer posts' });
  }
};

const createVolunteerPost = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const newPost = new VolunteerPost({
      ...req.body,
      creator: req.user._id
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const approveApplication = async (req, res) => {
  try {
    const { postId, applicationId } = req.params;
    
    // Find the volunteer post
    const post = await VolunteerPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Volunteer post not found' });
    }
    
    // Find the application in the applicants array
    const application = post.applicants.id(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Update application status
    application.status = 'approved';
    await post.save();

    // Find the user
    const user = await User.findById(application.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Award points to user
    user.points += post.pointsAwarded;
    await user.save();

    // Create notification
    const notificationMessage = `Your application for "${post.title}" has been approved! You've earned ${post.pointsAwarded} points.`;
    const notification = await createNotification(
      user._id, 
      notificationMessage, 
      'volunteer_approved',
      null,
      post._id
    );

    // Send real-time notification via socket if user is online
    const socketInstance = req.app.get('socketInstance');
    if (socketInstance && socketInstance.sendNotification) {
      socketInstance.sendNotification(user._id.toString(), notification);
    }

    res.json({ message: 'Application approved successfully' });
  } catch (error) {
    console.error('Error approving application:', error);
    res.status(500).json({ message: 'Failed to approve application', error: error.message });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const { postId, applicationId } = req.params;
    
    // Find the volunteer post
    const post = await VolunteerPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Volunteer post not found' });
    }
    
    // Find the application in the applicants array
    const application = post.applicants.id(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    // Update application status
    application.status = 'rejected';
    await post.save();

    // Find the user
    const user = await User.findById(application.user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create notification
    const notificationMessage = `Your application for "${post.title}" has been rejected. Please try other opportunities.`;
    const notification = await createNotification(
      user._id, 
      notificationMessage, 
      'volunteer_rejected',
      null,
      post._id
    );

    // Send real-time notification via socket if user is online
    const socketInstance = req.app.get('socketInstance');
    if (socketInstance && socketInstance.sendNotification) {
      socketInstance.sendNotification(user._id.toString(), notification);
    }

    res.json({ message: 'Application rejected successfully' });
  } catch (error) {
    console.error('Error rejecting application:', error);
    res.status(500).json({ message: 'Failed to reject application', error: error.message });
  }
};

const getApplications = async (req, res) => {
  try {
    // Find all volunteer posts that have at least one applicant
    const postsWithApplicants = await VolunteerPost.find({ 'applicants.0': { $exists: true } })
      .populate('applicants.user', 'name email points profilePicture')
      .populate('creator', 'name');
    
    // Format the data for frontend display
    const formattedApplications = [];
    
    postsWithApplicants.forEach(post => {
      post.applicants.forEach(applicant => {
        formattedApplications.push({
          applicationId: applicant._id,
          postId: post._id,
          postTitle: post.title,
          postDescription: post.description,
          location: post.location,
          date: post.date,
          pointsAwarded: post.pointsAwarded,
          status: applicant.status,
          appliedAt: applicant.appliedAt,
          user: applicant.user
        });
      });
    });

    res.json(formattedApplications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
};

const getPublicVolunteerPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all open volunteer posts
    const posts = await VolunteerPost.find({ status: 'open' })
      .populate('creator', 'name')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    // Map through the posts to add user-specific application info
    const postsWithApplicationStatus = posts.map(post => {
      // Convert to plain object
      const postObj = post.toObject();
      
      // Remove the full applicants array for security
      delete postObj.applicants;
      
      // Check if the current user has applied to this post
      const userApplication = post.applicants.find(
        applicant => applicant.user.toString() === userId.toString()
      );
      
      // Add application status information for the current user
      if (userApplication) {
        postObj.hasApplied = true;
        postObj.applicationStatus = userApplication.status;
      } else {
        postObj.hasApplied = false;
      }
      
      return postObj;
    });

    res.status(200).json(postsWithApplicationStatus);
  } catch (error) {
    console.error('Error fetching public volunteer posts:', error);
    res.status(500).json({ message: 'Failed to fetch volunteer posts', error: error.message });
  }
};

const applyForVolunteerPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    // Find the volunteer post
    const post = await VolunteerPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Volunteer post not found' });
    }

    // Check if the user has already applied
    const alreadyApplied = post.applicants.some(applicant => applicant.user.toString() === userId.toString());
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this post' });
    }

    // Add the user to the applicants list
    post.applicants.push({ user: userId, status: 'pending' });
    await post.save();

    res.status(200).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error applying for volunteer post:', error);
    res.status(500).json({ message: 'Failed to apply for volunteer post', error: error.message });
  }
};

module.exports = { createVolunteerPost, approveApplication, rejectApplication, getVolunteerPosts, getApplications, getPublicVolunteerPosts, applyForVolunteerPost };