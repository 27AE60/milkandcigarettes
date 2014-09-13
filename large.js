#!/usr/bin/env node

var rs = require('robotskirt'),
    argv = require('yargs').argv,
    parser = new rs.Markdown(new rs.HtmlRenderer());

console.log(parser.render('~~this is a test~~'));

var Large = {
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
  }
};

if(argv.p)  {
  Large.publish(argv.p);
}
