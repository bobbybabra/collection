# Collection [![Build Status](https://travis-ci.org/debrice/collection.svg?branch=master)](https://travis-ci.org/debrice/collection)

Handles collection for your stores and other things. It's not opiniated, not doing AJAX, not doing views, not doing routing etc... Just does one thing, manage collections of your objects and is good at it.

[Read the API!](src/README.md)

4.7kb, no dependencies, to do cool things like:

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
var models = [
  { id: 1, first_name: "Tim", last_name: "Doe", desc: {gender: 'm', age: 16 }},
  { id: 2, first_name: "Fred", last_name: "Redford", desc: {gender: 'm', age: 80 }},
  { id: 3, first_name: "John", last_name: "Doe",desc: {gender: 'm', age: 25 }},
  { id: 4, first_name: "Jane", last_name: "Doe",desc: {gender: 'f', age: 50 }}
];

var people = new Collection(models);

// Returns a collection containing only people named Doe
var does = people.where({last_name: 'Doe'});

// Returns the men
var men = people.where({'desc.gender': 'm'})

// Returns a collection containing only people in age of drinking
var can_drink = people.where({'desc.age': people.min(21)});

// Construct a new attribute "name" composed of first and last name
// and extract the age value down one leve
function join_name(model){
  return model.first_name + ' ' + model.last_name;
}

var people = new Collection(
  people.select({'name': join_name, id: 'id', age: 'desc.age'});
);
```

## How to

### Create a collection

Collection constructor takes 2 optional arguments. The first argument is
expected to be an array of object, the second defines the primary key for
every object contained within the collection.

By default the `Collection` will be emtpy and the primary key will be
set to `id`.

Every model needs to have a primary key. A convenience `Collection.uuid()` method
is provided for you to generate random unique IDs. By default the collection
will be indexed by the 'id' key. To change this behavior pass the
primary key to the constructor:

```javascript
var models = [
 {alt_id: 1, value: 'one'},
 {alt_id: 2, value: 'two'},
 {alt_id: 3, value: 'three'}
];
var my_collection = new Collection(models, 'alt_id');
```

#### Composed primary keys

In some cases, you may have composed primary keys, meaning the combine values
of two or more attributes defines the uniqueness of your object. In those
cases, when searching through your collection using a composed PK, you'll
need to provide an array of values.

```javascript
var address_join = [
 {address_id: 1, user_id: 1, position:2},
 {address_id: 2, user_id: 1, position:3},
 {address_id: 1, user_id: 2, position:5}
];
var addresses = new Collection(address_join, ['address_id', 'user_id']);

// returns the first record (primary key is explicit)
addresses.get(addresses.primary_key, [1,1]);

// returns the second record (primary key is implicit)
addresses.get([2,1]);

// Replace the 2nd record by adding a model with matching primary keys
addresses.add({address_id: 2, user_id: 1, position:1});

// Removes the first 2 records (an array of PK values)
// here too, the primary key selection is implicit when only one argument
// is passed (an array of array)
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

`Collection.remove()` takes either the primary key to be removed,

```javascript
var my_collection = new Collection();
my_collection.add({id: 1, name: 'first'}, {id: 2, name: 'second'}]);

// remove object with id (primary key) equal to 1
my_collection.remove(1);
```

...the attribute and the value to be removed,

```javascript
// remove object with name equal to 'second'
my_collection.remove('name', 'second');
```
...the model (or models) be removed,

```javascript
// remove models from the collection
my_collection.remove(fred);
my_collection.remove([tom, john]);
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

Finally, when removing using an attribute, you can use any where helper
to do so (`min`, `max`, `within`, `fuzzy` and `contains`)

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
attribute and value combination to be matched against.

When using get, a single element is always returned. If a primary key is
passed the corresponding object will be returned, in the the case of an
attribute name and value you'll receive the first matching object.

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

Additionally to selecting keys, you may also select deep attributes
within the model by using a dot notation to describe the traversing

```js
var vertex_a = {
  name: 'line_1',
  value: {
    x :10,
    y: 5,
    color: {
      r: 232,
      g: 44,
      b: 20
    }
  }
};

var vertex_b = {
  name: 'line_2',
  value: {
    x :2,
    y: 20,
    color: {
      r: 12,
      g: 44,
      b: 240
    }
  }
};

var lines = new Collection([vertex_a, vertex_b]);

// select all the models where model.value.x <= 5
var short_x = lines.where({'value.x': lines.max(5)})
// will return a new Collection([vertex_b])

// select all the models where model.color.r is within 200 and 255 included
var redish = lines.where({'value.color.r': lines.within(200,255)})
// will return a new Collection([vertex_a])
```

The value returned by `Collection.where()` is always a Collection instance.

### Collection.not

This will return you the opposite of `where`, a new collection where the model
do not match the select passed. `not` accepts the same parameters as `where`
with the same syntax.

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

### Collection.gWhere and Collection.gNot

Takes exactly the same argument as `where()` but returns a generator. A generator
returns a value each time its `next()` method is called until it runs out of
values to return. Generator are useful for filtering when only a limited
amount of result is necessary.

For example, if you had to go through 100,000+ models and you where paginating
the results to only 50 items per page, you could call `next()` 50 times each time
a new page is requested.

```js

function paginatedWhere(collection, select, item_per_page){
  var page = 1, generator = collection.gWhere(select);

  // default to 50 item per page unless specified otherwise
  if (!item_per_page)
    item_per_page = 50;

  function next(){
    var data = [];

    while(model = generator.next() && data.length < item_per_page){
      data.push model;
    }

    return data;
  }

  return next;
}

var large_record = new Collection(data);

page = paginatedWhere(large_record, {demo.age: 21}, 20);

page.next(); // returns the first 20 records
page.next(); // returns the next 20 records
// ... and so on until the return value is an array with a length less than 20
```

### Collection.generator

`gNot` and `gWhere` are both using `generator`, it accepts a callback that will
receive the models of the collection iteratively. If the callback returns
anything different than `undefined`, the generator will yield this value.

```js
function maxAge(model, max){
  if (model.demo.age < max)
    return model;
}

// passes [30] to the generator constructor so it will be transmitted to the
// callback.
var under30 = collection.generator(maxAge, [30]);
var model, counter = 0;

// display up to the first 20 records of people under 30 years old
while(model = under30.next() && counter < 20){
  counter++;
  console.log(counter + '. ' + model.name);
}

under30.hasNext();
// returns true if there is more records for which the generator returns a value

// This would set the cursor back to the begining of the collection
under30.reset();
```

### Where helpers

Where comes with some helpers to make your life easier.

* `collection.min(value)`: Only keep values equal or above the value
* `collection.max(value)`: Only keep values equal or under the value
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
```
Here, the `page` object could look like:

```
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
If you provide a string, `Collection.select()` will return you an array of
values

```javascript
var my_collection = new Collection([
  {id: 1, first_name: 'Joe', last_name: 'Doe'},
  {id: 2, first_name: 'Joe', last_name: 'Regan'},
  {id: 3, first_name: 'Tedd', last_name: 'Ford'}
]);

my_collection.select('id');
// returns [1,2,3]
```

... but if you pass it an array of keys, you'll receive an array of JSON object
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

Select also accepts nested values to be picked:

```javascript
models = [
  { id: 1, name: "Tim Doe", demo: {gender: 'm', age: 16 }},
  { id: 2, name: "Fred Redford", demo: {gender: 'm', age: 80 }}
];
var people = new Collection(models);

var people_ages = people.select({name: 'name', age: 'demo.age'});
// returns [{name: "Tim Doe", age: 16},{name: "Fred Redford", age: 80}]
```

*Note*: Now you can get fancy and do stuff like an intersection of collection

```javascript
var joe_doe = {id: 1, first_name: 'Joe', last_name: 'Doe'};
var joe_regan = {id: 2, first_name: 'Joe', last_name: 'Regan'};
var tedd_ford = {id: 3, first_name: 'Tedd', last_name: 'Ford'};

var engineers = new Collection([joe_doe, joe_regan]);

var professors = new Collection([joe_doe, tedd_ford])

// An intersections, professor who also are engineer
var professor_engineers = professors.where({'id': engineers.select('id')});
// returns new Collection([joe_doe])

// A union, professors and engineers
var professor_and_engineers = new Collection(professors.models).add(engineers.models);
// returns new Collection([joe_doe, joe_regan, tedd_ford])

// A difference, professor who are not engineers
var professor_engineers = professors.not({'id': engineers.select('id')});
// returns new Collection([tedd_ford])
```

### Collection.filter

An alternative to `Collection.where` is to use a filter. `Collection.filter`
simply takes a callback which will be called and passed every model contained
in the collection. If the callback returns falsy, the object will
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

The value returned by `Collection.filter()` is always a new Collection instance.

### Collection.sort

To sort the collection according to a given attribute. You may also pass
one of your sorting method as second arguments

```javascript
var joe = {id: 1, name: 'Joe', demo{age:33}},
    alan = {id: 2, name: 'Alan', demo{age:19}},
    fred = {id: 3, name: 'Fred', demo{age:22}};

var my_collection = new Collection([joe, alan, fred])

my_collection.sort('name');
// returns new Collection([alan, fred, joe]);
```

You can also sort a collection using deeply nested attribute by using the
dot notation:

```
my_collection.sort('demo.age');
// returns new Collection([alan, fred, joe]);
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

When calling `on`, a de-register method is returned to simplify the
de-registering process.

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

Views can also be chained, aka. a source of a view can be another view and
so on...

## Proxies

Proxies are subsets of collection. Unlike views, their content can be directly
altered and they are initialized empty. Proxies content are limited to what
their parent collection contains. When its parent loses some record, a proxy
will stay consistent by removing model it contains that aren't part of its
parent anymore. Another contraint of a proxy is that you cannot add a model
to a proxy if the collection being proxied doesn't contain it.

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

First lets define my query. I want all the users in Los Angeles. Since you'll
be going through multiple collection at a time, it's necessary that you
indicate the collection name you're filtering on:

```js
var where = {
  'addresses.city': 'Los Angeles'
};
```

Ok, now my relation, If you know some database, you'll see the relations as:

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
var collections = {
  'users': new Collection([tim, fred, john]),
  'addresses': new Collection(addresses),
  'address_join': new Collection(address_join),
  'jobs': new Collection(jobs)
};

// Filter is applied on all the collection,
var filtered_collections = Collection.join(collections, relations, where);
// Now, filtered_collections.users only contains users living in "Los Angeles"
```

## Testing

Test are run using QUnit library. First download this repository

```
$ git clone git@github.com:debrice/collection.git
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
