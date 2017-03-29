'use strict';
const Stream = require('stream');
const StatsD = require('node-statsd');

class DogReporter extends Stream.Transform {
  constructor(config) {
    super({ objectMode: true });

    this.config = config;

    this.statsd = new StatsD({
      host: config.host || false,
      port: config.port || false,
      prefix: config.prefix || 'node.hapi.router',
      globalTags: config.globalTags || config.globalTags.concat(['hapi']),
    });
  }

  increment(metricName, tags) {
    if (this.config.debug) {
      console.log('Sending metric to statsd', { type: 'increment', metricName, tags })
    }

    this.statsd.increment(metricName, tags);
  }

  histogram(metricName, time, tags) {
    if (this.config.debug) {
      console.log('Sending metric to statsd', { type: 'histogram', metricName, time, tags })
    }

    this.statsd.histogram(metricName, time, tags);
  }

  _transform(data, enc, next) {
    if (data.event !== 'response') return next(null, data);

    let requestMeta = [];
    const statusCode = data.statusCode || false;
    const responseTime = data.responseSentTime || false;

    if (data.route) requestMeta.push(`route:${data.route}`);
    if (data.method) requestMeta.push(`method:${data.method.toLowerCase()}`);
    if (data.httpVersion) requestMeta.push(`http_version:${data.httpVersion}`);
    if (data.tags && Array.isArray(data.tags)) requestMeta = requestMeta.concat(data.tags);

    if (statusCode) {
      requestMeta.push(`status_code:${statusCode}`);

      this.increment(`.status_code.${statusCode}`, requestMeta);
      this.increment('.status_code.total', requestMeta);
    }

    if (responseTime) {
      this.histogram('.response_time', responseTime, requestMeta);
    }

    return next(null, data);
  }
}

module.exports = DogReporter;
