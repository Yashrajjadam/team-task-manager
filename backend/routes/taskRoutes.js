const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createTask, getProjectTasks, getMyTasks, getTaskById,
  updateTask, deleteTask, taskValidation, taskUpdateValidation,
} = require('../controllers/taskController');

router.use(auth);

router.post('/', taskValidation, createTask);
router.get('/my', getMyTasks);
router.get('/project/:projectId', getProjectTasks);
router.get('/:id', getTaskById);
router.put('/:id', taskUpdateValidation, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
