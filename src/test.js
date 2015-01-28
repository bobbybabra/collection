var john = {id: 1, first_name:'john', last_name:'redford', xid: 'x1'};
var fred = {id: 2, first_name:'fred', last_name: 'doe', xid: 'x2'};
var tim = {id: 3, first_name:'tim', last_name: 'doe', xid: 'x3'};

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

QUnit.module("Collection remove");
QUnit.test("Should remove a model", function( assert ) {
    var collection = new Collection([john, fred, tim]);

    collection.remove('last_name', 'doe');
    assert.equal(collection.models.length, 1,
      "The collection should remove all models matching the criteria.");

    collection.remove(john.id);
    assert.equal(collection.models.length, 0,
      "The collection should removed objects matching the primary key.");
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
});

QUnit.module("Collection where");
QUnit.test("Should return a collection matching the clause", function( assert ) {
    var collection = new Collection([john, fred, tim]);

    the_does = collection.where({last_name: 'doe'});
    assert.deepEqual(the_does.models, [fred, tim],
      "Where should accept an attribute and value to match against");

    function is_odd(value){ return value % 2; }
    the_odds = collection.where({id: is_odd});
    assert.deepEqual(the_odds.models, [john, tim],
      "Where should accept an attribute function to match against");

    the_odd_does = collection.where({last_name: 'doe', id: is_odd});
    assert.deepEqual(the_odd_does.models, [tim],
      "Where should accept function and a value mixed together");
});

QUnit.module("Collection filter");
QUnit.test("Should return a collection matching the filter", function( assert ) {
    var collection = new Collection([john, fred, tim]);

    function is_a_doe(model){ return model.last_name === "doe"; }

    the_does = collection.filter(is_a_doe);
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
