const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var request = require('request');
var async = require('async');
var fs = require('fs');
var moment = require('moment');

require('dotenv').config();

var classicContractAddress = process.env.CLASSIC_CONTRACT;
var classicWalletAddress = process.env.CLASSIC_WALLET;
var classicTokenAddress = process.env.CLASSIC_TOKEN;
var ethereumContractAddress = process.env.ETHER_CONTRACT;
var ethereumWalletAddress = process.env.ETHER_WALLET;
var etherscanAPIKey = process.env.ETHERSCAN_KEY;

var updateJson = new Promise( (resolve, reject) => {
    var data = {};
    var takenOut = {
        "ETH_TAKEN_OUT":0,
        "ETC_TAKEN_OUT":0,  
    }

    //FOR ETHER CLASSIC CONTRACT

    var etherClassicInWallet = new Promise((resolve, reject)=> { request('http://gastracker.io/addr/'+classicWalletAddress, function (error, response, body2) {
        if (!error && response.statusCode == 200) {
            const dom = new JSDOM(body2);
            const untrimmedContent = dom.window.document.querySelectorAll("dd")[2].textContent;
            const trimmedContent = untrimmedContent.replace(/ /g,'');
            const number = trimmedContent.replace(/Ether/, ''); // bad because we may have to change? Nahh
            const etherClassic = parseFloat(number);
            console.log('Classic Wallet Ether: ' + etherClassic);
            resolve(etherClassic);
        } else{
            console.log(error);
        }
    })
    });

    //FOR ETHEREUM CONTRACT

    var ethereumInWallet = new Promise((resolve, reject)=> { request('https://etherscan.io/address/'+ethereumWalletAddress, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            const dom = new JSDOM(body);
            const untrimmedContent = dom.window.document.querySelectorAll("td")[1].textContent;
            const trimedContent = untrimmedContent.replace(/ /g,'');
            const number = trimedContent.replace(/Ether/, '');
            const etherBalance = parseFloat(number);
            console.log('Wallet Ethereum: ' + etherBalance);
            resolve(etherBalance);
        } else{
            console.log(error);
        }
    })
    });

    Promise.all([etherClassicInWallet, ethereumInWallet]).then(function(value){
        data["ETC_wallet"] = value[0] - takenOut.ETC_TAKEN_OUT;        
        data["ETH_wallet"] = value[1] - takenOut.ETH_TAKEN_OUT;
        data["timeStamp"] = moment().unix();
        fs.writeFile("./data.json", JSON.stringify(data), function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("data.json updated at : ", moment().format());
            resolve(data);
            return data;
        })
    });
});


var balanceChecker = new Promise((resolve, reject) => {
    fs.readFile("./data.json", 'utf8', (error,  data) => {
        if (error) throw error;
        data = JSON.parse(data);
        // console.log(data);
        const fiveMinsAgo = moment().unix() - 5*60;
        // console.log(fiveMinsAgo);
        if(data.timeStamp < fiveMinsAgo){
            console.log("Json updating");
            updateJson.then((value) =>{data = value; resolve(data)});
        } else {
            return resolve(data);
        }
    });
});

module.exports = balanceChecker;

// Below are old functions retrieveing data that we no longer need

// var nccTokens;
// var classicTokensInAccount = new Promise((resolve, reject)=> { request('https://gastracker.io/token/'+classicTokenAddress+'/'+classicTokenAddress, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//         const dom = new JSDOM(body);
//         const untrimmedContent = dom.window.document.querySelectorAll("dd")[2].textContent;
//         const trimedContent = untrimmedContent.replace(/ /g,'');
//         const number = trimedContent.replace(/BEC/, '');
//         // const number2 = trimedContent.match(/(\d+)/); // would be better but is not working
//         nccTokens = parseInt(number);
//         console.log("Tokens: " +nccTokens);
//         data["NCC_tokens_left"] = nccTokens;
//         resolve(nccTokens);
//     } else{
//         console.log(error);
//     }
// })
// });

// var etherClassic;
// var etherClassicInWallet = new Promise((resolve, reject)=> { request('http://gastracker.io/addr/'+classicWalletAddress, function (error, response, body2) {
//     if (!error && response.statusCode == 200) {
//     const dom2 = new JSDOM(body2);
//     const untrimmedContent2 = dom2.window.document.querySelectorAll("dd")[2].textContent;
//     const trimedContent2 = untrimmedContent2.replace(/ /g,'');
//     const number2 = trimedContent2.replace(/Ether/, ''); // bad because we may have to change? Nahh
//     //   const number2 = trimedContent2.match(/(\d+)/); // would be better but is not working
//     //var etherClassic = parseInt(number2);
//     console.log('Classic Wallet Ether: ' + number2);
//     data["ETC_wallet"] = number2;
//     resolve(number2);
// } else{
//         console.log(error);
//     }
// })
// });



// //Tokens in a contract
// //https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=0x47f92ebf4881359469bceffe1f753fe910701024&apikey=K2JMIK8PSP47I1BAGDDT6MGXMS4EHW15MH

// //CCE token
// //https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x47f92ebf4881359469bceffe1f753fe910701024&address=0xDAE0f24b37B36A9Fd2398d396551EC524e284ae7&tag=latest&apikey=K2JMIK8PSP47I1BAGDDT6MGXMS4EHW15MH

// var ncchTokens;
// var ethereumData = new Promise((resolve, reject)=> { request('https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress='+ ethereumContractAddress +'&address='+ethereumWalletAddress+'&tag=latest&apikey='+etherscanAPIKey, function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//         jsonData = JSON.parse(body);
//         ncchTokens = jsonData['result'];
//     console.log("NCCh in account:" + ncchTokens);
//     } else{
//         console.log(error);
//     }
//     data["NCCh_tokens_left"] = ncchTokens;
//     resolve(ncchTokens);
// })
// });