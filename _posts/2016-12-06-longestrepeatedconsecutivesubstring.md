---
layout: math_post
title: Longest Repeated Consecutive Substring in Lisp
description: Finding the longest repeated consecutive substring in Lisp!
author: Nhat Bui
tags: programming, functional programming, Lisp, algorithm, suffix array
category: programming
---

# Introduction

I wanted to document my journey figuring out how I solved a unique problem and
how doing so in Lisp helped me find a concise and correct solution.

[Twitch](https://www.twitch.tv/) is a live streaming platform for gaming and Twitch chat, a group chat accompanying
the live-streaming video, can become incomprehensible and unwieldy
with large amounts of messages submitted rapidly. A streamer or a viewer paying
attention to Twitch chat may miss messages as they are buried by the ocean of new
incoming messages.

I noticed that the screen real estate is occupied by long messages and often
repeated messages. So I tried to tackle that problem with [compakt](http://www.nhatqbui.com/compakt/), a Chrome
Extension for Twitch chat.

To compress long messages, I used suffix arrays and an adaptation to
the classic longest repeated substring. Prototyping all this in Lisp really help me
decide on a concise and accurate solution.

# Background: Suffix Arrays

Suppose we had the following string: __abracadabra__. Suffixes are substrings
that contain all characters from a position in the string to the end of the string.
For the aforementioned string, all possible suffixes are:

* __abracadabra\$__
* __bracadabra\$__
* __racadabra\$__
* __acadabra\$__
* __cadabra\$__
* __adabra\$__
* __dabra\$__
* __abra\$__
* __bra\$__
* __ra\$__
* __a\$__

'\$' denotes the end of the string. Typically a character that isn't present originally
in the string is used for this.
A [suffix array](https://en.wikipedia.org/wiki/Suffix_array) is an array that contains all the suffixes for a string __in sorted order__.
Again for the aforementioned string, the suffix array is:

* __a\$__
* __abra\$__
* __abracadabra\$__
* __acadabra\$__
* __adabra\$__
* __bra\$__
* __bracadabra\$__
* __cadabra\$__
* __dabra\$__
* __ra\$__
* __racadabra\$__

We take advantage of this sorted property to find the longest repeated substring!

In the example above, we explicitly list out every suffix for demonstration-sake.
But we can use a more compact representation of the suffix array. Instead
of the suffixes themselves, we use the position of the start of the suffix (0-based index). Because
suffixes are substrings from a position to the end of the string, the position can
be used to uniquely identify a suffix. The suffix array from above then becomes:

* 10
* 7
* 0
* 3
* 5
* 8
* 1
* 4
* 6
* 9
* 2

<p>
Suffix array construction takes \(O(n^{2} \log (n))\) time: sorting the suffixes
is \(O(n \log (n))\) and each suffix comparison is \(O(n)\).
A suffix array takes \(O(n)\) space.
</p>

<div class="well">
<p><b>Note</b></p>

<p>There are algorithms that can construct the suffix array in \(O(n)\) time
though the implementation I present here will not be one of those.</p>

<p>Sources:</p>
<a href="https://bibiserv.cebitec.uni-bielefeld.de/bpr">1</a>
<a href="http://pizzachili.di.unipi.it/">2</a>
<a href="http://www.biojava.org/">3</a>
<a href="http://wwww.icir.org/christian/libstree/">4</a>
<a href="http://marknelson.us/1996/09/01/suffix-trees/">5</a>
<a href="http://www.cs.ucdavis.edu/~gusfield/strmat.html">6</a>
</div>

<div class="well">
<p><b>Note</b></p>

<p>You may have heard of <a href="https://en.wikipedia.org/wiki/Suffix_tree">suffix <i>trees</i></a>.
Often, these are presented before suffix arrays in literature.
I went with a suffix array because it was easier so me to understand.</p>

</div>

# History: the Longest Repeated Substring.

The [longest repeated substring](https://en.wikipedia.org/wiki/Longest_repeated_substring_problem)
is a well-document problem. What follows is a description of the problem and how it's
solved with [suffix arrays](https://en.wikipedia.org/wiki/Suffix_array). Then I'll describe the steps I take to adapt it to my problem: the longest repeated ___consecutive___ substring.

> Longer repeated substrings are more likely to occur between lexicographically
consecutive suffixes.

<p>
What I want to do first is establish an intuition for determining the longest
repeated substring from a suffix array. Suppose we simply wanted to find an occurrence
of a pattern in the string __abracadabra__. Let this pattern be __bra__. What we
would do is a binary search on the suffix array. If the pattern exists in the string
it is equal to a suffix or a substring of a suffix, also known as a prefix.
Knowing this, how do we find an arbitrary substring that repeats in the string?
We compare suffixes to each other!
A repeated substring would appear in at least 2 different suffixes. In other words,
the repeated substring should appear in at least 2 different places of the string.
And knowing that the suffix array is sorted, we don't need a
\(O(n^2)\) comparison i.e. comparing one suffix to rest to find the repeated substring.
Longer repeated substrings are more likely to occur between lexicographically
consecutive suffixes. So we look for the longest common prefix between all pairs
of consecutive suffixes.
</p>

Finding the _longest_ repeated substring is a simple matter of retaining a best-so-far
match and comparing the length of new potential matches.

## Algorithm

    (defun lcp (a b)
      (let ((i (string< a b)))
        (subseq a 0 i)
    )

    (defun returnLonger (a b)
      (if (>= (length a) (length b))
        a
        b
      )
    )

    (defun findLongestCommonSubstring (suffixarr best)
      (let ((lcs (returnLonger
                   (lcp (first suffixArray) (second suffixArray))
                   best)))
        (if (<= (list-length suffixarr) 2)
          best
          (findLongestCommonSubstring (rest suffixArr) best))
    )

<p>
We benefit from iterating through the suffix array in \(O(n)\). But since we
compare each character of the string, the algorithm is \(O(n^{2})\).
</p>

# Longest Repeated Consecutive Substring

We have a strong foundation for what we want to do. However, it's not perfect.
Take this for example:

__ATCGATCGA\$__

The longest repeated substring is __ATCGA__. This repeated substring overlaps
with itself. We would like to find a repeated substring that doesn't overlap and
is consecutive.

### __Non-overlapping but also not consecutive__

__ABBAissocoolIloveyouABBA\$__

Repeated string __ABBA__ occurs but not sequentially.

### __Non-overlapping and consecutive__

__yoloyoloyolobaggins__

Repeated string __yolo__ is repeated multiple times and is non-overlapping and
consecutive.

So how do we do this?

Finding the repeated consecutive substrings is simple: the repeated substring must
be the same distance as the distance between 2 suffixes. So for every longest
common prefix that we find, check if its length is equal to the distance between
the 2 suffixes. If so, it is repeated, non-overlapping and consecutive.

## Algorithm

    (defun lcp (a b)
      (let ((i (string< a b)))
        (subseq a 0 i)
    )

    (defun updatelcp (oldlcp checklcp suffix1 suffix2)
      (if (and (>= (length checklcp) (length oldcp))
               (checkConsecutive checklcp suffix1 suffix2))
        checklcp
        oldlcp
      )
    )

    (defun checkConsecutive (lcp suffix1 suffix2)
      (= (length lcp) (abs (- suffix1 suffix2)))
    )

    (defun findLongestCommonSubstring (suffixarr str best)
      (let ((suffixIdx1 (first suffixArr))
            (suffixIdx2 (second suffixArr)))
        (let ((lcs (updatelcp
                     (lcp (subseq str suffixIdx1) (subseq str suffixIdx2))
                     best suffixIdx1 suffixIdx2)))
          (if (<= (list-length suffixarr) 2)
            best
            (findLongestCommonSubstring (rest suffixArr) best))))
    )

# Extensions

Before I explain how Lisp helped me understand this logic, I want to quickly
describe one other extension I made for my application.

I only wanted to find repeated substrings that consisted of whole words from the
original message. So I tokenized the original string and treated each token as a
character. Then I performed the longest repeated consecutive substring on this
new structure. You can give the code here on my [GitHub](https://github.com/nhatbui/lrs_lisp).

# I love Lisp

In my head, I imagined this section as a list of features that I would ramble on
about how they helped me implementation this algorithm. But I think I only need
to say one thing: __functional programming__.

* I was forced to take advantage of the existing structures and their properties instead of iterators and counts making for an efficient use of my allocated memory.
* I was able to see the meat and bones of the algorithm: a lcp search between each pair of lexicographically consecutive suffixes.

I'm still very new to Lisp but I know for sure I want to dive deeper into functional
programming. I'm happy to hear any feedback on this post or the code in this post.
Check out the Lisp code for my application [here](https://github.com/nhatbui/lrs_lisp).
And please check out my [extension](https://chrome.google.com/webstore/detail/twitch-compakt/gfjfndigkjbiabgckjpngijjdkmebeje?hl=en-US)! It's [open-sourced](https://github.com/nhatbui/compakt)!
