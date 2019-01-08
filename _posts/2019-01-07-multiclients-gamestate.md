---
layout: post
title: Multiple "identical" clients updating state
description: Helpful tip when developing applications here a user may have multiple clients observing+editing the state.
author: Nhat Bui
tags: programming
category: programming
---

# Applications where a user has multiple clients observing state

When an application allows a user to have multiple clients observing that state, any of which could update the state as well, I found this phrase helpful: "when a user changes a state in the application, you cannot assume the client performing the state change is the only client belonging to the user".

To some people this may be obvious. However, I found myself running into issues when I did not account for this.

Imagine an asynchronous turn-based game i.e. digital board game. A user may have the game (client) on her phone, iPad, and Steam.
Her turn may come up on her commute to which she'll play on her phone (sends an update to the game state).
When she gets home, she continues the match on her PC.
She then goes to another room and continues to play on the iPad.
If the game server assumes the client sending the state update is the *only* client belonging to the user, it's possible that if she takes a turn on one of her devices the others won't be updated. In fact, what's even worse is that those other clients still believe it's her turn and she can submit additional moves! (our protagonist would never cheat though)

For the situation above, I believe the best pattern is to broadcast state updates and include the user which it originated from. That allows the user's other clients to update state but also realize their turn is over. 

Go play more asynchronous turn-based games. They can fit to many people's lifestyles.
