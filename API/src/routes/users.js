const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { body, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

/**
 * @route GET /api/users/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', authenticateToken, userController.getProfile);

/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', 
  authenticateToken,
  [
    body('fullName').optional().trim().isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    body('phone').optional().isMobilePhone('pt-BR').withMessage('Please provide a valid Brazilian phone number'),
    body('birthDate').optional().isISO8601().withMessage('Please provide a valid birth date'),
    body('nationality').optional().trim().isLength({ min: 2 }).withMessage('Nationality must be at least 2 characters'),
    handleValidationErrors
  ],
  userController.updateProfile
);

/**
 * @route PUT /api/users/password
 * @desc Change user password
 * @access Private
 */
router.put('/password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    handleValidationErrors
  ],
  userController.changePassword
);

/**
 * @route GET /api/users/statistics
 * @desc Get user statistics
 * @access Private
 */
router.get('/statistics', authenticateToken, userController.getUserStatistics);

/**
 * @route DELETE /api/users/account
 * @desc Delete user account
 * @access Private
 */
router.delete('/account',
  authenticateToken,
  [
    body('password').notEmpty().withMessage('Password is required to delete account'),
    handleValidationErrors
  ],
  userController.deleteAccount
);

module.exports = router;