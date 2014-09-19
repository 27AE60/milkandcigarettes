var exec = require('child_process').exec,
    large = require('../large.js').Large,
    chai = require('chai'),
    assert = chai.assert,
    expect = chai.expect,
    sinon = require('sinon');

chai.use(require('chai-fs'));

var paths = {
  configs : {
    self : [process.cwd(), '.large'].join('/'),
    author : [process.cwd(),'.large','author.json'].join('/')
  }
};

describe('Initializing Large - ', function() {

  describe('when large is not initialized', function()  {

    before(function(done) {
      exec('rm -rf .large', function()  { done(); });
    });

    it('should throw error while reading author configuration file', function()  {
      var err = {},
          data = {},
          errorMsg = 'ERROR : reading author conf failed!';

      expect(large._authorConfigCb.bind(err, data)).to.throw(errorMsg);
    });

  });

  describe('when large is initialized', function()  {

    before(function(done) {
      exec('node large.js -i', function() { done(); });
    });

    it('should have .large directory', function() {
      expect(paths.configs.self).to.be.a.directory();
    });

    it('should have a non empty .large directory', function() {
      expect(paths.configs.self).to.be.a.directory().and.not.empty;
    })

    it('should have author config file in the .large folder', function()  {
      expect(paths.configs.author).to.be.a.file();
    });

    it('should have author config json file', function()  {
      expect(paths.configs.author).to.be.a.file().with.json;
    });
  });
});

describe('Parse Config - ', function() {
  var data = {},
      args = {};

  beforeEach(function() {
    data = {
      name : '',
      email : '',
      signature : ''
    };

    args = ['name', 'jaison', 'email', 'jaison.justus.lp@gmail.com',
      'signature', 'yours lovingly'];
  });

  it('return data should have property name', function()  {
    expect(large._parseConfig(data, args)).to.have.property('name');
  });

  it('return data should have property email', function()  {
    expect(large._parseConfig(data, args)).to.have.property('email');
  });

  it('return data should have property signature', function()  {
    expect(large._parseConfig(data, args)).to.have.property('signature');
  });

});
