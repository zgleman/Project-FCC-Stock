/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
const mongoose=require('mongoose');
const fetch = require('node-fetch');

const CONNECTION_STRING = process.env.DB; 
mongoose.connect(CONNECTION_STRING, {useNewUrlParser: true});
var db = mongoose.connection;
db.once('open', function(){console.log('Connected to Database')});

module.exports = function (app) {
  
  app.route('/api/stock-prices')
    .get(function (req, res){
      var stockName = req.query.stock;
      var like = req.query.like;
      
    
    if(Array.isArray(stockName)){
      
      res.json({wait: 'route in progress'})
    } else {
      
      console.log(getStock(stockName, like));
    }
      
    });
    
};
