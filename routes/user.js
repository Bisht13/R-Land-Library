const express = require('express');
const connection = require('./database');
const router = express.Router();
const crypto = require('crypto');
const session = require('express-session');
let alert = require('alert');

const app = express();

app.use(session({
  secret: 'Shh! Secret Key',
  resave: false,
  saveUninitialized: false
}))
router.use(session({
  secret: 'Shh! Secret Key',
  resave: false,
  saveUninitialized: false
}))
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1)

connection.connect();

router.get('/', (req, res) => {
  res.render('index');
});

router.post('/login', (req, res, next) => {
  var hash = crypto.createHash('sha512').update(req.body.password).digest('base64');

  connection.query(
    'select uuid,password,admin from users where email="' + req.body.email + '";',
    (error, results, fields) => {
      if (error) {
        res.writeHead(500);
        alert('Error. Try again.');
        res.redirect('/');
      } else {
        res.status(200);
        if (results.length > 0) {
          if (results[0].password == hash) {
            req.session.uuid = results[0].uuid;
            req.session.loggedIn = true;
            req.session.admin = false;
            req.session.email = req.body.email;
            if (results[0].admin) {
              req.session.admin = true;
            }
            req.url = '/dashboard';
            req.method = 'GET';
            next();
          } else {
            alert('Wrong password. Try again.');
            res.redirect('/');
          }
        } else {
          alert('Email not found. Please register.');
          res.redirect('/');
        }
      }
    }
  );
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', (req, res) => {
  if (req.body.password === req.body.Cpassword) {
    var hash = crypto.createHash('sha512').update(req.body.password).digest('base64');
    const { v4: uuidv4 } = require('uuid');
    var uuid = uuidv4();
    connection.query('SELECT * FROM users WHERE email LIKE "'+req.body.email+'" LIMIT 1;',
    (Error, Results, Fields) => {
      if(Results.length!=0){
        alert('An id already exists with this email. Try again.');
        res.redirect('/register');
      }else{
        connection.query(
          'insert into users (uuid,email,password) values ("' +
          uuid + '", "' +
          req.body.email + '", "' +
          hash + '");',
          (error, results, fields) => {
            if (error) {
              res.sendStatus(500);
              alert('Couldn\'t insert. Try again.');
              res.redirect('/register')
            } else {
              res.sendStatus(200);
              alert('Registered successfully.');
              res.redirect('/');
            }
          }
        );
      }
    });
  } else {
    alert('Passwords don\'t match. Try again.');
    res.redirect('/register');
  }
});

router.use('/', require('./dashboard'));

module.exports = router;