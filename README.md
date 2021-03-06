# xmlmapper

Extract fragments of an XML document as JavaScript objects.

Ideal for large XML documents where you can't load the whole document into memory and you only care about a subset of the values.

## Installation 

    npm install --save xmlmapper
    
## Usage

    var fs      = require('fs');
    var Parser  = require('xmlmapper');

    var schema = {
        name: 'individual',
        path: 'ccb_api.response.individuals.individual',
        properties: [
            {name: 'id',        path: '@id',      toObject: parseInt}, //attribute
            {name: 'firstName', path: 'first_name'},
            {name: 'lastName',  path: 'last_name'},
            {name: 'email',     path: 'email'},
            {name: 'active',    path: 'active',   toObject: toBool},
            {name: 'created',   path: 'created',  toObject: toDate},
            {name: 'modified',  path: 'modified', toObject: toDate}
        ]
    };
    
    Parser([schema])
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
    	return new Date(value);
    }

## TODO

 - writer
 - cdata
 - globs - e.g. `path=ccb_api.response.individuals.individual.*`
 - arrays - e.g. `name=address[].street`
 - conditions - e.g. `path=ccb_api.request.parameters.argument[name="srv"]@value`
 
## License

The MIT License (MIT)

Copyright (c) 2015 James Newell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
