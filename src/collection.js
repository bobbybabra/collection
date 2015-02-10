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

  primary_key = primary_key || 'id';

  if(_models) {
    add(_models);
  }

  /**
   * Returns the count of models contained in the collection
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
   * from being triggered when true.
   * @fires 'change'
   * @fires 'remove'
   */
  function empty(silent) {
    index = {};

    // prevent event from being triggered if no changes
    if(isEmpty()) return this;

    var removed_models = models;

    models = [];

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
   * @returns {collection} Returns a new filtered collection
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
    var r = [], position = 0;
    each(function (model, position) {
      if(func(model, models, position)){
        r.push(model);
      }
    });
    return new Collection(r);
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
   * @fires 'change'
   * @fires 'remove'
   * @returns {collection} the current collection for chaining
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
   * ```
   */
  function remove(attribute, value, silent) {
    var model_deleted = [];

    // if a single argument is passsed and is not a function
    // we infer that the filtering occurs on the primary key.
    // Otherwise the argument is considered a filter on the
    // whole models
    if(arguments.length === 1 && typeof attribute != 'function'){
      value = attribute;
      attribute = primary_key;
    }

    function match(model){
      // If a single callback got passed, consider passing it as a
      // global filter against the entire model.
      if(typeof value === 'undefined'){
        return attribute(model);
      }

      // If the filter is an array, check if the attribute
      // is contained within that filter
      if(Array.isArray(value)){
        return value.indexOf(model[attribute]) > -1;
      }

      // If the filter is a function, use it's return value when
      // pass the value of the attribute
      if(typeof value === 'function'){
        return value(model[attribute]);
      }

      // otherwise consider it a simple comparaison
      return model[attribute] === value;
    }

    // Going through the list upside down as we might pop
    // item during the loop.
    for (var i = models.length - 1; i >= 0; i--) {
      if (match(models[i])) {
        model_deleted.push(index[models[i][primary_key]]);
        delete index[models[i][primary_key]];
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
   * return a new collection of matching models
   * @param {object} select - JSON object of predicates.
   * @returns {collection} the current collection for chaining
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
    var match, r = [];

    each(function (model) {
      // match is our marker and reset to true for every model
      // We expect more often a mismatch than a match, so
      // we look for a mismatch and break a soon as one is
      // detected
      match = true;

      for (var key in select) {
        // If the predicat is a function we'll run it
        // against the current attribute value.
        if (typeof select[key] === 'function') {
          if (!select[key](model[key])){
            match = false;
            break;
          }
        }

        // If the selection is an array of value,
        // we'll try to match this value against the array
        else if (Array.isArray(select[key])) {
          if(select[key].indexOf(model[key]) === -1){
            match = false;
            break;
          }
        }

        // otherwise we expect a straight comparaison between
        // value and model's attribute
        else {
          if (select[key] !== model[key]){
            match = false;
            break;
          }
        }
      }

      // add the model if was a match
      if((!match && not) || (match && !not)) r.push(model);
    });

    return new Collection(r);
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

    // if the names is only an attribute name
    if (typeof names === 'string'){
      each(function(model){
        result.push(model[names]);
      });
    }

    // if the names are a list of model attributes
    else if(Array.isArray(names)){
      each(function(model){
        var values = {};
        for(var i = 0; i < names.length; i++){
          values[names[i]] = model[names[i]];
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
          else values[key] = model[names[key]];
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
        return callback(a[attribute], b[attribute]);
      });
    } else {
      models.sort(function (a, b) {
        var v_a = a[attribute];
        var v_b = b[attribute];
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
      return index[attribute];
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
   * @returns the current collection for chaining
   */
  function add(_models, silent){
    // makes an array if not one aleardy
    _models = [].concat(_models);

    // return to prevent events
    if(_models.length === 0) return this;

    for(var model, i = 0; i < _models.length; i++){
      model = _models[i];
      // first remove the model if its in the collection
      // but lets do it silently, the main action is still add
      remove(primary_key, model[primary_key], true);
      // then add it to the collection
      models.push(model);
      index[model[primary_key]] = model;
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
   */
  function uuid(){
    var uuid_format = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    return uuid_format.replace(/[xy]/g, _interpolate_uuid);
  }

  return {
    'uuid': uuid,
    'isEmpty': isEmpty,
    'empty': empty,
    'size': size,
    'models': models,
    'add': add,
    'filter': filter,
    'each': each,
    'where': where,
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
