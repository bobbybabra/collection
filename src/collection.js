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

function Collection(_models, primary_key) {
    // by default primary key is set to be 'id'
    var models = [];
    var index = {};

    primary_key = primary_key || 'id';

    if(_models) {
      add(_models);
    }

    /*
     * Returns the count of models contained in the collection
     *
     * > collection.models
     * -> [a, b]
     * > collection.size()
     * -> 2
     */
    function size() {
      return models.length;
    }

    /*
     * Returns true if the collection doesn't contain any model
     *
     * > collection.models
     * -> [a, b]
     * > collection.isEmpty()
     * -> false
     */
    function isEmpty() {
      return models.length === 0;
    }

    /*
     * empty the collection
     */
    function empty() {
      models = [];
      index = {};
    }

    /*
     * Returns an array with the returned values of the callback
     * iteration stops if the callback returns `false`.
     *
     * function callback(model, position){
     *   // return the first 3 models
     *   if(position < 3)
     *     return model;
     *   else
     *     return false;
     * }
     * var first_three = collection.each(callback);
     */
    function each(callback) {
        var r, i, result = [];
        for (r = i = 0; r !== false && i < models.length; i++) {
            r = callback(models[i], i);
            if(r) result.push(r);
        }
        return result;
    }

    /*
     * Returns model for which the callback function returns true.
     *
     * // return models with an odd id
     * function callback(model, collection, position){
     *   return model.id % 2;
     * }
     * var models = collection.filter(callback);
     */
    function filter(callback) {
        var r = [], position = 0;
        each(function (model, position) {
            if(callback(model, models, position)){
              r.push(model);
            }
        });
        return new Collection(r);
    }
    /*
     * Remove all the objects with a matching attribute.
     * If only one argument is passed the argument will
     * be used to match against every object primary key.
     */
    function remove(attribute, value) {
        // if remove(id) get called we consider that
        // the argument passed is the primary key
        if(arguments.length === 1){
          value = attribute;
          attribute = primary_key;
        }
        for (var i = 0; i < models.length; i++) {
            if (models[i][attribute] === value) {
                delete index[models[i][primary_key]];
                models.splice(i, 1);
                i = i - 1;
            }
        }
        return this;
    }

    /*
     * return a collection of matching elements
     *
     * // select name starting with "rob" and with in [1,2,3]
     * var select = {id: [1,2,3], name: /^rob/};
     * collection.where(select);
     */
    function where(select) {
        var r = [];
        each(function (model) {
            var match = true;
            for (var key in select) {
                if (typeof select[key] === 'function') {
                    if (!select[key](model[key])) match = false;
                } else if (Array.isArray(select[key])) {
                    var sub_match = false;
                    for (var i = 0; i < select[key].length; i++) {
                        if (select[key][i] === model[key]) sub_match = true;
                    }
                    match = match && sub_match;
                } else {
                    if (select[key] !== model[key]) match = false;
                }
            }
            if(match) r.push(model);
        });
        return new Collection(r);
    }

    /*
     * Return only the selected attribute
     *
     * // select the id only
     * collection.select('id');
     * returns an array of the contained ids [1, 2, 3...]
     *
     * // select the names and id
     * collection.select(['id', 'name'])
     * // returns [{id: 1, name: 'Joe'}, {id: 2, name: 'Fred'}...]
     */
    function select(names) {
      var result = [];
      if (typeof names === 'string'){
        each(function(model){
          result.push(model[names]);
        });
      }else{
        each(function(model){
          var values = {};
          for(var i = 0; i < names.length; i++){
            values[names[i]] = model[names[i]];
          }
          result.push(values);
        });
      }
      return result;
    }

    /*
     * Reverse the order of the current collection
     *
     * > collection.models
     * -> [a, b]
     * > collection.reverse()
     * -> [b, a]
     * > collection.models
     * -> [b, a]
     */
    function reverse() {
      models.reverse();
      return this;
    }

    /*
     * Returns a sorted collection according to a given
     * attribute. if a callback is passed, the return
     * value of this callback will be used for sorting
     *
     * callback(attribute_value_a, attribute_value_b){
     *   return attribute_value_a - attribute_value_b
     * }
     */
    function sort(attribute, callback) {
        var _models = [].concat(models); // copy
        if (callback) {
            _models.sort(function (a, b) {
                return callback(a[attribute], b[attribute]);
            });
        } else {
            _models.sort(function (a, b) {
                var v_a = a[attribute];
                var v_b = b[attribute];
                if (v_a === v_b) return 0;
                if (v_b === [v_b, v_a].sort()[0]) return 1;
                return -1;
            });
        }
        return Collection(_models);
    }

    /*
     * Returns the first model with the matching attribute
     * if only on argument is passed, the get is matched
     * against the model primary key
     *
     * // return model with the pk set to 1
     * var model = collection.get(1);
     * // return model with email "john.doe@gmail.com"
     * var user = collection.get('email', 'john.doe@gmail.com'
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

    /*
     * Add a models or an array of models to the collection.
     * Adding will replace existing model with the same
     * primary key value.
     */
    function add(_models){
      // makes an array if not one aleardy
      _models = [].concat(_models);
      var model;
      for(var i = 0; i < _models.length; i++){
        model = _models[i];
        // first remove the model if its in the collection
        remove(model[primary_key]);
        // then add it to the collection
        models.push(model);
        index[model[primary_key]] = model;
      }
    }

    function _interpolate_uuid(char) {
        var r = Math.random() * 16 | 0,
            v = char == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }

    // utility method that returns a valid uuid
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
      'select': select,
      'sort': sort,
      'get': get,
      'remove': remove,
      'reverse': reverse
    }
}

