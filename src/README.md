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
  * [.join(collections, relations, where)](#Collection.join)
  * [~size()](#Collection..size)
  * [~isEmpty()](#Collection..isEmpty)
  * [~empty(silent)](#Collection..empty)
  * [~each()](#Collection..each)
  * [~filter(func)](#Collection..filter) ⇒ <code>collection</code>
  * [~keep(attribute, value, silent)](#Collection..keep) ⇒ <code>collection</code>
  * [~remove(attribute, value, silent, not)](#Collection..remove) ⇒ <code>collection</code>
  * [~not(select)](#Collection..not) ⇒ <code>collection</code>
  * [~where(select)](#Collection..where) ⇒ <code>collection</code>
  * [~contains(str)](#Collection..contains) ⇒ <code>function</code>
  * [~fuzzy(str)](#Collection..fuzzy) ⇒ <code>function</code>
  * [~max(num)](#Collection..max) ⇒ <code>function</code>
  * [~min(num)](#Collection..min) ⇒ <code>function</code>
  * [~within(min, max)](#Collection..within) ⇒ <code>function</code>
  * [~select(names, names, names)](#Collection..select) ⇒ <code>array</code>
  * [~reverse(silent)](#Collection..reverse)
  * [~sort(attribute, callback, silent)](#Collection..sort)
  * [~page(page_size, page)](#Collection..page) ⇒ <code>object</code>
  * [~get(attribute, value)](#Collection..get) ⇒ <code>object</code>
  * [~add(models, silent)](#Collection..add)  
  * [~on(event_name, func)](#Collection..on) ⇒ <code>function</code>
  * [~off(event_name, func)](#Collection..off)
  * [~fire(event_name, data)](#Collection..fire)
  * [~uuid()](#Collection..uuid)

<a name="Collection.join"></a>
### Collection.join(collections, relations, where)
Join and trim Collections according to relations and where clause
passed.
Relation should be read as only keep the models in the second collection
connected to the first.


| Param | Type | Description |
| --- | --- | --- |
| collections | <code>object</code> | Collections to be filtered through |
| relations | <code>object</code> | Relation between the tables |
| where | <code>object</code> | Filtering clause |

<a name="Collection..size"></a>
### Collection~size()
Returns the count of models contained in the collection

**Example**  
```js
collection.models
// [a, b]
collection.size()
// 2
```
<a name="Collection..isEmpty"></a>
### Collection~isEmpty()
Returns true if the collection doesn't contain any model

**Example**  
```js
collection.models
// [a, b]
collection.isEmpty()
// false
```
<a name="Collection..empty"></a>
### Collection~empty(silent)
Empty the collection

**Emits**: <code>event:&#x27;change&#x27;</code>, <code>event:&#x27;remove&#x27;</code>  

| Param | Type | Description |
| --- | --- | --- |
| silent | <code>boolean</code> | Default to false, prevent events from being triggered when true. |

<a name="Collection..each"></a>
### Collection~each()
Returns an array with the returned values of the callback
iteration stops if the callback returns `false`.

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
### Collection~filter(func) ⇒ <code>collection</code>
Returns model for which the argument function returns true.
filter accepts a function to filter it's content. The function
receives 3 arguments: the current model, the collection's models,
and the position within the current iteration.

**Returns**: <code>collection</code> - Returns a new filtered collection  

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
### Collection~keep(attribute, value, silent) ⇒ <code>collection</code>
The opposite of remove, the collection will remove any object
not matching the query and only keep the one matching the query.

**Returns**: <code>collection</code> - the current collection for chaining  
**Emits**: <code>event:&#x27;change&#x27;</code>, <code>event:&#x27;remove&#x27;</code>  

| Param | Type | Description |
| --- | --- | --- |
| attribute | <code>string</code> | model's attribute to match against |
| value | <code>string</code> | Value expected |
| silent | <code>boolean</code> | Do not trigger event if true |

<a name="Collection..remove"></a>
### Collection~remove(attribute, value, silent, not) ⇒ <code>collection</code>
Remove all the objects with a matching attribute.
If only one argument is passed the argument will
be used to match against every object primary key.

If only a function is passed it will be called on every
model as a filter.

A function can also be used in conjunction with an
attribute name. In this case, the function will
receive the model's attribute value as an argument.

**Returns**: <code>collection</code> - the current collection for chaining  
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
<a name="Collection..where"></a>
### Collection~where(select) ⇒ <code>collection</code>
return a new collection of matching models

**Returns**: <code>collection</code> - the current collection for chaining  

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
### Collection~reverse(silent)
Reverse the order of the current collection

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
### Collection~sort(attribute, callback, silent)
Returns a sorted the collection sorted according to a given
attribute. if a callback is passed, the return value of this
callback will be used for sorting

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
### Collection~add(models, silent)  
Add a models or an array of models to the collection.
Adding will replace existing model with the same
primary key value.

**Returns**: the current collection for chaining  
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
### Collection~uuid()
utility method that returns a valid uuid

