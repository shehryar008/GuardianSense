const express = require('express');
const router = express.Router();
const supabase = require('../../config/db');
const { body, validationResult } = require('express-validator');

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Must be a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: errors.array().map((e) => e.msg).join(', '),
        });
      }

      const { email, password } = req.body;

      // First, check if this email belongs to an active hospital
      const { data: hospital, error: hospitalError } = await supabase
        .from('hospitals')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle();

      // Try to sign in via Supabase Auth
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If login failed and the email exists in Hospitals table,
      // auto-create the auth user and retry login
      if (error && hospital) {
        const { error: createError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });

        // If user already exists in auth but wrong password, don't mask the error
        if (createError && createError.message.includes('already been registered')) {
          return res.status(401).json({
            success: false,
            message: 'Invalid password',
            error: 'The password you entered is incorrect',
          });
        }

        if (createError) {
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password',
            error: createError.message,
          });
        }

        // Retry login with newly created auth user
        const retryResult = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        data = retryResult.data;
        error = retryResult.error;
      }

      if (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
          error: error.message,
        });
      }

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
          },
          hospital: hospital || null,
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          },
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message,
      });
    }
  }
);

// POST /api/auth/register
router.post(
  '/register',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Must be a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: errors.array().map((e) => e.msg).join(', '),
        });
      }

      const { email, password } = req.body;

      // Register via Supabase Auth Admin (skips email verification)
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Registration failed',
          error: error.message,
        });
      }

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
          },
        },
      });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message,
      });
    }
  }
);

module.exports = router;
