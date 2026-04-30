const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const {
  createProject, getProjects, getProjectById, updateProject,
  deleteProject, addMember, removeMember, projectValidation,
} = require('../controllers/projectController');

router.use(auth);

router.post('/', roleAuth('admin'), projectValidation, createProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.put('/:id', roleAuth('admin'), projectValidation, updateProject);
router.delete('/:id', roleAuth('admin'), deleteProject);
router.post('/:id/members', roleAuth('admin'), addMember);
router.delete('/:id/members/:userId', roleAuth('admin'), removeMember);

module.exports = router;
