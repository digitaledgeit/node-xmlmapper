var fs      = require('fs');
var Parser  = require('..');

var schema1 = {
	name: 'request',
	path: 'ccb_api.request',
	properties: [
		{name: 'parameter', path: 'parameters.argument@value'},
	]
};

var schema2 = {
	name: 'individual',
	path: 'ccb_api.response.individuals.individual',
	properties: [
		{name: 'id',        path: '@id',      toObject: parseInt},
		{name: 'firstName', path: 'first_name'},
		{name: 'lastName',  path: 'last_name'},
		{name: 'email',     path: 'email'},
		{name: 'active',    path: 'active',   toObject: toBool},
		{name: 'created',   path: 'created',  toObject: toDate},
		{name: 'modified',  path: 'modified', toObject: toDate}
	]
};

Parser([schema1, schema2])
	.on('parsed', function(name, object) {
		console.log(name, object);
	})
	.parse(fs.createReadStream(__dirname+'/example.xml'), function(err) {
		console.log('Parsed.');
	})
;

function toBool(value) {
	return String(value).toLowerCase() === 'true';
}

function toDate(value) {
	return new Date(String(value));
}
