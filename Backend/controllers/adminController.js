const VolunteerPost = require('../models/VolunteerPost');
const User = require('../models/userModel');
const Application = require('../models/applicationModel'); // Correct import path

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
    const post = await VolunteerPost.findById(req.params.postId);
    const application = post.applicants.id(req.params.applicationId);
    
    application.status = 'approved';
    await post.save();

    // Award points to user
    const user = await User.findById(application.user);
    user.points += post.pointsAwarded;
    await user.save();

    res.json({ message: 'Application approved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getApplications = async (req, res) => {
  try {
    const applications = await Application.find().populate('user', 'name email');
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
};

module.exports = { createVolunteerPost, approveApplication, getVolunteerPosts, getApplications };