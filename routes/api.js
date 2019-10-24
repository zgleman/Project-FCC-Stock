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
      var stockName = req.query.stock
      console.log(stockName);
    if(Array.isArray(stockName)){
      
      res.json({wait: 'route in progress'})
    } else {
      Stock.countDocuments({ stock: stockName }, async function(err, count){
        if (err) return console.log('error in count');
        if (count > 0) {
          Stock.findOne({stock: stockName}, async function(err, data){
            if (err) return console.log('error in findOne');
            let url = 'https://repeated-alpaca.glitch.me/v1/stock/' + stockName + '/quote';
            let response = await fetch(url);
            let raw = await response.json();
            data.price = raw.latestPrice;
            req.query.like == true ? data.likes++ : null;
            data.save().then(
            res.json({stockData: {stock: data.stock, price: data.price, likes: data.likes}}))
            
          })
        } else if (count == 0) {
          let url = 'https://repeated-alpaca.glitch.me/v1/stock/' + stockName + '/quote';
          let response = await fetch(url);
          let raw = await response.json();
          var price = raw.latestPrice;
          var likes = 0;
          req.query.like == true ? likes++ : null;
          Stock.create({stock: stockName,
                       price: price,
                       likes: likes}, function(err, data){
            if (err) return console.log('error saving doc');
            res.json({stockData: {stock: data.stock, price: data.price, likes: data.likes}});
          })
        }
        
      })
    }
      
    });
    
};
