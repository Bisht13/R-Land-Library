const express = require('express');
const path = require('path');
const mysql = require('mysql');

const PORT = process.env.PORT || 5000

//Init express
const app = express();

app.set('view engine', 'html');
app.set('views', __dirname + '/public/views');
app.use(express.json());
app.use(express.urlencoded({extended: true}));


//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//Create your endpoints/route handlers
app.use('/', require('./routes/user'));

app.get('/dashboard', (req, res) => {
    res.sendFile(__dirname + '/public/views/dashboard.html');
});

//Listen on a port
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));