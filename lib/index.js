var url = require('url')
  , libxml = require('libxmljs')
  , https = require('https');
var fs = require('fs');
var Path = require('path');
var appRoot = Path.resolve(__dirname);
var appRoot2 = Path.resolve("../../../"+__dirname);
/**
 * Exposes FreshBooks HTTP Client.
 * 
 * @param {String} url
 * @param {String} token
 * @api public
 */

var FreshBooks = module.exports = function(url, token) {
  if (!(this instanceof arguments.callee))
    throw new Error("FRESHBOOKS MUST BE CALLED WITH NEW KEYWORD");
  
  this.url = url;
  this.token = token;
  this.ns = "http://www.freshbooks.com/api/";
  
  this.Category = require('./Category');
  this.Category.prototype.freshbooks = this;
  
  this.Client = require('./Client');
  this.Client.prototype.freshbooks = this;
  
  this.Estimate = require('./Estimate');
  this.Estimate.prototype.freshbooks = this;
  
  this.Expense = require('./Expense');
  this.Expense.prototype.freshbooks = this;
  
  this.Gateway = require('./Gateway');
  this.Gateway.prototype.freshbooks = this;
  
  this.Invoice = require('./Invoice');
  this.Invoice.prototype.freshbooks = this;
  
  this.Item = require('./Item');
  this.Item.prototype.freshbooks = this;
  
  this.Language = require('./Language');
  this.Language.prototype.freshbooks = this;
  
  this.Payment = require('./Payment');
  this.Payment.prototype.freshbooks = this;
  
  this.Project = require('./Project');
  this.Project.prototype.freshbooks = this;
  
  this.Recurring = require('./Recurring');
  this.Recurring.prototype.freshbooks = this;
  
  this.Staff = require('./Staff');
  this.Staff.prototype.freshbooks = this;
  
  this.Task = require('./Task');
  this.Task.prototype.freshbooks = this;
  
  this.Tax = require('./Tax');
  this.Tax.prototype.freshbooks = this;
  
  this.Time_Entry = require('./Time_Entry');
  this.Time_Entry.prototype.freshbooks = this;
};

/**
 * Retrieves XML response from Freshbooks API.
 * 
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */
   
FreshBooks.prototype._get = function(xml, fn) {
  var string = xml.toString();
  
  var options = {
      host: url.parse(this.url).hostname
    , port: url.parse(this.url).port
    , path: url.parse(this.url).path
    , method: 'POST'
    , headers: {
      'Content-Length': string.length
      , 'Authorization': 'Basic ' + new Buffer(this.token + ':X').toString('base64')
    }
  };
  var req = https.request(options, function(res) {
    string = '';
    res.setEncoding('utf8');

    res.on('data', function(chunk) {
      string += chunk;
    });
  
    res.on('end', function() {
      var err = null;
      try { xml = libxml.parseXmlString(string); }
      catch(e) { err = e; }
        
      fn(err, xml);
    });
  });
  
  req.on('error', function(err) {
    fn(new Error("CANNOT CONNECT TO FRESHBOOKS:" + err));
  });
  
  req.write(string);
  req.end();
};

FreshBooks.prototype._getData = function(xml, fn) {
  var string = xml.toString();
  var string2 = xml.toString();
  var start = string2.indexOf('<invoice_id>')+12;
  var end = string2.indexOf('</invoice_id>');
  var invoice_id = string2.substring(start,end);
  // console.log(start+12, end, invoice_id);
  var options = {
      host: url.parse(this.url).hostname
    , port: url.parse(this.url).port
    , path: url.parse(this.url).path
    , method: 'POST'
    , headers: {
      'Content-Length': string.length
      , 'Authorization': 'Basic ' + new Buffer(this.token + ':X').toString('base64')
    }
  };
  
  var req = https.request(options, function(res) {
    data = [];
    // res.setEncoding('utf8');

    res.on('data', function(chunk) {
      console.log("Data incoming!");
      data.push(chunk);
    });
  
    res.on('end', function() {
      var err = null;
      var file = Buffer.concat(data); // Make one large Buffer of it
      // var myMessage = MyMessage.decode(data);
      console.log("Starting to save /pdf/"+invoice_id+"_invoice.pdf");
      // console.log(appRoot2);
      fs.writeFile("./pdf/"+invoice_id+"_invoice.pdf", file, function(err) {
        if(err) {
            return console.log(err);
        }
        else {
          console.log("The file was saved!");
          fn(err,  "/pdf/"+invoice_id+"_invoice.pdf");
        }
      }); 
      
    });
  });
  
  req.on('error', function(err) {
    fn(new Error("CANNOT CONNECT TO FRESHBOOKS:" + err));
  });
  
  req.write(string);
  req.end();
};