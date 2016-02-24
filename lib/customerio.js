var _        = require('lodash');
var when     = require('when');
var needle   = require('needle');
var unixDate = require('./unix_date');


var endPoint = 'https://track.customer.io/api';

// Set on `init` 
var siteId;
var apiKey;
var authString;

module.exports = {

  /*
  * Initialize the customerio module, getting it ready for
  * doing stuff.
  */
  init: function (id, key) {
    siteId = id;
    apiKey = key;
    authString = 'Basic ' + new Buffer(siteId + ':' + apiKey).toString('base64');
  },

  /*
  * Identify a user in Customer.io, creating/updating them.
  * This method is designed to replicate the JavaScript SDK
  * almost exactly.
  * 
  * Auto-converts Date() objects to UNIX timestamp, kinda useful huh?
  */
  identify: function (properties) {
    return when.promise(function (resolve, reject) {

      // Default to object so we delegate to the error handlers below
      // without throwing a nasty error.
      properties = properties || {};

      // Check we've got the required parameters
      var required = ['id', 'email'];
      var missing = _.filter(required, function (key) {
        if (!properties[key]) {
          return true;
        } else {
          return false;
        }
      });
      if (missing.length) {
        return reject('The following parameters are required in `identify`: ' + missing.join(', '));
      }

      // Convert dates to UNIX timestamps & format
      var data = {};
      _.each(properties, function (value, key) {
        if (_.isDate(value)) {
          data[key] = unixDate(value);
        } else {
          data[key] = value;
        }
      });

      // HTTP options - headers, auth, etc
      var options = {
        json: true,
        headers: {
          'Authorization': authString
        }
      };
      var url = endPoint + '/v1/customers/'+data.id;

      needle.put(url, data, options, function (err, response, body) {
        if (!response) {
          reject({
            message: "No response received",
            url: url,
            data: data,
            options: options
          })
        } else if (response.statusCode !== 200) {
          reject({
            code: response.statusCode,
            body: body
          })
        } else {
          resolve();
        }
      });


    }.bind(this));
  },

  /*
  * Delete a customer
  */
  remove: function (customerId) {
    return when.promise(function (resolve, reject) {

      if (!customerId) {
        return reject("Please provide a `customerId` in the first argument of `remove`.");
      }

      // HTTP options - just auth
      var options = {
        headers: {
          'Authorization': authString
        }
      };
      var url = endPoint + '/v1/customers/'+customerId;

      needle.delete(url, null, options, function (err, response, body) {
        if (!response) {
          reject({
            message: "No response received",
            url: url,
            options: options
          })
        } else if (response.statusCode !== 200) {
          reject({
            code: response.statusCode,
            body: body
          })
        } else {
          resolve();
        }
      });


    });
  },

  /*
  * Track an event with Customer.io.
  */
  track: function (customerId, eventName, properties) {
    return when.promise(function (resolve, reject) {

      // Default blank object
      properties = properties || {};

      // Check we've got the required parameters
      if (!customerId) {
        return reject('Please provide a `customerId` in the first argument of `track`.');
      }
      if (!eventName) {
        return reject('Please provide an `eventName` in the second argument of `track`.');
      }
      
      // Create a data object
      var data = {
        name: eventName,
        data: properties
      };

      // Convert data to UNIX timestamps & format
      _.each(data.data, function (value, key) {
        if (_.isDate(value)) {
          data.data[key] = unixDate(value);
        }
      });

      // HTTP options - headers, auth, etc
      var options = {
        json: true,
        headers: {
          'Authorization': authString
        }
      };
      var url = endPoint + '/v1/customers/'+customerId+'/events';

      needle.post(url, data, options, function (err, response, body) {
        if (!response) {
          reject({
            message: "No response received",
            url: url,
            data: data,
            options: options
          })
        } else if (response.statusCode !== 200) {
          reject({
            code: response.statusCode,
            body: body
          })
        } else {
          resolve();
        }
      });

    }.bind(this));
  },

  /*
  * Trigger events not associated with any customer
  */
  trackAnonymous: function (recipient, eventName, properties) {
    return when.promise(function (resolve, reject) {

      // Default blank object
      properties = properties || {};

      // Check we've got the required parameters
      if (!recipient) {
        return reject('Please provide a `recipient` in the first argument of `trackAnonymous`.');
      }
      if (!eventName) {
        return reject('Please provide an `eventName` in the second argument of `trackAnonymous`.');
      }
      
      // Create a data object
      var data = {
        name: eventName,
        data: properties
      };

      // Convert data to UNIX timestamps & format
      _.each(data.data, function (value, key) {
        if (_.isDate(value)) {
          data.data[key] = unixDate(value);
        }
      });

      // HTTP options - headers, auth, etc
      var options = {
        json: true,
        headers: {
          'Authorization': authString
        }
      };
      var url = endPoint + '/v1/events';

      needle.post(url, data, options, function (err, response, body) {
        if (!response) {
          reject({
            message: "No response received",
            url: url,
            data: data,
            options: options
          })
        } else if (response.statusCode !== 200) {
          reject({
            code: response.statusCode,
            body: body
          })
        } else {
          resolve();
        }
      });

    }.bind(this));
  }

};
