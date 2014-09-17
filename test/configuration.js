var exec = require('child_process').exec,
    large = require('../large.js').Large,
    assert = require('chai').assert,
    expect = require('chai').expect,
    sinon = require('sinon');

describe('Large Configurations', function() {

  describe('when large is not initialized', function()  {

    beforeEach(function() {
      exec('rm -rf .large');
    });

    it('should not read author configuration file', function()  {
      expect(large._readAuthorConfig).to.throw(Error);
    });

  });

  describe('when large is initialized', function()  {

    before(function(done) {
      exec('node large.js -i', function() { done(); });
    });

    it('should read author configuration file', function()  {
      expect(function() {
        return large._readAuthorConfig({}, function(){});
      }).not.to.throw(Error);
    });

    it('should call the callback function', function()  {
      var cb = sinon.spy();
      large._readAuthorConfig({}, cb);
      expect(cb.called).to.have.been.called;
    });

    it('should proper author config structure', function()  {
    });

  });

});
