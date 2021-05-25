const express = require('express');
const connection = require('./database');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');

const app = express();

app.set('view engine', 'html');
app.set('views', __dirname + '/public/views');
app.use(express.json());
app.use(express.urlencoded({extended: true}));

connection.connect();

router.post('/login', (req, res) => {
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
                res.sendFile(path.resolve('./public/views/dashboard.html'));
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

router.get('/register', (req, res) => {
    res.sendFile(path.resolve('./public/register.html'));
});

router.post('/register', (req, res) => {
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

module.exports=router;