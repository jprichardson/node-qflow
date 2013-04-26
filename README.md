Node.js - qflow
================

[![build status](https://secure.travis-ci.org/jprichardson/node-qflow.png)](http://travis-ci.org/jprichardson/node-qflow)

A very simple data queue processing library.



Why?
----

[BatchFlow](https://github.com/jprichardson/node-batchflow) didn't cut it because I needed to keep batch processing a data set.



What About queue-flow?
----------------------

Do not confuse this (`qflow`) with the great library [queue-flow](http://dfellis.github.com/queue-flow/2012/09/21/tutorial/) by [David Ellis](http://dfellis.posterous.com/). `queue-flow` does much more and very powerful, you should check it out. I wanted something simpler for my needs. I unfortunatley chose the name `qflow` after `queue-flow` was already taken. I did this because I wanted to keep a cohesive naming scheme with my other `flow` libraries: [NextFlow](https://github.com/jprichardson/node-nextflow), [BatchFlow](https://github.com/jprichardson/node-batchflow), and [TriggerFlow](https://github.com/jprichardson/node-triggerflow).



Installation
------------

    npm install qflow



Example
------

Super simple example:


```javascript
var results = []
qflow([1,2,3,4])
.deq(function(val, next) {
  results.push(val * 2)
  next()
})
.on('empty', function() {
  console.dir(results) //[2,4,6,8]
})
.start(1) //essentially process sequentially.
```

Methods
-------

Todo. In the meantime, use the source Luke.


License
-------

(MIT License)

Copyright 2012, JP Richardson  <jprichardson@gmail.com>


