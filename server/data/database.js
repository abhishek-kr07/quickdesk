const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// In-memory database (in production, this would be a real database)
let users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@quickdesk.com',
    password: bcrypt.hashSync('admin@2024', 10),
    role: 'admin',
    createdAt: new Date('2024-01-01'),
    avatar: 'https://via.placeholder.com/40/1976d2/ffffff?text=A'
  },
  {
    id: '2',
    name: 'Support Agent',
    email: 'agent@quickdesk.com',
    password: bcrypt.hashSync('agent123', 10),
    role: 'agent',
    createdAt: new Date('2024-01-02'),
    avatar: 'https://via.placeholder.com/40/2e7d32/ffffff?text=S'
  },
  {
    id: '3',
    name: 'John Doe',
    email: 'john@example.com',
    password: bcrypt.hashSync('user123', 10),
    role: 'user',
    createdAt: new Date('2024-01-03'),
    avatar: 'https://via.placeholder.com/40/ed6c02/ffffff?text=J'
  },
  {
    id: '4',
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: bcrypt.hashSync('user123', 10),
    role: 'user',
    createdAt: new Date('2024-01-04'),
    avatar: 'https://via.placeholder.com/40/9c27b0/ffffff?text=J'
  }
];

let categories = [
  {
    id: '1',
    name: 'Technical Support',
    description: 'Hardware and software issues',
    color: '#1976d2',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Account Issues',
    description: 'Login, password, and account-related problems',
    color: '#2e7d32',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '3',
    name: 'Billing',
    description: 'Payment and subscription issues',
    color: '#ed6c02',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '4',
    name: 'Feature Request',
    description: 'Suggestions for new features',
    color: '#9c27b0',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '5',
    name: 'General Inquiry',
    description: 'General questions and information',
    color: '#d32f2f',
    createdAt: new Date('2024-01-01')
  }
];

let tickets = [
  {
    id: '1',
    subject: 'Cannot login to my account',
    description: 'I\'m getting an error message when trying to log in. It says "Invalid credentials" but I\'m sure my password is correct.',
    categoryId: '2',
    userId: '3',
    assignedTo: '2',
    status: 'in_progress',
    priority: 'high',
    attachments: [],
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-16T14:20:00')
  },
  {
    id: '2',
    subject: 'Software crashes on startup',
    description: 'The application crashes immediately when I try to open it. This started happening after the latest update.',
    categoryId: '1',
    userId: '4',
    assignedTo: null,
    status: 'open',
    priority: 'medium',
    attachments: ['error_log.txt'],
    createdAt: new Date('2024-01-14T16:45:00'),
    updatedAt: new Date('2024-01-14T16:45:00')
  },
  {
    id: '3',
    subject: 'Billing question about subscription',
    description: 'I was charged twice this month for my subscription. Can you help me understand why?',
    categoryId: '3',
    userId: '3',
    assignedTo: '2',
    status: 'resolved',
    priority: 'low',
    attachments: [],
    createdAt: new Date('2024-01-10T09:15:00'),
    updatedAt: new Date('2024-01-12T11:30:00')
  },
  {
    id: '4',
    subject: 'Feature request: Dark mode',
    description: 'It would be great to have a dark mode option for the application. Many users prefer it for better eye comfort.',
    categoryId: '4',
    userId: '4',
    assignedTo: null,
    status: 'open',
    priority: 'low',
    attachments: [],
    createdAt: new Date('2024-01-13T13:20:00'),
    updatedAt: new Date('2024-01-13T13:20:00')
  }
];

let comments = [
  {
    id: '1',
    ticketId: '1',
    userId: '2',
    content: 'I can see the issue. Let me check your account settings.',
    createdAt: new Date('2024-01-15T11:00:00')
  },
  {
    id: '2',
    ticketId: '1',
    userId: '3',
    content: 'Thank you for looking into this. I\'ve been locked out for hours.',
    createdAt: new Date('2024-01-15T11:30:00')
  },
  {
    id: '3',
    ticketId: '1',
    userId: '2',
    content: 'I\'ve reset your password. You should receive an email with the new temporary password. Please change it after logging in.',
    createdAt: new Date('2024-01-16T14:20:00')
  },
  {
    id: '4',
    ticketId: '3',
    userId: '2',
    content: 'I found the duplicate charge. It was a system error. I\'ve issued a refund that should appear in your account within 3-5 business days.',
    createdAt: new Date('2024-01-12T11:30:00')
  },
  {
    id: '5',
    ticketId: '3',
    userId: '3',
    content: 'Perfect! Thank you for the quick resolution.',
    createdAt: new Date('2024-01-12T12:00:00')
  }
];

// Helper functions for database operations
const findUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

const findUserById = (id) => {
  return users.find(user => user.id === id);
};

const createUser = (userData) => {
  const newUser = {
    id: uuidv4(),
    ...userData,
    createdAt: new Date(),
    avatar: `https://via.placeholder.com/40/${getRandomColor()}/ffffff?text=${userData.name.charAt(0).toUpperCase()}`
  };
  users.push(newUser);
  return newUser;
};

const updateUser = (id, updates) => {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates, updatedAt: new Date() };
    return users[index];
  }
  return null;
};

const deleteUser = (id) => {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    const deletedUser = users[index];
    users.splice(index, 1);
    return deletedUser;
  }
  return null;
};

const createTicket = (ticketData) => {
  const newTicket = {
    id: uuidv4(),
    ...ticketData,
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  tickets.push(newTicket);
  return newTicket;
};

const updateTicket = (id, updates) => {
  const index = tickets.findIndex(ticket => ticket.id === id);
  if (index !== -1) {
    tickets[index] = { ...tickets[index], ...updates, updatedAt: new Date() };
    return tickets[index];
  }
  return null;
};

const createComment = (commentData) => {
  const newComment = {
    id: uuidv4(),
    ...commentData,
    createdAt: new Date()
  };
  comments.push(newComment);
  return newComment;
};

const createCategory = (categoryData) => {
  const newCategory = {
    id: uuidv4(),
    ...categoryData,
    createdAt: new Date()
  };
  categories.push(newCategory);
  return newCategory;
};

const updateCategory = (id, updates) => {
  const index = categories.findIndex(category => category.id === id);
  if (index !== -1) {
    categories[index] = { ...categories[index], ...updates };
    return categories[index];
  }
  return null;
};

const deleteCategory = (id) => {
  const index = categories.findIndex(category => category.id === id);
  if (index !== -1) {
    categories.splice(index, 1);
    return true;
  }
  return false;
};

const getRandomColor = () => {
  const colors = ['1976d2', '2e7d32', 'ed6c02', '9c27b0', 'd32f2f', '0288d1', '388e3c', 'f57c00'];
  return colors[Math.floor(Math.random() * colors.length)];
};

module.exports = {
  users,
  categories,
  tickets,
  comments,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  deleteUser,
  createTicket,
  updateTicket,
  createComment,
  createCategory,
  updateCategory,
  deleteCategory
}; 