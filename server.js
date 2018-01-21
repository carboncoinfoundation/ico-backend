var express = require('express');  
var app = express(); 
var bodyParser = require('body-parser');
var $ = require('jquery');


// var api = require('etherscan-api').init('K2JMIK8PSP47I1BAGDDT6MGXMS4EHW15MH');

// // var balance = api.account.balance('0x1bdB66311cC87966a31a2b6B8459cb704444F325');//'0xDAE0f24b37B36A9Fd2398d396551EC524e284ae7');
 
// https://api.etherscan.io/api?module=contract&action=getabi&address=0x47f92ebf4881359469bceffe1f753fe910701024&apikey=K2JMIK8PSP47I1BAGDDT6MGXMS4EHW15MH

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var request = require('request');

var nccTokens;
var classicTokensInAccount = request('https://gastracker.io/token/0x085fb4f24031EAedbC2B611AA528f22343eB52Db/0x085fb4f24031EAedbC2B611AA528f22343eB52Db', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    const dom = new JSDOM(body);
    const untrimmedContent = dom.window.document.querySelectorAll("dd")[2].textContent;
    const trimedContent = untrimmedContent.replace(/ /g,'');
    const number = trimedContent.replace(/BEC/, ''); // bad because we may have to change? Nahh 
    // const number2 = trimedContent.match(/(\d+)/); // would be better but is not working
    nccTokens = parseInt(number);
    console.log("Tokens: " +nccTokens); 
} else{
      console.log(error);
  }
})

var etherClassic;
var etherInContract = new Promise((resolve, reject)=> { request('http://gastracker.io/addr/0x085fb4f24031eaedbc2b611aa528f22343eb52db', function (error, response, body2) {
    if (!error && response.statusCode == 200) {
      const dom2 = new JSDOM(body2);
      const untrimmedContent2 = dom2.window.document.querySelectorAll("dd")[2].textContent;
      const trimedContent2 = untrimmedContent2.replace(/ /g,'');
      const number2 = trimedContent2.replace(/Ether/, ''); // bad because we may have to change? Nahh 
    //   const number2 = trimedContent2.match(/(\d+)/); // would be better but is not working
      var etherClassic = parseInt(number2);
      console.log('Contract Ether: ' + etherClassic); 
  } else{
        console.log(error);
    }
  })});

//FOR ETHEREUM CONTRACT

//Tokens in a contract
//https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=0x47f92ebf4881359469bceffe1f753fe910701024&apikey=K2JMIK8PSP47I1BAGDDT6MGXMS4EHW15MH

//CCE token 
//https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x47f92ebf4881359469bceffe1f753fe910701024&address=0xDAE0f24b37B36A9Fd2398d396551EC524e284ae7&tag=latest&apikey=K2JMIK8PSP47I1BAGDDT6MGXMS4EHW15MH

var ncchTokens;
var ethereumData = request('https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x47f92ebf4881359469bceffe1f753fe910701024&address=0xDAE0f24b37B36A9Fd2398d396551EC524e284ae7&tag=latest&apikey=K2JMIK8PSP47I1BAGDDT6MGXMS4EHW15MH', function (error, response, body) {
    if (!error && response.statusCode == 200) {
        jsonData = JSON.parse(body);
        ncchTokens = jsonData['result'];
      console.log("NCCh in account:" + ncchTokens); 
    } else{
        console.log(error);
    }
  });

  var data = {
      "ETC_contract": etherClassic,
      "NCC_tokens_left": nccTokens,
      "NCCh_tokens_left": ncchTokens
  };
  console.log(data);

// now working out.. 
// we need - number of tokens sold ETC and ETH
// NOTE: is going to be very hard to do number of people
// need the below file to be written in a promise

var fs = require('fs');
etherInContract.then(fs.writeFile("./data.json", JSON.stringify(data), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
})); 


// var contractAbi = api.contract.getabi('0xb7244E49b4b64644DC781e9eA298d0b608F9715F')

// contractAbi.then(function(contractData){
//     console.log(contractData);
//   //   console.log("Token Balance = " + tokenBalance); 
//   })



// balance.then(function(balanceData){
//   console.log(balanceData);
// //   console.log("Token Balance = " + tokenBalance); 
// });
// var tokenBalance = api.account.tokenbalance('0xDAE0f24b37B36A9Fd2398d396551EC524e284ae7', 'CCE', '0x47f92ebf4881359469bceffe1f753fe910701024');
// tokenBalance.then(function(tokenBalanceData){
//     console.log(tokenBalanceData)
// });


//   .catch(e => {console.log(e)});





app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;       

var apiRoutes = express.Router();

// middleware
apiRoutes.use(function(req, res, next) {
    console.log("I'm up and running");
    next();
});

// testiranje rute (GET http://localhost:8080/api)
apiRoutes.get('/', function(req, res) {
    //ako je sve ispravno postavljeno kao odgovor ćemo dobiti ovu poruku
    res.json({ message: 'API is working!' });   
});

//We don't need post
// apiRoutes.post('/dodajkorisnika', function (req, res, next) {
// })

apiRoutes.get('/retrieveparticipants', function(req, res,next){
    //etherscan account carboncoin-dev, carboncoiner

});

// apiRoutes.put('/korisnik/:k_id', function(req, res, next){
// });

// apiRoutes.delete('/korisnik/:k_id', function(req, res, next){
// });

// sve rute sadržavati će /api
app.use('/api', apiRoutes);

// pokretanje API-ja
app.listen(port);
console.log('API is ready at port:' + ' ' + port);
