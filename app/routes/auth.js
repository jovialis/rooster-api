const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

router.post('login/native', authController.login_native_post_middleware, authController.login_native_post);

module.exports = router;