const HelpRequest = require('../models/helpRequestModel');
const User = require('../models/userModel');
const { createNotification } = require('./notificationController');

// Create new help request
const createHelpRequest = async (req, res) => {
  try {
    const { title, description, category, emergencyLevel, pointsDeducted, location } = req.body;

    // Validate user points
    const user = await User.findById(req.user.id);
    if (user.points < pointsDeducted) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Calculate points reward based on emergency level
    const pointsReward = calculatePointsReward(emergencyLevel, pointsDeducted);
    console.log('Calculated points reward:', pointsReward);

    // Create the help request
    const newRequest = new HelpRequest({
      title,
      description,
      category,
      emergencyLevel,
      pointsDeducted: Number(pointsDeducted),
      pointsReward: Number(pointsReward),
      location,
      requestedBy: req.user.id,
    });

    await newRequest.save();

    // Deduct points from the user
    user.points -= Number(pointsDeducted);
    await user.save();

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating help request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to calculate points reward
const calculatePointsReward = (emergencyLevel, pointsDeducted) => {
  const rewardMultipliers = {
    low: 1.2,    // 20% more points
    medium: 1.5, // 50% more points
    high: 2.0    // 100% more points
  };
  
  const multiplier = rewardMultipliers[emergencyLevel] || 1.0;
  const reward = Math.round(Number(pointsDeducted) * multiplier);
  console.log('Calculating points reward:', { pointsDeducted, emergencyLevel, multiplier, reward });
  return reward;
};

const getHelpRequests = async (req, res) => {
  try {
    const helpRequests = await HelpRequest.find().populate('requestedBy', 'name email');
    res.status(200).json(helpRequests);
  } catch (error) {
    console.error('Error fetching help requests:', error);
    res.status(500).json({ message: 'Failed to fetch help requests' });
  }
};

// Get single help request
const getHelpRequestById = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id)
      .populate('requestedBy', 'name email')
      .populate('assignedTo', 'name');
    
    if (!request) {
      return res.status(404).json({ message: 'Help request not found' });
    }
    res.json(request);
  } catch (err) {
    console.error('Error creating help request:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error',
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ 
      message: err.message || 'Server error occurred'
    });
  }
};

// Update help request
const updateHelpRequest = async (req, res) => {
  try {
    const { title, description, category, emergencyLevel } = req.body;
    
    const updatedRequest = await HelpRequest.findByIdAndUpdate(
      req.params.id,
      { title, description, category, emergencyLevel },
      { new: true }
    );

    res.json(updatedRequest);
  } catch (err) {
    console.error('Error creating help request:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error',
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ 
      message: err.message || 'Server error occurred'
    });
  }
};

// Delete help request
const deleteHelpRequest = async (req, res) => {
  try {
    await HelpRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Help request deleted successfully' });
  } catch (err) {
    console.error('Error creating help request:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error',
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ 
      message: err.message || 'Server error occurred'
    });
  }
};

// Update request status
const updateRequestStatus = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    
    const updateData = { status };
    if (assignedTo) updateData.assignedTo = assignedTo;
    
    const updatedRequest = await HelpRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    // Handle completion timestamp
    if (status === 'completed') {
      updatedRequest.completedAt = new Date();
      await updatedRequest.save();
    }

    res.json(updatedRequest);
  } catch (err) {
    console.error('Error creating help request:', err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error',
        errors: Object.values(err.errors).map(e => e.message) 
      });
    }
    
    res.status(500).json({ 
      message: err.message || 'Server error occurred'
    });
  }
};

const offerHelp = async (req, res) => {
  try {
    console.log('Offer help request received for ID:', req.params.id);
    console.log('User ID:', req.user.id);

    const helpRequest = await HelpRequest.findById(req.params.id)
      .populate('requestedBy', 'name'); // Populate the requestedBy field to get user name

    if (!helpRequest) {
      console.log('Help request not found');
      return res.status(404).json({ message: 'Help request not found' });
    }

    const helper = await User.findById(req.user.id);
    if (!helper) {
      console.log('Helper user not found');
      return res.status(404).json({ message: 'Helper user not found' });
    }

    if (helpRequest.status !== 'open') {
      console.log('Request status is not open:', helpRequest.status);
      return res.status(400).json({ message: 'This request is no longer available' });
    }

    // Award points to the helper based on emergency level
    const pointsToAward = helpRequest.pointsReward;
    console.log('Points to award:', pointsToAward);
    
    helper.points += pointsToAward;
    await helper.save();
    console.log('Helper points updated');

    // Update the help request
    helpRequest.assignedTo = req.user.id;
    helpRequest.status = 'completed';
    helpRequest.completedAt = new Date();
    await helpRequest.save();
    console.log('Help request updated');

    // Create notification for the request creator
    await createNotification(
      helpRequest.requestedBy._id, // Use _id since we populated requestedBy
      `${helper.name} has offered to help with your request: "${helpRequest.title}"`,
      'help_offer',
      helpRequest._id
    );

    console.log('Notification created for request creator');

    res.json({
      message: 'Help request completed successfully',
      pointsAwarded: pointsToAward,
      helpRequest
    });
  } catch (err) {
    console.error('Detailed error in offerHelp:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ 
      message: 'Server error occurred',
      error: err.message 
    });
  }
};

const getNearbyRequests = async (req, res) => {
  const { latitude, longitude } = req.query;

  try {
    const requests = await HelpRequest.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: 5000, // 5km radius
        },
      },
      status: 'open',
    });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching nearby requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createHelpRequest, getHelpRequests, getHelpRequestById, updateHelpRequest, deleteHelpRequest, updateRequestStatus, offerHelp, getNearbyRequests };