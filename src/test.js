var engineer = {
  id: 1,
  title: 'engineer'
};

var technician = {
  id: 2,
  title: 'technician'
};

var jobs = [engineer, technician];

var john = {
  id: 1,
  first_name:'john',
  last_name:'redford',
  xid: 'x1',
  age: 22,
  job_id: engineer.id
};

var fred = {
  id: 2,
  first_name:'fred',
  last_name: 'doe',
  xid: 'x2',
  age: 16,
  job_id: technician.id
};

var tim = {
  id: 3,
  first_name:'tim',
  last_name: 'doe',
  xid: 'x3',
  age: 55,
  job_id: engineer.id
};

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

QUnit.module( "Collection constructor" );
QUnit.test("Initialize models to empty array", function( assert ) {
    var collection = new Collection();

    assert.equal(collection.models.length, 0,
      "Newly created collection with no models should be empty");
});

QUnit.test("Initialize with models", function( assert ) {
    var collection = new Collection([john, fred]);

    assert.equal(collection.models.length, 2,
      "Should have a length of 2 when initialized with 2 objects.");

    assert.equal(collection.models[0], john,
      "Should find 1st added object.");

    assert.equal(collection.models[1], fred,
      "Should find 2nd added object.");
});

QUnit.module("Collection add");
QUnit.test("Should add a new model", function( assert ) {
    var collection = new Collection([john, fred]);
    collection.add(tim);

    assert.equal(collection.models[2], tim,
      "The collection should have newly.");

    assert.equal(collection.models.length, 3,
      "The collection should count a total of 3 models.");
});

QUnit.test("Should overwrite a conflicting primary key", function( assert ) {
    var ted = {id: 2, first_name: 'ted', last_name: 'kirk', xid: 'x2'};
    var collection = new Collection([john, fred]);
    collection.add(ted);

    assert.equal(collection.models.length, 2,
      "Models length should not have changed when replace.");

    assert.equal(collection.models[1], ted,
      "Replacing object should take place of replaced object.");
});

QUnit.module("Collection keep");
QUnit.test("Should keep a model", function( assert ) {
    var collection = new Collection([john, fred, tim]);

    collection.keep('last_name', 'doe');
    assert.equal(collection.models.length, 2,
      "The collection should keep all models matching the criteria.");
    assert.deepEqual(collection.models, [fred, tim],
      "The collection should have kept non matching model.");

    collection.keep(fred.id);
    assert.equal(collection.models.length, 1,
      "The collection should keep objects matching the primary key.");
});

QUnit.module("Collection remove");
QUnit.test("Should remove a model", function( assert ) {
    var collection = new Collection([john, fred, tim]);

    collection.remove('last_name', 'doe');
    assert.equal(collection.models.length, 1,
      "The collection should remove all models matching the criteria.");
    assert.deepEqual(collection.models[0], john,
      "The collection should have kept non matching model.");

    collection.remove(john.id);
    assert.equal(collection.models.length, 0,
      "The collection should remove objects matching the primary key.");
});

QUnit.test("Should remove a list of model through a callback", function( assert ) {
    var collection = new Collection([john, fred, tim]);

    collection.remove('age', collection.within(22, 16));
    assert.equal(collection.models.length, 1,
      "The collection should remove all models matching the attribute callback.");
    assert.deepEqual(collection.models[0], tim,
      "The collection should keep matching model.");

    collection = new Collection([john, fred, tim]);

    function hasOddId(model){ return model.id % 2; }
    collection.remove(hasOddId);
    assert.equal(collection.models.length, 1,
      "The collection should remove all models matching callback.");
    assert.deepEqual(collection.models[0], fred,
      "The collection should keep matching model.");
});

QUnit.test("Should remove a list of model using array of values", function( assert ) {
    var collection = new Collection([john, fred, tim]);

    collection.remove('first_name', ['john', 'fred']);
    assert.equal(collection.models.length, 1,
      "The collection should remove all models matching the criteria.");
    assert.deepEqual(collection.models[0], tim,
      "The collection should keep matching model.");

    collection = new Collection([john, fred, tim]);
    collection.remove([john.id, fred.id]);
    assert.equal(collection.models.length, 1,
      "The collection should remove all models matching the criteria.");
    assert.deepEqual(collection.models[0], tim,
      "The collection should keep matching model.");
});

QUnit.module("Collection get");
QUnit.test("Should return matching model", function( assert ) {
    var collection = new Collection([john, fred, tim]);

    var model = collection.get('last_name', 'doe');
    assert.equal(model, fred,
      "Get should return first matching model");

    model = collection.get(john.id);
    assert.equal(model, john,
      "Get should return model with the matching primary key");
});

QUnit.module("Collection select");
QUnit.test("Should return only the selected attributes", function( assert ) {
    var collection = new Collection([john, fred, tim]);

    var selection = collection.select('id');

    assert.deepEqual(selection, [john.id, fred.id, tim.id],
      "Select should return a flat array when only one attribute is selected");

    var selection = collection.select(['first_name', 'last_name']);

    assert.deepEqual(selection, [
      {first_name: john.first_name, last_name: john.last_name },
      {first_name: fred.first_name, last_name: fred.last_name },
      {first_name: tim.first_name, last_name: tim.last_name }
    ], "Select should return an array of object when an array is selected");

    var selection = collection.select({'name': 'first_name'});

    assert.deepEqual(selection, [
      {name: john.first_name},
      {name: fred.first_name},
      {name: tim.first_name}
    ], "Select should return an array of mapped object when an object is selected");

    function combineName(model){
      return model.first_name + ' ' + model.last_name;
    }

    var selection = collection.select({id: 'id', name: combineName});

    assert.deepEqual(selection, [
      {id: 1, name: john.first_name + ' ' + john.last_name},
      {id: 2, name: fred.first_name + ' ' + fred.last_name},
      {id: 3, name: tim.first_name + ' ' + tim.last_name}
    ], "Select should return an array of mapped generated properties");



});

QUnit.module("Collection where");
QUnit.test("Should return a collection matching the clause", function( assert ) {
    var collection = new Collection([john, fred, tim]);

    var the_does = collection.where({last_name: 'doe'});
    assert.deepEqual(the_does.models, [fred, tim],
      "Where should accept an attribute and value to match against");

    function is_odd(value){ return value % 2; }
    var the_odds = collection.where({id: is_odd});
    assert.deepEqual(the_odds.models, [john, tim],
      "Where should accept an attribute function to match against");

    var the_odd_does = collection.where({last_name: 'doe', id: is_odd});
    assert.deepEqual(the_odd_does.models, [tim],
      "Where should accept function and a value mixed together");

    var tim_john = collection.where({first_name: ['tim', 'john']});
    assert.deepEqual(tim_john.models, [john, tim],
      "Where should accept an array of matching attributes");
});

QUnit.module("Collection page");
QUnit.test("Should paginate accross records", function( assert ) {
    var collection = new Collection([john, fred, tim]);

    var page = collection.page(1,2);
    assert.deepEqual(page.models, [fred],
      "Should return models contained on requested the page");

    assert.equal(page.has_next, true,
      "Should indicate if there is a next page");

    assert.equal(page.has_previous, true,
      "Should indicate if there is a previous page");

    assert.equal(page.from, 1,
      "Should have the correct bottom boundary");

    assert.equal(page.to, 1,
      "Should have the correct top boundary");

    assert.equal(page.page, 2,
      "Should have the correct page number");

    assert.equal(collection.page(2, 1).pages, 2,
      "Should have the correct amount of pages (round ceil)");

    assert.equal(collection.page(1, 3).has_next, false,
      "Should indicate if there is no next page");

    assert.equal(collection.page(1, 1).has_previous, false,
      "Should indicate if there is no previous page");
});

QUnit.module("Collection not");
QUnit.test("Should return a collection not matching the predicats", function( assert ) {
    var collection = new Collection([john, fred, tim]);

    var the_does = collection.not({last_name: 'doe'});
    assert.deepEqual(the_does.models, [john],
      "Not should accept an attribute and value to match against");

    function is_odd(value){ return value % 2; }
    var the_odds = collection.not({id: is_odd});
    assert.deepEqual(the_odds.models, [fred],
      "Not should accept an attribute function to match against");

    var the_odd_does = collection.not({last_name: 'doe', id: is_odd});
    assert.deepEqual(the_odd_does.models, [john, fred],
      "Not should accept function and a value mixed together");

    var tim_john = collection.not({first_name: ['tim', 'john']});
    assert.deepEqual(tim_john.models, [fred],
      "Not should accept an array of matching attributes");
});

QUnit.module("Collection filter");
QUnit.test("Should return a collection matching the filter", function( assert ) {
    var collection = new Collection([john, fred, tim]);

    function is_a_doe(model){ return model.last_name === "doe"; }

    var the_does = collection.filter(is_a_doe);
    assert.deepEqual(the_does.models, [fred, tim],
      "Where should keep only matching models");
});

QUnit.module("Collection custom primary key");
QUnit.test("Should return a collection matching the clause", function( assert ) {
    var ted = {id: 4, first_name: 'ted', last_name: 'kirk', xid: 'x2'};
    var collection = new Collection([john, fred, tim], 'xid');

    var x2 = collection.get('x2');
    assert.equal(x2, fred,
      "Should operate lookup through custom primary key");

    collection.add(ted);
    assert.equal(collection.models.length, 3,
      "Should not grow when replacing");

    x2 = collection.get('x2');
    assert.equal(x2, ted,
      "Primary key lookup should return replacing object")
});

QUnit.module("Collection quickies");
QUnit.test("isEmpty()", function( assert ){
  var collection = new Collection();

  assert.equal(collection.isEmpty(), true,
    "isEmpty() should return a true when the collection is empty");

  collection.add(tim);
  assert.equal(collection.isEmpty(), false,
    "isEmpty() should return a false when the collection contains stuff");
});

QUnit.test("size()", function( assert ){
  var collection = new Collection();

  assert.equal(collection.size(), 0,
    "size() should return 0 when the collection is empty");

  collection.add([fred, tim]);
  assert.equal(collection.size(), 2,
    "size() should return the size of the collection");

});

QUnit.test("reverse()", function( assert ){
  var collection = new Collection([tim, fred]);

  assert.deepEqual(collection.reverse().models, [fred, tim],
    "Reverse should return a reversed collection");
});

QUnit.test("each()", function( assert ){
  var collection = new Collection([tim, fred]);
  var items = [];

  collection.each(function(model){
    items.push(model)
  });
  assert.deepEqual(collection.models, items,
    "Each should iterate over all the models contained in the collection");
});


QUnit.test("sort()", function( assert ){
  var collection = new Collection([tim, fred, john]);

  assert.deepEqual(collection.sort('first_name').models, [fred, john, tim],
    "Should sort the collection according to a string attribute");

  assert.deepEqual(collection.sort('id').models, [john, fred, tim],
    "Should sort the collection according to an integer attribute");

  function desc_compare(a, b){ return b - a; }
  assert.deepEqual(collection.sort('id', desc_compare).models, [tim, fred, john],
    "Should sort the collection according to an callback function");
});

QUnit.module("where helpers");
QUnit.test("contains()", function( assert ){
  var books = [
    {id: 1, title: "A Midsummer Night's Dream"},
    {id: 2, title: "Twelfth Night"},
    {id: 3, title: "The Merchant of Venice"}
  ]
  var collection = new Collection(books);

  var result = collection.where({title: collection.contains("Merchant")});
  assert.deepEqual(result.models, [books[2]],
    "Should find matching strings");

  var result = collection.where({title: collection.contains("merchant")});
  assert.deepEqual(result.models, [books[2]],
    "Should find matching strings case insensitive");
});

QUnit.test("fuzzy()", function( assert ){
  var books = [
    {id: 1, title: "A Midsummer Night's Dream"},
    {id: 2, title: "Twelfth Night"},
    {id: 3, title: "The Merchant of Venice"}
  ]
  var collection = new Collection(books);

  var result = collection.where({title: collection.fuzzy("merc eni")});
  assert.deepEqual(result.models, [books[2]],
    "Should fuzzy match models");

  var result = collection.where({title: collection.fuzzy("er n")});
  assert.deepEqual(result.models, [books[0], books[2]],
    "Should fuzzy match models");
});

QUnit.test("min()", function( assert ){
  var collection = new Collection([tim, fred, john]);

  var result = collection.where({age: collection.min(22)});
  assert.deepEqual(result.models, [tim, john],
    "Should return result above or equal the constraint");
});

QUnit.test("max()", function( assert ){
  var collection = new Collection([tim, fred, john]);

  var result = collection.where({age: collection.max(22)});
  assert.deepEqual(result.models, [fred, john],
    "Should return result under or equal the constraint");
});

QUnit.test("within()", function( assert ){
  var collection = new Collection([tim, fred, john]);

  var result = collection.where({age: collection.within(16, 25)});
  assert.deepEqual(result.models, [fred, john],
    "Should return result within (included) the constraint");
});

QUnit.module("Collection events");
QUnit.test("on('change')", function( assert ){
    var collection = new Collection([john, fred, tim]);

    var changed = false;

    function onChange(){
      changed = true;
    }

    collection.on('change', onChange);

    collection.remove(john.id);
    assert.equal(changed, true,
      "The collection should fire a change event on delete.");

    changed = false;

    collection.add(john);
    assert.equal(changed, true,
      "The collection should fire a change event on add.");

    changed = false;

    collection.reverse();
    assert.equal(changed, true,
      "The collection should fire a change event on reverse.");

    changed = false;

    collection.sort('first_name');
    assert.equal(changed, true,
      "The collection should fire a change event on sort.");

    changed = false;

    collection.empty();
    assert.equal(changed, true,
      "The collection should fire a change event on empty.");

    changed = false;

    collection.empty();
    assert.equal(changed, false,
      "The collection should not fire a change event on emptying an empty collection.");

    changed = false;

    collection.remove(john.id);
    assert.equal(changed, false,
      "The collection should not fire a change event if nothing got removed.");

    changed = false;

    collection.add([]);
    assert.equal(changed, false,
      "The collection should not fire a change event if nothing got added.");

    changed = false;

    collection.sort('first_name');
    assert.equal(changed, false,
      "The collection should not fire a change event on sorting an empty collection.");

    changed = false;

    collection.reverse();
    assert.equal(changed, false,
      "The collection should not fire a change event on reversing an empty collection.");
});

QUnit.test("on('sort')", function( assert ){
    var collection = new Collection([john, fred, tim]);

    var sorted = false;

    function onSort(){
      sorted = true;
    }

    collection.on('sort', onSort);

    collection.reverse();
    assert.equal(sorted, true,
      "The collection should fire a sort event on reverse.");

    sorted = false;

    collection.sort('first_name');
    assert.equal(sorted, true,
      "The collection should fire a sort event on sort.");
});

QUnit.test("on('add')", function( assert ){
    var collection = new Collection([john, fred]);

    var added = false;

    function onAdd(){
      added = true;
    }

    collection.on('add', onAdd);

    collection.add(tim);
    assert.equal(added, true,
      "The collection should fire a add event on add.");
});

QUnit.test("on('remove')", function( assert ){
    var collection = new Collection([john, fred, tim]);

    var removed = false;

    function onRemove(){
      removed = true;
    }

    collection.on('remove', onRemove);

    collection.remove(tim.id);
    assert.equal(removed, true,
      "The collection should fire a remove event on remove.");
});

QUnit.test("off()", function( assert ){
    var collection = new Collection([john, fred, tim]);

    var changed = false;

    function onChange(){
      changed = true;
    }

    collection.on('change', onChange);

    collection.remove(john.id);
    assert.equal(changed, true,
      "The collection should fire the attached listener");

    changed = false;
    collection.off('change', onChange);

    collection.remove(john.id);
    assert.equal(changed, false,
      "The collection should not fire the attached listener once detached");

});

QUnit.module("Relations");
QUnit.test("Should filter related collections", function( assert ){
  var tables = {
    'users': new Collection([tim, fred, john]),
    'addresses': new Collection(addresses),
    'address_join': new Collection(address_join),
    'jobs': new Collection(jobs)
  };

  var relations = [
    ['addresses.id', 'address_join.address_id'],
    ['address_join.user_id','users.id'],
    ['users.job_id','jobs.id'],
  ];

  var where = {
    'addresses.city': 'Los Angeles'
  };

  var joined_tables = Collection.join(tables, relations, where);

  assert.equal(joined_tables.addresses.models.length, 2,
    "Should keep only the models matching the where");

  assert.deepEqual(joined_tables.addresses.select('city'),
    ['Los Angeles','Los Angeles'], "Objects kept should match the query");

  assert.equal(joined_tables.address_join.models.length, 1,
    "Should keep only the related models matching the where (join collection)");

  assert.deepEqual(joined_tables.users.models, [tim],
    "Should keep only the related models matching the where (users)");

  assert.deepEqual(joined_tables.jobs.models, [engineer],
    "Should keep only the related models matching the where (jobs)");
});

QUnit.module("Chainability");
QUnit.test("add and remove should be chainable and mutable", function( assert ){
  var collection = new Collection([john]);

  collection.add(tim).remove(john.id);

  assert.deepEqual(collection.models,[tim],
    "Add and remove should act on the same collection and be chainable");
});

QUnit.test("where and not should be chainable and immutable", function( assert ){
  var collection = new Collection([tim, fred, john]);
  var new_collection = collection.not({last_name: 'doe'})
    .where({id: collection.max(2)});

  assert.deepEqual(collection.models,[tim, fred, john],
    "Where and Not should return a new collection");

  assert.deepEqual(new_collection.models,[john],
    "Where and Not should act on the a new collection and be chainable");

});

QUnit.module("Performance");
QUnit.test("Sorting", function( assert ){
  var collection = new Collection();
  for(var i = 0; i < 1000; i++){
    collection.add({id: i, value: Math.random()});
  }

  var start = new Date().getTime();

  collection.sort('value');

  var elapsed = new Date().getTime() - start;

  assert.ok(elapsed < 50,
    "Should sort a 1000 items in less than 50ms (took "+ elapsed +"ms)");
});

QUnit.test("Where", function( assert ){
  var collection = new Collection();
  for(var i = 0; i < 1000; i++){
    collection.add({id: i, value: i * i});
  }

  var start = new Date().getTime();

  collection.where({'value': collection.within(1000, 50000)});

  var elapsed = new Date().getTime() - start;

  assert.ok(elapsed < 10,
    "Should where over a 1000 items in less than 10ms (took "+ elapsed +"ms)");
});
