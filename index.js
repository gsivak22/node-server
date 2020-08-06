//use path module
const path = require('path');
//use express module
const express = require('express');
//use hbs view engine
const hbs = require('hbs');
//use bodyParser middleware
const bodyParser = require('body-parser');
//use mysql database
const mysql = require('mysql');
const { log } = require('console');
const app = express();
 
//Create connection
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'crud_db'
});
 
//connect to database
conn.connect((err) =>{
  if(err) throw err;
  console.log('Mysql Connected...');
});
 
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// //set views file
// app.set('views',path.join(__dirname,'views'));
// //set view engine
// app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//set public folder as static folder for static file
// app.use('/assets',express.static(__dirname + '/public'));
 
//route for homepage
app.get('/',(req, res) => {
  let sql = "SELECT * FROM product";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.json({ value: {results:'sucess'} })
    // res.render('product_view',{
    //   results: results
    // });
  });
});
 
//get data with filter
app.post('/search',(req, res) => {
    // let body = JSON.parse(req.body);
    console.log(req.body,'My request body');
    let sql = "SELECT * FROM product";
    if(req.body.filter && req.body.filter.filters.length > 0){
        req.body.filter.filters.forEach((element, i) => {
          if(i == 0){
            sql+=` WHERE ${element.field} LIKE '%${element.value}%'`;
          }{
            sql+=` AND ${element.field} LIKE '%${element.value}%'`;
          }
        });
    }

    if(req.body.sort && req.body.sort.length > 0) {
      req.body.sort.forEach((element, i) => {
        if(i == 0){
          sql+=` ORDER BY ${element.field} ${element.dir}`;
        }{
          sql+=`, ${element.field} ${element.dir}`;
        }
      });
    }
    
    console.log(sql,'New Query');
    let query = conn.query(sql, (err, results) => {
      if(err) throw err;
      let data = [], length = results.length;
      if(req.body.numOfRows && req.body.numOfRows !== 0 ){
        if(req.body.startAt && req.body.startAt !== 0 ){
            results.forEach((e,i)=>{
                if(req.body.startAt <= i && i < req.body.startAt+req.body.numOfRows){
                    data.push(e)
                }
            })
        }else {
            results.forEach((e,i)=>{
                if(i < req.body.numOfRows){
                    data.push(e);
                }
            });
        }
        
      }
      console.log(results.length,'Results');
      console.log(results.length,'Results');

      res.json({ value: data, total: length })
    });
  });
 
//get data with filter
app.post('/product_export',(req, res) => {
  // let body = JSON.parse(req.body);
  console.log(req.body,'My request body');
  let sql = "SELECT * FROM product";
  if(req.body.filter && req.body.filter.filters.length > 0){
      req.body.filter.filters.forEach((element, i) => {
        if(i == 0){
          sql+=` WHERE ${element.field} LIKE '%${element.value}%'`;
        }{
          sql+=` AND ${element.field} LIKE '%${element.value}%'`;
        }
      });
  }

  if(req.body.sort && req.body.sort.length > 0) {
    req.body.sort.forEach((element, i) => {
      if(i == 0){
        sql+=` ORDER BY ${element.field} ${element.dir}`;
      }{
        sql+=`, ${element.field} ${element.dir}`;
      }
    });
  }
  
  console.log(sql,'New Query');
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.json({ data: results })
  });
});

//get data with filter
app.post('/orders', (req, res) => {
  let sql = "SELECT * FROM orders";
  if (req.body.filter && req.body.filter.filters.length > 0) {
    req.body.filter.filters.forEach((element,i) => {
      if(i == 0){
        sql+=` WHERE ${element.field} LIKE '%${element.value}%'`;
      }{
        sql+=` AND ${element.field} LIKE '%${element.value}%'`;
      }
    });
  }

  if(req.body.sort && req.body.sort.length > 0) {
    req.body.sort.forEach((element, i) => {
      if(i == 0){
        sql+=` ORDER BY ${element.field} ${element.dir}`;
      }{
        sql+=`, ${element.field} ${element.dir}`;
      }
    });
  }

  console.log(sql,'New Query');

  let query = conn.query(sql, (err, results) => {
    if (err) throw err;
    let data = [], length = results.length;
    if (req.body.numOfRows && req.body.numOfRows !== 0) {
      if (req.body.startAt && req.body.startAt !== 0) {
        results.forEach((e, i) => {
          if (req.body.startAt <= i && i < req.body.startAt + req.body.numOfRows) {
            data.push(e)
          }
        })
      } else {
        results.forEach((e, i) => {
          if (i < req.body.numOfRows) {
            data.push(e);
          }
        });
      }

    }
    res.json({ value: data, total: length })
  });
});

  
//route for insert data
app.post('/save',(req, res) => {
  let data = {product_name: req.body.product_name, product_price: req.body.product_price};
  let sql = "INSERT INTO product SET ?";
  let query = conn.query(sql, data,(err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
});
 
//route for update data
app.post('/update',(req, res) => {
  let sql = "UPDATE product SET product_name='"+req.body.product_name+"', product_price='"+req.body.product_price+"' WHERE product_id="+req.body.id;
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
    res.redirect('/');
  });
});
 
//route for delete data
app.post('/delete',(req, res) => {
  let sql = "DELETE FROM product WHERE product_id="+req.body.product_id+"";
  let query = conn.query(sql, (err, results) => {
    if(err) throw err;
      res.redirect('/');
  });
});
 



//server listening
app.listen(8000, () => {
  console.log('Server is running at port 8000');
});