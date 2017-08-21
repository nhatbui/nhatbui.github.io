---
layout: post
title: Python Protobuf 'syntax' Error
description: Common Python Protobuf error
author: Nhat Bui
tags: protobuf, protocol buffer, Python, programming, software 
category: programming
---

A common error somebody may encounter using Python protobufs on common Linux distros is:

```
TypeError: __init__() got an unexpected keyword argument 'syntax'
```

This is __most likely__ due to the fact that a lot of OSs have an outdated version of the Python protobuf package.
Typically a user may acquire protobuf tools from the OS package manager like

```
sudo apt-get install protobuf-compiler
sudo apt-get install python-protobuf
```

The protobuf compiler will compile a version of the protobuf which has a syntax the python-protobuf, the package that allows you to do `import google.protobuf`, doesn't understand. Specifically, all objects will be passed a `syntax` field to their `__init__` function. Update Python protobuf by visiting the [repo](https://github.com/google/protobuf/releases) and getting the latest version.
