var EventEmitter = require('events').EventEmitter

function QFlow (collection) {
  this.collection = collection
  this.running = 0
  this.processed = 0
  this.limit = 1
  this.deqCallback = null
}

QFlow.prototype = new EventEmitter()
//require('util').inherits(QFlow, EventEmitter)


QFlow.prototype.deq = function(callback) {
  this.deqCallback = callback
  return this;
}

QFlow.prototype.enq = function(item) {
  this.collection.push(item)
  return this;
}

QFlow.prototype.start = function(limit) {
  this.limit = limit

  var _this = this

  function deqNext(callback) {
    _this.running += 1
    try {
      _this.deqCallback(_this.collection.shift(), callback)
    } catch (error) {
      doneCallback(error)
    }
  }

  function doneCallback(err) {
    if (err) _this.emit('error', err)
    _this.running -= 1
    _this.processed += 1

    if (_this.collection.length > 0)
      deqNext(doneCallback)
    else if (_this.collection.length === 0 && _this.running === 0)
      _this.emit('empty') 
  }

  var max = _this.limit > this.collection.length ? this.collection.length : _this.limit
  for (var i = 0; i < max; ++i)
    deqNext(doneCallback)

  return this
}

module.exports = function q(collection) {
  return new QFlow(collection)
}