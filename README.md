# Carboncoin ICO Backend

1. Scrapes ETC in contact from gastracker.io
1. Scrapes Tokens in an Account from gastracker.io
1. Pulls Tokens in an account from etherscan api

It saves all this data a json file, which it pulls out on demand. This json file gets updates if a request is made when the fileis more than 5mins old.

TODO: 
- Admin/accounting panel
- Deploy/verify Ethereum Contract so it is accessible via API

Maybe I need to do the scrape for the Ethereum Contract as well..

# How to use it?

* Download this repo.
* Run `npm install` command inside project folder.
* Run `npm start` in CMD.
