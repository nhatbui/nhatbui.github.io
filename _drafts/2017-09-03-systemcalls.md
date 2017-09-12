---
layout: post
title: Understanding system calls 
description: If I can invoke system calls from assembly, how are system calls implemented?
author: Nhat Bui
tags: programming, assembly, UNIX, Linux, system call
category: programming
---

I'm learning assembly language using the great book by Jonathan Bartlett, [Programming From The Ground Up]().

While studying, I learned that one can invoke system calls, such as open(), in assembly. I thought by using assembly, I'm at one of the lowest levels of programming, machine code and flipping bits with tweezers and magnets being even lower, and that there were almost no abstractions available to me. But if I can call invoke the kernel through system calls, there's still a layer of abstraction below me! I thought I was talking directly to the processor!

So I wanted to look at the source code for system calls. I was thinking perhaps if I saw the source code, it would share some light onto how some common operations, such as opening files, are done in pure assembly. I found [empty implementations of code]() such as implementations of open() that don't return valid file descriptors.

After talking to the kind folks in #c++ and ##c IRC channels, those implementations are stubs for systems that don't implementate those functions. The actual implementations are in `sysdep` [Link]().

So what's up with assembly? Why am I still using the kernel to help me with stuff? I thought I was doing everything from scratch? I think [this StackOverflow](https://stackoverflow.com/questions/11609110/how-to-access-the-system-call-from-user-space) answer by [Basile Starynkevitch](https://stackoverflow.com/users/841108/basile-starynkevitch) explains it best. To summarize: using assembly language, you're still coding at a very low-level. However, you are still writing applications in the __user space__ and that means to interface with devices and hardware, such as the disk, you need to go through the kernel.


