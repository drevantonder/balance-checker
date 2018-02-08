const axios = require('axios');
const Vue = require("./node_modules/vue/dist/vue.js");

var balanceChecker = new Vue({
  el: '#balance-checker',
  data: {
    currency: "AUD", //TODO: add setting where user can set this
    exchangeRate: 0,

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

    updatePools: function () {
      this.pools.forEach(function(pool){
        this.getPoolData(pool);
      }.bind(this));
    },

    getPoolData: function(pool){
      var apiURL = pool.API.replace("WALLET_ADDRESS","1AvyuTeXNVqu1wJoGBYQwGkZbGJZtSs22E") //TODO: get the WALLET_ADDRESS from the input
      axios.get(apiURL)
        .then(function (response) {
          pool.unpaidBalance = (response.data.total_unpaid || response.data.unpaid);
          pool.unpaidBalanceWorth = this.calculateWorth(pool.unpaidBalance);
        }.bind(this))
        .catch(function(error) { // on fail log error try again
          console.log("pool:",pool.name,"failed:",error)
          this.getPoolData(pool);
        }.bind(this));
    }

    calculateWorth: function(cryptocurrencyAmount){
      return (cryptocurrencyAmount * this.exchangeRate).toFixed(2);
    },
  },

  mounted: function () {
    this.setExchangeRate();
    this.updatePools();

    setInterval(function () {
      this.updatePools();
    }.bind(this), 30000);
  }

});
