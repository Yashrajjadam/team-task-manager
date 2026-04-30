const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { getUsers, getUserById, updateUserRole, deleteUser } = require('../controllers/userController');

// All user routes require admin
router.use(auth, roleAuth('admin'));

router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;
