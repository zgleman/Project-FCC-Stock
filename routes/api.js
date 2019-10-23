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
const https = require('https');

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
    if(Array.isArray(stockName)){
      res.json({wait: 'route in progress'})
    } else {
      Stock.countDocuments({ stock: stockName }, function(err, count){
        if (err) return console.log('error in count');
        if (count > 0) {
          Stock.findOne({stock: stockName}, function(err, data){
            if (err) return console.log('error in findOne');
            data.price = "https://finance.google.com/finance/info?q=NASDAQ%3a" + stockName.toUpperCase();
            req.query.like == true ? data.likes++ : null;
            data.save().then(
            res.json({stockData: {stock: data.stock, price: data.price, likes: data.likes}}))
          })
        } else if (count == 0) {
          var price = https.get("https://finance.google.com/finance/info?q=NASDAQ%3a" + stockName.toUpperCase(), (resp) => {
              let data = '';

              resp.on('data', (chunk) => {
                data += chunk;
              });

  
             resp.on('end', () => {
             return JSON.parse(data).explanation;
             });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});
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