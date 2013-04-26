if (!global.setImmediate) { //below Node v0.10
  global.setImmediate = process.nextTick;
}

var EventEmitter = require('events').EventEmitter
  , inherits = require('util').inherits

function QFlow (array) {
  this.arr = array || []
  this.limit = Math.pow(2,53); //2^53 is the largest integer, highly unlikely as to what is wanted
  this.deqCallback = null
  this.deqNext = null
  this.running = 0
  this.completed = 0
}
inherits(QFlow, EventEmitter)

QFlow.prototype.deq = function(callback) {
  this.deqCallback = callback
  return this;
}

QFlow.prototype.enq = function(item) {
  this.arr.push(item)

  var _this = this
  if (this.running === 0) {
    setImmediate(function(){
      if (_this.running === 0)
        _this.start() //kick 'em off again
    })
  }

  return this
}

QFlow.prototype.start = function(limit) {
  this.limit = limit || this.limit
  _this = this

  function runEm () {
    var limit = _this.limit - _this.running
    var max = limit > _this.arr.length ? _this.arr.length : limit
    //console.log("max: %d", max)
    for (var i = 0; i < max; ++i) {
      fireNext(doneCallback)
    }
  }

  function fireNext (callback) {
    _this.running += 1
    var item = _this.arr.shift()
    setImmediate(function() {
      _this.deqCallback(item, callback)
    })
  }

  function doneCallback () {
    _this.running -= 1
    _this.completed += 1

    //console.log("%d : %d".green, _this.arr.length, _this.running)
    if (_this.arr.length > 0)
      runEm()
    else 
      if (_this.running == 0)
        _this.emit('empty')
  }

  runEm()

  return this
}

module.exports = function q(collection) {
  return new QFlow(collection)
}

