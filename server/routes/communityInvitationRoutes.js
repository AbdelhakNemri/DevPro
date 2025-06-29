const express = require('express');
const router = express.Router();
const communityInvitationController = require('../controllers/communityInvitationController');

// Send invitation to a user
router.post('/send', communityInvitationController.sendInvitation);

// Accept invitation
router.put('/:id/accept', communityInvitationController.acceptInvitation);

// Decline invitation
router.put('/:id/decline', communityInvitationController.declineInvitation);

// Get all invitations for a user
router.get('/user/:user_id', communityInvitationController.getUserInvitations);

// Get all invitations sent by a user
router.get('/sent/:user_id', communityInvitationController.getSentInvitations);

// Get all invitations for a community
router.get('/community/:community_id', communityInvitationController.getCommunityInvitations);

module.exports = router; 