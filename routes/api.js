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

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
mongoose.connect(CONNECTION_STRING, {useNewUrlParser: true});
var db = mongoose.connection;
db.once('open', function(){console.log('Connected to Database')});
const Stock = mongoose.model('Stock', {stock: String,
                                      price: String,
                                      likes: Number});
module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      var stockName = req.query.stock
      console.log(stockName);
    if(stockName.isArray()){
      res.json({wait: 'route in progress'})
    } else {
      Stock.documentCount({ stock: stockName}, function(err, count){
        if (err) return res.json({error: 'error in documentCount'});
        if (count > 1)
        
      })
    }
      
    });
    
};
