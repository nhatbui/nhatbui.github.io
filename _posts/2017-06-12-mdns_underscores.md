---
layout: post
title: Multicast DNS and Hostnames with Underscores
description: Avahi-mDNS not working? Do you have underscores in the hostname?
author: Nhat Bui
tags: programming, networking, mdns, dns-sd, hostname, avahi, libnss-mdns
category: programming
---

Are you setting up a host with multicast DNS (mDNS) but you can't seem to reach it?

Are there underscores in your hostname?

avahi will discard underscores if they are present in the hostname.

my_host_name == myhostname

`ping myhostname`
