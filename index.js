const express = require('express');

const PORT = process.env.PORT || 5000

const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(express.static(__dirname + '/public'));

app.use('/', require('./routes/user'));

//Listen on a port
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));