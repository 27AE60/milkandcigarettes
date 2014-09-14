var express = require('express');
var app = express();

app.set('views', __dirname + '/static/design');
app.use(express.static(__dirname + '/static/design'));
app.engine('html', require('ejs').renderFile);

app.use(function(req, res) {
  res.status(400);
  res.render('404.html');
});

var port = Number(process.env.PORT || 5000);
app.listen(port);
