var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var balanceCheker = require('./balance-checker');
var acceptance_cookie = 'CarboncoinICOTerms_accepted';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var icoRoutes = express.Router();
icoRoutes.use(cookieParser());

//(GET http://localhost:8080/ico)
icoRoutes.get('/get-token-data', function(req, res) {
  if (req.cookies[acceptance_cookie]) {
    balanceCheker.then((value) => {
        res.json(value);
    });
  } else {
    return res.send(401, 'Please accept ICO terms to proceed');
  }
});

icoRoutes.get('/set-acceptance-cookie', function(req, res) {
  res.cookie(acceptance_cookie , 'true').send('Terms accepted');
})

app.use('/ico', icoRoutes);

app.listen(port);

console.log('API is ready at port:' + ' ' + port);
