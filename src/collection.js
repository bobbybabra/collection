/**
 * Collection library
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Brice Leroy <bbrriiccee@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

/**
 * Container for a collection of javascript models (JSON).
 * The only requirement for your models is to have a unique primary key.
 * @contstructor
 * @param {array} models - An initial list of models
 * @param {string} primary_key - Default to 'id', this is the primary key of your collection.
 */
function Collection(_models, primary_key) {
  // by default primary key is set to be 'id'
  var models = [];
  var index = {};
  var events = {};

  // Official ascii information separator
  // see http://en.wikipedia.org/wiki/Delimiter#ASCII_delimited_text
  var delimiter = String.fromCharCode(31);


  primary_key = primary_key || 'id';

  var is_pk_composed = Array.isArray(primary_key);

  if(_models) {
    add(_models);
  }

  /**
   * Returns the primary key value of a model as a string
   * @param {object} model Model from which to extract the PK
   * @returns {string} value of the PK
   */
  function getPKString(model){
    if(is_pk_composed){
      return makeIndexStr(getPKValues(model));
    }
    return model[primary_key];
  }

  /**
   * Returns the primary keys values as an array of values
   * @param {object} model - Model from which to extract the PK values
   * @returns {array} an array of values if composed primary key.
   * @returns {value} value of the PK if not composed PK.
   */
   function getPKValues(model){
      if(is_pk_composed){
        var pk_values = []
        primary_key.forEach(function(pk){
          pk_values.push(model[pk]);
        });

        return pk_values;
      }
      return model[primary_key];
    }


  /**
   * makeIndexStr returns the pass value if the collection primary key is not
   * composed. Otherwise, it will return a single string, composed of the array
   * of strings passed to it separated by a 0x31 char code delimiter.
   * This method is used to build the strings primary key value when added to
   * the collection and retrieved through `collection.get(primary_key_value)`
   * @param {array} values - an array of values used to build the PK
   * @param {string} values - Value used to build the PK
   * @returns {string} representation of a model primary key
   * @example
   * ```js
   * makeIndexStr([1, 'doe', 'john']);
   * // returns '1doejohn', the undisplayed delimiter between those be a 0x31 char.
   * ```
   */
  function makeIndexStr(values){
    if(is_pk_composed){
      return values.join(delimiter);
    }
    return values
  }

  /**
   * Returns the count of models contained in the collection
   * @returns {number} the collection model count
   * @example
   * ```js
   * collection.models
   * // [a, b]
   * collection.size()
   * // 2
   * ```
   */
  function size() {
    return models.length;
  }

  /**
   * Returns true if the collection doesn't contain any model
   * @returns {boolean} `true` if collection is empty, otherwise `false`
   * @example
   * ```js
   * collection.models
   * // [a, b]
   * collection.isEmpty()
   * // false
   * ```
   */
  function isEmpty() {
    return models.length === 0;
  }

  /**
   * Empty the collection
   * @param {boolean} silent - Default to false, prevent events
   * @returns {Collection} Returns the same collection instance but emptied for
   * additional chaining
   * from being triggered when true.
   * @fires 'change'
   * @fires 'remove'
   */
  function empty(silent) {
    index = {};

    // prevent event from being triggered if no changes
    if(isEmpty()) return this;

    var removed_models = models;

    models.length = 0;

    // only trigger events if not silenced
    if(!silent){
      fire('remove', removed_models);
      fire('change');
    }

    return this;
  }

  /**
   * Returns an array with the returned values of the callback
   * iteration stops if the callback returns `false`.
   * @param {function} callback Function to be called on every model
   * @returns {array} an array of matching models according to the callback
   * @example
   * ```js
   * function callback(model, position){
   *   // return the first 3 models
   *   if(position < 3)
   *     return model;
   *   else
   *     return false;
   * }
   * var first_three = collection.each(callback);
   * ```
   */
  function each(callback) {
    var r, i, result = [];
    for (r = i = 0; r !== false && i < models.length; i++) {
      r = callback(models[i], i);
      if(r) result.push(r);
    }
    return result;
  }

  /**
   * Returns model for which the argument function returns true.
   * filter accepts a function to filter it's content. The function
   * receives 3 arguments: the current model, the collection's models,
   * and the position within the current iteration.
   * @param {function} func - filtering function
   * @returns {Collection} Returns a new filtered collection
   * @example
   * ```js
   * // return models with an odd id
   * function callback(model, models, position){
   *   return model.id % 2;
   * }
   * var models = collection.filter(callback);
   * ```
   */
  function filter(func) {
    var r = [];
    each(function (model, position) {
      if(func(model, models, position)){
        r.push(model);
      }
    });
    return new Collection(r, primary_key);
  }

  /**
   * The opposite of remove, the collection will remove any object
   * not matching the query and only keep the one matching the query.
   * @param {string} attribute - model's attribute to match against
   * @param {string} value - Value expected
   * @param {boolean} silent - Do not trigger event if true
   * @fires 'change'
   * @fires 'remove'
   * @returns {Collection} the current collection for chaining
   */
  function keep(attribute, value, silent) {
    return remove(attribute, value, silent, true);
  }

  /**
   * Equal function compairing arrays and values only
   */
  function isEqual(a, b){
    if(Array.isArray(a) && Array.isArray(b)){
      if(a.length != b.length){
        return false;
      }

      for(var i = a.length - 1; i >= 0; i--){
        if(a[i] !== b[i]){
          return false;
        }
      }

      return true;
    }
    return a === b;
  }

  /**
   * Remove all the objects with a matching attribute.
   * If only one argument is passed the argument will
   * be used to match against every object primary key.
   *
   * If only a function is passed it will be called on every
   * model as a filter.
   *
   * A function can also be used in conjunction with an
   * attribute name. In this case, the function will
   * receive the model's attribute value as an argument.
   * @param {string} attribute - model's attribute to match against
   * @param {string} value - Value expected
   * @param {boolean} silent - Do not trigger event if true
   * @param {boolean} not - Does the opposite, keeps items matching the query
   * @fires 'change'
   * @fires 'remove'
   * @returns {Collection} the current collection for chaining
   * @example
   * ```js
   * // remove the object with a primary key of 1
   * collection.remove(1);
   * // remove the object with first name 'john'
   * collection.remove('first_name', 'john');
   * // remove the objects with a primary key of 1, 3 or 5
   * collection.remove([1,3,5]);
   * // remove all the object where the first_name is 'john' or 'steve'
   * collection.remove('first_name', ['john', 'steve']);
   * // remove all the object with an age within 21 and 35
   * collection.remove('age', collection.within(21, 35));
   * // remove the model passsed
   * collection.remove(john);
   * // remove the models passsed
   * collection.remove([tim, fred]);
   * ```
   */
  function remove(attribute, value, silent, not) {
    var model, model_deleted = [], models_to_remove;

    // if a single argument is passsed and is not a function
    // we infer that the filtering occurs on the primary key.
    // Otherwise the argument is considered a filter on the
    // whole models
    if(typeof value === 'undefined' && typeof attribute != 'function'){
      // If we passed a model or an array of model, we'll extract their PKs
      // values and rebuild a attribute format aka an array of PKs or
      // an array of arrays of PKs in case of a composed primary key
      if(
        (!Array.isArray(attribute) && typeof attribute === 'object') ||
        (!Array.isArray(attribute[0]) && typeof attribute[0] === 'object')
      ){
        models_to_remove = [].concat(attribute);
        attribute = [];
        models_to_remove.forEach(function(model){
          attribute.push(getPKValues(model));
        });
      }

      // if the key is a composed key (more than one attribute)
      // then a single level array is a direct 1 to 1 match
      // a 2 level array represent a serie of pk to be matched.
      // In that case we will generate their representation
      // as a primary key to allow later === matching.
      if(is_pk_composed){
        // If we passed an array of array of PK
        // [[1,2], [2,2], [3,1]...]
        if(Array.isArray(attribute[0])){
          value = [];
          attribute.forEach(function(v){
            value.push(makeIndexStr(v));
          });
        }
        // We pass a single composed PK
        // [1,2]
        else {
          value = makeIndexStr(attribute);
        }
      }

      // otherwise the value doesn't need any conversion
      else{
        value = attribute;
      }

      // once the value got set, we can now set the attribute as
      // primary_key
      attribute = primary_key;
    }

    function match(model){
      // If we pass the `not` argument, we want the opposite match to be removed,
      // aka keep the model when the match is valid.
      return not ? !_match(model) : _match(model);
    }

    function _match(model){
      // So you pass the primary key as the attribute you want to
      // filter on
      if(attribute === primary_key){

        if(Array.isArray(value)){
          // composed primary keys need to be converted to be matched
          if(is_pk_composed){
            return value.indexOf(getPKString(model)) > -1;
          }
          return value.indexOf(traverse(model, attribute)) > -1;
        }
        if(is_pk_composed){
          return getPKString(model) === value
        }
        return traverse(model, attribute) === value;
      }

      // If a single callback got passed, consider passing it as a
      // global filter against the entire model.
      if(typeof value === 'undefined'){
        return attribute(model);
      }

      // If the filter is an array, check if the attribute
      // is contained within that filter
      if(Array.isArray(value)){
        return value.indexOf(traverse(model, attribute)) > -1;
      }

      // If the filter is a function, use it's return value when
      // pass the value of the attribute
      if(typeof value === 'function'){
        return value(traverse(model, attribute));
      }

      // otherwise consider it a simple comparaison
      return traverse(model, attribute) === value;
    }

    // Going through the list upside down as we might pop
    // item during the loop.
    for (var i = models.length - 1; i >= 0; i--) {
      model = models[i];
      if (match(model)) {
        model_deleted.push(index[getPKString(model)]);
        delete index[getPKString(model)];
        models.splice(i, 1);
      }
    }

    // only trigger events if not silenced
    if(!silent && model_deleted.length > 0){
      fire('change');
      fire('remove', model_deleted);
    }

    return this;
  }

  /**
   * return a new collection of non matching models (see collection.where)
   * @param {object} select - JSON object of predicates.
   * @returns {collection} the current collection for chaining
   * @example
   * ```js
   * // select name not starting with "rob"
   * collection.not({name: Collection.contains('^rob')});
   * ```
   */
  function not(select) {
    return where(select, true);
  }

  /**
   * traverse a model according to a composed key where
   * key and sub keys are separated by a dot.
   * @param {object} keys - model Model to query
   * @param {String} keys - attribute name (can be nested using dot notation)
   * @param {array} nested key value as an array
   * @returns {value} value or undefined if attribute could not be resolved
   * @example
   * ```js
   * var model = {
   *   a: 1,
   *   b: {
   *     x: 1,
   *     y: 2
   *   }
   * };
   * traverse(model, 'b.x')
   * // returns 1
   * traverse(model, ['b', 'x'])
   * // returns 1
   * ```
   */
  function traverse(model, keys){
    var key;

    if(typeof keys === 'string'){
      // in case we can resolve the requested key directly
      // on the modeltraverse(model, key)
      if(keys in model) {
        return model[keys];
      }

      keys = keys.split('.');
    }

    while(key = keys.shift()){
      if(key in model){
        model = model[key];
      }else{
        return;
      }
    }

    return model;
  }

  /**
   * return a new collection of matching models
   * @param {object} select - JSON object of predicates.
   * @returns {Collection} the current collection for chaining
   * @example
   * ```js
   * // select name starting with "rob" and with in [1,2,3]
   * collection.where({
   *     id: [1,2,3],
   *     name: Collection.contains('rob')
   * });
   * ```
   */
  function where(select, not) {
    var match, r;

    r = each(function (model) {
      // match is our marker and reset to true for every model
      // We expect more often a mismatch than a match, so
      // we look for a mismatch and break a soon as one is
      // detected
      match = true;

      for (var key in select) {
        // If the predicat is a function we'll run it
        // against the current attribute value.
        if (typeof select[key] === 'function') {
          if (!select[key](traverse(model, key))){
            match = false;
            break;
          }
        }

        // If the selection is an array of value,
        // we'll try to match this value against the array
        else if (Array.isArray(select[key])) {
          if(select[key].indexOf(traverse(model, key)) === -1){
            match = false;
            break;
          }
        }

        // otherwise we expect a straight comparaison between
        // value and model's attribute
        else {
          if (select[key] !== traverse(model, key)){
            match = false;
            break;
          }
        }
      }

      // add the model if was a match
      if((!match && not) || (match && !not)) return model;
    });

    return new Collection(r, primary_key);
  }

  /**
   * Where filter to string match value.
   * @param {string} str - String or regexp to match models against
   * @returns {function} Callable accepting a string.
   * @example
   * ```js
   * var avenues = collection.where('address', collection.contains('avenue'));
   * ```
   */
  function contains(str){
    var regexp = new RegExp(str, 'i');
    return function(value){
      return regexp.test(value);
    };
  }

  /**
   * Where filter to fuzzy match strings.
   * @param {string} str - String to match a model attribute against
   * @returns {function} Callable accepting a string.
   * @example
   * ```js
   * var victor_hugos = books.where('author', collection.fuzzy('vic hug'));
   * ```
   */
  function fuzzy(str){
    var predicats = str.split(' ');
    var regexp = new RegExp(predicats.join('[^\\s]*\\s.*'), 'i');
    return function(value){
      return regexp.test(value);
    };
  }

  /**
   * Where filter up to a maximum value.
   * @param {number} num - maximum (inclusive) value
   * @returns {function} Callable accepting a number.
   * @example
   * ```js
   * var non_drinkers = people.where('age', collection.max(20));
   * ```
   */
  function max(num){
    return function(value){
      return value <= num;
    }
  }

  /**
   * Where filter from a minimum value.
   * @param {number} num - minimum (inclusive) value
   * @returns {function} Callable accepting a number.
   * @example
   * ```js
   * var adults = people.where('age', collection.max(21));
   * ```
   */
  function min(num){
    return function(value){
      return value >= num;
    }
  }

  /**
   * Where filter within two values.
   * @param {number} min - minimum (inclusive) value
   * @param {number} max - maximum (inclusive) value
   * @returns {function} Callable accepting a number.
   * @example
   * ```js
   * var teens = people.within('age', collection.within(14,18));
   * ```
   */
  function within(min, max){
    return function(value){
      return value >= Math.min(min, max) && value <= Math.max(min,max);
    }
  }

  /**
   * Return only the selected attribute on the collection.
   * To remap attributes, you can pass an object where the key is the
   * attribute you want to read, the value will be the mapped name.
   *
   * @param {string} names - request a flat list of attribute value (a pluck).
   * @param {array} names - request a list of object containings those attributes.
   * @param {object} names - request a mapped list of object containings those attributes.
   * @returns {array} a flat array of attribute if a string was requested
   * @example
   * ```js
   * // select the id only
   * collection.select('id');
   * returns an array of the contained ids [1, 2, 3...]
   *
   * // select the names and id
   * collection.select(['id', 'name']);
   * // returns [{id: 1, name: 'Joe'}, {id: 2, name: 'Fred'}...]
   *
   * // select the 'name' as 'first_name' and keep 'id' as 'id'
   * collection.select({id:'id', name: 'first_name'});
   * // returns [{id: 1, first_name: 'Joe'}, {id: 2, first_name: 'Fred'}...]
   * ```
   */
  function select(names) {
    var result = [];

    // if the request is asking for the primary key
    if(names === primary_key && is_pk_composed){
      each(function(model){
        result.push(getPKValues(model));
      });
    }

    // if the names is only an attribute name
    else if (typeof names === 'string'){
      each(function(model){
        result.push(traverse(model, names));
      });
    }

    // if the names are a list of model attributes
    else if(Array.isArray(names)){
      each(function(model){
        var values = {};
        for(var i = 0; i < names.length; i++){
          values[names[i]] = traverse(model, names[i]);
        }
        result.push(values);
      });
    }

    // if the names is a mapping object
    else{
      each(function(model){
        var values = {};
        for(var key in names){
          // If the selection a method to construct a value from the model
          if(typeof names[key] === 'function') values[key] = names[key](model);
          // otherwise apply simple attribute mapping
          else values[key] = traverse(model,names[key]);
        }
        result.push(values);
      });
    }

    return result;
  }

  /**
   * Reverse the order of the current collection
   * @fires 'change'
   * @fires 'sort'
   * @param {boolean} silent - Mute the events when true
   * @returns {Collection} the current collection reversed
   * @example
   * ```js
   * collection.models
   * // [a, b]
   * collection.reverse()
   * // [b, a]
   * collection.models
   * // [b, a]
   * ```
   */
  function reverse(silent) {
    if (isEmpty()) return this;

    models.reverse();

    // only trigger events if not silenced
    if(!silent){
      fire('change');
      fire('sort');
    }

    return this;
  }

  /**
   * Returns a sorted the collection sorted according to a given
   * attribute. if a callback is passed, the return value of this
   * callback will be used for sorting
   * @param {string} attribute - Property to sort against
   * @param {function} callback - Optional method to do the sorting yourself
   * @param {boolean} silent - Mute the events when true
   * @returns {Collection} the current collection sorted
   * @fires 'change'
   * @fires 'sort'
   * @example
   * ```js
   * sort_callback(attribute_value_a, attribute_value_b){
   *   return attribute_value_a - attribute_value_b
   * }
   * my_collection.sort(sort_callback);
   * ```
   */
  function sort(attribute, callback, silent) {
    if (isEmpty()) return this;

    if (callback) {
      models.sort(function (a, b) {
        return callback(traverse(a, attribute), traverse(b, attribute));
      });
    } else {
      models.sort(function (a, b) {
        var v_a = traverse(a, attribute);
        var v_b = traverse(b, attribute);
        if (v_a === v_b) return 0;
        if (v_b === [v_b, v_a].sort()[0]) return 1;
        return -1;
      });
    }

    // only trigger events if not silenced
    if(!silent){
      fire('change');
      fire('sort');
    }

    return this;
  }

  /**
   * Paginate through the models contained in a collection.
   * Returns a JSON object with keys to help you paginate your listing:
   * ```js
   * {
   *   page: 2,
   *   pages: 2,
   *   has_previous: true
   *   has_next: false
   *   from: 20
   *   to: 35
   *   models:[...]
   * }
   * ```
   * @param {number} page_size - How many item per page
   * @param {number} page - The page number
   * @returns {object} Page object
   */
  function page(page_size, page){
    var to = (page_size * page), from = to - page_size;

    // maxout to the models length and prevent < 0 index
    from = from > models.length ? models.length: from > 0 ? from : 0;
    to = to > models.length ? models.length: to;

    return {
      'page': page,
      'pages': Math.ceil(models.length / page_size),
      'has_previous': page > 1,
      'has_next': to < models.length,
      'from': from,
      'to': to - 1,
      'models': models.slice(from, to)
    };
  }

  /**
   * Returns the first model with the matching attribute
   * if only on argument is passed, the get is matched
   * against the model primary key
   * @param {string} attribute - Attribute to search against
   * @param {string|number} value - Value to be matched
   * @returns {object} Returns a single model.
   * @example
   * ```js
   * // return model with the pk set to 1
   * var model = collection.get(1);
   * // return model with email "john.doe@gmail.com"
   * var user = collection.get('email', 'john.doe@gmail.com')
   * ```
   */
  function get(attribute, value) {
    // if get(id) gets called we consider that
    // the argument passed is the primary key
    if(arguments.length === 1 || attribute === primary_key){
      return index[makeIndexStr(attribute)];
    }
    var r = null;
    each(function (model) {
      if (model.hasOwnProperty(attribute) && model[attribute] == value) {
        r = model;
        return false; // stop the loop
      }
    });
    return r;
  }

  /**
   * Add a models or an array of models to the collection.
   * Adding will replace existing model with the same
   * primary key value.
   * @param {array|object} models - List of models or single model to add
   * @param {boolean} silent - Add model silently (no event triggered)
   * @fires 'change'
   * @fires 'add'
   * @returns {Collection} the current collection for chaining
   */
  function add(_models, silent){
    // makes an array if not one aleardy
    _models = [].concat(_models);

    // return to prevent events
    if(_models.length === 0) return this;

    for(var pk, model, i = 0; i < _models.length; i++){
      model = _models[i];
      pk = getPKString(model);
      // first remove the model if its in the collection
      if(pk in index) remove(primary_key, pk);

      // then add it to the collection
      models.push(model);
      index[pk] = model;
    }

    // only trigger events if not silenced
    if(!silent){
      fire('add', _models);
      fire('change');
    }

    return this
  }

  /**
   * Register a callback on an given event
   * event can be 'change', 'remove', 'add' or 'sort'.
   * @param {string} event_name - Event to listen to.
   * @param {function} func - Listener to be called on event.
   * @returns {function} Unregister callback
   */
  function on(event_name, func){
    if (!events[event_name]) {
      events[event_name] = [];
    }
    events[event_name].push(func);

    // return a de-registration call
    return function(){
      off(event_name, func);
    }
  }

  /**
   * Unregister a callback on an event
   * @param {string} event_name - Event to unregister from.
   * @param {function} func - Listener to unregister.
   */
  function off(event_name, func){
    var index = events[event_name].indexOf(func);
    if (index > -1) {
      events[event_name].splice(index, 1);
    }
  }

  /**
   * Fire an event
   * @param {string} event_name - Event stack to be fired.
   * @param {object} data - Data to be passed to the listener.
   */
  function fire(event_name, data){
    if(event_name in events){
      for(var i=0, length = events[event_name].length; i < length; i++){
        events[event_name][i](data);
      }
    }
  }

  function _interpolate_uuid(char) {
    var r = Math.random() * 16 | 0,
        v = char == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }

  /**
   * utility method that returns a valid uuid
   * @returns {string} a valid UUID string
   */
  function uuid(){
    var uuid_format = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return uuid_format.replace(/[xy]/g, _interpolate_uuid);
  }

  return {
    'getPKString': getPKString,
    'getPKValues': getPKValues,
    'primary_key': primary_key,
    'uuid': uuid,
    'isEmpty': isEmpty,
    'empty': empty,
    'size': size,
    'models': models,
    'add': add,
    'filter': filter,
    'each': each,
    'where': where,
    'keep': keep,
    'page': page,
    'not': not,
    'min': min,
    'max': max,
    'within': within,
    'contains': contains,
    'fuzzy': fuzzy,
    'select': select,
    'sort': sort,
    'get': get,
    'remove': remove,
    'reverse': reverse,
    'on': on,
    'off': off,
    'fire': fire
  }
}
/**
 * Join and trim Collections according to relations and where clause
 * passed.
 * Relation should be read as only keep the models in the second collection
 * connected to the first.
 * @param {object} collections - Collections to be filtered through
 * @param {object} relations - Relation between the tables
 * @param {object} where - Filtering clause
 * @returns {object} an associative array of filtered Collections
 */
Collection.join = function(collections, relations, where){
  var indexes, relation, collection, attribute, left, right, clause;
  var r = {};

  // Clone the collections, we're supposed to stay immutable
  for(collection in collections){
    r[collection] = new Collection(
      collections[collection].models, collections[collection].primary_key
    );
  }

  // first group together the where clauses
  var wheres = {}
  for(var coll_attr in where){
    // the where target are provided prefixed with the collection's name
    // followed by a dat + the attribute name
    // Lets first extract the collection's name
    collection = coll_attr.split('.')[0];
    // then the attribute name, making sure that we capture
    // nested value, so 'collection.attr.nested_attr' works.
    attribute = coll_attr.substring(coll_attr.indexOf('.')+1);
    clause = where[coll_attr];

    // Initialize the wheres container for the collection if
    // haven't been done already
    if(!(collection in wheres)){
      wheres[collection] = {};
    }
    // Build the where query as we go per collection
    // wheres[collection_1] == {attr_1: clause, attr_2: clause...}
    wheres[collection][attribute] = clause;
  }

  // Apply the filter on the different collections
  for(collection in wheres){
    r[collection] = r[collection].where(wheres[collection]);
  }

  // Trim the collections according to their relation
  // The triming implies only keeping record in the right collection
  // that have a relation matching in the left collection
  relations.forEach(function(relation, index){
    right = relation[1];
    left = relation[0];

    // format is 'collection.attribute' for left and right relations
    // definition
    collection = r[left.split('.')[0]];
    attribute = left.split('.')[1];

    // first lets select the indexes from the first table
    indexes = collection.select(attribute);

    // then remove trim the right table to match only those
    collection = r[right.split('.')[0]];
    attribute = right.split('.')[1];

    collection.keep(attribute, indexes);
  });

  return r;
};


/**
 * CollectionView allows you to have collection depending on a where
 * applied to a parent collection.
 * When the content of a main collection changes, its subset is updated
 * to reflect the where applied to itself.
 * You can
 * @param {Collection} collection - Collection source to the view
 * @param {object} where - Where clause to be applied on the viewed
 * collection
 * @example
 * ```js
 * var people = new Collection([tim, fred, john]);
 * var engineers = new CollectionView(people, {job_id: engineer.id});
 * // engineers.models is [tim, fred]
 * // adding steve (an engineer) to people, will be reflected to the view
 * people.add(steve);
 * engineers.models is [tim, fred, steve]
 * ```
 */
 function CollectionView(collection, where){
   var view = collection.where(where);

   collection.on('add', function(models){
     var added = new Collection(models, collection.primary_key).where(where);
     view._add(added.models);
   });

   collection.on('remove', function(models){
     var removed = new Collection(models, collection.primary_key);
     view._remove(removed.select(collection.primary_key))
   });

   // store those to update the collection on change
   view._add = view.add;
   view._remove = view.remove;

   // map mutative method to the parent
   view.add = collection.add;
   view.empty = collection.empty;
   view.keep = collection.keep;
   view.remove = collection.remove;

   return view;
 };

/**
 * CollectionProxy allows you to have collection depending on the content
 * of a parent. It could be use to store a subset of a main collection.
 * When the content of a main collection changes, its subset will truncat
 * itself to match the parent.
 * It is also possible to proxy another proxy.
 * @param {Collection} collection - Collection to be proxied
 * @example
 * ```js
 * var people = new Collection([tim, fred, john]);
 * var people_selection = new CollectionProxy(people);
 * var people_selection_highlight = new CollectionProxy(people_selection);
 * people_selection.add([tim, fred]);
 * people_selection_highlight([tim]);
 * people.remove(tim.id);
 * people_selection.size() == 1;
 * // true as removing from people, removes from the selection
 * people_selection_highlight.size() == 0;
 * // true as removing from people, removes from the proxy of the proxy
 * ```
 */
function CollectionProxy(collection){
  var proxy = new Collection([], collection.primary_key);

  proxy.proxied = collection;

  proxy._add = proxy.add;

  proxy.add = function(models){
    var valid_models = [];

    models = [].concat(models);

    for(var i = 0; i < models.length; i++){
      if(proxy.proxied.get(proxy.getPKValues(models[i]))){
        valid_models.push(models[i]);
      }
    }

    return proxy._add(valid_models);
  }

  collection.on('remove', function(models){
    var removed = new Collection(models, collection.primary_key);
    proxy.remove(removed.select(collection.primary_key))
  });

  return proxy;
}
