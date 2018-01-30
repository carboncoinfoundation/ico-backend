var express = require('express');  
var app = express(); 
var bodyParser = require('body-parser');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var request = require('request');
var async = require('async');
var fs = require('fs');
var moment = require('moment');

// TODO: Put in correct Contract addresses
//     for EtherClassic
//     for Ethereum 

// This is playing with the contract api - havent quite got it yet
// var Web3 = require('web3');
// var web3 = new Web3(new Web3.providers.HttpProvider());
// var version = web3.version.api;

// var ethData = web3.eth.getBalance('0x1ba0d3ddb07a2893efd55c865848ce42b6d502b1');
// console.log(ethData);

// var ethereumInContract = request('http://api.etherscan.io/api?module=contract&action=getabi&address=0x1ba0d3ddb07a2893efd55c865848ce42b6d502b1', function(error, response, body) {
//     if (!error && response.statusCode == 200) {
//         console.log("we have data");
//         var constractAbi = "";
//         var ethData = JSON.parse(body);
//         constractAbi = ethData.result;
//         if(constractAbi != ''){
//             var Contract = web3.eth.contract(constractAbi);
//             ethData = Contract.eth.getBalance('0x1ba0d3ddb07a2893efd55c865848ce42b6d502b1');
//             console.log(ethData);
//             // var myContractInstance = Contract.at("0x24284b65c843258d0f7b305dc9d083301e5fb41c0fa9fcf0527b201ddf66e316");
//             // var result = myContractInstance.memberId("0x8962cd4a9023aafe7a4ffcde97ea144accda2557");
//             // console.log(result);            
//         }
//     }
// });


var updateJson = new Promise( (resolve, reject) => {
    var data = {
        "ETC_contract": null,
        "NCC_tokens_left": null,
        "ETH_contract": null,        
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

    // As a back up I think we need to do a scrape for the Ethreum as well 
    // CCE Contract adress: 0x47f92ebf4881359469bceffe1f753fe910701024
    // Etherscan contract page https://etherscan.io/address/0x1ba0d3ddb07a2893efd55c865848ce42b6d502b1#code

    //written offline - need to test!
    var ethereum;
    var ethereumInContract = new Promise((resolve, reject)=> { request('https://etherscan.io/address/0x47f92ebf4881359469bceffe1f753fe910701024', function (error, response, body2) {
        if (!error && response.statusCode == 200) {
        const etherDom = new JSDOM(body2);
        const untrimmedContent2 = etherDom.window.document.querySelectorAll("td")[3].textContent;
        const trimedContent2 = untrimmedContent2.replace(/ /g,'');
        const number2 = trimedContent2.replace(/$/, '');
        //   const number2 = trimedContent2.match(/(\d+)/); // would be better but is not working
        var etherClassic = parseInt(number2);
        console.log('Contract Ethereum: ' + ethereum); 
        data["ETH_contract"] = ethereum;
        resolve(ethereum);      
    } else{
            console.log(error);
        }
    })
    });

    var data = {
        "ETC_contract": etherClassic,
        "NCC_tokens_left": nccTokens,
        "ETH_contract": ethereum,        
        "NCCh_tokens_left": ncchTokens
    };  

    // now working out.. 
    // we need - number of tokens sold ETC and ETH
    // NOTE: is going to be very hard to do number of people
    // need the below file to be written in a promise

    // when(data["ETC_contract"] != null && data["NCC_tokens_left"] != null && data["NCCh_tokens_left"] != null).then(function(){

    Promise.all([ethereumData, ethereumInContract, etherInContract, classicTokensInAccount]).then(function(value){
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

//need to test this again - written offline!
var readInJson = new Promise((resolve, reject) => {
    fs.readFile("./data.json", 'utf8', (error,  data) => {
        if (error) throw error;
        data = JSON.parse(data);
        resolve(data);
    });    
});

// Used to test
// readInJson.then((value) => {
//     console.log(value);
// });


//This is trying to scrape the Ethereum Contract as a back up. Also not quite working unfortunately
// var ethereum;
// var ethereumInContract = request('https://etherscan.io/address/0x1ba0d3ddb07a2893efd55c865848ce42b6d502b1', function (error, response, body3) {
// console.log("I'm doing something");    

// if (!error && response.statusCode == 200) {
//     const etherDom = new JSDOM(body3);
//     console.log(etherDom);
//     const untrimmedContent2 = etherDom.window.document.querySelectorAll("td");//[3].textContent;
//     console.log(untrimmedContent2);
//     const trimedContent2 = untrimmedContent2.replace(/ /g,'');
//     const number2 = trimedContent2.replace(/$/, '');
//     //   const number2 = trimedContent2.match(/(\d+)/); // would be better but is not working
//     var ethereum = parseInt(number2);
//     // console.log('Contract Ethereum: ' + ethereum); 
//     // data["ETH_contract"] = ethereum;
//     return ethereum;      
// } else{
//         console.log(error);
//     }
// })
// // });


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
    readInJson.then((data)=> {
        const fiveMinsAgo = moment().unix() - 5*60;
        if(data.timeStamp < fiveMinsAgo){ //wants to be smalller <
            console.log("Json updating");            
            updateJson.then((data) =>{res.json({ data })});
            return data
        } else {
            res.json({ data });  
            return data;
        }
    })
});

//Post for changing the value of Ether Chris has taken out
// Chris needs to post the total number that he has taken out to date? 
// Or the number he takes out each time?
apiRoutes.post('/ETHTakenOut', function (req, res, next) {
    console.log(JSON.stringify(req.body.takenOut));
    let takenOut = parseInt(JSON.stringify(req.body.takenOut));
    if(typeof takenOut === 'number'){
        console.log("i'm in here is a number");
        readInJson.then((data)=>{
            data["ETH_out"] = takenOut;
            console.log('writing data');
            fs.writeFile("./data.json", JSON.stringify(data), function(err) {
                if(err) {
                    return console.log(err);
                }
                res.json({ data });
                console.log("Eth taken out was updated to ", takenOut);
            });
        });
    } else {
        res.json({ "answer" : "I need to be passed a number" });
    }
});

// apiRoutes.post('/ETCTakenOut', function (req, res, next) {
//     console.log(req.body); 
//     if(typeof(req.body.number) == int ){
//         readInJson.then((data)=>{
//             data["ETC_out"] = req.body;
//             fs.writeFile("./data.json", JSON.stringify(data), function(err) {
//                 if(err) {
//                     return console.log(err);
//                 }
//                 console.log("ETC taken out was updated to ", req.body);
//             });
//         });
//     }
// })



apiRoutes.get('/retrieveparticipants', function(req, res,next){

});

// apiRoutes.put('/put/:k_id', function(req, res, next){
// });

// apiRoutes.delete('/delete/:k_id', function(req, res, next){
// });

app.use('/api', apiRoutes);

app.listen(port);
console.log('API is ready at port:' + ' ' + port);
