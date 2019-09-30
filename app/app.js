//////////////////////////////
//// MARK: MONGODB CONNECTION
//////////////////////////////

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

// Bind connection to error event
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

//////////////////////////////
//// MARK: EXPRESS SETUP
//////////////////////////////

const express = require('express');
const bodyParser = require('body-parser');
const expressSsl = require('express-sslify');
const cookies = require('cookies');

// Instantiate router
const router = express();
router.disable('X-Powered-By');

// POST middlewares
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

// Cookie get/set support
router.use(cookies.express([ process.env.COOKIE_SECRET ]));

// Forward to SSL middlewares in production
if (process.env.NODE_ENV === 'production') {
	router.use(expressSsl.HTTPS({trustProtoHeader: true}));
	router.enable('trust proxy');
}

// Make user-agent field easily accessible
router.use(function(req, res, next) {
	req.userAgent = req.get('User-Agent');
	next();
});

// Import routers
const authRouter = require('./routes/auth');

// Register all routes
router.use('/auth', authRouter);

// Handle errors natively with Express
router.use((err, req, res, next) => {
	console.log(err);

	const errorName = err.name;
	const errorCode = err.code;
	const errorDescription = err.description;

	// If detailed error available
	if (errorName && errorCode) {

		// Send descriptive error
		res.status(errorCode).send({
			error: errorName,
			description: errorDescription ? errorDescription : err.message
		});

	} else {

		// Send generic server error
		res.status(500).send({
			error: 'error_server',
			description: 'An internal error occurred. Please contact an administrator.'
		});

	}
});

// Grab port and start listening
const port = process.env.PORT || 5000;

router.listen(port, function() {
	console.log(`RoosterAPI is listening for requests at port ${port}.`);
});