const HelpRequest = require('../models/helpRequestModel');
const User = require('../models/user');

// Create new help request
const createHelpRequest = async (req, res) => {
  try {
    const { title, description, category, emergencyLevel, pointsDeducted } = req.body;
    
    const newRequest = new HelpRequest({
      title,
      description,
      category,
      emergencyLevel,
      pointsDeducted,
      requestedBy: req.user.id
    });

    await newRequest.save();
    
    // Deduct points from user
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { points: -pointsDeducted }
    });

    res.status(201).json(newRequest);
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

const getHelpRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find()
      .populate('requestedBy', 'name email')
      .populate('assignedTo', 'name');
    res.json(requests);
  } catch (err) {
    console.error('Error fetching help requests:', err);
    res.status(500).json({ message: err.message || 'Server error occurred' });
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

module.exports = { createHelpRequest, getHelpRequests, getHelpRequestById, updateHelpRequest, deleteHelpRequest, updateRequestStatus, offerHelp };