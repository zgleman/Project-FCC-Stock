/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb");
const mongoose = require("mongoose");
const fetch = require("node-fetch");

const CONNECTION_STRING = process.env.DB;
mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true });
var db = mongoose.connection;
db.once("open", function() {
  console.log("Connected to Database");
});
const Stock = mongoose.model("Stock", {
  stock: String,
  price: String,
  likes: Number,
  ip: [String]
});

module.exports = function(app) {
  app.route("/api/stock-prices").get(async function(req, res) {
    var stockName = req.query.stock;
    var like = req.query.like;
    var userIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log(userIp);
    if (Array.isArray(stockName)) {
      let url1 =
        "https://repeated-alpaca.glitch.me/v1/stock/" + stockName[0] + "/quote";
      let response1 = await fetch(url1);
      let raw1 = await response1.json();
      let url2 =
        "https://repeated-alpaca.glitch.me/v1/stock/" + stockName[1] + "/quote";
      let response2 = await fetch(url2);
      let raw2 = await response2.json();
      Stock.countDocuments({ stock: stockName[0] }, async function(err, count) {
        if (err) return console.log("error in count");
        if (count > 0) {
          Stock.findOne({ stock: stockName[0] }, async function(err, data) {
            if (err) return console.log("error in findOne");
            data.price = raw1.latestPrice;
            if (like == 'true' && data.ip.indexOf(userIp) == -1) {
              data.likes++;
              data.ip.push(userIp);
            }
            data.save().then(function(data) {
              Stock.countDocuments({ stock: stockName[1] }, async function(err, count) {
                if (err) return console.log("error in count");
                if (count > 0) {
                  Stock.findOne({ stock: stockName[1] }, async function(err, data2) {
                    if (err) return console.log("error in findOne");
                    data2.price = raw2.latestPrice;
                    if (like == 'true' && data2.ip.indexOf(userIp) == -1) {
                      data2.likes++;
                      data2.ip.push(userIp);
                    }
                    data2.save().then(function(data2) {
                      res.json({stockData: [{ stock: data.stock, price: data.price, rel_likes: data.likes - data2.likes}, { stock: data2.stock, price: data2.price, rel_likes: data2.likes - data.likes}]});
                    });
                  });
                } else if (count == 0) {
                  var price = raw2.latestPrice;
                  var likes = 0;
                  var ip = [];
                  if (like == 'true') {
                      likes++;
                      ip.push(userIp);
                    }
                  Stock.create(
                    { stock: stockName[1], price: price, likes: likes, ip: ip},
                    function(err, data2) {
                      if (err) return console.log("error saving doc");
                      res.json({stockData: [{ stock: data.stock, price: data.price, rel_likes: data.likes - data2.likes}, { stock: data2.stock, price: data2.price, rel_likes: data2.likes - data.likes}]});
                    }
                  );
                }
              });
            });
          });
        } else if (count == 0) {
          var price = raw1.latestPrice;
          var likes = 0;
          var ip = [];
          if (like == 'true') {
                      likes++;
                      ip.push(userIp);
                    }
          Stock.create(
            { stock: stockName[0], price: price, likes: likes, ip: ip },
            function(err, data) {
              if (err) return console.log("error saving doc");
              Stock.countDocuments({ stock: stockName[1] }, async function(err, count) {
                if (err) return console.log("error in count");
                if (count > 0) {
                  Stock.findOne({ stock: stockName[1] }, async function(err, data2) {
                    if (err) return console.log("error in findOne");
                    data2.price = raw2.latestPrice;
                    if (like == 'true' && data2.ip.indexOf(userIp) == -1) {
                      data2.likes++;
                      data2.ip.push(userIp);
                    }
                    data2.save().then(function(data2) {
                      res.json({stockData: [{ stock: data.stock, price: data.price, rel_likes: data.likes - data2.likes}, { stock: data2.stock, price: data2.price, rel_likes: data2.likes - data.likes}]});
                    });
                  });
                } else if (count == 0) {
                  var price = raw2.latestPrice;
                  var likes = 0;
                  var ip = [];
                  if (like == 'true') {
                      likes++;
                      ip.push(userIp);
                    }
                  Stock.create(
                    { stock: stockName[1], price: price, likes: likes, ip: ip },
                    function(err, data2) {
                      if (err) return console.log("error saving doc");
                      res.json({stockData: [{ stock: data.stock, price: data.price, rel_likes: data.likes - data2.likes}, { stock: data2.stock, price: data2.price, rel_likes: data2.likes - data.likes}]});
                    }
                  );
                }
              });
            }
          );
        }
      });
    } else {
      let url =
        "https://repeated-alpaca.glitch.me/v1/stock/" + stockName + "/quote";
      let response = await fetch(url);
      let raw = await response.json();
      Stock.countDocuments({ stock: stockName }, async function(err, count) {
        if (err) return console.log("error in count");
        if (count > 0) {
          Stock.findOne({ stock: stockName }, async function(err, data) {
            if (err) return console.log("error in findOne");
            data.price = raw.latestPrice;
            if (like == 'true' && data.ip.indexOf(userIp) == -1) {
                      data.likes++;
                      data.ip.push(userIp);
                    }
            data.save().then(function(data) {
              res.json({
                stockData: {
                  stock: data.stock,
                  price: data.price,
                  likes: data.likes
                }
              });
            });
          });
        } else if (count == 0) {
          var price = raw.latestPrice;
          var likes = 0;
          var ip = [];
          if (like == 'true') {
                      likes++;
                      ip.push(userIp);
                    }
          Stock.create(
            { stock: stockName, price: price, likes: likes, ip: ip },
            function(err, data) {
              if (err) return console.log("error saving doc");
              res.json({
                stockData: {
                  stock: data.stock,
                  price: data.price,
                  likes: data.likes
                }
              });
            }
          );
        }
      });
    }
  });
};
