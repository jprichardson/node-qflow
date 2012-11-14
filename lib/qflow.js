var EventEmitter = require('events').EventEmitter

function QFlow (collection) {
  this.collection = collection || []
  this.running = 0
  this.processed = 0
  this.limit = Math.pow(2,53); //2^53 is the largest integer, highly unlikely as to what is wanted
  this.deqCallback = null
  this.isRunning = false
}

QFlow.prototype = new EventEmitter()
//require('util').inherits(QFlow, EventEmitter)


QFlow.prototype.deq = function(callback) {
  this.deqCallback = callback
  return this;
}

QFlow.prototype.enq = function(item) {
  this.collection.push(item)

  var _this = this
  if (this.isRunning && this.running === 0) {
    process.nextTick(function(){
      if (_this.isRunning && _this.running === 0)
        _this.start() //kick 'em off again
    })
  }

  return this;
}

QFlow.prototype.pause = function() {
  this.isRunning = false
  return this
};

QFlow.prototype.start = function(limit) {
  this.limit = limit || this.limit //probably paused, and then started again -> use same limit from first time
  this.isRunning = true

  var _this = this

  function doneCallback(err) {
    if (err) _this.emit('error', err)
    _this.running -= 1
    _this.processed += 1

    if (_this.isRunning) {
      if (_this.collection.length > 0) {
        var canRun = _this.limit - _this.running //most of the time, should be 1
        canRun = canRun > _this.collection.length ? _this.collection.length : canRun //is the amount that we want to run greater than our collection size?
        for (var i = 0; i < canRun; ++i)
          deqNext(doneCallback)
      } else if (_this.collection.length === 0 && _this.running === 0)
        _this.emit('empty')
    } else //pause was called
      if (_this.running === 0)
        _this.emit('paused') 
  }

  function deqNext(callback) {
     //this is needed because if there is a sync error in the first one, it'll fire again from doneCallback and then from the loop in start()
     //remove this line and verify from tests
    if (_this.collection.length > 0) {
      _this.running += 1
      try {
        _this.deqCallback(_this.collection.shift(), callback)
      } catch (error) {
        doneCallback(error)
      }
    }
  }

  var max = _this.limit > this.collection.length ? this.collection.length : _this.limit
  for (var i = 0; i < max; ++i)
    deqNext(doneCallback)

  return this
}

module.exports = function q(collection) {
  return new QFlow(collection)
}

