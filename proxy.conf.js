const PROXY_CONFIG = [
    {
      context: [
        "/api"
      ],
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      autoRewrite: true,
      // "target": "https://yjs.grandsportautonft.io",
      "target": "http://localhost:80/",
      "secure": true,
      "changeOrigin": true,
      "logLevel": "debug"
    }, {
      context: [
        "/options"
      ],
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      autoRewrite: true,
      "target": "http://localhost:61438",
      // "target": "http://127.0.0.1",
      "secure": false,
      "changeOrigin": true,
      "logLevel": "info"
    }, {
      context: [
        "/cdn"
      ],
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      autoRewrite: true,
      "target": "https://fhj079vapc.execute-api.eu-central-1.amazonaws.com/api",
      // "target": "http://localhost:7777",
      // "target": "http://127.0.0.1",
      "secure": false,
      "changeOrigin": true,
      "logLevel": "info"
    }
  ];
  //https://github.com/angular/angular-cli/blob/master/docs/documentation/stories/proxy.md
  module.exports = PROXY_CONFIG;
  