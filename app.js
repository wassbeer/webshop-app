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

const app = express();

// configuring db

const db = new Sequelize( "webshop_app_1", process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	host: "localhost",
	dialect: "postgres",
	define: {
		timestamps: false
	}
} )

// Configuring app

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( express.static( __dirname + '/public' ) );
app.use( session( {
	secret: "shizzle",
	store: new SequelizeStore( {
		db: db,
		checkExpirationInterval: 15 * 60 * 1000,
		expiration: 24 * 60 * 60 * 1000
	} ),
	saveUninitialized: true,
	resave: true
} ) );

// Setting view engine

app.set( "views", "./views" );
app.set( "view engine", "pug" );

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
	},
	password: {
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

// Defining relations

Account.hasMany( Order );
Order.belongsTo( Account );

// GET

app.get( "/", ( req, res ) => {
	res.render( "index" )
} );

//Temporary get request for checkout page for front-end purposes
app.get( "/checkout", ( req, res ) => {
	res.render( "checkout" )
} );

//Temporary get request for info page for front-end purposes
app.get( "/info", ( req, res ) => {
	res.render( "info" )
} );

app.get( "/login", ( req, res ) => {
	let account = req.session.account;
	if ( account === undefined ) {
		res.render( "login" )
	} else {
		res.redirect( "/checkout/" + account.id )
	}
} );

app.get( "/signup", ( req, res ) => {
	res.render( "signup" )
} )

// Dynamic routes

app.get( "/checkout/:id", ( req, res ) => {
	var account = req.session.account;
	if ( !account ) {
		let message = "Please log in to checkout!";
		res.render( "login", { message: message } )
	} else {
		Account.findOne( {
				where: {
					id: account.id
				}
			} )
			.then( account => {
				console.log( "account! : " + account )
				res.render( "checkout", { account: account } )
			} )
			.catch( error => {
				res.redirect( 'login/?message=' + encodeURIComponent( "Something going horribly wrong" ) );
			} )
	};
} );

app.get( "/thankyou", ( req, res ) => {
	var account = req.session.account;
	if ( !account ) {
		let message = "Please log in to receive grace from us!";
		res.render( "login", { message: message } )
	} else {
		Order.create( {
			product: "6-strap",
			amount: 1,
			accountId: account.id
		} ).then(
			res.render( "thankyou" )
		)
	.catch( error => {
		res.redirect( 'login/?message=' + encodeURIComponent( "Something going horribly wrong" ) );
	} )}
} );

app.get( "/account/:id", ( req, res ) => {
	let account = req.session.account;
	if ( account === undefined ) {
		let message = "Please log in to view your account!";
		res.render( "login", { message: message } )
	} else {
		Account.findOne( {
				where: {
					id: account.id
				}
			} )
			.then( account => {
				Order.findAll( {
					where: {
						accountId: account.id
					}
				});
			} )
			.then( order => {
				res.render( "account", { account: account }, {order: order} )
			} )
	.catch( error => {
		res.redirect( 'login/?message=' + encodeURIComponent( "Something going horribly wrong" ) );
	} );}
} );

// POST

app.post( "/login", ( req, res ) => {
	let email = req.body.email,
		plainPassword = req.body.password;
	Account.findOne( {
			where: {
				email: email
			}
		} )
		.then( account => {
			if ( !account ) { // validate membership
				let message = ( "we have not registered an e-mail with this account yet, please enter the correct e-mail or create an account" )
				res.render( "login", { message: message } )
			} else {
				hash = account.password;
				if ( // validate password
					bcrypt.compare( plainPassword, hash ).then( res => {
						return res;
					} ) ) { // initiate session
					req.session.account = account;
					res.redirect( `/checkout/${account.id}` );
				} else {
					let message = "Invalid e-mail or password";
					res.render( "login", { message: message } );
				}
			}
		} )
		.catch( error => {
			res.redirect( 'login/?message=' + encodeURIComponent( "Something going horribly wrong" ) );
		} )
} );

app.post( "/signup", ( req, res ) => {
	let plainPassword = req.body.password;
	bcrypt.hash( plainPassword, saltRounds, ( err, hash ) => {
		Account.findOne( {
				where: {
					email: req.body.email
				}
			} )
			.then( account => {
				if ( account ) {
					res.render( "signup", { message: `username ${req.body.username} already taken` } )
				} else {
					Account.create( {
							first: req.body.first,
							last: req.body.last,
							email: req.body.email,
							address: req.body.address,
							city: req.body.city,
							country: req.body.country,
							zip: req.body.zip,
							password: hash
						} )
						.then( account => {
							req.session.account =
								res.redirect( "login" )
						} )
						.catch( error => {
							res.redirect( 'login/?message=' + encodeURIComponent( "Something going horribly wrong" ) );
						} )
				}
			} )
	} )
} );

app.post( "/accountupdate", ( req, res ) => {

} );

app.post( "/logout", ( req, res ) => {
	req.session.destroy( error => {
		if ( error ) {
			throw error;
		}
		res.render( "index", { message: "logged out succesfully!" } )
	} );
} );

// server launch

app.listen( port, res => {
	console.log( "App listening in port " + port )
} )