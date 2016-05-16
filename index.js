var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var helmet = require('helmet');

var app = express();

app.use(helmet())

var https_redirect = function(req, res, next) {
    if (process.env.NODE_ENV === 'production') {
        if (req.headers['x-forwarded-proto'] != 'https') {
            return res.redirect('https://' + req.headers.host + req.url);
        } else {
            return next();
        }
    } else {
        return next();
    }
};

app.use(https_redirect);

app.use(express.static('public'));

app.use(bodyParser.json({
    extended: false
}));

app.set('view engine', 'jade');

//Search for Legislation
app.get('/api/v1/legislation', function(req, res) {

var term = req.query.search

var options = {
  url: 'https://webapi.legistar.com/v1/lexington/matters?$filter=substringof(\'' +  term + '\', MatterName) eq true' + 
  '&$select=MatterId,MatterGuid,MatterLastModifiedUtc,MatterFile,MatterName,MatterTitle,MatterTypeName,MatterStatusName,MatterBodyName,' +
  'MatterIntroDate,MatterAgendaDate,MatterPassedDate,MatterEnactmentNumber,MatterRequester' +
  '&$orderby=MatterId desc', 
  headers: {
    'Accept': 'application/json'
  }
};

request(options, function (error, response, body) {
  if (!error && response.statusCode == 200) {
        res.json({
      "term": term,
      "results" : JSON.parse(body)
    })
  }
  else {console.log(error)}
})

})

//Get Specific Legislation
app.get('/api/v1/legislation/:id', function(req, res) {

var term = req.query.search

var urlOptions = {
  url: 'https://webapi.legistar.com/v1/lexington/matters/' + req.params.id, 
  headers: {
    'Accept': 'application/json'
  }
};

request(urlOptions, function (error, response, body) {
  if (!error && response.statusCode == 200) {       
        res.json({
      "results" : JSON.parse(body)
    })
  }
  else {console.log(error)}
})
})

//Get History of Legislation
app.get('/api/v1/legislation/history/:id', function(req, res) {

var urlOptions = {
  url: 'https://webapi.legistar.com/v1/lexington/matters/' + req.params.id + '/histories' +
  '?$select=MatterHistoryId,MatterHistoryGuid,MatterHistoryLastModifiedUtc,MatterHistoryActionDate,MatterHistoryActionName,MatterHistoryActionText,MatterHistoryActionBodyName' +
  '&$orderby=MatterHistoryId desc', 
  headers: {
    'Accept': 'application/json'
  }
};

request(urlOptions, function (error, response, body) {
  if (!error && response.statusCode == 200) {       
        res.json({
      "results" : JSON.parse(body)
    })
  }
  else {console.log(error)}
})
})

//Get Attachments of Legislation
app.get('/api/v1/legislation/attachments/:id', function(req, res) {

var urlOptions = {
  url: 'https://webapi.legistar.com/v1/lexington/matters/' + req.params.id + '/attachments' +
  '?$select=MatterAttachmentId,MatterAttachmentGuid,MatterAttachmentLastModifiedUtc,MatterAttachmentName,MatterAttachmentHyperlink', 
  headers: {
    'Accept': 'application/json'
  }
};

request(urlOptions, function (error, response, body) {
  if (!error && response.statusCode == 200) {       
        res.json({
      "results" : JSON.parse(body)
    })
  }
  else {console.log(error)}
})
})

//Get Text of Legislation
app.get('/api/v1/legislation/text/:id', function(req, res) {

var textKey = ''

var textKeyOptions = {
  url: 'https://webapi.legistar.com/v1/lexington/matters/' + req.params.id + '/versions?$orderby=Value%20desc&$top=1', 
  headers: {
    'Accept': 'application/json'
  }
};

request(textKeyOptions, function (error, response, body) {
  if (!error && response.statusCode == 200) {       
    if (JSON.parse(body)[0]) {
    var textKey = JSON.parse(body)[0].Key
    }
        var urlOptions = {
          url: 'https://webapi.legistar.com/v1/lexington/matters/' + req.params.id + '/texts/' + textKey, 
          headers: {
            'Accept': 'application/json'
          }
        };


        request(urlOptions, function (error, response, body) {
      if (!error && response.statusCode == 200) {
              res.json({
          "results" : JSON.parse(body)
        })
      }
    })

  }
  else {console.log(error)}
})



})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});