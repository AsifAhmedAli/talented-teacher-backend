const { check, validationResult } = require('express-validator');

// Validate the register_teacher request
const validateRegistration = [
  check('name').trim().notEmpty().withMessage('Name is required'),
  check('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email'),
  check('password').trim().notEmpty().withMessage('Password is required'),
  check('address').trim().notEmpty().withMessage('Address is required'),
  check('phone').trim().notEmpty().withMessage('Phone is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateRegistration };
