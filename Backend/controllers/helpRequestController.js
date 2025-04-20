const HelpRequest = require('../models/helpRequestModel');
const User = require('../models/userModel');

// Create new help request
const createHelpRequest = async (req, res) => {
  try {
    const { title, description, category, emergencyLevel, pointsDeducted, location } = req.body;

    // Validate user points
    const user = await User.findById(req.user.id);
    if (user.points < pointsDeducted) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Create the help request
    const newRequest = new HelpRequest({
      title,
      description,
      category,
      emergencyLevel,
      pointsDeducted,
      location,
      requestedBy: req.user.id,
    });

    await newRequest.save();

    // Deduct points from the user
    user.points -= pointsDeducted;
    await user.save();

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating help request:', error);
    res.status(500).json({ message: 'Server error' });
  }
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
    const helpRequest = await HelpRequest.findById(req.params.id);

    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' });
    }

    helpRequest.assignedTo = req.user.id;
    helpRequest.status = 'assigned';
    await helpRequest.save();

    res.json(helpRequest);
  } catch (err) {
    console.error('Error offering help:', err);
    res.status(500).json({ message: err.message || 'Server error occurred' });
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