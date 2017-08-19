# Back-end outline Webshop app

Context: the webshop will have 5 pages in total:
1. Index page
2. Login page
3. Signup page
4. Buy product page
5. Thank you page
5. My Account(containing order history)

For UX we decided to store order history under my account to keep the layout of the pages simple.

STEPS:

<!-- 1. Dependencies: express, body-parser, express-session, pg, sequelize, connect-session-sequelize, bcrypt -->
<!-- 2. App.set: pug -->
<!-- 3. App.use: express static, bodyparser.urlencoded, session(new SequelizeStore) -->
<!-- 4. Database: db, "webshop_app", timestamps: true. db.sync({force:false}) -->
<!-- 5. Models: Account(first, last, e-mail, address, city, country, ZIP, password), Order(product, amount), Event(event) -->
<!-- 6. Model relations: Account.hasMany(Order), Order.belongsTo( Account ), Account.hasMany( Event ), Event.belongsTo( Account ), Order.hasOne ( Event ). Event.belongsTo( Order ) -->
<!-- 7. GET routes: /, /login, /signup, /checkout/:id, /thankyou/:id, /account/:id -->
<!-- 8. POST routes: /login, /signup, /pay(in PayPal button), /accountupdate, /logout -->
<!-- 9. Sessions: * Evaluate: /, /login, /signup, /checkout, /thankyou /account, * Create: /login, *Destroy: /logout -->
<!-- 10. DB CRUD: Account.findOne @ GET /login /signup /checkout /thankyou /account, POST /buy, Order.findAll @ GET /account /thankyou -->
<!-- 11. Validation: input fields(not empty and minimum length password), availability e-mail -->
<!-- 12. Encryption: bcrypt.hash @ POST /signup, bcrypt.compare @ GET /login  -->

BEYOND MVP:
* Event logging: Event model, Event.create in /checkout and /thankyou route to see potential buyers
* Add "Start session", "Destroy session" and "Visit time" to the model Event and create a row on entering and leaving the site.
* Make a little password validator on the client side that evaluates the password on the use of capitals, nonliterals, and small letters. Update the input field text and the validation message when incorrect.
* Edit session time to 5 minutes
* RESTful routing 2.0: editing URL on error
* Send an e-mail if there has been a login but no buy
