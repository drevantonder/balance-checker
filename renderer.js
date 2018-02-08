const axios = require('axios');
const Vue = require("./node_modules/vue/dist/vue.js");

const walletRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;

var balanceChecker = new Vue({
  el: '#balance-checker',
  data: {
    currency: "AUD", //TODO: add setting where user can set this
    exchangeRate: 0,
    walletAddress: "1AvyuTeXNVqu1wJoGBYQwGkZbGJZtSs22E",
    canUpdate: false,

    pools: [ //TODO: add setting where user can set this
      {"name":"aHashPool",   "API":"http://www.ahashpool.com/api/wallet?address=WALLET_ADDRESS",    "unpaidBalance": 0,"unpaidBalanceWorth": 0},
      {"name":"HashRefinery","API":"http://pool.hashrefinery.com/api/wallet?address=WALLET_ADDRESS","unpaidBalance": 0,"unpaidBalanceWorth": 0},
      {"name":"ZPool",       "API":"http://www.zpool.ca/api/wallet?address=WALLET_ADDRESS",         "unpaidBalance": 0,"unpaidBalanceWorth": 0}],
  },
  methods: {
    setExchangeRate: function(){
      axios.get('https://blockchain.info/ticker') //TODO: add setting where user can set the bitcoin exchange rate provider
        .then(function (response) {
          this.exchangeRate = response.data[this.currency]["15m"];
          console.log("Exchange Rate:",this.exchangeRate);
        }.bind(this));
    },

    validateWalletAddress: function(){
      if (walletRegex.test(this.walletAddress)){
        this.canUpdate = true;
        this.updatePools();
      }
    },

    updatePools: function () {
      if(this.canUpdate){
        this.pools.forEach(function(pool){
          this.getPoolData(pool);
        }.bind(this));
      }

    },

    getPoolData: function(pool){
      var apiURL = pool.API.replace("WALLET_ADDRESS",this.walletAddress)
      axios.get(apiURL)
        .then(function (response) {
          pool.unpaidBalance = (response.data.total_unpaid || response.data.unpaid);
          pool.unpaidBalanceWorth = this.calculateWorth(pool.unpaidBalance);
        }.bind(this))
        .catch(function(error) {
          setTimeout(function(){ this.getPoolData(pool); }.bind(this), 200);
        }.bind(this));
    },

    calculateWorth: function(cryptocurrencyAmount){
      return (cryptocurrencyAmount * this.exchangeRate).toFixed(2);
    }
  },

  mounted: function () {
    this.setExchangeRate();
    this.validateWalletAddress();
    this.updatePools();

    setInterval(function () {
      this.updatePools();
    }.bind(this), 30000);
  }

});
