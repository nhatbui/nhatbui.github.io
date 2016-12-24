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

/**
 * Find indices of all matches of Regex pattern in str.
 * @param {string} str - string to find Regex patterns in.
 * @param {RegExp} re - Regex patterns
 * @return {array} Array of indices where Regex pattern occurs in str.
 */
var findAllIndicesRegex = function(str, re) {
  var indices = [];
  var m = re.exec(str);
  while (m) {
    indices.push(m.index);
    m = re.exec(str);
  }
  return indices;
};

var nullOutChars = function(str, start, end, nullChar) {
  return str.slice(0, start) + nullChar.repeat(end - start) + str.slice(end);
}

module.exports.findAllIndices = findAllIndices;
module.exports.findAllIndicesRegex = findAllIndicesRegex;
module.exports.nullOutChars = nullOutChars;

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
 * @param {string} splitOn - String separating tokens.
 * @return {array} Array of token positions.
 */
var findTokenPositions = function(str, splitOn) {
  var space_indices = common.findAllIndices(str, splitOn);
  var tokenIndices = space_indices.map(function(i) { return i + 1; });
  tokenIndices.unshift(0);
  return tokenIndices;
};

/**
 * Finds LCS between consecutive shuffixes.
 * @param {string} str - String to find LCSs in.
 * @param {string} splitOn - String to split tokens on.
 * @return {array} Array of LCS between shuffixes.
 */
var LCPArray = function(str, splitOn) {
  if (str.length === 0) {
    return [];
  }

  // Split the sentence into tokens.
  var tokenList = str.split(splitOn);
  if (tokenList.length <= 1) {
    return '';
  }

  // Get positions of each token in the original string.
  var positions = findTokenPositions(str, splitOn);

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
    var lcp = tokenList.slice(sh1, sh1 + tokensMatched).join(splitOn);

    if (lcp.length > 0) {
      lcp_array.push(lcp);
    }
  }

  return lcp_array;
};

module.exports = LCPArray;

},{"../lib/common.js":1}],3:[function(require,module,exports){
var common = require('../lib/common.js');

/**
 * Find all "runs" of 'pattern' in 'doc'. Runs are sequential repeats.
 * A run is an object with the following keys:
 * 'start': index of start of run.
 * 'count': number of sequential repeats of the string.
 * @param {string} pattern - String to find runs of within doc.
 * @param {int} doc - String to find runs of 'pattern' within.
 * @param {string} delimiter - String which delimits tokens
 * @return {array} runs - Array of runs.
 */
var findRuns = function(pattern, doc, delimiter) {
  // all matches must be followed by a whitespace or end of the string.
  // NOTE: We tokenized on single-space. Will the mismatch lead to funkiness?
  var regexPattern = new RegExp(pattern + '(' + delimiter + '|$)', 'g');
  var matches = common.findAllIndicesRegex(doc, regexPattern);

  // Returned structure:
  // list of tuples where each tuple is the start of the run and the number
  // of times that run is repeated.
  if (matches.length === 0) {
    return [];
  } else if (matches.length === 1) {
    return [{start: matches[0], count: 1, pattern: pattern}];
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
        runs.push({start: runStart, count: runCount, pattern: pattern});

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
    runs.push({start: runStart, count: runCount, pattern: pattern});
  }

  return runs;
};

/**
 * Replace sequential repeats, runs, by one instance of the pattern.
 * Optionally, add styling to all reduced runs.
 * @param {array} runs - Array of runs.
 * @param {string} pattern - String whose repeated pattern occurs in doc.
 * @param {string} doc - String containing runs of pattern.
 * @param {string} delimiter - String separating tokens.
 * @param {boolean} showNum - Flag to show number of repeats.
 * @param {string} multiplier - String to show before number of repeats.
 * @param {string} tagStart - String to show before start of run.
 * @param {string} tagEnd - String to show at the end of run.
 * @return {string} newDoc - String whose runs have been compressed to one
 * instance of the repeated pattern.
 */
var tagRuns = function(runs, doc, delimiter, showNum,
                       multiplier, tagStart, tagEnd) {
  var lastPos = 0;
  var newDoc = '';
  for (run of runs) {
    newDoc += doc.slice(lastPos, run.start);

    if (showNum && run.count > 1) {
      newDoc += tagStart + run.pattern + multiplier + run.count + tagEnd + delimiter;
    } else {
      newDoc += run.pattern + delimiter;
    }

    lastPos = run.start + run.count * (run.pattern.length + 1);
  }

  if (lastPos < doc.length) {
    newDoc += doc.slice(lastPos);
  } else {
    newDoc = newDoc.slice(0, -1);
  }

  return newDoc;
};

/**
 * Replace sequential repeats, runs, by one instance of the pattern.
 * Optionally, add styling to all reduced runs.
 * @param {string} pattern - String whose repeated pattern occurs in doc.
 * @param {string} doc - String containing runs of pattern.
 * @param {string} delimiter - String that separates tokens.
 * @param {boolean} showNum - Flag to show number of repeats.
 * @param {string} multiplier - String to show before number of repeats.
 * @param {string} tagStart - String to show before start of run.
 * @param {string} tagEnd - String to show at the end of run.
 * @return {string} newDoc - String whose runs have been compressed to one
 * instance of the repeated pattern.
 */
var tagRepeats = function(pattern, doc, delimiter, showNum, multiplier, tagStart, tagEnd) {
  var runs = findRuns(pattern, doc, delimiter);
  return tagRuns(runs, doc, delimiter, showNum, multiplier, tagStart, tagEnd);
};

module.exports.tagRepeats = tagRepeats;
module.exports.findRuns = findRuns;
module.exports.tagRuns = tagRuns;

},{"../lib/common.js":1}],"libhrc":[function(require,module,exports){
var LCPArray = require('../lib/lcpArray.js');
var tagging = require('../lib/tagRepeats.js');
var common = require('../lib/common.js');

/**
 * Replace sequential repeats, runs, by one instance of the pattern.
 * Optionally, add styling to all reduced runs.
 * @param {string} s - String to compress (hopefully).
 * @param {string} delimiter - String to split s into tokens.
 * @param {boolean} showNum - Flag to show number of repeats.
 * @param {string} multiplier - String to show before number of repeats.
 * @param {string} left_tag - String to show before start of run.
 * @param {string} right_tag - String to show at the end of run.
 * @return {string} If repeats are found, return new string whose
 * runs have been compressed to one instance of the repeated pattern. If not,
 * return original string.
 */
var naive_compress = function(s,
                              delimiter,
                              showNum,
                              multiplier,
                              left_tag,
                              right_tag) {
  var lcp_array = LCPArray(s, delimiter);
  if (lcp_array.length > 0) {
    // Starting from the longest LCP, find the first LCP that compresses the
    // original string.

    // Sort the LCP array so we know we are going in order of length of common
    // prefix.
    lcp_array.sort(function(a, b) {
      if (a.length < b.length) {
        return -1;
      } else if (a.length > b.length) {
        return 1;
      } else {
        return 0;
      }
    });
    
    var i = lcp_array.length - 1;
    var lrs = null;
    while (i >= 0) {
      var testlrs = lcp_array[i];
      var testCompress = tagging.tagRepeats(testlrs, s, delimiter);
      if (testCompress.length < s.length) {
        lrs = testlrs;
        break;
      }
      i--;
    }

    if (lrs) {
      return tagging.tagRepeats(lrs, s, delimiter, showNum, multiplier, left_tag, right_tag);
    } else {
      return s;
    }
  } else {
    return s;
  }
};

var greedy_compress = function(s,
                               delimiter,
                               showNum,
                               multiplier,
                               left_tag,
                               right_tag) {
  var lcp_array = LCPArray(s, delimiter);

  if (lcp_array.length > 0) {
    // Sort the LCP array so we know we are going in order of length of common
    // prefix.
    lcp_array.sort(function(a, b) {
      if (a.length < b.length) {
        return -1;
      } else if (a.length > b.length) {
        return 1;
      } else {
        return 0;
      }
    });

    var testStr = s;
    var greedySet = [];
    var i = lcp_array.length - 1;
    while (i >= 0) {
      var testlrs = lcp_array[i];
      var runs = tagging.findRuns(testlrs, testStr, delimiter);
      //console.log("'", runs, "'");
      // Filter only runs of length greater than 1.
      var newRuns = runs.filter(function(x) { return x.count > 1; });

      // Filter runs that do not overlap with existing set.
      var includedRuns = newRuns.filter(function(x) {
        for (var i = 0; i < greedySet.length; i++) {
          var r = greedySet[i];
          var xEnd = x.start + x.pattern.length*x.count + (x.count - 1);
          var rEnd = r.start + r.pattern.length*r.count + (r.count - 1);
          //console.log(x.pattern, x.count, r.pattern, r.count, x.start, xEnd, r.start, rEnd);
          if (x.start <= rEnd && r.start <= xEnd) {
              return false;
            }
        }
        return true;
      });

      // Use these runs to delete from string.
      for (x of includedRuns) {
        testStr = common.nullOutChars(
          testStr, x.start, x.start + x.pattern.length*x.count + (x.count - 1), ' '
        );
      }

      // Add to the set
      greedySet.push.apply(greedySet, includedRuns);

      i--;
    }

    if (greedySet.length > 0) {
      // Sort set for easy tagging.
      var sortedGreedySet = greedySet.sort(function(a, b) {
        return a.start - b.start;
      });
      return tagging.tagRuns(sortedGreedySet, s, delimiter, showNum, multiplier, left_tag, right_tag);
    } else {
      return s;
    }
  } else {
    return s;
  }
};

module.exports.LCPArray = LCPArray;
module.exports.tagRepeatedPhrases = tagging.tagRepeats;
module.exports.naive_compress = naive_compress;
module.exports.greedy_compress = greedy_compress;

},{"../lib/common.js":1,"../lib/lcpArray.js":2,"../lib/tagRepeats.js":3}]},{},[]);
