'use strict';

const crypto = require('crypto');

const PROXY_URL = 'https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/';
const stockData = {}; // In-memory store for likes + IPs

function saveStock(stock, ip, like) {
  const hash = crypto.createHash('md5').update(ip).digest('hex');
  
  if (!stockData[stock]) {
    stockData[stock] = {
      likes: 0,
      ips: new Set()
    };
  }

  if (like === 'true' && !stockData[stock].ips.has(hash)) {
    stockData[stock].likes++;
    stockData[stock].ips.add(hash);
  }

  return stockData[stock].likes;
}

async function getStock(stock) {
  try {
    // Fetch stock data from the proxy API
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(
      `${PROXY_URL}${stock}/quote`
    );
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we got valid data
    if (!data || data.symbol === undefined) {
      // If the symbol is undefined but we have a latestPrice, we'll create a valid response
      if (data && data.latestPrice !== undefined) {
        return {
          stock: stock.toUpperCase(),
          price: Number(data.latestPrice)
        };
      }
      throw new Error('Invalid stock data');
    }
    
    return {
      stock: data.symbol,
      price: Number(data.latestPrice) || 0 // Ensure the price is a number and handle null values
    };
  } catch (error) {
    console.error(`Error fetching stock ${stock}:`, error);
    // Instead of throwing, return a default object
    return {
      stock: stock.toUpperCase(),
      price: 0
    };
  }
}

module.exports = function (app) {
  app.route('/api/stock-prices').get(async function (req, res) {
    const { stock, like } = req.query;
    
    try {
      // Handle multiple stocks
      if (Array.isArray(stock)) {
        const [stock1, stock2] = stock;
        if (!stock1 || !stock2) {
          return res.json({ error: "Missing stock symbols" });
        }

        // Get stock data - the function now handles errors internally
        const stockResult1 = await getStock(stock1);
        const stockResult2 = await getStock(stock2);

        // Save likes for both stocks
        const likes1 = saveStock(stockResult1.stock, req.ip, like);
        const likes2 = saveStock(stockResult2.stock, req.ip, like);

        // Return data with relative likes
        return res.json({
          stockData: [
            {
              stock: stockResult1.stock,
              price: stockResult1.price,
              rel_likes: likes1 - likes2
            },
            {
              stock: stockResult2.stock,
              price: stockResult2.price,
              rel_likes: likes2 - likes1
            }
          ]
        });
      } 
      // Single stock handling
      else {
        if (!stock) {
          return res.json({ error: "Missing stock symbol" });
        }

        const stockResult = await getStock(stock);
        const likes = saveStock(stockResult.stock, req.ip, like);
          
        // Return data with the correct structure
        return res.json({ 
          stockData: {
            stock: stockResult.stock,
            price: stockResult.price,
            likes: likes
          }
        });
      }
    } catch (error) {
      console.error("Server error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  });
};