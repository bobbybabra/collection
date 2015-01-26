# collection
Handles collection for store (a la backbone)

## Install

### Via Bower

By running ```$ bower install simple-collection``` from your console.

### Include in your HTML

Include collection.js (or collection.min.js) in your index.html.

```html
<!doctype html>
<html>
  <head>
    <script src="/bower_components/simple-collection/src/collection.min.js">
    ...
  </head>
  <body>
    ...
  </body>
</html>
```

## Quick Usage

```javascript
var test_1 = {
    id: 1,
    title: "test 1"
};

var test_2 = {
    id: 2,
    title: "test 2"
};

var test_3 = {
    id: 3,
    title: "test 3"
};

var tests = Collection([test_1, test_2, test_3]);

console.log('--each--');
tests.each(function (model) {
    console.log(model);
});

console.log('--reverse--');
tests.reverse().each(function (model) {
    console.log(model);
});

console.log('--where--');
tests.where({id: [1,3,2], 'title': ['test 2', 'test 1']}).each(function (model) {
    console.log(model);
});

console.log('--remove--');
tests.remove('id', 3).each(function (model) {
    console.log(model);
});

console.log('--get--');
var model = tests.get('title', 'test 2')
console.log(model);
```

## How to

### Create a collection

Collection constructor takes 2 optional arguments. The first argument is
expected to be an array of object, the second defines the primary key for
every object contained by the collection.

By default the `Collection` will be emtpy and the primary key will be
set to `id`.

Every model needs to have an ID. A convenience `Collection.uuid()` method
is provided for you to generate random unique IDs.


### Collection.add

`Collection.add()` accepts an array or a single element to add to the
collection.

```javascript
var my_collection = new Collection();
my_collection.add({id: 1, name: 'first'});

// returns 'first'
my_collection.get(1).name;

// add with same id will replace existing element
my_collection.add([{id: 1, name: 'new first'}]);

// returns 'new first'
my_collection.get(1).name;
```


### Collection.remove

`Collection.remove()` takes either the primary key to be removed

```javascript
var my_collection = new Collection();
my_collection.add({id: 1, name: 'first'}, {id: 2, name: 'second'}]);

// remove object with id (primary key) equal to 1
my_collection.remove(1);

or the attribute and the value to be removed

// remove object with name equal to 'second'
my_collection.remove('name', 'second');
```


### Collection.get

Same as remove, `Collection.get()` accepts a primary key or an
attribute and value to match.

If a primary key is passed a single element will be returned,
in the the case of an attribute name and value you'll receive
an array (possibly empty)

```javascript
var my_collection = new Collection();
my_collection.add({id: 1, name: 'first'}, {id: 2, name: 'second'}]);

my_collection.get(1);
// returns {id: 1, name: 'first'}
```

or the attribute and the value to match across the collection. Beware that
this method will return an array and not a single model as previously.

```javascript
my_collection.get('name', 'second');
// returns [{id: 2, name: 'second'}]
```


### Collection.where

You may pass a JSON select object to `Collection.where()` in order to
make a selection within the collection.

```javascript
function is_odd(value) {
  return value % 2
}

var my_collection = new Collection([
  {id: 1, name: 'Joe'},
  {id: 2, name: 'Joe'},
  {id: 3, name: 'Tedd'}
]);

// filters id with a callable and name with a value
my_collection.where({id: is_odd, name: 'Joe'});
// returns new Collection([{id: 1, name: 'Joe'}])
```

The value returned by `Collection.where()` is always a Collection instance.

### Collection.select

Select will return the attributes you pick, not unlike pluck but with a twist.
If you provide a string, `Collection.select()` will return you an array of value

```javascript
var my_collection = new Collection([
  {id: 1, first_name: 'Joe', last_name: 'Doe'},
  {id: 2, first_name: 'Joe', last_name: 'Regan'},
  {id: 3, first_name: 'Tedd', last_name: 'Ford'}
]);

my_collection.select('id');
// returns [1,2,3]
```

But if you pass it an array of keys, you'll receive a array of JSON object
composed only of those keys

```javascript
my_collection.select(['id','first_name'])
// returns  [{id: 1, first_name: 'Joe'},{id: 2, first_name: 'Joe'}...]
```


*Note*: Now you can get fancy and do stuff like an intersection of collection


```javascript
var engineers = new Collection([
  {id: 1, first_name: 'Joe', last_name: 'Doe'},
  {id: 2, first_name: 'Joe', last_name: 'Regan'},
]);

var professors = new Collection([
  {id: 1, first_name: 'Joe', last_name: 'Doe'},
  {id: 3, first_name: 'Tedd', last_name: 'Ford'}
]);

professor_engineers = new professors.where({'id': engineers.select('id')});
// returns new Collection([{id: 1, first_name: 'Joe', last_name: 'Doe'}])
```



### Collection.filter

An alternative to `Collection.where` is to use a filter. `Collection.filter`
simply accepts a callback. The callback will be called with every object
contained in the collection. If the callback returns false, the object will
be filtered out from the returned Collection, else it will be kept.

```javascript
function has_odd_id(object) {
  return object.id % 2
}

var my_collection = new Collection([
  {id: 1, name: 'Joe'},
  {id: 2, name: 'Joe'},
  {id: 3, name: 'Tedd'}
]);

my_collection.filter(has_odd_id);
// returns new Collection([{id: 1, name: 'Joe'}, {id: 3, name: 'Tedd'}])
```

The value returned by `Collection.filter()` is always a Collection instance.

### Collection.sort

All to sort the collection according to a given attribute. You may also pass
one of your sorting method as second arguments

```javascript
var my_collection = new Collection([
  {id: 1, name: 'Joe'},
  {id: 2, name: 'Alan'},
  {id: 3, name: 'Fred'}
]);

my_collection.sort('name');
// returns new Collection([{id: 2, name: 'Alan'}, {id: 3, name: 'Fred'}, {id: 1, name: 'Joe'}])
```

### Other quickies

* `isEmpty()`: Return true if the collection doesn't contain any object.
* `empty()`: Flushes the collection, removes all the object it contains.
* `size()`: Returns the size of the collection.
* `each(callback)`: Calls callback(obj) for every object in the collection.
* `uuid()`: returns a uniq valid UUID4 format.
* `reverse()`: reverse and returns the collection (not a new collection).
* `models`: returns the collection's content (an array).

## License

This library is released under the MIT license

The MIT License (MIT)

Copyright (c) 2015 Brice Leroy <bbrriiccee@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
