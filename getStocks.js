const mongoose=require('mongoose');
const fetch = require('node-fetch');

const Stock = mongoose.model('Stock', {stock: String,
                                      price: String,
                                      likes: Number});

let getStock = function(stockName, like){
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
            data.save(function (err, product){
              if (err) return (err);
              return product;
            })
            
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
            return {stockData: {stock: data.stock, price: data.price, likes: data.likes}};
          })
        }
        
      })
    
  };