#!/usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    events = require('events'),
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
  author : {},

  config : {
    path: [process.cwd(),'.large'].join('/'),
    author: [process.cwd(),'.large','author.json'].join('/'),
    post: [process.cwd(), '.post'].join('/')
  },

  folder : {
    markdown : [process.cwd(), 'post'].join('/'),
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
    var that = this,
        path = [this.folder.markdown, filename].join('/');

    fs.readFile(path, "utf-8", function(err, data)  {
      if(err) { throw "ERROR: Article not found"; }
      that.channel.emit('onReadMarkdown', that, data);
    });
  },

  _renderHTML : function(that, md)  {
    console.log(that._convertMarkdown(md));
  },

  _convertMarkdown : function(md) {
    return namp(md, {highlight : true});
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

      fs.mkdir(that.config.post, function(err)  {});
    });
  },

  _authorConfigErrorCheck : function(err) {
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
      this._authorConfigErrorCheck(err);
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
      try { this._authorConfigErrorCheck(err) }
      catch(msg) { console.log(msg); exit; }

      data = this._parseConfig(data, args);

      this._authorConfigIO('w', this._authorConfigErrorCheck, { data : data });
    });
  },

  _filenameBuilder : function(args) {
    var filename = '';

    if(Array.isArray(args)) {
      args = args.join('_');
    }else if(args instanceof Object) {
      return null;
    }

    filename = args.toString().replace(/\s/g, '_');
    filename += '.md';
    filename = filename.toLowerCase();
    return filename;
  },

  _loadAuthorConfig : function()  {
    var that = this;

    this._authorConfigIO('r', function(err, data)  {
      try { this._authorConfigErrorCheck() }
      catch(msg) { console.log(msg); exit; }

      that.author = data;
      that.channel.emit('onLoadAuthorConfig', that);
    });
  },

  _getAuthor : function(prop) {
    if(this.author.hasOwnProperty(prop))  {
      return this.author[prop];
    }else {
      return null;
    }
  },

  _getArticleMetaData : function(filename)  {
    var article = '',
        metadata = {
          filename : '',
          article : '',
          author : '',
          email : '',
          created_date : '',
          modified_date : '',
          publish_date : ''
        };

    article = path.basename(filename, path.extname(filename)).replace(/_/g,' ');

    metadata.filename = filename;
    metadata.article = article;
    metadata.author = this._getAuthor('name');
    metadata.email = this._getAuthor('email');
    metadata.created_date = new Date();

    return metadata;
  },

  _prepareNewArticle : function(that) {
    var metadata = {},
        filePath = '';

    if(that._getAuthor('name').length <= 0 ||
       that._getAuthor('email').length <= 0)  {
      throw 'ERROR: author name is empty';
    }

    metadata = that._getArticleMetaData(that.tmp);
    filePath = path.join(that.config.post, metadata.filename.replace('.md', '.json'));
    fs.writeFile(filePath, JSON.stringify(metadata), function(err) {
      if(err) { throw 'ERROR: post i/o failed!'; }
    })
  },

  articleOperation : function(args) {
    if(!args || !args.length) {
      throw "ERROR: article name empty!"
    }

    this.tmp = this._filenameBuilder(args);
    this._loadAuthorConfig('new');
  },

  _functionSwitch : function()  {
    try {
      switch(this.option.toLowerCase()) {
        case 'new':
          this._prepareNewArticle();
        break;
        case 'publish':
          this._publishArticle();
        break;
        default:
          console.log('unknown option :// ');
      }
    }catch(msg) {
      console.log(msg);
    }
  },

  _publishArticle : function(args) {
    console.log('publish Article');
  },

  boot : function() {
    this.channel = new events.EventEmitter();
    this.channel.on('onReadMarkdown', this._renderHTML);
    this.channel.on('onLoadAuthorConfig', this._prepareNewArticle);
  }
};

Large.boot();
program.parse(process.argv);

if(program.init)  {
  Large.init();
}else if(program.config) {
  Large.configuration(program.args);
}else if(program.me)  {
  Large.me();
}else if(program.flush) {
  require('child_process').exec('rm -rf .large/', function() {
    require('child_process').exec('rm -rf .post/', function() {
      console.log('Large is removed :( !');
    });
  });
}else if(program.new || program.publish) {
  Large.articleOperation(program.args);
}

if(program.test)  {
  console.log(Large._readMarkdown('this_is_a_test.md'));
}

exports.Large = Large;
