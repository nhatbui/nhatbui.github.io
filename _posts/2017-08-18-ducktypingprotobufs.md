---
layout: post
title: Ducktyping + Python Protobuf
description: Don't use ducktyping to see existance of optional fields in a Python protobuf.
author: Nhat Bui
tags: protobuf, protocol buffer, Python, duck typing, programming, software 
category: programming
---

Given a compiled Python protobuf as follows:

```
message Person {
    optional string email = 1;
}
```

__Don't use duck typing to see if an optional field has been set!__

Though the value is known to be unset, accessing the value always returns
a default value! [(Source. See `optional` field description.)](https://developers.google.com/protocol-buffers/docs/pythontutorial#defining-your-protocol-format)

```
import Person_pb2

person = Person()

if person.email:
    print('Oh wow you totally have an email!')
    print('It is: '.format(person.email))
```

`> Oh wow you totally have an email!`
`> It is:`

Use the compiled protobuf's data member functions to check existance:

```
if person.HasField('email'):
    # do stuff
```

[It's not very clear you need to do it like this...](https://developers.google.com/protocol-buffers/docs/reference/python/google.protobuf.message.Message-class#HasField)
