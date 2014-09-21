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
    author : [process.cwd(),'.large','author.json'].join('/'),
    post : [process.cwd(), '.post'].join('/')
  }
};

describe('Initializing Large', function() {

  describe('when large is not initialized', function()  {

    before(function(done) {
      exec('rm -rf .large', function()  { done(); });
    });

    it('should throw error while reading author configuration file', function()  {
      var err = {},
          data = {},
          errorMsg = 'ERROR : author conf i/o failed!';

      expect(large._authorConfigErrorCheck.bind(err, data)).to.throw(errorMsg);
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

    it('should have .post directory', function()  {
      expect(paths.configs.post).to.be.a.directory();
    })
  });
});


describe('Author config IO', function() {

  describe('when configuration exists', function()  {

    it('should call callback after reading author config', function() {
      var cb = function(err, data) {
        assert.equal(err, null);
      }

      large._authorConfigIO('r', cb, {});
    });

    it('should return data as object not as string after reading', function()  {
      var cb = null;

      cb = function(err, data) {
        assert.equal(err, null);
        assert.equal(typeof data, 'object');
        assert.notEqual(typeof data, 'string');
      }

      large._authorConfigIO('r', cb, {});
    });

    it('error will be null if writing is success', function()  {
      var cb = null;

      cb = function(err, data) {
        assert.equal(err, null);
      }

      large._authorConfigIO('w', cb, { data : {} });
    });
  });

  describe('when configuration file does not exists', function(done)  {
    before(function(done) {
      exec('rm -rf .large', function()  { done(); });
    });

    it('should pass error while reading author config', function(done) {
      var cb = function(err, data) {
        assert.notEqual(err, null);
        assert.equal(data, undefined);
        done();
      }

      large._authorConfigIO('r', cb, {});
    });

    it('should pass error while writing', function(done)  {
      var cb = null;

      cb = function(err, data) {
        assert.notEqual(err, null);
        done();
      }

      large._authorConfigIO('w', cb, { data : {} });
    });

  });

})


describe('Parse Config', function() {
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

  it('return data should have a name', function()  {
    expect(large._parseConfig(data, args).name).to.equal('jaison');
  });

  it('return data should have property email', function()  {
    expect(large._parseConfig(data, args)).to.have.property('email');
  });

  it('return data should have a email', function()  {
    expect(large._parseConfig(data, args).email).to.equal('jaison.justus.lp@gmail.com');
  });

  it('return data should have property signature', function()  {
    expect(large._parseConfig(data, args)).to.have.property('signature');
  });

  it('return data should have a signature', function()  {
    expect(large._parseConfig(data, args).signature).to.equal('yours lovingly');
  });
});

describe('File Name Builder', function() {
  it('should return string with extname .md', function()  {
    assert.include(large._filenameBuilder('this_is_a_test'),'.md');
  });

  it('should return basename snake case string if array is passed', function() {
    var args = ['this', 'is', 'a', 'test'],
        truth = 'this_is_a_test.md';
    assert.equal(large._filenameBuilder(args), truth);
  });

  it('should return basename snake case string if string with space is passed', function() {
     var args = 'this is a test',
        truth = 'this_is_a_test.md';
    assert.equal(large._filenameBuilder(args), truth);
  });

  it('should return basename in snake case string if element of array having spaces', function() {
    var args = ['this is a test'],
        truth = 'this_is_a_test.md';

    assert.equal(large._filenameBuilder(args), truth);
  })

  it('should return null if pass and object', function()  {
    assert.isNull(large._filenameBuilder({}));
  });
});
