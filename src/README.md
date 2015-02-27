## Globals
<dl>
<dt><a href="#Collection">Collection(models, primary_key)</a></dt>
<dd><p>Container for a collection of javascript models (JSON).
The only requirement for your models is to have a unique primary key.</p>
</dd>
<dt><a href="#CollectionView">CollectionView(collection, where)</a></dt>
<dd><p>CollectionView allows you to have collection depending on a where
applied to a parent collection.
When the content of a main collection changes, its subset is updated
to reflect the where applied to itself.
You can</p>
</dd>
<dt><a href="#CollectionProxy">CollectionProxy(collection)</a></dt>
<dd><p>CollectionProxy allows you to have collection depending on the content
of a parent. It could be use to store a subset of a main collection.
When the content of a main collection changes, its subset will truncat
itself to match the parent.
It is also possible to proxy another proxy.</p>
</dd>
</dl>
<a name="Collection"></a>
## Collection(models, primary_key)
Container for a collection of javascript models (JSON).
The only requirement for your models is to have a unique primary key.

**contstructor**:   

| Param | Type | Description |
| --- | --- | --- |
| models | <code>array</code> | An initial list of models |
| primary_key | <code>string</code> | Default to 'id', this is the primary key of your collection. |


* [Collection(models, primary_key)](#Collection)
  * [.join(collections, relations, where)](#Collection.join) ⇒ <code>object</code>
  * [~getPKString(model)](#Collection..getPKString) ⇒ <code>string</code>
  * [~getPKValues(model)](#Collection..getPKValues) ⇒ <code>array</code> \| <code>value</code>
  * [~makeIndexStr(values, values)](#Collection..makeIndexStr) ⇒ <code>string</code>
  * [~size()](#Collection..size) ⇒ <code>number</code>
  * [~isEmpty()](#Collection..isEmpty) ⇒ <code>boolean</code>
  * [~empty(silent)](#Collection..empty) ⇒ <code>[Collection](#Collection)</code>
  * [~each(callback)](#Collection..each) ⇒ <code>array</code>
  * [~filter(func)](#Collection..filter) ⇒ <code>[Collection](#Collection)</code>
  * [~keep(attribute, value, silent)](#Collection..keep) ⇒ <code>[Collection](#Collection)</code>
  * [~isEqual()](#Collection..isEqual)
  * [~remove(attribute, value, silent, not)](#Collection..remove) ⇒ <code>[Collection](#Collection)</code>
  * [~not(select)](#Collection..not) ⇒ <code>collection</code>
  * [~traverse(keys, keys, nested)](#Collection..traverse) ⇒ <code>value</code>
  * [~modelWhereMatch(model, select, not)](#Collection..modelWhereMatch) ⇒ <code>object</code>
  * [~where(select)](#Collection..where) ⇒ <code>[Collection](#Collection)</code>
  * [~gWhere(select)](#Collection..gWhere) ⇒ <code>generator</code>
  * [~gNot(select)](#Collection..gNot) ⇒ <code>generator</code>
  * [~generator(callback, args)](#Collection..generator) ⇒ <code>generator</code>
  * [~contains(str)](#Collection..contains) ⇒ <code>function</code>
  * [~fuzzy(str)](#Collection..fuzzy) ⇒ <code>function</code>
  * [~max(num)](#Collection..max) ⇒ <code>function</code>
  * [~min(num)](#Collection..min) ⇒ <code>function</code>
  * [~within(min, max)](#Collection..within) ⇒ <code>function</code>
  * [~select(names, names, names)](#Collection..select) ⇒ <code>array</code>
  * [~reverse(silent)](#Collection..reverse) ⇒ <code>[Collection](#Collection)</code>
  * [~sort(attribute, callback, silent)](#Collection..sort) ⇒ <code>[Collection](#Collection)</code>
  * [~page(page_size, page)](#Collection..page) ⇒ <code>object</code>
  * [~get(attribute, value)](#Collection..get) ⇒ <code>object</code>
  * [~add(models, silent)](#Collection..add) ⇒ <code>[Collection](#Collection)</code>
  * [~on(event_name, func)](#Collection..on) ⇒ <code>function</code>
  * [~off(event_name, func)](#Collection..off)
  * [~fire(event_name, data)](#Collection..fire)
  * [~uuid()](#Collection..uuid) ⇒ <code>string</code>

<a name="Collection.join"></a>
### Collection.join(collections, relations, where) ⇒ <code>object</code>
Join and trim Collections according to relations and where clause
passed.
Relation should be read as only keep the models in the second collection
connected to the first.

**Returns**: <code>object</code> - an associative array of filtered Collections  

| Param | Type | Description |
| --- | --- | --- |
| collections | <code>object</code> | Collections to be filtered through |
| relations | <code>object</code> | Relation between the tables |
| where | <code>object</code> | Filtering clause |

<a name="Collection..getPKString"></a>
### Collection~getPKString(model) ⇒ <code>string</code>
Returns the primary key value of a model as a string

**Returns**: <code>string</code> - value of the PK  

| Param | Type | Description |
| --- | --- | --- |
| model | <code>object</code> | Model from which to extract the PK |

<a name="Collection..getPKValues"></a>
### Collection~getPKValues(model) ⇒ <code>array</code> \| <code>value</code>
Returns the primary keys values as an array of values

**Returns**: <code>array</code> - an array of values if composed primary key.<code>value</code> - value of the PK if not composed PK.  

| Param | Type | Description |
| --- | --- | --- |
| model | <code>object</code> | Model from which to extract the PK values |

<a name="Collection..makeIndexStr"></a>
### Collection~makeIndexStr(values, values) ⇒ <code>string</code>
makeIndexStr returns the pass value if the collection primary key is not
composed. Otherwise, it will return a single string, composed of the array
of strings passed to it separated by a 0x31 char code delimiter.
This method is used to build the strings primary key value when added to
the collection and retrieved through `collection.get(primary_key_value)`

**Returns**: <code>string</code> - representation of a model primary key  

| Param | Type | Description |
| --- | --- | --- |
| values | <code>array</code> | an array of values used to build the PK |
| values | <code>string</code> | Value used to build the PK |

**Example**  
```js
makeIndexStr([1, 'doe', 'john']);
// returns '1doejohn', the undisplayed delimiter between those be a 0x31 char.
```
<a name="Collection..size"></a>
### Collection~size() ⇒ <code>number</code>
Returns the count of models contained in the collection

**Returns**: <code>number</code> - the collection model count  
**Example**  
```js
collection.models
// [a, b]
collection.size()
// 2
```
<a name="Collection..isEmpty"></a>
### Collection~isEmpty() ⇒ <code>boolean</code>
Returns true if the collection doesn't contain any model

**Returns**: <code>boolean</code> - `true` if collection is empty, otherwise `false`  
**Example**  
```js
collection.models
// [a, b]
collection.isEmpty()
// false
```
<a name="Collection..empty"></a>
### Collection~empty(silent) ⇒ <code>[Collection](#Collection)</code>
Empty the collection

**Returns**: <code>[Collection](#Collection)</code> - Returns the same collection instance but emptied for
additional chaining
from being triggered when true.  
**Emits**: <code>event:&#x27;change&#x27;</code>, <code>event:&#x27;remove&#x27;</code>  

| Param | Type | Description |
| --- | --- | --- |
| silent | <code>boolean</code> | Default to false, prevent events |

<a name="Collection..each"></a>
### Collection~each(callback) ⇒ <code>array</code>
Returns an array with the returned values of the callback
iteration stops if the callback returns `false`.

**Returns**: <code>array</code> - an array of matching models according to the callback  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | Function to be called on every model |

**Example**  
```js
function callback(model, position){
  // return the first 3 models
  if(position < 3)
    return model;
  else
    return false;
}
var first_three = collection.each(callback);
```
<a name="Collection..filter"></a>
### Collection~filter(func) ⇒ <code>[Collection](#Collection)</code>
Returns model for which the argument function returns true.
filter accepts a function to filter it's content. The function
receives 3 arguments: the current model, the collection's models,
and the position within the current iteration.

**Returns**: <code>[Collection](#Collection)</code> - Returns a new filtered collection  

| Param | Type | Description |
| --- | --- | --- |
| func | <code>function</code> | filtering function |

**Example**  
```js
// return models with an odd id
function callback(model, models, position){
  return model.id % 2;
}
var models = collection.filter(callback);
```
<a name="Collection..keep"></a>
### Collection~keep(attribute, value, silent) ⇒ <code>[Collection](#Collection)</code>
The opposite of remove, the collection will remove any object
not matching the query and only keep the one matching the query.

**Returns**: <code>[Collection](#Collection)</code> - the current collection for chaining  
**Emits**: <code>event:&#x27;change&#x27;</code>, <code>event:&#x27;remove&#x27;</code>  

| Param | Type | Description |
| --- | --- | --- |
| attribute | <code>string</code> | model's attribute to match against |
| value | <code>string</code> | Value expected |
| silent | <code>boolean</code> | Do not trigger event if true |

<a name="Collection..isEqual"></a>
### Collection~isEqual()
Equal function compairing arrays and values only

<a name="Collection..remove"></a>
### Collection~remove(attribute, value, silent, not) ⇒ <code>[Collection](#Collection)</code>
Remove all the objects with a matching attribute.
If only one argument is passed the argument will
be used to match against every object primary key.

If only a function is passed it will be called on every
model as a filter.

A function can also be used in conjunction with an
attribute name. In this case, the function will
receive the model's attribute value as an argument.

**Returns**: <code>[Collection](#Collection)</code> - the current collection for chaining  
**Emits**: <code>event:&#x27;change&#x27;</code>, <code>event:&#x27;remove&#x27;</code>  

| Param | Type | Description |
| --- | --- | --- |
| attribute | <code>string</code> | model's attribute to match against |
| value | <code>string</code> | Value expected |
| silent | <code>boolean</code> | Do not trigger event if true |
| not | <code>boolean</code> | Does the opposite, keeps items matching the query |

**Example**  
```js
// remove the object with a primary key of 1
collection.remove(1);
// remove the object with first name 'john'
collection.remove('first_name', 'john');
// remove the objects with a primary key of 1, 3 or 5
collection.remove([1,3,5]);
// remove all the object where the first_name is 'john' or 'steve'
collection.remove('first_name', ['john', 'steve']);
// remove all the object with an age within 21 and 35
collection.remove('age', collection.within(21, 35));
// remove the model passsed
collection.remove(john);
// remove the models passsed
collection.remove([tim, fred]);
```
<a name="Collection..not"></a>
### Collection~not(select) ⇒ <code>collection</code>
return a new collection of non matching models (see collection.where)

**Returns**: <code>collection</code> - the current collection for chaining  

| Param | Type | Description |
| --- | --- | --- |
| select | <code>object</code> | JSON object of predicates. |

**Example**  
```js
// select name not starting with "rob"
collection.not({name: Collection.contains('^rob')});
```
<a name="Collection..traverse"></a>
### Collection~traverse(keys, keys, nested) ⇒ <code>value</code>
traverse a model according to a composed key where
key and sub keys are separated by a dot.

**Returns**: <code>value</code> - value or undefined if attribute could not be resolved  

| Param | Type | Description |
| --- | --- | --- |
| keys | <code>object</code> | model Model to query |
| keys | <code>String</code> | attribute name (can be nested using dot notation) |
| nested | <code>array</code> | key value as an array |

**Example**  
```js
var model = {
  a: 1,
  b: {
    x: 1,
    y: 2
  }
};
traverse(model, 'b.x')
// returns 1
traverse(model, ['b', 'x'])
// returns 1
```
<a name="Collection..modelWhereMatch"></a>
### Collection~modelWhereMatch(model, select, not) ⇒ <code>object</code>
Return the model if it matches the selection

**Returns**: <code>object</code> - return model or undefined if not a match  

| Param | Type | Description |
| --- | --- | --- |
| model | <code>object</code> | The model the filter against |
| select | <code>object</code> | The selection constraint hash array |
| not | <code>boolean</code> | Indicate that the selection is a NOT (inversed) |

<a name="Collection..where"></a>
### Collection~where(select) ⇒ <code>[Collection](#Collection)</code>
return a new collection of matching models

**Returns**: <code>[Collection](#Collection)</code> - the current collection for chaining  

| Param | Type | Description |
| --- | --- | --- |
| select | <code>object</code> | JSON object of predicates. |

**Example**  
```js
// select name starting with "rob" and with in [1,2,3]
collection.where({
    id: [1,2,3],
    name: Collection.contains('rob')
});
```
<a name="Collection..gWhere"></a>
### Collection~gWhere(select) ⇒ <code>generator</code>
Similar to where but returns a generator.
gWhere allow a more gentle filtering of the collection as it
only returns result one by one


| Param | Type | Description |
| --- | --- | --- |
| select | <code>object</code> | Similar to where |

**Example**  
```js
var does = collection.gNot({last_name: 'doe'});
the_does.next();
// returns the first matching person which last name is not "doe"
// ...
the_does.next();
// returns undefined now, as there is no more matching record to be find
```
<a name="Collection..gNot"></a>
### Collection~gNot(select) ⇒ <code>generator</code>
Similar to where but returns a generator.
gWhere allow a more gentle filtering of the collection as it
only returns result one by one

**Returns**: <code>generator</code> - a generator  

| Param | Type | Description |
| --- | --- | --- |
| select | <code>object</code> | Similar to where |

**Example**  
```js
var does = collection.gWhere({last_name: 'doe'});
the_does.next();
// returns the first matching person which last name is "doe"
// ...
the_does.next();
// returns undefined now, as there is no more matching record to be find
```
<a name="Collection..generator"></a>
### Collection~generator(callback, args) ⇒ <code>generator</code>
Returns a generator scrolling through the collection one by one.
The generator stops and returns the callbacks returns value when it is
different than `undefined`.

The callback should accept the model as its first argument. It will
receive the array of arguments as additional ones.

Generator is used for gNot and gWhere.

**Returns**: <code>generator</code> - call `next()` of the returned object to retrieve
the next value returned by the callback argument.  

| Param | Type | Description |
| --- | --- | --- |
| callback | <code>function</code> | The selection predicates |
| args | <code>array</code> | optional arguments to be passed to the callback |

**Example**  
```js
function maxAge(model, max){
  if (model.demo.age < max)
    return model;
}

var generator = collection.generator(maxAge, [30]);
var model, counter = 0;

// display up to the first 20 records of people under 30 years old
while(model = generator.next() && counter < 20){
  counter++;
  console.log(counter + '. ' + model.name);
}

// This would set the cursor back to the begining of the collection
generator.reset();
```
<a name="Collection..contains"></a>
### Collection~contains(str) ⇒ <code>function</code>
Where filter to string match value.

**Returns**: <code>function</code> - Callable accepting a string.  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | String or regexp to match models against |

**Example**  
```js
var avenues = collection.where('address', collection.contains('avenue'));
```
<a name="Collection..fuzzy"></a>
### Collection~fuzzy(str) ⇒ <code>function</code>
Where filter to fuzzy match strings.

**Returns**: <code>function</code> - Callable accepting a string.  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | String to match a model attribute against |

**Example**  
```js
var victor_hugos = books.where('author', collection.fuzzy('vic hug'));
```
<a name="Collection..max"></a>
### Collection~max(num) ⇒ <code>function</code>
Where filter up to a maximum value.

**Returns**: <code>function</code> - Callable accepting a number.  

| Param | Type | Description |
| --- | --- | --- |
| num | <code>number</code> | maximum (inclusive) value |

**Example**  
```js
var non_drinkers = people.where('age', collection.max(20));
```
<a name="Collection..min"></a>
### Collection~min(num) ⇒ <code>function</code>
Where filter from a minimum value.

**Returns**: <code>function</code> - Callable accepting a number.  

| Param | Type | Description |
| --- | --- | --- |
| num | <code>number</code> | minimum (inclusive) value |

**Example**  
```js
var adults = people.where('age', collection.max(21));
```
<a name="Collection..within"></a>
### Collection~within(min, max) ⇒ <code>function</code>
Where filter within two values.

**Returns**: <code>function</code> - Callable accepting a number.  

| Param | Type | Description |
| --- | --- | --- |
| min | <code>number</code> | minimum (inclusive) value |
| max | <code>number</code> | maximum (inclusive) value |

**Example**  
```js
var teens = people.within('age', collection.within(14,18));
```
<a name="Collection..select"></a>
### Collection~select(names, names, names) ⇒ <code>array</code>
Return only the selected attribute on the collection.
To remap attributes, you can pass an object where the key is the
attribute you want to read, the value will be the mapped name.

**Returns**: <code>array</code> - a flat array of attribute if a string was requested  

| Param | Type | Description |
| --- | --- | --- |
| names | <code>string</code> | request a flat list of attribute value (a pluck). |
| names | <code>array</code> | request a list of object containings those attributes. |
| names | <code>object</code> | request a mapped list of object containings those attributes. |

**Example**  
```js
// select the id only
collection.select('id');
returns an array of the contained ids [1, 2, 3...]

// select the names and id
collection.select(['id', 'name']);
// returns [{id: 1, name: 'Joe'}, {id: 2, name: 'Fred'}...]

// select the 'name' as 'first_name' and keep 'id' as 'id'
collection.select({id:'id', name: 'first_name'});
// returns [{id: 1, first_name: 'Joe'}, {id: 2, first_name: 'Fred'}...]
```
<a name="Collection..reverse"></a>
### Collection~reverse(silent) ⇒ <code>[Collection](#Collection)</code>
Reverse the order of the current collection

**Returns**: <code>[Collection](#Collection)</code> - the current collection reversed  
**Emits**: <code>event:&#x27;change&#x27;</code>, <code>event:&#x27;sort&#x27;</code>  

| Param | Type | Description |
| --- | --- | --- |
| silent | <code>boolean</code> | Mute the events when true |

**Example**  
```js
collection.models
// [a, b]
collection.reverse()
// [b, a]
collection.models
// [b, a]
```
<a name="Collection..sort"></a>
### Collection~sort(attribute, callback, silent) ⇒ <code>[Collection](#Collection)</code>
Returns a sorted the collection sorted according to a given
attribute. if a callback is passed, the return value of this
callback will be used for sorting

**Returns**: <code>[Collection](#Collection)</code> - the current collection sorted  
**Emits**: <code>event:&#x27;change&#x27;</code>, <code>event:&#x27;sort&#x27;</code>  

| Param | Type | Description |
| --- | --- | --- |
| attribute | <code>string</code> | Property to sort against |
| callback | <code>function</code> | Optional method to do the sorting yourself |
| silent | <code>boolean</code> | Mute the events when true |

**Example**  
```js
sort_callback(attribute_value_a, attribute_value_b){
  return attribute_value_a - attribute_value_b
}
my_collection.sort(sort_callback);
```
<a name="Collection..page"></a>
### Collection~page(page_size, page) ⇒ <code>object</code>
Paginate through the models contained in a collection.
Returns a JSON object with keys to help you paginate your listing:
```js
{
  page: 2,
  pages: 2,
  has_previous: true
  has_next: false
  from: 20
  to: 35
  models:[...]
}
```

**Returns**: <code>object</code> - Page object  

| Param | Type | Description |
| --- | --- | --- |
| page_size | <code>number</code> | How many item per page |
| page | <code>number</code> | The page number |

<a name="Collection..get"></a>
### Collection~get(attribute, value) ⇒ <code>object</code>
Returns the first model with the matching attribute
if only on argument is passed, the get is matched
against the model primary key

**Returns**: <code>object</code> - Returns a single model.  

| Param | Type | Description |
| --- | --- | --- |
| attribute | <code>string</code> | Attribute to search against |
| value | <code>string</code> \| <code>number</code> | Value to be matched |

**Example**  
```js
// return model with the pk set to 1
var model = collection.get(1);
// return model with email "john.doe@gmail.com"
var user = collection.get('email', 'john.doe@gmail.com')
```
<a name="Collection..add"></a>
### Collection~add(models, silent) ⇒ <code>[Collection](#Collection)</code>
Add a models or an array of models to the collection.
Adding will replace existing model with the same
primary key value.

**Returns**: <code>[Collection](#Collection)</code> - the current collection for chaining  
**Emits**: <code>event:&#x27;change&#x27;</code>, <code>event:&#x27;add&#x27;</code>  

| Param | Type | Description |
| --- | --- | --- |
| models | <code>array</code> \| <code>object</code> | List of models or single model to add |
| silent | <code>boolean</code> | Add model silently (no event triggered) |

<a name="Collection..on"></a>
### Collection~on(event_name, func) ⇒ <code>function</code>
Register a callback on an given event
event can be 'change', 'remove', 'add' or 'sort'.

**Returns**: <code>function</code> - Unregister callback  

| Param | Type | Description |
| --- | --- | --- |
| event_name | <code>string</code> | Event to listen to. |
| func | <code>function</code> | Listener to be called on event. |

<a name="Collection..off"></a>
### Collection~off(event_name, func)
Unregister a callback on an event


| Param | Type | Description |
| --- | --- | --- |
| event_name | <code>string</code> | Event to unregister from. |
| func | <code>function</code> | Listener to unregister. |

<a name="Collection..fire"></a>
### Collection~fire(event_name, data)
Fire an event


| Param | Type | Description |
| --- | --- | --- |
| event_name | <code>string</code> | Event stack to be fired. |
| data | <code>object</code> | Data to be passed to the listener. |

<a name="Collection..uuid"></a>
### Collection~uuid() ⇒ <code>string</code>
utility method that returns a valid uuid

**Returns**: <code>string</code> - a valid UUID string  
<a name="CollectionView"></a>
## CollectionView(collection, where)
CollectionView allows you to have collection depending on a where
applied to a parent collection.
When the content of a main collection changes, its subset is updated
to reflect the where applied to itself.
You can


| Param | Type | Description |
| --- | --- | --- |
| collection | <code>[Collection](#Collection)</code> | Collection source to the view |
| where | <code>object</code> | Where clause to be applied on the viewed collection |

**Example**  
```js
var people = new Collection([tim, fred, john]);
var engineers = new CollectionView(people, {job_id: engineer.id});
// engineers.models is [tim, fred]
// adding steve (an engineer) to people, will be reflected to the view
people.add(steve);
engineers.models is [tim, fred, steve]
```
<a name="CollectionProxy"></a>
## CollectionProxy(collection)
CollectionProxy allows you to have collection depending on the content
of a parent. It could be use to store a subset of a main collection.
When the content of a main collection changes, its subset will truncat
itself to match the parent.
It is also possible to proxy another proxy.


| Param | Type | Description |
| --- | --- | --- |
| collection | <code>[Collection](#Collection)</code> | Collection to be proxied |

**Example**  
```js
var people = new Collection([tim, fred, john]);
var people_selection = new CollectionProxy(people);
var people_selection_highlight = new CollectionProxy(people_selection);
people_selection.add([tim, fred]);
people_selection_highlight([tim]);
people.remove(tim.id);
people_selection.size() == 1;
// true as removing from people, removes from the selection
people_selection_highlight.size() == 0;
// true as removing from people, removes from the proxy of the proxy
```
