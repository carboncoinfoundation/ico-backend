var express = require('express');  
var app = express(); 
var bodyParser = require('body-parser');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var request = require('request');
var async = require('async');
var fs = require('fs');
var moment = require('moment');


var updateJson = new Promise( (resolve, reject) => {
    var data = {
        "ETC_contract": null,
        "NCC_tokens_left": null,
        "NCCh_tokens_left": null
    };

    var nccTokens;
    var classicTokensInAccount = new Promise((resolve, reject)=> { request('https://gastracker.io/token/0x085fb4f24031EAedbC2B611AA528f22343eB52Db/0x085fb4f24031EAedbC2B611AA528f22343eB52Db', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const dom = new JSDOM(body);
            const untrimmedContent = dom.window.document.querySelectorAll("dd")[2].textContent;
            const trimedContent = untrimmedContent.replace(/ /g,'');
            const number = trimedContent.replace(/BEC/, ''); // bad because we may have to change? Nahh 
            // const number2 = trimedContent.match(/(\d+)/); // would be better but is not working
            nccTokens = parseInt(number);
            console.log("Tokens: " +nccTokens); 
            data["NCC_tokens_left"] = nccTokens;
            resolve(nccTokens);
        } else{
            console.log(error);
        }
    })
    });

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
        data["ETC_contract"] = etherClassic;
        resolve(etherClassic);      
    } else{
            console.log(error);
        }
    })
    });

    //FOR ETHEREUM CONTRACT

    //Tokens in a contract
    //https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=0x47f92ebf4881359469bceffe1f753fe910701024&apikey=K2JMIK8PSP47I1BAGDDT6MGXMS4EHW15MH

    //CCE token 
    //https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x47f92ebf4881359469bceffe1f753fe910701024&address=0xDAE0f24b37B36A9Fd2398d396551EC524e284ae7&tag=latest&apikey=K2JMIK8PSP47I1BAGDDT6MGXMS4EHW15MH

    var ncchTokens;

    var ethereumData = new Promise((resolve, reject)=> { request('https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x47f92ebf4881359469bceffe1f753fe910701024&address=0xDAE0f24b37B36A9Fd2398d396551EC524e284ae7&tag=latest&apikey=K2JMIK8PSP47I1BAGDDT6MGXMS4EHW15MH', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            jsonData = JSON.parse(body);
            ncchTokens = jsonData['result'];
        console.log("NCCh in account:" + ncchTokens); 
        } else{
            console.log(error);
        }
        data["NCCh_tokens_left"] = ncchTokens;
        resolve(ncchTokens);    
    })
    });


    console.log(data);

    var data = {
        "ETC_contract": etherClassic,
        "NCC_tokens_left": nccTokens,
        "NCCh_tokens_left": ncchTokens
    };  

    // now working out.. 
    // we need - number of tokens sold ETC and ETH
    // NOTE: is going to be very hard to do number of people
    // need the below file to be written in a promise

    // when(data["ETC_contract"] != null && data["NCC_tokens_left"] != null && data["NCCh_tokens_left"] != null).then(function(){
    // Promise.all([ethereumData , etherInContract , classicTokensInAccount], function(values){ 

    etherInContract.then(function(value){ //this works but is not ideal
        console.log("we're in ");
        data["timeStamp"] = moment().unix();
        console.log(data["timeStamp"]);
        fs.writeFile("./data.json", JSON.stringify(data), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("Values " + value);
            console.log("The file was saved!");
            resolve(data);
            return data;
        })
    });
});


var readInJson = new Promise((resolve, reject) => {
    fs.readFile("./data.json", 'utf8', (error,  data) => {
        if (error) throw error;
        data = JSON.parse(data);
        // console.log(data);  
        const fiveMinsAgo = moment().unix() - 5*60;
        // console.log(fiveMinsAgo);
        if(data.timeStamp < fiveMinsAgo){
            updateJson();
            console.log("Json updating");
        } else {
            return resolve(data);
        }
    });    
});

readInJson.then((value) => {
    console.log(value);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var port = process.env.PORT || 8080;       
var apiRoutes = express.Router();

// middleware
apiRoutes.use(function(req, res, next) {
    console.log("I'm up and running");
    next();
});

//(GET http://localhost:8080/api)
apiRoutes.get('/getTokenData', function(req, res) {
    data = readInJson();
    res.json({ message: 'API is working!' });   
});

//We don't need post
// apiRoutes.post('/dodajkorisnika', function (req, res, next) {
// })

apiRoutes.get('/retrieveparticipants', function(req, res,next){

});

// apiRoutes.put('/korisnik/:k_id', function(req, res, next){
// });

// apiRoutes.delete('/korisnik/:k_id', function(req, res, next){
// });

app.use('/api', apiRoutes);

app.listen(port);
console.log('API is ready at port:' + ' ' + port);
