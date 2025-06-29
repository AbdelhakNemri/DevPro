const { CommunityInvitation, User, Community } = require('../database/index');

// Send invitation to a user
exports.sendInvitation = async (req, res) => {
  try {
    const { invited_user_id, community_id } = req.body;
    const invited_by = req.body.invited_by || 1; // For now, hardcoded. Later use auth middleware

    // Check if invitation already exists
    const existingInvitation = await CommunityInvitation.findOne({
      where: {
        invited_user_id,
        community_id,
        status: 'pending'
      }
    });

    if (existingInvitation) {
      return res.status(400).json({ error: 'Invitation already sent to this user for this community' });
    }

    // Check if user is already a member
    const isMember = await require('../database/index').CommunityMemberModel.findOne({
      where: {
        UserId: invited_user_id,
        CommunityId: community_id
      }
    });

    if (isMember) {
      return res.status(400).json({ error: 'User is already a member of this community' });
    }

    const invitation = await CommunityInvitation.create({
      invited_by,
      invited_user_id,
      community_id,
      status: 'pending'
    });

    res.status(201).json(invitation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Accept invitation
exports.acceptInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const invitation = await CommunityInvitation.findByPk(id);

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation is no longer pending' });
    }

    // Update invitation status
    await invitation.update({ status: 'accepted' });

    // Add user to community members
    await require('../database/index').CommunityMemberModel.create({
      UserId: invitation.invited_user_id,
      CommunityId: invitation.community_id
    });

    res.status(200).json({ message: 'Invitation accepted successfully', invitation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Decline invitation
exports.declineInvitation = async (req, res) => {
  try {
    const { id } = req.params;
    const invitation = await CommunityInvitation.findByPk(id);

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation is no longer pending' });
    }

    await invitation.update({ status: 'declined' });
    res.status(200).json({ message: 'Invitation declined successfully', invitation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all invitations for a user
exports.getUserInvitations = async (req, res) => {
  try {
    const { user_id } = req.params;
    const invitations = await CommunityInvitation.findAll({
      where: {
        invited_user_id: user_id,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'inviter',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Community,
          as: 'community',
          attributes: ['id', 'name', 'description', 'category']
        }
      ]
    });

    res.status(200).json(invitations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all invitations sent by a user
exports.getSentInvitations = async (req, res) => {
  try {
    const { user_id } = req.params;
    const invitations = await CommunityInvitation.findAll({
      where: {
        invited_by: user_id
      },
      include: [
        {
          model: User,
          as: 'invitee',
          attributes: ['id', 'username', 'email']
        },
        {
          model: Community,
          as: 'community',
          attributes: ['id', 'name', 'description', 'category']
        }
      ]
    });

    res.status(200).json(invitations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all invitations for a community
exports.getCommunityInvitations = async (req, res) => {
  try {
    const { community_id } = req.params;
    const invitations = await CommunityInvitation.findAll({
      where: {
        community_id,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'inviter',
          attributes: ['id', 'username', 'email']
        },
        {
          model: User,
          as: 'invitee',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    res.status(200).json(invitations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 