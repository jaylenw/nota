var chai = require('chai');
var assert = chai.assert;

describe('assert works', function() {
  describe('test assert', function() {
    it('should return true', function() {
      var bool = 'goldfish'
      assert(bool === 'goldfish');
    });
  });
});
