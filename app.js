// Webshop App

const express = require( 'express' ),
	pg = require( 'pg' ),
	Sequelize = require( 'sequelize' ),
	bodyParser = require( 'body-parser' ),
	session = require( "express-session" ),
	SequelizeStore = require( "connect-session-sequelize" )( session.Store ),
	bcrypt = require( 'bcrypt' ),
	saltRounds = 10,
	port = process.env.PORT || 8000;
var db = new Sequelize( "webshop_app", process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	host: "localhost",
	dialect: "postgres",
	define: {
		timestamps: false
	}
} )

const app = express();

// Configuring app 

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( express.static( __dirname + '/public' ) );
app.use( session( {
	secret: "whatever",
	store: new SequelizeStore( {
		db: db,
		checkExpirationInterval: 15 * 60 * 1000,
		expiration: 24 * 60 * 60 * 1000
	} ),
	saveUnitialized: true,
	resave: true
} ) );

// Setting view engine

app.set( "views", "./views" );
app.set( "view engine", "pug" );

// Configuring db

db = new Sequelize( "webshop_app", process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	host: "localhost",
	dialect: "postgres",
	define: {
		timestamps: true
	}
} );

// Establishing DB Connection

db.sync( { force: false } )

// Defining models: User and Event

const Account = db.define( "account", {
	first: {
		type: Sequelize.STRING
	},
	last: {
		type: Sequelize.STRING
	},
	email: {
		type: Sequelize.STRING
	},
	address: {
		type: Sequelize.STRING
	},
	city: {
		type: Sequelize.STRING
	},
	country: {
		type: Sequelize.STRING
	},
	zip: {
		type: Sequelize.STRING
	}
} );

const Order = db.define( "order", {
	product: {
		type: Sequelize.STRING
	},
	amount: {
		type: Sequelize.STRING
	}
} )

const Event = db.define( "event", {
	type: {
		type: Sequelize.STRING
	},
	amount: {
		type: Sequelize.INTEGER
	},
	product: {
		type: Sequelize.STRING
	}
} );

// Defining relations

Account.hasMany( Order );
Order.belongsTo( Account );
Account.hasMany( Event );
Event.belongsTo( Account );
Order.hasOne( Event );
Event.belongsTo( Order );

// GET

app.get( "/", ( req, res ) => {
	res.send( "Application running!" )
} );

app.get( "/login", ( req, res ) => {

} );

app.get( "/signup", ( req, res ) => {

} )

// Dynamic routes

app.get( "/checkout/:id", ( req, res ) => {
	let user = req.session.user;
	if ( user === undefined ) {
		let message = "Please log in to checkout!";
		res.render( "login", { message: message } )
	} else {
		res.render( "checkout" )
	};
} );

app.get( "/thankyou/:id", ( req, res ) => {
	let user = req.session.user;
	if ( user === undefined ) {
		let message = "Please log in to receive grace from us!";
		res.render( "login", { message: message } )
	} else {
		res.render( "thankyou" )
	}
} );

app.get( "/account/:id", ( req, res ) => {
	let user = req.session.user;
	if ( user === undefined ) {
		let message = "Please log in to view your account!";
		res.render( "login", { message: message } )
	} else {
		res.render( "account" )
	}
} );

// POST

app.post( "/login", ( req, res ) => {
	let email = req.body.email;
	let plainPassword = req.body.password;
	User.findOne( {
			where: {
				email: email
			}
		} )
		.then( function( user ) {
			hash = user.password;
			if (
				bcrypt.compare( plainPassword, hash ).then( function( res ) {
					return res;
				} ) ) {
				req.session.user = user;
				res.redirect( `/checkout/${account.first}` );
			} else {
				let message = "Invalid e-mail or password";
				res.render( "login", {message: message} );
			}
		} )
		.catch( function( error ) {
			res.redirect( 'login/?message=' + encodeURIComponent( "Something going horribly wrong" ) );
		} )
} );

app.post( "/signup", ( req, res ) => {
	let plainPassword = req.body.password;
	bcrypt.hash( plainPassword, saltRounds, function( err, hash ) {

		User.findOne( {
				where: {
					username: req.body.username
				}
			} )
			.then( function( user ) {
				if ( user ) {
					res.render( "signup", { message: `username ${req.body.username} already taken` } )
				} else {
					User.create( {
							first: req.body.first,
							last: req.body.last,
							email: req.body.email,
							username: req.body.username,
							password: hash
						} )
						.then( ( user ) => {
							res.redirect( "login" )
						} )
				}
			} )
	} )
} );

app.post( "/pay", ( req, res ) => {

} );

app.post( "/accountupdate", ( req, res ) => {

} );

app.post( "/logout", ( req, res ) => {
	req.session.destroy( function( error ) {
		if ( error ) {
			throw error;
		}
		res.render( "index", { message: "logged out succesfully!" } )
	} );
} );

// server launch

app.listen( port, function( res ) {
	console.log( "App listening in port " + port )
} )