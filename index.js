const express = require('express');
const path = require('path');
const mysql = require('mysql');
var crypto = require('crypto');

const PORT = process.env.PORT || 5000

//Init express
const app = express();

app.set('view engine', 'html');

app.use(
    express.urlencoded({
        extended: true,
    })
);

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password@123',
    database: 'RLandLibrary',
});

connection.connect();

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Create your endpoints/route handlers
app.get('/login', (req, res) => {
    res.send('hi');
});

app.post('/login', (req, res) => {
    var hash = crypto.createHash('sha512').update(req.body.password).digest('base64');

    connection.query(
        'select password from users where email="' + req.body.email + '";',
        (error, results, fields) => {
          if (error) {
            res.writeHead(500);
            res.end("couldn't find");
          } else {
            res.writeHead(200);
            if (results.length > 0) {
              if(results[0].password == hash){
                res.redirect('/dashboard');
              }else{
                  res.end('Wrong Password');
              }
            } else {
              res.end('absent');
            }
          }
        }
    );
});

app.get('/register', (req, res) => {
    res.sendFile('public/register.html',{root:__dirname});
});

app.post('/register', (req, res) => {
    if(req.body.password === req.body.Cpassword){
        var hash = crypto.createHash('sha512').update(req.body.password).digest('base64');
        const { v4: uuidv4 } = require('uuid');
        var uuid = uuidv4();
        connection.query(
            'insert into users (uuid,email,password) values ("'+
            uuid + '", "' + 
            req.body.email + '", "' +
            hash + '");',
            (error, results, fields) => {
                if (error) {
                    console.log(error);
                    res.writeHead(500);
                    res.end('couldn\'t insert');
                } else {
                    res.writeHead(200);
                    res.end('inserted successfully');
                }
            }
        );
    }else{
        res.end('Password don\'t match');
    }
});

app.get('/dashboard', (req, res) => {
    res.render('public/dashboard.html');
});

//Listen on a port
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));