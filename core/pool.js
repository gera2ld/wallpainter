const { fork } = require('child_process');

function defer() {
  const deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
}

function idFactory() {
  let id = 0;
  return () => {
    id += 1;
    return id;
  };
}

class Worker {
  constructor() {
    this.process = fork(`${__dirname}/worker.js`);
    this.process.on('message', ({ id, data, error }) => {
      const deferred = this.deferredMap[id];
      if (deferred) {
        if (error) deferred.reject(error);
        else deferred.resolve(data);
        delete this.deferredMap[id];
      }
    });
    this.getMessageId = idFactory();
    this.deferredMap = {};
  }

  defer(id) {
    const deferred = defer();
    this.deferredMap[id] = deferred;
    return deferred;
  }

  sendMessage(command, params) {
    if (!params) params = [];
    else if (!Array.isArray(params)) params = [params];
    const id = this.getMessageId();
    const deferred = this.defer(id);
    this.process.send({
      id,
      command,
      params,
    });
    return deferred.promise;
  }
}

class Pool {
  constructor(size) {
    this.size = size;
    this.workers = [];
    this.available = [];
    this.deferreds = [];
  }

  getNoWait() {
    return this.available.shift();
  }

  async get() {
    let worker = this.getNoWait();
    if (!worker) {
      if (this.workers.length < this.size) {
        worker = new Worker();
        this.workers.push(worker);
      } else {
        const deferred = defer();
        this.deferreds.push(deferred);
        worker = await deferred.promise;
      }
    }
    return worker;
  }

  put(worker) {
    const deferred = this.deferreds.shift();
    if (deferred) deferred.resolve(worker);
    else this.available.push(worker);
  }

  async sendMessage(command, params) {
    const worker = await this.get();
    try {
      return await worker.sendMessage(command, params);
    } finally {
      this.put(worker);
    }
  }
}

const pool = new Pool(3);

module.exports = pool;
