import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InterpolateService {

  constructor() {
  }

  static getNested(nestedObj : any, path: any, res?: any) {
    let pathArr: any;
    if (res) {
      const newPath = path.split(res.toString());
      pathArr = [];
      newPath.forEach((item: any, index: any) => {
        item.split('.').forEach((el: any) => {
          if (el) {
            pathArr.push(el);
          }
        });
        if (newPath.length > index + 1) {
          pathArr.push(res);
        }
      });
      console.log('pathArr', pathArr);
    } else {
      pathArr = path.split('.');
    }
    return pathArr.reduce((obj: any, key: any) => {
      if (Array.isArray(key)) {
        return key;
      }
      return obj && obj[key] !== 'undefined'
        ? typeof obj[key] === 'function'
          ? obj[key]()
          : obj[key]
        : undefined;
    }, nestedObj);
  };

  static suplant(that: any, o: any, res?: any) {
    const self = this;
    let str: any;
    let r;
    const regex = /\${([^{}]*)}/g;
    const found = that.match(regex);
    if (found && found[0] === that) {
      str = self.getNested(
        o,
        that.replace(regex, (a: any, b: any) => {
          return b;
        }),
        res
      );
    } else {
      var matches = regex.exec(that);
      r = self.getNested(o, matches && matches[1]);
      str = that.replace(regex, function (a: any, b: any) {
        return self.getNested(o, b, res);
      });
    }
    if (typeof r === 'object') {
      str = this.suplant(str, o, r);
    } else if (
      typeof str === 'string' &&
      str !== that &&
      str.match(regex)?.length
    ) {
      str = this.suplant(str, o);
    }
    return str;
  };

  static evaluate(exp: any, callback: any) {
    let workerStart = `
          self.addEventListener('message', function(e) {
            if(e.data){
              var x =`;
    const workerRest = `;
    postMessage(JSON.stringify(x));
            }
        });`;
    var code = workerStart + exp + workerRest;
    // prepare the string into an executable blob
    var bb = new Blob([code], {
      type: 'text/javascript'
    });

    // convert the blob into a pseudo URL
    var bbURL = URL.createObjectURL(bb);

    // Prepare the worker to run the code
    var worker = new Worker(bbURL);

    // add a listener for messages from the Worker
    worker.addEventListener('message', function (e: any) {
      var string = (e.data);
      callback(string)
    }.bind(this));

    // add a listener for errors from the Worker
    worker.addEventListener('error', function (e) {
      var string = (e.message).toString();
      console.log(string)
    });

    // Finally, actually start the worker
    worker.postMessage('start');

    // Put a timeout on the worker to automatically kill the worker
    setTimeout(function () {
      worker.terminate();
      // @ts-ignore
      worker = null;
    }, 10000);
  }
}
