var q = require('../lib/qflow')
  , testutil = require('testutil')

describe('qflow', function () {
  describe('> when collection is passed in and no more are added and a limit is set to 1', function() {
    it('should process the items', function(done) {
      var results = []
      q([1,2,3,4])
      .deq(function(val, next) {
        results.push(val * 2)
        next()
      })
      .on('error', function(err) {
        F (err)
        T (false)
      })
      .on('empty', function() {
        T (results[0] === 2)
        T (results[1] === 4)
        T (results[2] === 6)
        T (results[3] === 8)
        T (results.length === 4)
        done()
      })
      .start(1)  
    })
  })

  describe('> when limit is > 1', function(done) {
    it ('should process the items', function(done) {
      var res = []
      var data = [
        function(done) { setTimeout(function() { res.push(1); done() }, 15) }, 
        function(done) { setTimeout(function() { res.push(2); done() }, 30) }, 
        function(done) { setTimeout(function() { res.push(3); done() }, 5) }, 
        function(done) { setTimeout(function() { res.push(4); done() }, 12) }
      ]

      q(data)
      .deq(function(val, next) {
        val(next)
      })
      .on('error', function() {
        F (err)
        T (false)
      })
      .on('empty', function() {
        T (res[0] === 3)
        T (res[1] === 1)
        T (res[2] === 4)
        T (res[3] === 2)
        T (res.length === 4)
        done()
      })
      .start(3) 
    })
  })


})