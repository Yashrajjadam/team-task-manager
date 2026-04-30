const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');

const projectValidation = [
  body('title').trim().notEmpty().withMessage('Project title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('description').optional().trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

// @desc    Create project
// @route   POST /api/projects
const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, description, members } = req.body;

    const project = new Project({
      title,
      description: description || '',
      owner: req.user._id,
      members: members || [],
    });

    await project.save();
    await project.populate('owner members', 'name email role');

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error creating project.' });
  }
};

// @desc    Get all projects (admin sees all, members see theirs)
// @route   GET /api/projects
const getProjects = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = { members: req.user._id };
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .populate('members', 'name email role')
      .sort({ updatedAt: -1 });

    // Attach task counts to each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        const completedCount = await Task.countDocuments({ project: project._id, status: 'done' });
        return {
          ...project.toObject(),
          taskCount,
          completedCount,
        };
      })
    );

    res.json(projectsWithCounts);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error fetching projects.' });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email role')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Check if user is a member or admin
    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
    if (req.user.role !== 'admin' && !isMember) {
      return res.status(403).json({ message: 'Access denied. Not a project member.' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error fetching project.' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
const updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, description } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true, runValidators: true }
    ).populate('owner members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error updating project.' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Delete all tasks in the project
    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project and all associated tasks deleted successfully.' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error deleting project.' });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required.' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Check if already a member
    if (project.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member.' });
    }

    project.members.push(userId);
    await project.save();
    await project.populate('owner members', 'name email role');

    res.json({ message: 'Member added successfully', project });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error adding member.' });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
const removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Cannot remove the owner
    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove the project owner.' });
    }

    project.members = project.members.filter(
      m => m.toString() !== req.params.userId
    );
    await project.save();

    // Unassign removed member from project tasks
    await Task.updateMany(
      { project: req.params.id, assignedTo: req.params.userId },
      { $set: { assignedTo: null } }
    );

    await project.populate('owner members', 'name email role');

    res.json({ message: 'Member removed successfully', project });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error removing member.' });
  }
};

module.exports = {
  createProject, getProjects, getProjectById, updateProject,
  deleteProject, addMember, removeMember, projectValidation,
};
