const moment = require('moment');
const https = require('https');
const url = require('url');

// Constants
const API_BASE_URL = 'https://monitoringapi.solaredge.com';
const API_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const API_DATE_FORMAT = 'YYYY-MM-DD';

function buildRequestQueryString(params) {
  let qs = [];

  // Loop over options and encode
  for (let key in params) {
    if (params.hasOwnProperty(key)) {
      qs.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    }
  }

  // Return as joined parameters
  return qs.join('&');
}

function buildRequestUrl(siteId, request, params) {
  let url = `${API_BASE_URL}/site/${siteId}/${request}`;

  // Determine correct URLs for certain requests
  switch (request) {
    case 'apiVersion':
      url = `${API_BASE_URL}/version/current`;
      break;
    case 'accounts':
      url = `${API_BASE_URL}/accounts/list`;
      break;
    case 'components':
      url = `${API_BASE_URL}/equipment/${siteId}/list`;
      break;
    case 'sites':
      url = `${API_BASE_URL}/sites/list`;
      break;
    case 'energy':
      // Request for one month with 15-minute values
      params.startDate = moment().subtract(1, 'months').format(API_DATE_FORMAT);
      params.endDate = moment().format(API_DATE_FORMAT);
      params.timeUnit = 'QUARTER_OF_AN_HOUR';
      break;
    case 'energyDetails':
      // Request for one month with 15-minute values
      params.startTime = moment().
        subtract(1, 'months').
        format(API_DATETIME_FORMAT);
      params.endTime = moment().format(API_DATETIME_FORMAT);
      params.timeUnit = 'QUARTER_OF_AN_HOUR';
      break;
    case 'timeFrameEnergy':
      // TODO Fix reason why this returns a server error
      // Request for one month
      params.startDate = moment().subtract(1, 'years').format(API_DATE_FORMAT);
      params.endDate = moment().format(API_DATE_FORMAT);
      break;
    case 'power': // Fallthrough
    case 'powerDetails':
      // Request for one month
      params.startTime = moment().
        subtract(1, 'months').
        format(API_DATETIME_FORMAT);
      params.endTime = moment().format(API_DATETIME_FORMAT);
      break;
    case 'sensors':
      url = `${API_BASE_URL}/equipment/${siteId}/sensors`;
      break;
    case 'sensorsData':
      url = `${API_BASE_URL}/site/${siteId}/sensors`;
      // Request for one week
      params.startDate = moment().
        subtract(1, 'weeks').
        format(API_DATETIME_FORMAT);
      params.endDate = moment().format(API_DATETIME_FORMAT);
      break;
    case 'storageData':
      // Request for one week
      params.startTime = moment().
        subtract(1, 'weeks').
        format(API_DATETIME_FORMAT);
      params.endTime = moment().format(API_DATETIME_FORMAT);
      break;
  }

  // Append query string to the URL
  const qs = buildRequestQueryString(params);
  return `${url}.json?${qs}`;
}

module.exports = function(RED) {

  function SolarEdgeNode(config) {
    RED.nodes.createNode(this, config);

    const node = this;
    const endpoint = config.endpoint;

    const site = RED.nodes.getNode(config.site);
    const {siteId, apiKey} = site;

    node.on('input', function(msg) {
      const requestUrl = buildRequestUrl(siteId, endpoint, {'api_key': apiKey});
      const options = url.parse(requestUrl);
      options.method = 'GET';

      const request = https.request(options, function(response) {
        const msg = {statusCode: response.statusCode, payload: ''};
        response.setEncoding('utf8');

        // Concatenate data coming in
        response.on('data', function(chunk) {
          msg.payload += chunk;
          node.log(chunk);
        });

        // Parse complete response
        response.on('end', function() {
          try {
            msg.payload = JSON.parse(msg.payload);
          } catch (e) {
            node.warn('Invalid response returned by SolarEdge API');
          }

          node.send(msg);
          node.status({});
        });
      });

      // Log errors
      request.on('error', function(err) {
        node.error(err);
        node.status({fill: 'red', shape: 'dot', text: 'error'});
      });

      request.end();
    }.bind(this));
  }

  RED.nodes.registerType('solaredge', SolarEdgeNode);

};
