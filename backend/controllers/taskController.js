const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Project = require('../models/Project');

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required')
    .isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters'),
  body('description').optional().trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('project').notEmpty().withMessage('Project ID is required'),
  body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid date format'),
];

const taskUpdateValidation = [
  body('title').optional().trim().notEmpty().withMessage('Task title cannot be empty')
    .isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters'),
  body('description').optional().trim(),
  body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  body('dueDate').optional({ nullable: true }),
];

// @desc    Create task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, description, project: projectId, assignedTo, status, dueDate } = req.body;

    // Check project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    if (req.user.role !== 'admin' && !isMember) {
      return res.status(403).json({ message: 'You are not a member of this project.' });
    }

    const task = new Task({
      title,
      description: description || '',
      project: projectId,
      assignedTo: assignedTo || null,
      status: status || 'todo',
      dueDate: dueDate || null,
      createdBy: req.user._id,
    });

    await task.save();
    await task.populate('assignedTo createdBy', 'name email');
    await task.populate('project', 'title');

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error creating task.' });
  }
};

// @desc    Get tasks for a project
// @route   GET /api/tasks/project/:projectId
const getProjectTasks = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const isMember = project.members.some(m => m.toString() === req.user._id.toString());
    if (req.user.role !== 'admin' && !isMember) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const { status } = req.query;
    const query = { project: req.params.projectId };
    if (status && ['todo', 'in-progress', 'done'].includes(status)) {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get project tasks error:', error);
    res.status(500).json({ message: 'Server error fetching tasks.' });
  }
};

// @desc    Get tasks assigned to current user
// @route   GET /api/tasks/my
const getMyTasks = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { assignedTo: req.user._id };
    if (status && ['todo', 'in-progress', 'done'].includes(status)) {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .populate('project', 'title')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1, createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ message: 'Server error fetching your tasks.' });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'title members');

    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error fetching task.' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const { title, description, status, assignedTo, dueDate } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;

    await task.save();
    await task.populate('assignedTo createdBy', 'name email');
    await task.populate('project', 'title');

    res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error updating task.' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    // Only admin or task creator can delete
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isCreator) {
      return res.status(403).json({ message: 'Only admins or the task creator can delete this task.' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error deleting task.' });
  }
};

module.exports = {
  createTask, getProjectTasks, getMyTasks, getTaskById,
  updateTask, deleteTask, taskValidation, taskUpdateValidation,
};
