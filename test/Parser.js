var fs = require('fs');
var assert = require('assert');
var streams = require('memory-streams');
var Parser = require('..');

describe('Parser', function() {

  describe('.parse()', function() {

    it('should call the callback when the stream emits an error', function(done) {

      var stream = new streams.ReadableStream('');
      var parser = new Parser([{name: 'individual'}]);

      parser.parse(stream, function(err) {
        assert.notEqual(err, null);
        done();
      });

      stream.emit('error', new Error('Err #1'));

    });

    it('should call the callback once the stream emits an error and ends', function(done) {

      var stream = new streams.ReadableStream('<api></api>');
      var parser = new Parser([{name: 'individual'}]);

      parser.parse(stream, function(err) {
        done();
      });

      stream.append(null);
      stream.emit('error', new Error('Err #1'));

    });

  });

});