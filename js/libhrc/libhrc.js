// Longest Repeated Substring

var longestCommonPrefix =  function (i1, i2, arr) {
  // Given 2 indices for an array, find the longest common subsequence of an array.
  var l = 0;
  var offset = 0;
  var limit = arr.length - Math.max(i1, i2);
  for (var offset = 0; offset < limit; offset++) {
    if(arr[i1+offset] == arr[i2+offset]) {
      l++;
    } else {
      break;
    }
  }
  return l;
};

var findAllIndices = function(arr, elem) {
  var indices = [];
  var i = arr.indexOf(elem);
  while(i != -1) {
    indices.push(i);
    i = arr.indexOf(elem, i+1);
  }
  return indices;
}

var findTokenPositions = function(str) {
  var space_indices = findAllIndices(str, " ");
  var tokenIndices = space_indices.map(function (i) { return i+1; })
  tokenIndices.unshift(0);
  return tokenIndices;
}

var getLCPArray = function(str) {
  // Iterates through a suffix array and finds the longest common prefix.

  if (str.length === 0) {
    return [];
  }

  // Split the sentence into tokens.
  var tokenList = str.split(" ");
  if (tokenList.length <= 1) {
    return "";
  }

  // Get positions of each token in the original string.
  var positions = findTokenPositions(str);

  // Create the shuffix array by sorting it.
  var shuffixArray = Array.apply(null, Array(tokenList.length))
    .map(function (_, i) {return i;});
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
  for(var i = 1; i < shuffixArray.length; i++) {
    var sh1 = shuffixArray[i-1];
    var sh2 = shuffixArray[i];

    var tokensMatched = longestCommonPrefix(sh1, sh2, tokenList);
    var lcp = tokenList.slice(sh1, sh1+tokensMatched).join(" ");

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

var findAllIndices = function(arr, elem) {
  var indices = [];
  var i = arr.indexOf(elem);
  while(i != -1) {
    indices.push(i);
    i = arr.indexOf(elem, i+1);
  }
  return indices;
}

var findRuns = function(pattern, doc) {
  var matches = findAllIndices(doc, pattern);

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
    for(var i = 1; i < matches.length; i++) {
      var diff = matches[i] - matches[i-1];
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

var tagRuns = function(runs, pattern, doc, showNum, multiplier, tagStart, tagEnd) {
  var lastPos = 0;
  var newDoc = '';
  for (run of runs) {
    newDoc += doc.slice(lastPos, run.start);

    if (showNum && run.count > 1) {
      newDoc += tagStart + pattern + multiplier + run.count + tagEnd + " ";
    } else {
      newDoc += pattern + " ";
    }

    lastPos = run.start + run.count*(pattern.length + 1);
  }

  if (lastPos < doc.length) {
    newDoc += doc.slice(lastPos);
  }

  return newDoc.trim();
}

var tagRepeats = function(pattern, doc, showNum, multiplier, tagStart, tagEnd) {
  var runs = findRuns(pattern, doc);
  return tagRuns(runs, pattern, doc, showNum, multiplier, tagStart, tagEnd);
}

var naive_compress = function(s, showNum=false, multiplier="", left_tag="", right_tag="") {
  var lcp_array = getLCPArray(s);
  //console.log(lcp_array);
  if (lcp_array.length > 0) {
    // Starting from the longest LCP, find the first LCP that compresses the
    // original string.
    var i = lcp_array.length - 1;
    var lrs = null;
    while(i >= 0) {
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
}
