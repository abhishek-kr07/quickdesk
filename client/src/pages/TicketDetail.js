import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Send,
  Person,
  Schedule,
  PriorityHigh,
  Category,
  Assignment,
  Comment
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ticketService } from '../services/ticketService';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAgent } = useAuth();
  const queryClient = useQueryClient();
  
  const [newComment, setNewComment] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusChangeReason, setStatusChangeReason] = useState('');
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');

  // Fetch ticket data
  const { data: ticket, isLoading, error } = useQuery(
    ['ticket', id],
    () => ticketService.getTicket(id),
    {
      enabled: !!id,
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  // Fetch agents for assignment
  const { data: agents } = useQuery(
    'agents',
    () => authService.getAllUsers().then(users => users.filter(user => user.role === 'agent' || user.role === 'admin')),
    {
      enabled: isAgent,
    }
  );

  // Add comment mutation
  const addCommentMutation = useMutation(
    (content) => ticketService.addComment(id, content),
    {
      onSuccess: () => {
        setNewComment('');
        queryClient.invalidateQueries(['ticket', id]);
        queryClient.invalidateQueries('tickets');
      },
    }
  );

  // Update ticket status mutation
  const updateStatusMutation = useMutation(
    (updates) => ticketService.updateTicket(id, updates),
    {
      onSuccess: () => {
        setStatusDialogOpen(false);
        setNewStatus('');
        setStatusChangeReason('');
        queryClient.invalidateQueries(['ticket', id]);
        queryClient.invalidateQueries('tickets');
      },
    }
  );

  // Assign ticket mutation
  const assignTicketMutation = useMutation(
    (assigneeId) => ticketService.updateTicket(id, { assignedTo: assigneeId }),
    {
      onSuccess: () => {
        setAssignmentDialogOpen(false);
        setSelectedAssignee('');
        queryClient.invalidateQueries(['ticket', id]);
        queryClient.invalidateQueries('tickets');
      },
    }
  );

  const handleStatusChange = () => {
    if (newStatus && newStatus !== ticket.status) {
      const updates = {
        status: newStatus,
        ...(statusChangeReason && { statusChangeReason })
      };
      updateStatusMutation.mutate(updates);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  const handleAssignTicket = () => {
    if (selectedAssignee) {
      assignTicketMutation.mutate(selectedAssignee);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'default';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">
          Error loading ticket: {error.message}
        </Alert>
      </Box>
    );
  }

  if (!ticket) {
    return (
      <Box>
        <Alert severity="warning">Ticket not found</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Ticket #{ticket.id}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Ticket Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {ticket.subject}
                </Typography>
                <Chip
                  label={ticket.status.replace('_', ' ').toUpperCase()}
                  color={getStatusColor(ticket.status)}
                  variant="outlined"
                />
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                {ticket.description}
              </Typography>

              {/* Ticket Metadata */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Person sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      Created by: {ticket.createdBy?.name || 'Unknown'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Schedule sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      Created: {format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Category sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      Category: {ticket.category?.name || 'Uncategorized'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <PriorityHigh sx={{ mr: 1, fontSize: 20 }} />
                    <Chip
                      label={ticket.priority.toUpperCase()}
                      color={getPriorityColor(ticket.priority)}
                      size="small"
                    />
                  </Box>
                </Grid>
                {ticket.assignedTo && (
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Assignment sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Assigned to: {ticket.assignedTo.name}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

                             {/* Status Change and Assignment for Agents */}
               {isAgent && (
                 <Box mt={3}>
                   <Divider sx={{ mb: 2 }} />
                   <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                     <Box>
                       <Typography variant="h6">Update Status</Typography>
                       <Button
                         variant="outlined"
                         startIcon={<Edit />}
                         onClick={() => {
                           setNewStatus(ticket.status);
                           setStatusDialogOpen(true);
                         }}
                       >
                         Change Status
                       </Button>
                     </Box>
                     <Box>
                       <Typography variant="h6">Assign Ticket</Typography>
                       <Button
                         variant="outlined"
                         startIcon={<Assignment />}
                         onClick={() => {
                           setSelectedAssignee(ticket.assignedTo?.id || '');
                           setAssignmentDialogOpen(true);
                         }}
                       >
                         Assign to Agent
                       </Button>
                     </Box>
                   </Box>
                 </Box>
               )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Comments ({ticket.comments?.length || 0})
              </Typography>

              {/* Add Comment */}
              <Box mb={3}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={addCommentMutation.isLoading}
                />
                <Box display="flex" justifyContent="flex-end" mt={1}>
                  <Button
                    variant="contained"
                    startIcon={<Send />}
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addCommentMutation.isLoading}
                  >
                    Add Comment
                  </Button>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Comments List */}
              {ticket.comments && ticket.comments.length > 0 ? (
                <List>
                  {ticket.comments.map((comment, index) => (
                                          <ListItem key={comment.id || index} alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: comment.isStatusChange ? 'warning.main' : 'primary.main',
                            fontSize: '0.875rem'
                          }}>
                            {comment.isStatusChange ? <Edit /> : <Person />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="subtitle2">
                                {comment.user?.name || 'Unknown User'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                              </Typography>
                              {comment.isStatusChange && (
                                <Chip 
                                  label="Status Change" 
                                  size="small" 
                                  color="warning" 
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                mt: 1,
                                fontStyle: comment.isStatusChange ? 'italic' : 'normal',
                                color: comment.isStatusChange ? 'warning.dark' : 'text.primary'
                              }}
                            >
                              {comment.content}
                            </Typography>
                          }
                        />
                      </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center">
                  No comments yet. Be the first to add one!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </Button>
                
                                 {isAgent && (
                   <>
                     <Button
                       variant="contained"
                       fullWidth
                       startIcon={<Edit />}
                       onClick={() => setStatusDialogOpen(true)}
                     >
                       Update Status
                     </Button>
                     <Button
                       variant="outlined"
                       fullWidth
                       startIcon={<Assignment />}
                       onClick={() => {
                         setSelectedAssignee(ticket.assignedTo?.id || '');
                         setAssignmentDialogOpen(true);
                       }}
                     >
                       Assign Ticket
                     </Button>
                   </>
                 )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Ticket Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="New Status"
            >
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for status change (optional)"
            value={statusChangeReason}
            onChange={(e) => setStatusChangeReason(e.target.value)}
            placeholder="Explain why you're changing the status..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleStatusChange}
            variant="contained"
            disabled={!newStatus || updateStatusMutation.isLoading}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialogOpen} onClose={() => setAssignmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Ticket</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Assign to Agent</InputLabel>
            <Select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              label="Assign to Agent"
            >
              <MenuItem value="">
                <em>Unassigned</em>
              </MenuItem>
              {agents?.map((agent) => (
                <MenuItem key={agent.id} value={agent.id}>
                  <Box display="flex" alignItems="center">
                    <Avatar src={agent.avatar} sx={{ mr: 1, width: 24, height: 24 }}>
                      {agent.name?.charAt(0)}
                    </Avatar>
                    {agent.name} ({agent.role})
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssignTicket}
            variant="contained"
            disabled={assignTicketMutation.isLoading}
          >
            Assign Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TicketDetail; 