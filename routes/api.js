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
const Stock = mongoose.model('Stock', {stock: String,
                                      price: String,
                                      likes: Number});
module.exports = function (app) {
  
  app.route('/api/stock-prices')
    .get(function (req, res){
      function getStock(stockName, like){
        Stock.countDocuments({ stock: stockName }, async function(err, count){
        if (err) return console.log('error in count');
        if (count > 0) {
          Stock.findOne({stock: stockName}, async function(err, data){
            if (err) return console.log('error in findOne');
            let url = 'https://repeated-alpaca.glitch.me/v1/stock/' + stockName + '/quote';
            let response = await fetch(url);
            let raw = await response.json();
            data.price = raw.latestPrice;
            like == true ? data.likes++ : null;
            data.save().then(function(data){
            let obj = {stockData: {stock: data.stock, price: data.price, likes: data.likes}};
            return obj;})
            
          })
        } else if (count == 0) {
          let url = 'https://repeated-alpaca.glitch.me/v1/stock/' + stockName + '/quote';
          let response = await fetch(url);
          let raw = await response.json();
          var price = raw.latestPrice;
          var likes = 0;
          like == true ? likes++ : null;
          Stock.create({stock: stockName,
                       price: price,
                       likes: likes}, function(err, data){
            if (err) return console.log('error saving doc');
            let obj = {stockData: {stock: data.stock, price: data.price, likes: data.likes}};
            return obj;
          })
        }
      })
  };
    
    
      var stockName = req.query.stock;
      var like = req.query.like;
      console.log(stockName);
    
    if(Array.isArray(stockName)){
      
      res.json({wait: 'route in progress'})
    } else {
      
      console.log(getStock(stockName, like));
    }
      
    });
    
};
