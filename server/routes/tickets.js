const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { 
  tickets, 
  comments, 
  users, 
  categories, 
  createTicket, 
  updateTicket, 
  createComment 
} = require('../data/database');
const { authenticateToken, requireAgent, requireOwnership } = require('../middleware/auth');

const router = express.Router();

// Get all tickets with filtering and pagination
router.get('/', authenticateToken, [
  query('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
  query('category').optional().isString(),
  query('priority').optional().isIn(['low', 'medium', 'high']),
  query('assignedTo').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'priority', 'status']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const {
      status,
      category,
      priority,
      assignedTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let filteredTickets = [...tickets];

    // Filter by user role
    if (req.user.role === 'user') {
      filteredTickets = filteredTickets.filter(ticket => ticket.userId === req.user.id);
    } else if (req.user.role === 'agent') {
      // Agents can see all tickets or just their assigned tickets
      if (assignedTo === 'me') {
        filteredTickets = filteredTickets.filter(ticket => ticket.assignedTo === req.user.id);
      }
    }

    // Apply filters
    if (status) {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === status);
    }
    if (category) {
      filteredTickets = filteredTickets.filter(ticket => ticket.categoryId === category);
    }
    if (priority) {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === priority);
    }
    if (assignedTo && assignedTo !== 'me') {
      filteredTickets = filteredTickets.filter(ticket => ticket.assignedTo === assignedTo);
    }

    // Sort tickets
    filteredTickets.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

    // Enrich tickets with user and category data
    const enrichedTickets = paginatedTickets.map(ticket => {
      const user = users.find(u => u.id === ticket.userId);
      const assignedUser = ticket.assignedTo ? users.find(u => u.id === ticket.assignedTo) : null;
      const category = categories.find(c => c.id === ticket.categoryId);
      const ticketComments = comments.filter(c => c.ticketId === ticket.id);
      
      return {
        ...ticket,
        user: user ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar } : null,
        assignedTo: assignedUser ? { id: assignedUser.id, name: assignedUser.name, email: assignedUser.email, avatar: assignedUser.avatar } : null,
        category: category ? { id: category.id, name: category.name, color: category.color } : null,
        commentCount: ticketComments.length
      };
    });

    res.json({
      tickets: enrichedTickets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredTickets.length / limit),
        totalTickets: filteredTickets.length,
        hasNextPage: endIndex < filteredTickets.length,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ message: 'Server error getting tickets' });
  }
});

// Get single ticket with comments
router.get('/:id', authenticateToken, requireOwnership, (req, res) => {
  try {
    const ticket = req.ticket;
    const user = users.find(u => u.id === ticket.userId);
    const assignedUser = ticket.assignedTo ? users.find(u => u.id === ticket.assignedTo) : null;
    const category = categories.find(c => c.id === ticket.categoryId);
    const ticketComments = comments
      .filter(c => c.ticketId === ticket.id)
      .map(comment => {
        const commentUser = users.find(u => u.id === comment.userId);
        return {
          ...comment,
          user: commentUser ? { 
            id: commentUser.id, 
            name: commentUser.name, 
            email: commentUser.email, 
            avatar: commentUser.avatar,
            role: commentUser.role 
          } : null
        };
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const enrichedTicket = {
      ...ticket,
      user: user ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar } : null,
      assignedTo: assignedUser ? { id: assignedUser.id, name: assignedUser.name, email: assignedUser.email, avatar: assignedUser.avatar } : null,
      category: category ? { id: category.id, name: category.name, color: category.color } : null,
      comments: ticketComments
    };

    res.json({ ticket: enrichedTicket });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ message: 'Server error getting ticket' });
  }
});

// Create new ticket
router.post('/', authenticateToken, [
  body('subject').trim().isLength({ min: 5, max: 200 }).withMessage('Subject must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('categoryId').notEmpty().withMessage('Category is required'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority level')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { subject, description, categoryId, priority = 'medium', attachments = [] } = req.body;

    // Validate category exists
    const category = categories.find(c => c.id === categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const newTicket = createTicket({
      subject,
      description,
      categoryId,
      userId: req.user.id,
      priority,
      attachments
    });

    // Enrich ticket with user and category data
    const enrichedTicket = {
      ...newTicket,
      user: { id: req.user.id, name: req.user.name, email: req.user.email, avatar: req.user.avatar },
      category: { id: category.id, name: category.name, color: category.color },
      comments: []
    };

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: enrichedTicket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Server error creating ticket' });
  }
});

// Update ticket (status, assignment, priority)
router.put('/:id', authenticateToken, requireOwnership, [
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed']),
  body('assignedTo').optional().isString(),
  body('priority').optional().isIn(['low', 'medium', 'high']),
  body('statusChangeReason').optional().isString().isLength({ max: 500 }).withMessage('Status change reason must be less than 500 characters')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { status, assignedTo, priority, statusChangeReason } = req.body;
    const updates = {};

    // Only agents and admins can update status and assignment
    if (req.user.role === 'agent' || req.user.role === 'admin') {
      if (status) updates.status = status;
      if (assignedTo) updates.assignedTo = assignedTo;
      if (priority) updates.priority = priority;
      if (statusChangeReason) updates.statusChangeReason = statusChangeReason;
    } else {
      // Regular users can only update priority
      if (priority) updates.priority = priority;
    }

    const updatedTicket = updateTicket(req.params.id, updates);
    if (!updatedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // If status was changed, create a comment about the status change
    if (status && status !== req.ticket.status) {
      const statusComment = statusChangeReason 
        ? `Status changed to ${status.replace('_', ' ')}: ${statusChangeReason}`
        : `Status changed to ${status.replace('_', ' ')}`;
      
      createComment({
        ticketId: req.params.id,
        userId: req.user.id,
        content: statusComment,
        isStatusChange: true
      });
    }

    // Enrich ticket with user and category data
    const user = users.find(u => u.id === updatedTicket.userId);
    const assignedUser = updatedTicket.assignedTo ? users.find(u => u.id === updatedTicket.assignedTo) : null;
    const category = categories.find(c => c.id === updatedTicket.categoryId);

    const enrichedTicket = {
      ...updatedTicket,
      user: user ? { id: user.id, name: user.name, email: user.email, avatar: user.avatar } : null,
      assignedTo: assignedUser ? { id: assignedUser.id, name: assignedUser.name, email: assignedUser.email, avatar: assignedUser.avatar } : null,
      category: category ? { id: category.id, name: category.name, color: category.color } : null
    };

    res.json({
      message: 'Ticket updated successfully',
      ticket: enrichedTicket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ message: 'Server error updating ticket' });
  }
});

// Add comment to ticket
router.post('/:id/comments', authenticateToken, requireOwnership, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { content } = req.body;
    const ticketId = req.params.id;

    const newComment = createComment({
      ticketId,
      userId: req.user.id,
      content
    });

    // Enrich comment with user data
    const enrichedComment = {
      ...newComment,
      user: { 
        id: req.user.id, 
        name: req.user.name, 
        email: req.user.email, 
        avatar: req.user.avatar,
        role: req.user.role 
      }
    };

    res.status(201).json({
      message: 'Comment added successfully',
      comment: enrichedComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

module.exports = router; 