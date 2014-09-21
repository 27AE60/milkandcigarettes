#!/usr/bin/env node

var fs = require('fs'),
    namp = require('namp'),
    prettyPrint = require('pretty-print'),
    program = require('commander');

program
  .version('0.0.1')
  .option('-i --init', 'intialize large')
  .option('-c --config', 'add user configurations')
  .option('-n --new', 'create new article')
  .option('-p --publish', 'publish article')
  .option('--me', 'show author details')
  .option('--flush', 'flush out large instance *Only for Dev*')
  .option('--test', 'test command binding');

var template = {
  authorConfig : {
    name : "",
    email : "",
    signature : ""
  }
};

var Large = {
  config : {
    path: [process.cwd(),'.large'].join('/'),
    author: [process.cwd(),'.large','author.json'].join('/')
  },

  folder : {
    markdown : [process.cwd(), 'post/'].join('/'),
    html : ''
  },

  printerConfig : {
    leftPadding: 2,
    rightPadding: 3
  },

  _printer : function(obj) {
    prettyPrint(obj, this.printerConfig);
  },

  _readMarkdown : function(filename)  {
    console.log(this.folder.markdown);
    console.log(filename);
  },

  publish : function(filename)  {
    this._readMarkdown(filename);
  },

  init : function() {
    var that = this;

    fs.exists(this.config.path, function(exists)  {
      if(exists) {
        console.log('\n Already Initialized!\n');
      }else {
        fs.mkdir(that.config.path, function()  {
          that._authorConfigIO('w',
                               function()  { console.log('\n Medium is Medium, But this is Large!\n'); },
                               { data: template.authorConfig });
        });
      }
    });
  },

  _authorConfigErrorCheck : function(err, data) {
    if(err) {
      throw "ERROR : author conf i/o failed!";
    }
  },

  _authorConfigIO : function(mode, cb, options)  {
    var that = this;
    switch(mode)  {
      case 'r':
        fs.readFile(this.config.author, function(err, data) {
          cb.call(that, err, (data) ? JSON.parse(data) : undefined, options)
        });
        break;

      case 'w':
        fs.writeFile(this.config.author, JSON.stringify(options.data), function(err) {
            cb.call(that, err)
        });
        break;

      default:
        throw 'ERROR: unkown operation!';
    }
  },

  _configurationHelp : function() {
    var printObj = {
      name : 'author name',
      email : 'author email',
      signature : 'author signature'
    };

    console.log('\n Usage large --config [param] [value]\n');
    this._printer(printObj);
  },

  _parseConfig : function(data, args) {
    try { this._authorConfigErrorCheck(); }
    catch(msg) { console.log(msg)}

    var argsLength = args.length,
        key = null,
        value = null;

    for(var i = 0; i < argsLength;) {
      if(args[i] === 'help') {
        this._configurationHelp();
        i++;
      }else {
        key = args[i];
        value = args[i+1];
        if(value) {
          if(data.hasOwnProperty(key))  {
            data[key] = value;
          }
        }
        i += 2;
      }
    }

    return data;
  },

  _printUserProfile : function(err, data)  {
    try{
      this._authorConfigErrorCheck();
    }catch(msg) {
      console.log(msg);
    }

    this._printer(data);
  },

  me : function() {
    this._authorConfigIO('r', this._printUserProfile);
  },

  configuration : function(args) {
    var that = this;

    this._authorConfigIO('r', function(err, data)  {
      try { this._authorConfigErrorCheck() }
      catch(msg) { console.log(msg); exit; }

      data = this._parseConfig(data, args);

      this._authorConfigIO('w', this._authorConfigErrorCheck, { data : data });

    });

  },
};

program.parse(process.argv);

if(program.test)  {
  console.log('\n Test env: \n');
  console.log('program - ', program.args);
  console.log(' args - ', program.test);

  exit;
}

if(program.init)  {
  Large.init();
}else if(program.config) {
  Large.configuration(program.args);
}else if(program.me)  {
  Large.me();
}else if(program.flush) {
  require('child_process').exec('rm -rf .large/', function() {
    console.log('Large is removed :( !');
  });
}

exports.Large = Large;
