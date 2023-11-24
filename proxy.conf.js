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
      "target": "https://641b-93-123-32-30.ngrok.io",
      "secure": true,
      "changeOrigin": true,
      "logLevel": "debug"
    }, {
      context: [
        "/game"
      ],
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      autoRewrite: true,
      "target": "https://fhj079vapc.execute-api.eu-central-1.amazonaws.com/api",
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
  