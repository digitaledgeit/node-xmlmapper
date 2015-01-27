var expat = require('node-expat');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var pathval = require('pathval');

/**
 * A parser
 * @constructor
 * @param   {Array} schemas
 */
function Parser(schemas) {

	if (!(this instanceof Parser)) {
		return new Parser(schemas);
	}

	EventEmitter.call(this);

	this._parser = new expat.Parser('UTF-8');

	this._parser
		.on('error', this._onError.bind(this))
		.on('startElement', this._onElementStart.bind(this))
		.on('endElement', this._onElementEnd.bind(this))
		.on('text', this._onText.bind(this))
	;

	this._schemas = schemas;

}
util.inherits(Parser, EventEmitter);


Parser.prototype.parse = function(stream, callback) {
	var self = this;

	this._stream        = stream;
	this._elementStack  = [];
	this._currentSchema = null;
	this._currentObject = null;

	this._stream.on('data', function(data) {
		self._parser.write(data);
	});

	this._stream.on('end', function() {
		if (callback) callback();
	});

};

Parser.prototype.pause = function() {
	this._parser.stop();
	this._stream.pause();
	return this;
};

Parser.prototype.resume = function() {
	this._parser.resume();
	this._stream.resume();
	return this;
};

Parser.prototype._onElementStart = function(name, attr) {
	this._elementStack.push(name);

	//if there is not already a current schema
	if (!this._currentSchema) {

		//get the path of the current object element
		var path = this._elementStack.join('.');

		//try and find a schema matching the path
		for (var i=0; i<this._schemas.length; ++i) {
			var schema = this._schemas[i];
			if (schema.path === path) {

				//set the object and schema
				this._currentSchema = schema;
				this._currentObject = {};

				break;
			}
		}

	}

	if (this._currentSchema) {

		//get the path of the current property element
		var path = this._elementStack.join('.').substr(this._currentSchema.path.length+1);

		//check for attribute properties
		for (var i=0; i<this._currentSchema.properties.length; ++i) {
			var property = this._currentSchema.properties[i];

			//if its an attribute property at this path and the attribute has a value
			if (property.path.substr(0, path.length) === path && property.path[path.length] === '@' && attr[property.path.substr(path.length+1)]) {
				pathval.set(this._currentObject, property.name, attr[property.path.substr(path.length+1)]);
			}

		}
	}

};

Parser.prototype._onElementEnd = function(name) {

	//if there is a current schema
	if (this._currentSchema) {

		//get the path of the current object element
		var path = this._elementStack.join('.');

		//if the schema is ending
		if (this._currentSchema.path === path) {

			//filter the properties
			for (var i=0; i<this._currentSchema.properties.length; ++i) {
				var property = this._currentSchema.properties[i];
				var value = pathval.get(this._currentObject, property.name);
				if (property.toObject && value) {
					pathval.set(this._currentObject, property.name, property.toObject(value));
				}
			}

			//emit the object
			this.emit('parsed', this._currentSchema.name, this._currentObject);

			//cleanup the object and schema
			this._currentSchema = null;
			this._currentObject = null;

		}

	}

	this._elementStack.pop();
};

Parser.prototype._onText = function(text) {

	//if there is a current schema
	if (this._currentSchema) {

		//get the path of the current property element
		var path = this._elementStack.join('.').substr(this._currentSchema.path.length+1);

		//find a matching field
		for (var i=0; i<this._currentSchema.properties.length; ++i) {
			var property = this._currentSchema.properties[i];
			if (property.path === path) {

				//set the property
				var value = pathval.get(this._currentObject, property.name) || '';
				pathval.set(this._currentObject, property.name, value+text);

			}
		}

	}

};

Parser.prototype._onError = function(error) {
	this.emit('error', error);
};

module.exports = Parser;