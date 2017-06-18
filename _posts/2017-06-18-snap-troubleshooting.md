---
layout: post
title: Troubleshooting Snap on Ubuntu Core
description: Common issues starting with snap on Ubuntu Core.
author: Nhat Bui
tags: programming, Ubuntu, Ubuntu Core, snap
category: programming
---

I got started with Ubuntu Core on the Raspberry Pi and I had some problems (nothing major)
starting with snap on Ubuntu Core. Here are some quick resolutions:

* is the snap daemon on? Restart the service with `service snapd restart`
* errors installing snaps? Did you login? Do `snap login`
