var qflow = require('../lib/qflow')
  , testutil = require('testutil')

describe('qflow', function () {
  describe('> when collection is passed in and no more are added and a limit is set to 1', function() {
    it('should process the items', function(done) {
      var results = []
      qflow([1,2,3,4])
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

      qflow(data)
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

  describe('> when more items are queued up and limit is 2', function(done) {
    it ('should process the items', function(done) {
      var res = []
      var data = [
        function(done) { setTimeout(function() { res.push(1); done() }, 15) }, 
        function(done) { setTimeout(function() { res.push(2); done() }, 30) }, 
        function(done) { setTimeout(function() { res.push(3); done() }, 5) }, 
        function(done) { setTimeout(function() { res.push(4); done() }, 60) }
      ]

      var data2 = [
        function(done) { setTimeout(function() { res.push(5); done() }, 5) }, 
        function(done) { setTimeout(function() { res.push(6); done() }, 20) }, 
        function(done) { setTimeout(function() { res.push(7); done() }, 5) }, 
        function(done) { setTimeout(function() { res.push(8); done() }, 2) }
      ]

      var q = qflow(data)
      .deq(function(val, next) {
        val(next)
      })
      .on('error', function() {
        F (err)
        T (false)
      })
      .on('empty', function() {
        T (res[0] === 1)
        T (res[1] === 3)
        T (res[2] === 2)
        T (res[3] === 5)
        T (res[4] === 6)
        T (res[5] === 7)
        T (res[6] === 8)
        T (res[7] === 4)
        T (res.length === 8)
        done()
      })
      .start(2)

      data2.forEach(function(fun) {
        q.enq(fun)
      })

    })
  })

  describe('> when queue goes empty and more items are added', function() {
    it ('should start again and process the new items', function(done) {
      var res = []
      var data = [
        function(done) { setTimeout(function() { res.push(1); done() }, 15) }, 
        function(done) { setTimeout(function() { res.push(2); done() }, 30) }, 
        function(done) { setTimeout(function() { res.push(3); done() }, 5) }, 
        function(done) { setTimeout(function() { res.push(4); done() }, 60) }
      ]

      var data2 = [
        function(done) { setTimeout(function() { res.push(5); done() }, 5) }, 
        function(done) { setTimeout(function() { res.push(6); done() }, 20) }, 
        function(done) { setTimeout(function() { res.push(7); done() }, 5) }, 
        function(done) { setTimeout(function() { res.push(8); done() }, 2) }
      ]

      var emptyCount = 0;

      var q = qflow(data)
      .deq(function(val, next) {
        val(next)
      })
      .on('error', function() {
        F (err)
        T (false)
      })
      .on('empty', function() {
        if (emptyCount === 0) {
          data2.forEach(function(fun) {
            q.enq(fun)
          })

          emptyCount += 1
        } else {
          T (res[0] === 3)
          T (res[1] === 1)
          T (res[2] === 2)
          T (res[3] === 4)
          T (res[4] === 5)
          T (res[5] === 7)
          T (res[6] === 8)
          T (res[7] === 6)
          T (res.length === 8)
          done()
        }
       
      })
      .start(3)
    })
  })

  describe('> when an error is thrown or an error is passed as first param', function() {
    it ('should emit the error event', function(done) {
      var res = []
      var data = [
        function(done) { throw new Error('1')  },
        function(done) { setTimeout(function() { done(new Error('2')) }, 2) } 
      ]

      var errorCount = 0

      var q = qflow(data)
      .deq(function(val, next) {
        //console.log('VAL: ' + val)
        val(next)
      })
      .on('error', function(err) {
        T (err)
        errorCount += 1
      })
      .on('empty', function() {
        T (errorCount === 2)
        done()
      })
      .start(2)
    })
  })

  describe('> when paused is called', function() {
    it ('should finish the current running operations and emit the pause event', function(done) {
      var res = []
      var data = [
        function(done) { setTimeout(function() { res.push(1); done() }, 15) }, 
        function(done) { setTimeout(function() { res.push(2); done() }, 30) }, 
        function(done) { setTimeout(function() { res.push(3); done() }, 5) }, 
        function(done) { setTimeout(function() { res.push(4); done() }, 12) }
      ]

      var q = qflow(data)
      q.deq(function(val, doneFun) {
        q.pause()
        val(doneFun)
      })
      .on('error', function(err) {
        console.error(err)
        F (err)
        T (false)
      })
      .on('empty', function() {
        console.dir(res)
        T (false) //should never get here
      })
      .on('paused', function() {
        T (res[0] === 1)
        T (res[1] === 2)
        T (res.length === 2)
        done()
      })
      .start(2)
    })
  })

  describe('> when no array is passed into the constructor', function() {
    it ('should create an empty array', function(done) {
      var res = []
      var q = qflow()
      
      q.deq(function(val, next) {
        res.push(val)
        next()
      })
      .on('empty', function() {
        T (res.length === 2)
        T (res[0] === 1)
        T (res[1] === 2)
        done()
      })

      q.enq(1)
      q.enq(2)
      q.start()

    })
  })

})

