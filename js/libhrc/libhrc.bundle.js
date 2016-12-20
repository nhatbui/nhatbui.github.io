require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Find indices of all occurance of elem in arr. Uses 'indexOf'.
 * @param {array} arr - Array-like element (works with strings too!).
 * @param {array_element} elem - Element to search for in arr.
 * @return {array} indices - Array of indices where elem occurs in arr.
 */
var findAllIndices = function(arr, elem) {
  var indices = [];
  var i = arr.indexOf(elem);
  while (i != -1) {
    indices.push(i);
    i = arr.indexOf(elem, i + 1);
  }
  return indices;
};

module.exports.findAllIndices = findAllIndices;

},{}],2:[function(require,module,exports){
var common = require('../lib/common.js');

/**
 * Given two indices for the same array, find the
 * longest commom subsequence (LCS)  of the array.
 * @param {int} i1 - The index of the first subsequence.
 * @param {int} i2 - The index of the second subsequence.
 * @param {array} arr - Array.
 * @return {int} l - Length of LCS
 */
var longestCommonPrefix = function(i1, i2, arr) {
  var l = 0;
  var offset = 0;
  var limit = arr.length - Math.max(i1, i2);
  for (var offset = 0; offset < limit; offset++) {
    if (arr[i1 + offset] == arr[i2 + offset]) {
      l++;
    } else {
      break;
    }
  }
  return l;
};

/**
 * Finds positions of tokens in string.
 * @param {string} str - String.
 * @return {array} tokenIndices - Array of token positions.
 */
var findTokenPositions = function(str) {
  var space_indices = common.findAllIndices(str, ' ');
  var tokenIndices = space_indices.map(function(i) { return i + 1; });
  tokenIndices.unshift(0);
  return tokenIndices;
};

/**
 * Finds LCS between consecutive shuffixes.
 * @param {string} str - String to find LCSs in.
 * @return {array} lcp_array - Aray of LCS between shuffixes.
 */
var getLCPArray = function(str) {
  if (str.length === 0) {
    return [];
  }

  // Split the sentence into tokens.
  var tokenList = str.split(' ');
  if (tokenList.length <= 1) {
    return '';
  }

  // Get positions of each token in the original string.
  var positions = findTokenPositions(str);

  // Create the shuffix array by sorting it.
  var shuffixArray = Array.apply(null, Array(tokenList.length))
    .map(function(_, i) {return i;});
  shuffixArray.sort(function(a, b) {
    var s1 = tokenList.slice(a);
    var s2 = tokenList.slice(b);
    if (s1 < s2) {
      return -1;
    } else if (s1 > s2) {
      return 1;
    } else {
      return 0;
    }
  });

  // Build LCP array (longest common prefix)
  var lcp_array = [];
  for (var i = 1; i < shuffixArray.length; i++) {
    var sh1 = shuffixArray[i - 1];
    var sh2 = shuffixArray[i];

    var tokensMatched = longestCommonPrefix(sh1, sh2, tokenList);
    var lcp = tokenList.slice(sh1, sh1 + tokensMatched).join(' ');

    if (lcp.length > 0) {
      lcp_array.push(lcp);
    }
  }

  lcp_array.sort(function(a, b) {
    if (a.length < b.length) {
      return -1;
    } else if (a.length > b.length) {
      return 1;
    } else {
      return 0;
    }
  });

  return lcp_array;
};

module.exports = getLCPArray;

},{"../lib/common.js":1}],3:[function(require,module,exports){
var common = require('../lib/common.js');

/**
 * Find all "runs" of 'pattern' in 'doc'. Runs are sequential repeats.
 * A run is an object with the following keys:
 * 'start': index of start of run.
 * 'count': number of sequential repeats of the string.
 * @param {string} pattern - String to find runs of within doc.
 * @param {int} doc - String to find runs of 'pattern' within.
 * @return {array} runs - Array of runs.
 */
var findRuns = function(pattern, doc) {
  var matches = common.findAllIndices(doc, pattern);

  // Returned structure:
  // list of tuples where each tuple is the start of the run and the number
  // of times that run is repeated.
  if (matches.length === 0) {
    return doc;
  } else if (matches.length === 1) {
    return [{start: matches[0], count: 1}];
  } else {
    // collect "runs"
    var runs = [];
    var runStart = matches[0];
    var runCount = 1;
    for (var i = 1; i < matches.length; i++) {
      var diff = matches[i] - matches[i - 1];
      // +1 is important! Assume patterns are delimited by a space!
      if (diff === (pattern.length + 1)) {
        // Continue the run
        runCount++;
      } else {
        // Log the run.
        runs.push({start: runStart, count: runCount});

        // Restart run counting
        runStart = matches[i];
        runCount = 1;
      }
    }
    // State:
    // - The last run is never logged.
    //    - If there's one run, it still hasn't been logged.
    // - for n number of runs where n > 1, the last is not printed so we better
    //   make sure we handle it outside of this for loop.
    runs.push({start: runStart, count: runCount});
  }

  return runs;
};

/**
 * Replace sequential repeats, runs, by one instance of the pattern.
 * Optionally, add styling to all reduced runs.
 * @param {array} runs - Array of runs.
 * @param {string} pattern - String whose repeated pattern occurs in doc.
 * @param {string} doc - String containing runs of pattern.
 * @param {boolean} showNum - Flag to show number of repeats.
 * @param {string} multiplier - String to show before number of repeats.
 * @param {string} tagStart - String to show before start of run.
 * @param {string} tagEnd - String to show at the end of run.
 * @return {string} newDoc - String whose runs have been compressed to one
 * instance of the repeated pattern.
 */
var tagRuns = function(runs, pattern, doc, showNum,
                       multiplier, tagStart, tagEnd) {
  var lastPos = 0;
  var newDoc = '';
  for (run of runs) {
    newDoc += doc.slice(lastPos, run.start);

    if (showNum && run.count > 1) {
      newDoc += tagStart + pattern + multiplier + run.count + tagEnd + ' ';
    } else {
      newDoc += pattern + ' ';
    }

    lastPos = run.start + run.count * (pattern.length + 1);
  }

  if (lastPos < doc.length) {
    newDoc += doc.slice(lastPos);
  }

  return newDoc.trim();
};

/**
 * Replace sequential repeats, runs, by one instance of the pattern.
 * Optionally, add styling to all reduced runs.
 * @param {string} pattern - String whose repeated pattern occurs in doc.
 * @param {string} doc - String containing runs of pattern.
 * @param {boolean} showNum - Flag to show number of repeats.
 * @param {string} multiplier - String to show before number of repeats.
 * @param {string} tagStart - String to show before start of run.
 * @param {string} tagEnd - String to show at the end of run.
 * @return {string} newDoc - String whose runs have been compressed to one
 * instance of the repeated pattern.
 */
var tagRepeats = function(pattern, doc, showNum, multiplier, tagStart, tagEnd) {
  var runs = findRuns(pattern, doc);
  return tagRuns(runs, pattern, doc, showNum, multiplier, tagStart, tagEnd);
};

module.exports = tagRepeats;

},{"../lib/common.js":1}],"libhrc":[function(require,module,exports){
var getLCPArray = require('../lib/lrcs.js');
var tagRepeats = require('../lib/tagRepeats.js');

/**
 * Replace sequential repeats, runs, by one instance of the pattern.
 * Optionally, add styling to all reduced runs.
 * @param {string} s - String to compress (hopefully).
 * @param {boolean} [showNum=false] - Flag to show number of repeats.
 * @param {string} [multiplier=''] - String to show before number of repeats.
 * @param {string} [left_tag=''] - String to show before start of run.
 * @param {string} [right_tag=''] - String to show at the end of run.
 * @return {string} new string - If repeats are found, return new string whose
 * runs have been compressed to one instance of the repeated pattern. If not,
 * return original string.
 */
var naive_compress = function(s, showNum, multiplier, left_tag, right_tag) {
  var lcp_array = getLCPArray(s);
  //console.log(lcp_array);
  if (lcp_array.length > 0) {
    // Starting from the longest LCP, find the first LCP that compresses the
    // original string.
    var i = lcp_array.length - 1;
    var lrs = null;
    while (i >= 0) {
      var testlrs = lcp_array[i];
      var testCompress = tagRepeats(testlrs, s);
      if (testCompress.length < s.length) {
        lrs = testlrs;
        break;
      }
      i--;
    }

    if (lrs) {
      return tagRepeats(lrs, s, showNum, multiplier, left_tag, right_tag);
    } else {
      return s;
    }
  } else {
    return s;
  }
};

module.exports.getLCPArray = getLCPArray;
module.exports.tagRepeatedPhrases = tagRepeats;
module.exports.naive_compress = naive_compress;

},{"../lib/lrcs.js":2,"../lib/tagRepeats.js":3}]},{},[]);
