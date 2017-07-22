'use strict';
const Stream = require('stream');
const StatsD = require('node-statsd');

const debugLog = (payload) => {
  console.log('\x1b[36m%s\x1b[0m', 'DEBUG: Sending metric to statsd');
  console.log(payload)
}

class DogReporter extends Stream.Writable {
  constructor(config) {
    super({ objectMode: true, decodeStrings: false });

    this.config = Object.assign(config, {
      prefix: config.prefix || 'node.hapi.router',
      globalTags: config.globalTags ? config.globalTags.concat(['hapi']) : [],
    });

    this.statsd = new StatsD({
      host: this.config.host || false,
      port: this.config.port || false,
    });
  }

  increment(metricName, tags) {
    if (this.config.debug) {
      debugLog({ type: 'increment', metricName, tags });
    }

    this.statsd.increment(metricName, tags);
  }

  histogram(metricName, time, tags) {
    if (this.config.debug) {
      debugLog({ type: 'histogram', metricName, time, tags });
    }

    this.statsd.histogram(metricName, time, tags);
  }

  _write(data, enc, callback) {
    if (data.event !== 'response') return callback();

    let metricTags = this.config.globalTags.slice(0); // Clonig globalTags to avoid mutating state
    const statusCode = data.statusCode || false;
    const responseTime = data.responseSentTime || false;

    if (data.route) metricTags.push(`route:${data.route}`);
    if (data.method) metricTags.push(`method:${data.method.toLowerCase()}`);
    if (data.httpVersion) metricTags.push(`http_version:${data.httpVersion}`);
    if (data.tags && Array.isArray(data.tags)) metricTags = metricTags.concat(data.tags);

    if (statusCode) {
      metricTags.push(`status_code:${statusCode}`);

      this.increment(`${this.config.prefix}.status_code.${statusCode}`, metricTags);
      this.increment(`${this.config.prefix}.status_code.total`, metricTags);
    }

    if (responseTime) {
      this.histogram(`${this.config.prefix}.response_time`, responseTime, metricTags);
    }

    return callback();
  }
}

module.exports = DogReporter;
