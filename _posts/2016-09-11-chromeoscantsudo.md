---
layout: post
title: Can't sudo on ChromeOS
tags: programming, chromeos, chromebook, developer mode, crouton
category: programming
---

## Help! I'm on my Chromebook in developer mode and I can't `sudo` in the shell!

So you have a Chromebook. You booted into developer mode. You `alt+ctrl+t` for the terminal. You entered `shell`.
But now when you want to try [crouton](https://github.com/dnschneid/crouton) or something as `sudo`, it prompts you for a password you don't know!

Solution:

1. Go into VT2 using `ctrl+alt+F2`.
2. When prompted for a login, use `root`.
3. If you enabled _Debugging Features_ and __you set a root password__, enter that password.
   If you enabled _Debugging Features_ and __you DID NOT set a root password__, enter `test0000`.
   If you DID NOT enable _Debugging Features_, ...([contributions welcomed](https://github.com/nhatbui/nhatbui.github.io/blob/master/_posts/2016-09-11-chromeoscantsudo.md))
4. Enter `chromeos-setdevpasswd` and follow the prompt.
5. Once complete, you have just set the `sudo` password! Use it on the shell (a.k.a `ctrl+alt+t` and `shell`).
6. Done!

Enormous thanks to Github user [lan-gate](https://github.com/dnschneid/crouton/issues/825#issuecomment-223117369).
