const express = require('express');
const connection = require('./database');
const router = express.Router();
const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

router.get('/dashboard', (req, res) => {
    if (req.session.admin) {
        connection.query('select name,count(name) as count from books group by name order by name;',
            (error, results, fields) => {
                if (error) throw error;
                connection.query('select name,issuereq from books where issuereq is not null;',
                    (Uerror, Uresults, Ufields) => {
                        if (Uerror) throw Uerror;
                        connection.query('select name,issuedby,issuedon,returnby,fine from books where issuedon is not null;',
                            (Error, Results, Fields) => {
                                if (Error) throw Error;
                                for(let i=0;i<Results.length;i++){
                                    let Difference_In_Time = new Date() - Results[i].returnby;
                                    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
                                    Difference_In_Days = Math.round(Difference_In_Days);
                                    if(Difference_In_Days<=0){
                                        Results[i].fine = 0;
                                    }else{
                                        Results[i].fine = Difference_In_Days;
                                    }
                                    Results[i].issuedon = formatDate(Results[i].issuedon);
                                    Results[i].returnby = formatDate(Results[i].returnby);
                                }
                                res.render('admin', { title: 'Data', tableData: results, userData: Uresults, issueData: Results });
                            })
                    });
            });
    } else if (req.session.loggedIn) {
        connection.query('select name,count(name) as count from books where (issuedby!="'+req.session.email+'" and issuereq is NULL) or (issuedby is null and issuereq is null) group by name order by name;',
            (error, results, fields) => {
                if (error) throw error;
                connection.query('select * from books where issuedby = "'+req.session.email+'";',
                    (Uerror, Uresults, Ufields) => {
                        if (Uerror) throw Uerror;
                        for(let i=0;i<Uresults.length;i++){
                            let Difference_In_Time = new Date() - Uresults[i].returnby;
                            var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
                            Difference_In_Days = Math.round(Difference_In_Days);
                            if(Difference_In_Days<=0){
                                Uresults[i].fine = 0;
                            }else{
                                Uresults[i].fine = Difference_In_Days;
                            }
                        }
                        res.render('dashboard', { title: 'Data', tableData: results, userData: Uresults });
                    });
            });
        
    } else {
        res.redirect('/');
    }
});

router.post('/dashboard', (req, res, next) => {
    const { v4: uuidv4 } = require('uuid');
    var uuid = uuidv4();
    connection.query('insert into books (uuid, name) values ("'+
    uuid + '","' +
    req.body.bookname + '");',
    (error, results, fields) => {
        if(error) throw error;
    }
    );
    res.redirect('/dashboard');
});

router.post('/checkout', (req, res) => {
    connection.query('select uuid from books where name= "'+req.body.book+'" and issuereq is null and issuedby is null;',
            (error, results, fields) => {
                if (error) throw error;
                connection.query('update books set issuereq="'+req.session.email+'" where uuid= "'+results[0].uuid+'";',
                    (Uerror, Uresults, Ufields) => {
                        if (Uerror) throw Uerror;
                    });
            });
    res.redirect('/dashboard');
});

router.post('/accept', (req, res) => {
    connection.query('select uuid from books where name="'+req.body.book+'" and issuereq="'+req.body.name+'";',
            (error, results, fields) => {
                if (error) throw error;
                connection.query('update books set issuereq=null,issuedby="'+req.body.name+'",issuedon="'+getDateTime()+'",returnby="'+getReturnDateTime()+'" where uuid="'+results[0].uuid+'";',
                (Error, Results, Fields) => {
                    if (Error) throw Error;
                });
            });
    res.redirect('/dashboard');
});

router.post('/decline', (req, res) => {
    connection.query('select uuid from books where name="'+req.body.book+'" and issuereq="'+req.body.name+'";',
            (error, results, fields) => {
                if (error) throw error;
                connection.query('update books set issuereq=null where uuid="'+results[0].uuid+'";',
                (Error, Results, Fields) => {
                    if (Error) throw Error;
                });
            });
    res.redirect('/dashboard');
});

router.post('/return', (req, res) => {
    connection.query('update books set issuedby=null,issuedon=null,returnby=null where uuid="'+req.body.uuid+'";',
            (error, results, fields) => {
                if (error) throw error;
            });
    res.redirect('/dashboard');
});

router.post('/logout', (req, res) => {
    req.session.destroy(function(err) {
        res.redirect('/')
      })
});

function getDateTime() {
    var now     = new Date(); 
    var year    = now.getFullYear();
    var month   = now.getMonth()+1; 
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
    if(month.toString().length == 1) {
         month = '0'+month;
    }
    if(day.toString().length == 1) {
         day = '0'+day;
    }   
    if(hour.toString().length == 1) {
         hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
         minute = '0'+minute;
    }
    if(second.toString().length == 1) {
         second = '0'+second;
    }   
    var dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;   
     return dateTime;
}

function getReturnDateTime() {
    var now     = new Date(); 
    now.setDate(now.getDate() + 14);
    var year    = now.getFullYear();
    var month   = now.getMonth()+1; 
    var day     = now.getDate();
    var hour    = now.getHours();
    var minute  = now.getMinutes();
    var second  = now.getSeconds(); 
    if(month.toString().length == 1) {
         month = '0'+month;
    }
    if(day.toString().length == 1) {
         day = '0'+day;
    }   
    if(hour.toString().length == 1) {
         hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
         minute = '0'+minute;
    }
    if(second.toString().length == 1) {
         second = '0'+second;
    }   
    var dateTime = year+'/'+month+'/'+day+' '+hour+':'+minute+':'+second;   
     return dateTime;
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [day, month, year].join('-');
}

module.exports = router;