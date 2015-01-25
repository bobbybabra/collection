# collection
Handles collection for store (a la backbone)

## Usage

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
