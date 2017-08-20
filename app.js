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

// const Event = db.define( "event", {
// 	type: {
// 		type: Sequelize.STRING
// 	},
// 	amount: {
// 		type: Sequelize.INTEGER
// 	},
// 	product: {
// 		type: Sequelize.STRING
// 	}
// } );

// Defining relations

Account.hasMany( Order );
Order.belongsTo( Account );
// Account.hasMany( Event );
// Event.belongsTo( Account );
// Order.hasOne( Event );
// Event.belongsTo( Order );

// GET

app.get( "/", ( req, res ) => {
	res.render( "index" )
} );

//Temporary get request for checkout page for front-end purposes
app.get( "/checkout", ( req, res ) => {
	res.render( "checkout" )
} );

app.get( "/login", ( req, res ) => {
	let user = req.session.user;
	if ( user === undefined ) {
		res.render( "login" )
	} else {
		res.redirect( "/account/" + user.id )
	}
} );

app.get( "/signup", ( req, res ) => {
	res.render( "signup" )
} )

// Dynamic routes

app.get( "/checkout/:id", ( req, res ) => {
	let user = req.session.user;
	if ( user === undefined ) {
		let message = "Please log in to checkout!";
		res.render( "login", { message: message } )
	} else {
		Account.findOne( {
				where: {
					id: user.id
				}
			} )
			.then( user => {
				res.render( "checkout", { user: user } )
			} )
			.catch( error => {
				res.redirect( 'login/?message=' + encodeURIComponent( "Something going horribly wrong" ) );
			} )
	};
} );

app.get( "/thankyou/:id", ( req, res ) => {
	let user = req.session.user;
	if ( user === undefined ) {
		let message = "Please log in to receive grace from us!";
		res.render( "login", { message: message } )
	} else {
		Account.findOne( {
				where: {
					id: user.id
				}
			} )
			.then( user => {
				Order.findAll().then( order => {
				res.render( "thankyou", { user: user, order: order } )
			} )})
			.catch( error => {
				res.redirect( 'login/?message=' + encodeURIComponent( "Something going horribly wrong" ) );
			} )
	}
} );

app.get( "/account/:id", ( req, res ) => {
	let user = req.session.user;
	if ( user === undefined ) {
		let message = "Please log in to view your account!";
		res.render( "login", { message: message } )
	} else {
		Account.findOne( {
				where: {
					id: user.id
				}
			} )
			.then( user => {
				Order.findAll().then( order => {
				res.render( "account", { user: user } )
			} )})
			.catch( error => {
				res.redirect( 'login/?message=' + encodeURIComponent( "Something going horribly wrong" ) );
			} )
	}
} );

// POST

app.post( "/login", ( req, res ) => {
	let email = req.body.email;
	let plainPassword = req.body.password;
	Account.findOne( {
			where: {
				email: email
			}
		} )
		.then( user => {
			hash = user.password;
			if (
				bcrypt.compare( plainPassword, hash ).then( res => {
					return res;
				} ) ) {
				req.session.user = user;
				res.redirect( `/checkout/${account.first}` );
			} else {
				let message = "Invalid e-mail or password";
				res.render( "login", { message: message } );
			}
		} )
		.catch( error => {
			res.redirect( 'login/?message=' + encodeURIComponent( "Something going horribly wrong" ) );
		} )
} );

app.post( "/signup", ( req, res ) => {
	let plainPassword = req.body.password;
	bcrypt.hash( plainPassword, saltRounds, ( err, hash )  => {
		Account.findOne( {
				where: {
					username: req.body.username
				}
			} )
			.then( user => {
				if ( user ) {
					res.render( "signup", { message: `username ${req.body.username} already taken` } )
				} else {
					Account.create( {
							first: req.body.first,
							last: req.body.last,
							email: req.body.email,
							address: req.body.address,
							city: req.body.city,
							country: req.body.country,
							zip: req.country.zip,
							password: hash
						} )
						.then( user  => {
							res.redirect( "login" )
						} )
						.catch( error => {
							res.redirect( 'login/?message=' + encodeURIComponent( "Something going horribly wrong" ) );
						} )
				}
			} )
	} )
} );

app.post( "/pay", ( req, res ) => {
Order.create(
	{
		product: "Leather holder of 6-pack",
		amount: orderQuantity
	}.then( order => {
		res.redirect("/thankyou/:id")
	})
)
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
