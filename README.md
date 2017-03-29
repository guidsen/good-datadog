A HapiJS good reporter for sending request metrics to Datadog.

Install the plugin with the `npm install good-datadog` command.  
After installing the NPM package you should register the reporter via the good plugin.

### Example usage
```javascript
server.register({
  register: require('good'),
  options: {
    reporters: {
      dogReporter: [{
        module: 'good-datadog',
        args: [{
          debug: true,
          globalTags: [`env:${process.env.NODE_ENV}`],
        }],
      }],
    },
  },
});
```

### Options
The module accepts the following arguments:

- `host` - The host of the statsd server. Defaults to `localhost`.
- `port` - The port of the statsd server. Defaults to `8125`.
- `prefix` - The prefix of every metric. Defaults to `node.hapi.router`.
- `globalTags` - Define tags that should be sent with every metric. Defaults to `['hapi']`.
- `debug` - Debug mode that will `console.log` the metrics that are sent. Defaults to `false`.

### Metrics
The module will send the following metrics to the Datadog Agent. By default every metric is prefixed with `node.hapi.router`, which can be changed via the reporter config.

- `node.hapi.router.status_code.[status_code]` - Increments the total amount of a specific status code.
- `node.hapi.router.status_code.total` - Increments the total amount of incoming requests.
- `node.hapi.router.response_time.count` - The number of times the metric is sampled.
- `node.hapi.router.response_time.avg` - The average response time.
- `node.hapi.router.response_time.median` - The median of the response time.
- `node.hapi.router.response_time.max` - The maximum of the response time.
- `node.hapi.router.response_time.95percentile` - The 95th percentile of the response time. Useful for filtering out great performing requests.

### Metric Tags
Every metric being sent to the Datadog Agent contains some extra metadata that could be useful for filtering your graphs.

- `route:[route_name]` - The name of your route. Example: `/v1/posts/_postid_`.
- `method:[method]` - The method of the request in lowercase. Example: `post`.
- `http_version:[http_version]` - The HTTP version of the incoming request. Example: `1.1`.
- `status_code:[status_code]` - The status code of the request. Example: `404`.

> **Note**: The tags that are being added via the HapiJS route config (https://hapijs.com/api#route-configuration) will also be added to the metric as extra metadata.

### Contribution
Do not hesitate to open an issue or pull request, if you want this reporter to sent some extra data to Datadog.
If you have any suggestions on useful metrics, please open an issue containing the metric and the reason why you think it's useful.
