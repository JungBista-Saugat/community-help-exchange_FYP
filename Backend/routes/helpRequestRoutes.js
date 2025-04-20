const express = require('express');
const router = express.Router();
const helpRequestController = require('../controllers/helpRequestController');
const authMiddleware = require('../middleware/authMiddleware');

// Create a new help request
router.post('/', authMiddleware, helpRequestController.createHelpRequest);

// Get all help requests
router.get('/', authMiddleware, helpRequestController.getHelpRequests);

// Get nearby help requests
router.get('/nearby', authMiddleware, helpRequestController.getNearbyRequests);

// Get a single help request by ID
router.get('/:id', authMiddleware, helpRequestController.getHelpRequestById);

// Update a help request by ID
router.put('/:id', authMiddleware, helpRequestController.updateHelpRequest);

// Delete a help request by ID
router.delete('/:id', authMiddleware, helpRequestController.deleteHelpRequest);

// Update request status
router.patch('/:id/status', authMiddleware, helpRequestController.updateRequestStatus);

// Offer help for a help request
router.post('/:id/offer-help', authMiddleware, helpRequestController.offerHelp);

module.exports = router;