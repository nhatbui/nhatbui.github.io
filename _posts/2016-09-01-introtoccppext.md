---
layout: post
title: Intro to C/C++ Extensions for Python
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
After stumbling around, I was finally able to make things work.
I don't think it's difficult to write Python bindings or  C++ extensions;
it's just hard to know how you should approach doing so for your particular case.
I hope to do that in a series of blog posts. This will be just an introduction._

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

You usually have a set of functions that serve as the interface into your C++ library. You wrap around or attach bindings to these functions.

#### How will it be used?

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
They help by reducing the amount of conversion code you need to write. In exchange, you make
it more difficult for other users to install your package because they'll need to obtain the same tools.

Check out the next post for writing these functions.
