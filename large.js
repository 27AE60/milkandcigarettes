#!/usr/bin/env node

var fs = require('fs'),
    namp = require('namp'),
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

  // TODO: read markdown file.
  _readMarkdown : function(filename)  {
    console.log(this.folder.markdown);
    console.log(filename);
  },

  // TODO: convert it to html.
  // TODO: embed into the page template.
  // TODO: create html file in static folder.
  // TODO: update the home page list.
  // TODO: publish the article.
  publish : function(filename)  {
    this._readMarkdown(filename);
  },

  // TODO: initialize large
  init : function() {
    var that = this;

    fs.exists(this.config.path, function(exists)  {
      if(exists) {
        console.log('\n Already Initialized!\n');
      }else {
        fs.mkdir(that.config.path, function()  {
          that._writeAuthorConfig(template.authorConfig, function()  {
            console.log('\n Medium is Medium, But this is Large!\n')
          });
        });
      }
    });
  },

  _readAuthorConfig : function(args, callback) {
    var that = this;

    fs.readFile(this.config.author, function(err, data) {
      if(err) {
        throw "Error: issue with author configutation file"
      }else {
        callback.call(that, JSON.parse(data), args);
      }
    });
  },

  _writeAuthorConfig : function(data, callback) {
    callback = callback || function(){};
    fs.writeFile(this.config.author,JSON.stringify(data),function() {
      callback();
    })
  },

  _configurationHelp : function() {
    console.log('\n Usage large --config [param] [value]\n');
    console.log('   name        author name');
    console.log('   email       author email');
    console.log('   signature   author signature\n');
  },

  _parseConfig : function(data, args) {
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

        this._writeAuthorConfig(data);

        i += 2;
      }
    }

  },

  me : function(args) {
    this._readAuthorConfig(args, function(data) {
      var params = [];
      for(var attr in data) {
        params.push(data[attr]);
      }
      console.log(params.join(', '))
    })
  },

  configuration : function(args) {
    var that = this;
    this._readAuthorConfig(args, this._parseConfig);
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
}else {
  console.log('\n Forget Something!  Try large -h\n');
}

exports.Large = Large;
