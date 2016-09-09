---
layout: post
title: C++ Extensions for Python
tags: programming, python
category: programming
---

## A Practical Guide to Python C++ Extensions and Bindings

* [What are Python bindings for C++?](#what)
* [How is C++ Code interfaced with Python?](#how)
* [When should I use Python bindings?](#when)
* [Where do I wrap/attach binding/extend?](#where)
* [How to use your large C++ library in Python...](#main)

_This guide is born from my recent experiences of adding Python bindings to a large C++ library.
I used [Boost Python](http://www.boost.org/doc/libs/1_61_0/libs/python/doc/html/index.html)
because it was the first thing I found. The Boost guide is not particularly helpful
and after 2 days of stumbling around, I was finally able to make things work.
I don't think it's difficult to write Python bindings or  C++ extensions.
it's just hard to know how you should approach doing so for your particular case.
And so that is what I want to discuss here._

_Part of the reason why writing Python bindings for C++ is so confusing is because the examples
Boost gives are so shitty. They are stupid useless examples that don't motivate the
need for Python bindings. Or they go into how they resolve a unique C++ feature, like templates, for Python._

<a id="what"></a>

### What are Python bindings for C++?

Writing C++ that is used by Python has a lot of names: "Python bindings", "C++ extensions", "wrappers", etc.
All of them entail the same thing: you're writing code in C++ to be used in Python.

Where they differ is in mostly context:

* "Python bindings" typically refers to adding a Python API to a C++ library.
* "C++ extensions" more generally means extending Python with functionality written in C++.
* "wrappers" more or less the same as "Python bindings"

And by doing so, you can:

1. implement new built-in types
2. call C++ functions

<a id="how"></a>

### How is C++ code interfaced with Python?

The Python implementation you're currently using is most likely written in C. This
is known as [CPython](#CPython). Python can actually expose the C code that it's using so that
you can access native types and objects in C. And you can write them in C++ too.

And there's lots of pros and cons that come with doing this...

<a id="when"></a>

### When should I use Python bindings?

* you want to take advantage of Python's expressiveness to quickly develop
* your C++ component is taking on the more CPU intensive tasks of your app but the rest of your app can be in Python.
* you like developing in Python
* any task where there's a lot of "pipelining" and "infrastructure" code that needs to be written.

Python bindings allow you to leverage the strengths and weaknesses of both languages.
Mainly, you can leverage the ease and speed of developing in Python coupled with the performance of C++.

<a id="where"></a>

### Where do I wrap/attach binding/extend?

You usually have entry points into your C++ library. You wrap around or attach bindings
to these entry points.
Suppose you had a C++ library called `myLib.a` or `myLib.so`.
Now you can use it like this in Python: `import myLib`.
Now your CPython is _extended_ with `myLib`.

<a id="main"></a>

### How to use your large C++ library in Python...

There's only one thing you need to do to use your C++ library in Python:
__You need to write facade functions that convert Python objects to C++ objects and then call your C++ functions. Vice versa, you need to convert C++ objects returned from your C++ function into Python objects.__

That's it.

The task is more time-consuming than it is difficult. And it varies by how many functions you want to
expose and how many objects you need to convert. There are many tools out there to help you.
They help by reducing the amount of conversion code you need to write. The exchange is
how easily your package can be distributed.

Example:
I'm concentrating on Boost.Python because it's long-running and well-established way to get your C++ into Python.

* Build Boost.Python (or obtain Boost.Python)
* Write facade C++ functions using the boost_python library.

__How to write these facade functions?__

* Make them only accept Python objects as arguments via boost_python library
* you should expose C++ classes whose objects are returned by methods
* use boost_python again to help with any conversion between Python and C++ types i.e. (str to string or char arrays, list to vectors, etc.)

Suppose you have this C++ library

<a name="fakecpp"></a>

```
#include <fancy.h>
#include <ohlala.h>

X& foo(vector<Y> yVect, Z* yes);
```

### Packaging and Distribution Strategies

The following are how you may have written your extensions...

__Pure C__

Your package can entirely be installed by distutils/setuptools.

__Pure C++ (and done properly...)__

Same as __Pure C__. Your package can entirely be installed by distutils/setuptools.

__Impose user to compile C/C++ library and the package provides the extension__

You assume that the user has built the native C/C++ library e.g. `myLib.a` or `myLib.so` and it is pointed to by `LD_LIBRARY_PATH`.

__Include C/C++ source and package builds entire library and extension__

You include the C/C++ code with the package and setup.py compiles the entire library and facade functions.

### Improperly done C++ Extensions

Function names are mangled by C++ to support C++ features such as overloading.
Python won't know what to call. You need to use `extern C` ([more info](http://stackoverflow.com/a/1041880/4400558)).

### The C++ Extensions for Python Tools Matrix

SWIG
Boost.Python

<a id="CPython"></a>

### What is CPython?

Python is a language specification. And its most popular implementation is CPython as a scripted, dynamic, interpreted programming language. CPython is the Python interpreter written in C. CPython happens to also
be the reference implementation of Python. (_Fun Fact: did you know [Ruby](https://en.wikipedia.org/wiki/Ruby_(programming_language)) had_ ***only*** _the interpreter
as the language reference until 2011 when the language specification was finally created?_)

[There are implementations of Python](http://docs.python-guide.org/en/latest/starting/which-python/#implementations)
