# Collection [![Build Status](https://travis-ci.org/debrice/collection.svg?branch=master)](https://travis-ci.org/debrice/collection)

Handles collection (à la backbone) for your store and other things. It's not opiniated, not doing AJAX, not doing views, not doing routing etc... Just does one thing, manage collections of your objects and is good at it.

[Read the API!](src/README.md)

4.5kb, no dependencies, to do cool things like:

```javascript
function is_odd(value) {
  return value % 2
}

var my_collection = new Collection([
  {id: 1, first_name: 'John', last_name: 'Doe'},
  {id: 2, first_name: 'John', last_name: 'Regan'},
  {id: 3, first_name: 'Tedd', last_name: 'Ford'}
]);

// filters id with a callable and first_name with a value, only select first_name and last_name
my_collection.where({id: is_odd, first_name: 'John'}).select(['first_name', 'last_name']);
// returns [{last_name: 'Doe', first_name: 'John'}]
```

## Install

### Via Bower

By running ```$ bower install simple-collection``` from your console.

### Include in your HTML

Include collection.js (or collection.min.js) in your index.html.

```html
<!doctype html>
<html>
  <head>
    <script src="/bower_components/simple-collection/src/collection.min.js"></script>
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

var tests = new Collection([test_1, test_2, test_3]);

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
is provided for you to generate random unique IDs. By default the collection
will index by the 'id' key. To change this behavior, simply pass the primary key
to the constructor:

```javascript
var models = [
 {ext_id: 1, value: 'one'},
 {ext_id: 2, value: 'two'},
 {ext_id: 3, value: 'three'}
];
var my_collection = new Collection(models, 'ext_id');
```

#### Composed primary keys

In some cases, you may have composed primary keys, meaning the combination
of two attributes defines the uniqueness of your object. In those cases, when
searching through your collection using a composed PK, you'll need to provide
an array of values.

```javascript
var address_join = [
 {address_id: 1, user_id: 1, position:2},
 {address_id: 2, user_id: 1, position:3},
 {address_id: 1, user_id: 2, position:5}
];
var addresses = new Collection(address_join, ['address_id', 'user_id']);

// returns the first record (primary key is explicit)
addresses.get(addresses.primary_key, [1,1]);

// returns the second record (primary key is implicity)
addresses.get([2,1]);

// Replace the 2nd record
addresses.add({address_id: 2, user_id: 1, position:1});

// Removes the first 2 records (an array of PKs)
addresses.remove([[2,1],[1,1]]);
```

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

### Collection.keep

`Collection.keep()` accepts the same argument as `remove` but will keep
the matching element, removing the non matching ones.

### Collection.remove

`Collection.remove()` takes either the primary key to be removed

```javascript
var my_collection = new Collection();
my_collection.add({id: 1, name: 'first'}, {id: 2, name: 'second'}]);

// remove object with id (primary key) equal to 1
my_collection.remove(1);
```

...the attribute and the value to be removed

```javascript

// remove object with name equal to 'second'
my_collection.remove('name', 'second');
```

or a callback, not unlike filter.

```javascript
function has_odd_id(object) {
  return object.id % 2
}

var my_collection = new Collection([
  {id: 1, name: 'Joe'},
  {id: 2, name: 'Joe'},
  {id: 3, name: 'Tedd'}
]);

my_collection.remove(has_odd_id);
// returns the reduced Collection([{id: 2, name: 'Joe'}])
```

Finally, when removing using an attribute, you can use where helper
to do so

```javascript
var my_collection = new Collection([
  {id: 1, name: 'Joe', age: 18},
  {id: 2, name: 'Joe', age: 22},
  {id: 3, name: 'Tedd', age: 50}
]);

my_collection.remove('age', Collection.within(18,22));
// returns the reduced Collection([{id: 1, name: 'Joe', age: 18},{id: 2, name: 'Joe', age: 22}])
```

### Collection.get

Same as remove, `Collection.get()` accepts a primary key or an
attribute and value to match.

A single element is always returned. If a primary key is passed
the corresponding object will be returned,
in the the case of an attribute name and value you'll receive
the first matching object.

```javascript
var my_collection = new Collection();
my_collection.add({id: 1, name: 'first'}, {id: 2, name: 'second'}]);

my_collection.get(1);
// returns {id: 1, name: 'first'}
```

or the attribute and the value to match across the collection.

```javascript
my_collection.get('name', 'second');
// returns {id: 2, name: 'second'}
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

### Collection.not

This will return you the opposite of `where`
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
my_collection.not({id: is_odd});
// returns new Collection([{id: 2, name: 'Joe'}])
```

### Where helpers

Where comes with some helpers to make your life easier.

* `collection.min(value)`: Only keep value equal or above the value
* `collection.max(value)`: Only keep value equal or under the value
* `collection.within(value, value)`: Only keep value within the values (inclusive)
* `collection.contains(str)`: Accept a string or regexp to match string against
* `collection.fuzzy(str)`: Fuzzy match strings "to ea" will match "Today I eat"

Usage:

```javascript
var collection = new Collection([
  {id: 1, name: 'Joe', age: 16},
  {id: 2, name: 'Joe', age: 22},
  {id: 3, name: 'Tedd', age: 55}
]);

collection.where(age: collection.min(22), name: collection.contains('o')});
// returns new Collection([{id: 2, name: 'Joe', age: 22}]);
```

### Collection.page

Often you'll need to display your collections paginated. `Collection.page`
returns a JSON object to help you achieve paginated listing.

```javascript
var collection = new Collection([model, model,...]);

// display the first page of 50 elements
page = collection.page(50, 1);
console.log(page);
{
  page: 1,
  has_previous: false,
  has_next: true,
  from: 0,
  to: 49,
  models: [model, model,...]
}
```

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

You can also map values and pass function to create new ones

```javascript
function combineName(model){
  return model.first_name + ' ' + model.last_name;
}
my_collection.select({ext_id: 'id', name: combineName});
// returns  [{ext_id: 1, name: 'Joe Doe'}, {ext_id: 2, name: 'Joe Regan'},...]
```

*Note*: Now you can get fancy and do stuff like an intersection of collection


```javascript
var joe_doe = {id: 1, first_name: 'Joe', last_name: 'Doe'};
var joe_regan = {id: 2, first_name: 'Joe', last_name: 'Regan'};
var tedd_ford = {id: 3, first_name: 'Tedd', last_name: 'Ford'};

var engineers = new Collection([joe_doe, joe_regan]);

var professors = new Collection([joe_doe, tedd_ford])

// An intersections
var professor_engineers = professors.where({'id': engineers.select('id')});
// returns new Collection([joe_doe])

// A Union
var professor_and_engineers = new Collection(professors.models).add(engineers.models);
// returns new Collection([joe_doe, joe_regan, tedd_ford])
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

### Events

You may register listeners to actions happening to your collection. Available
events are:

* `change`: Triggered on every event (remove, sort, add)
* `sort`: Whenever the collection is reversed or sorted
* `add`: A model got added to your collection
* `remove`: A model got removed to your collection

When calling on, a de-register method is returned to simplify deregistering
process.

```javascript
var my_collection = new Collection([{id: 1, name: 'Joe'}]);

function onChange(){
  alert("Collection got changed!");

  // stop listening to change
  unregister();
}

// trigger onChange method when collection changes
var unregister = my_collection.on('change', onChange);

// will trigger the `add` and `change` event
my_collection.add({id: 2, name: 'Alan'});
```

## Views

Not unlike database views, you can build a view from a collection's where
clause. When the parent collection changes (remove or add are triggered),
the view listens to those changes and update itself accordingly. Your view will
always reflect the where clause applied on it initially.

Note that altering a view, besides sorting, will actually alter it's parent
collection. When you `add`, `remove`, `keep` or `empty` on a view, those will
be executed on the collection being viewed.

```js
var people = new Collection([tim, fred, john]);
var engineers = new CollectionView(people, {job_id: engineer.id});
// engineers.models is [tim, fred]
// adding steve (an engineer) to people, will be reflected to the view
people.add(steve);
// engineers now contains [tim, fred, steve]
```

Views can also be chained, aka. a source of a view can be another view...

## Proxies

Proxies are subsets of collection. Unlike views, their content can be altered
and they are initialized empty. Proxies are limited to what their parent
collection contains. When its parent loses some record, a proxy will stay
consistent by removing model it contains that aren't part of its parent anymore.
Proxies are useful to make a sub selection of a collection.

Proxy can be chained, a use case could be displaying a sub selection
that can be highlighted on click. You would then need a proxy for the
selection and a proxy of this selection to store which one is highlighted.
Since proxy auto-truncate themselves, if the selection were to be reduced, the
highlighted sub-proxy would also truncate itself accordingly.

```js
var people = new Collection([tim, fred, john]);
var people_selection = new CollectionProxy(people);
var people_selection_highlight = new CollectionProxy(people_selection);
// since proxy start empty, you have to fill them
people_selection.add([tim, fred]);
// highlight being a proxy of a proxy, it can only contain what
// it's parent contains (here tim or fred)
people_selection_highlight([tim]);

people.remove(tim.id);
people_selection.size() == 1;
// true as removing from people, removes from the selection
people_selection_highlight.size() == 0;
// true as removing from people, also removes from the proxy of the selection
```

## Joins

Ok, this is becoming more complex now. The assumption is made that the
collections you deal with are related to each others. If they are not then
this is not for you, otherwise stay with me.

Join allows you to work and query multiple collection in one shot. Once you
define their relations, you may leverage the flexibility of `where` accross
all the collections and the join will take care of trimming the related
collection for you.

Ok, so there are my collections

```js

var john = {
  id: 1,
  first_name:'john',
  last_name:'redford',
  xid: 'x1',
  age: 22,
  job_id: 1 //engineer
};

var fred = {
  id: 2,
  first_name:'fred',
  last_name: 'doe',
  xid: 'x2',
  age: 16,
  job_id: 2 //technician
};

var tim = {
  id: 3,
  first_name:'tim',
  last_name: 'doe',
  xid: 'x3',
  age: 55,
  job_id: 1 //engineer
};

var jobs = [
  {id: 1, title: 'engineer'},
  {id: 2, title: 'technician'}
];

// many to many relation user to addresses
var address_join = [
  {id: 1, user_id: john.id, address_id: 1},
  {id: 2, user_id: john.id, address_id: 2},
  {id: 3, user_id: fred.id, address_id: 2},
  {id: 4, user_id: tim.id, address_id: 4}
];

var addresses = [
  {id: 1, street: '123 rose ave', city: 'New York', zipcode: '10005'},
  {id: 2, street: '321 blue street', city: 'New York', zipcode: '1006'},
  {id: 3, street: '456 red blvd', city: 'Los Angeles', zipcode: '90046'},
  {id: 4, street: '65 black rd', city: 'Los Angeles', zipcode: '90046'},
];
```

First lets decide my query. This is the part that will probably evolve with
your user input. I want all the users in Los Angeles. Since you'll
be going through multiple collection at a time, it's necessary that you
indicate the collection name you're filtering on:

```js
var where = {
  'addresses.city': 'Los Angeles'
};
```

Ok, now my relation, If you know some database, you'll see the relations:

* `jobs` *one to many* `users`
* `users` *many to many* `addresses` (through `address_join`)

When defining the relations, keep in mind the relation trimming order. Here I'm
going to search by address first, so that will be my starting point.
`address --[filters]--> users --[filters]--> jobs`

```js
var relations = [
  ['addresses.id', 'address_join.address_id'],
  ['address_join.user_id','users.id'],
  ['users.job_id','jobs.id'],
];
```

Join will allow you to truncate all your collection at once according to a
where close.

```js
var tables = {
  'users': new Collection([tim, fred, john]),
  'addresses': new Collection(addresses),
  'address_join': new Collection(address_join),
  'jobs': new Collection(jobs)
};

// Filter is applied on all the collection,
// Now, filtered_tables_tables.users only contains users living in "Los Angeles"
var filtered_tables = Collection.join(tables, relations, where);
```

## Testing

Test are run using QUnit library. First download this repository

```
$ git clone git@github.com:debrice/collection.git
```

then inside the repository install the QUnit library using bower

```
$ cd collection
$ bower install --dev
```

Then simply open the `test.html` file with the web-browser you want to run the
test against. The tests can be found in the `src/test.js` file.

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
