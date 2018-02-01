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

icoRoutes.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//(GET http://localhost:8080/ico)
icoRoutes.get('/get-token-data', function(req, res) {

  // Display the balances to all users
  balanceCheker.then((value) => {
      res.json(value);
  });

});

icoRoutes.get('/get-contract-addresses', function(req, res) {

  // Only display contract addresses to people who accept the terms
  if (req.cookies[acceptance_cookie]) {

    res.json({
      'NCC_Contract': process.env.CLASSIC_CONTRACT,
      'NCCh_Contract': process.env.ETHER_CONTRACT,
    });

  } else {
    res.status(401).send('Please accept ICO terms to proceed');
  }
});

icoRoutes.get('/set-acceptance-cookie', function(req, res) {
  res.cookie(acceptance_cookie , 'true').send('Terms accepted');
})

app.use('/ico', icoRoutes);

app.listen(port);

console.log('API is ready at port:' + ' ' + port);
