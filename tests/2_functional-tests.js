const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  // Test 1: Viewing one stock: GET request to /api/stock-prices/
  test('Viewing one stock: GET request to /api/stock-prices/', function(done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: 'GOOG' })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'stockData');
        assert.isObject(res.body.stockData);
        assert.property(res.body.stockData, 'stock');
        assert.isString(res.body.stockData.stock);
        assert.property(res.body.stockData, 'price');
        assert.isNumber(res.body.stockData.price);
        assert.property(res.body.stockData, 'likes');
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });

  // Test 2: Viewing one stock and liking it: GET request to /api/stock-prices/
  test('Viewing one stock and liking it: GET request to /api/stock-prices/', function(done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: 'AAPL', like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'stockData');
        assert.isObject(res.body.stockData);
        assert.property(res.body.stockData, 'stock');
        assert.isString(res.body.stockData.stock);
        assert.property(res.body.stockData, 'price');
        assert.isNumber(res.body.stockData.price);
        assert.property(res.body.stockData, 'likes');
        assert.isNumber(res.body.stockData.likes);
        assert.isAtLeast(res.body.stockData.likes, 1);
        done();
      });
  });

  // Test 3: Viewing the same stock and liking it again: GET request to /api/stock-prices/
  test('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function(done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: 'AAPL', like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'stockData');
        assert.isObject(res.body.stockData);
        assert.property(res.body.stockData, 'stock');
        assert.isString(res.body.stockData.stock);
        assert.property(res.body.stockData, 'price');
        assert.isNumber(res.body.stockData.price);
        assert.property(res.body.stockData, 'likes');
        assert.isNumber(res.body.stockData.likes);
        // The likes should remain the same as previous test since we're using the same IP
        done();
      });
  });

  // Test 4: Viewing two stocks: GET request to /api/stock-prices/
  test('Viewing two stocks: GET request to /api/stock-prices/', function(done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'] })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);
        
        // First stock
        assert.property(res.body.stockData[0], 'stock');
        assert.isString(res.body.stockData[0].stock);
        assert.property(res.body.stockData[0], 'price');
        assert.isNumber(res.body.stockData[0].price);
        assert.property(res.body.stockData[0], 'rel_likes');
        assert.isNumber(res.body.stockData[0].rel_likes);
        
        // Second stock
        assert.property(res.body.stockData[1], 'stock');
        assert.isString(res.body.stockData[1].stock);
        assert.property(res.body.stockData[1], 'price');
        assert.isNumber(res.body.stockData[1].price);
        assert.property(res.body.stockData[1], 'rel_likes');
        assert.isNumber(res.body.stockData[1].rel_likes);
        done();
      });
  });

  // Test 5: Viewing two stocks and liking them: GET request to /api/stock-prices/
  test('Viewing two stocks and liking them: GET request to /api/stock-prices/', function(done) {
    chai
      .request(server)
      .get('/api/stock-prices')
      .query({ stock: ['FB', 'AMZN'], like: true })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);
        
        // First stock
        assert.property(res.body.stockData[0], 'stock');
        assert.isString(res.body.stockData[0].stock);
        assert.property(res.body.stockData[0], 'price');
        assert.isNumber(res.body.stockData[0].price);
        assert.property(res.body.stockData[0], 'rel_likes');
        assert.isNumber(res.body.stockData[0].rel_likes);
        
        // Second stock
        assert.property(res.body.stockData[1], 'stock');
        assert.isString(res.body.stockData[1].stock);
        assert.property(res.body.stockData[1], 'price');
        assert.isNumber(res.body.stockData[1].price);
        assert.property(res.body.stockData[1], 'rel_likes');
        assert.isNumber(res.body.stockData[1].rel_likes);
        
        // The sum of relative likes should be 0
        assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0);
        done();
      });
  });
});