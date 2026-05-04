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
      let hospital = null;
      let station = null;
      let isPending = false;
      let pendingMessage = '';

      const { data: hData } = await supabase
        .from('hospitals')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle();
      
      hospital = hData;

      if (!hospital) {
        const { data: inactiveHospital } = await supabase
          .from('hospitals')
          .select('hospital_id')
          .eq('email', email)
          .eq('is_active', false)
          .maybeSingle();

        if (inactiveHospital) {
          isPending = true;
          pendingMessage = 'Your hospital registration is pending admin approval. Please wait for activation.';
        } else {
          // Check police stations
          const { data: sData } = await supabase
            .from('police_stations')
            .select('station_id, station_name, address, city, phone, email, is_active')
            .eq('email', email)
            .eq('is_active', true)
            .maybeSingle();
          
          station = sData;

          if (!station) {
            const { data: inactiveStation } = await supabase
              .from('police_stations')
              .select('station_id')
              .eq('email', email)
              .eq('is_active', false)
              .maybeSingle();
            
            if (inactiveStation) {
               isPending = true;
               pendingMessage = 'Your police station account is inactive or deleted.';
            }
          }
        }
      }

      if (isPending) {
        return res.status(403).json({
          success: false,
          message: pendingMessage,
          error: 'Account is not active',
        });
      }

      // Try to sign in via Supabase Auth
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If login failed and the email exists in Hospitals or Police table,
      // auto-create the auth user and retry login
      if (error && (hospital || station)) {
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
          station: station || null,
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

// POST /api/auth/change-password
router.post(
  '/change-password',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Must be a valid email'),
    body('currentPassword')
      .notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .notEmpty().withMessage('New password is required')
      .isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
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

      const { email, currentPassword, newPassword } = req.body;

      // Verify current password by attempting sign-in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (signInError) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
          error: signInError.message,
        });
      }

      // Update password via admin API
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        signInData.user.id,
        { password: newPassword }
      );

      if (updateError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to update password',
          error: updateError.message,
        });
      }

      res.json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (err) {
      console.error('Change password error:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message,
      });
    }
  }
);

module.exports = router;
