const express = require('express');
const router = express.Router();
const { createHelpRequest, getHelpRequests, getHelpRequestById, updateHelpRequest, deleteHelpRequest, updateRequestStatus } = require('../controllers/helpRequestController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, createHelpRequest);
router.get('/', authMiddleware, getHelpRequests);
router.get('/:id', authMiddleware, getHelpRequestById);
router.put('/:id', authMiddleware, updateHelpRequest);
router.delete('/:id', authMiddleware, deleteHelpRequest);
router.put('/:id/status', authMiddleware, updateRequestStatus);

module.exports = router;