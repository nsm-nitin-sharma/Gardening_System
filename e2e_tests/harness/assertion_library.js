/**
 * harness/assertion_library.js
 * Monotonic Assertion Library with Detailed Diffs and Counting
 */

class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

let totalAssertions = 0;

function increment() {
  totalAssertions++;
}

const assert = {
  get count() {
    return totalAssertions;
  },
  resetCount() {
    totalAssertions = 0;
  },

  ok(value, message = 'Expected value to be truthy') {
    increment();
    if (!value) {
      throw new AssertionError(message, value, true);
    }
  },

  strictEqual(actual, expected, message) {
    increment();
    if (!Object.is(actual, expected)) {
      throw new AssertionError(
        message || `Expected ${JSON.stringify(actual)} to strictly equal ${JSON.stringify(expected)}`,
        actual,
        expected
      );
    }
  },

  notStrictEqual(actual, unexpected, message) {
    increment();
    if (Object.is(actual, unexpected)) {
      throw new AssertionError(
        message || `Expected ${JSON.stringify(actual)} not to equal ${JSON.stringify(unexpected)}`,
        actual,
        unexpected
      );
    }
  },

  deepStrictEqual(actual, expected, message) {
    increment();
    const actualStr = JSON.stringify(actual);
    const expectedStr = JSON.stringify(expected);
    if (actualStr !== expectedStr) {
      throw new AssertionError(
        message || `Deep strict equality failed:\nActual:   ${actualStr}\nExpected: ${expectedStr}`,
        actual,
        expected
      );
    }
  },

  includes(haystack, needle, message) {
    increment();
    let passes = false;
    if (typeof haystack === 'string') {
      passes = haystack.includes(needle);
    } else if (Array.isArray(haystack)) {
      passes = haystack.includes(needle);
    } else if (haystack && typeof haystack === 'object') {
      if (haystack instanceof Set || haystack instanceof Map) {
        passes = haystack.has(needle);
      } else {
        passes = Object.prototype.hasOwnProperty.call(haystack, needle);
      }
    }
    if (!passes) {
      throw new AssertionError(
        message || `Expected ${JSON.stringify(haystack)} to include ${JSON.stringify(needle)}`,
        haystack,
        needle
      );
    }
  },

  doesNotInclude(haystack, needle, message) {
    increment();
    let contains = false;
    if (typeof haystack === 'string') {
      contains = haystack.includes(needle);
    } else if (Array.isArray(haystack)) {
      contains = haystack.includes(needle);
    } else if (haystack && typeof haystack === 'object') {
      if (haystack instanceof Set || haystack instanceof Map) {
        contains = haystack.has(needle);
      } else {
        contains = Object.prototype.hasOwnProperty.call(haystack, needle);
      }
    }
    if (contains) {
      throw new AssertionError(
        message || `Expected ${JSON.stringify(haystack)} NOT to include ${JSON.stringify(needle)}`,
        haystack,
        needle
      );
    }
  },

  match(str, regex, message) {
    increment();
    if (!regex.test(String(str ?? ''))) {
      throw new AssertionError(
        message || `Expected "${str}" to match pattern ${regex}`,
        str,
        regex.toString()
      );
    }
  },

  doesNotMatch(str, regex, message) {
    increment();
    if (regex.test(String(str ?? ''))) {
      throw new AssertionError(
        message || `Expected "${str}" NOT to match pattern ${regex}`,
        str,
        regex.toString()
      );
    }
  },

  throws(fn, expectedRegexOrMessage, message) {
    increment();
    let threw = false;
    let thrownError = null;
    try {
      fn();
    } catch (e) {
      threw = true;
      thrownError = e;
    }
    if (!threw) {
      throw new AssertionError(message || 'Expected function to throw an error, but it did not throw.');
    }
    if (expectedRegexOrMessage instanceof RegExp) {
      if (!expectedRegexOrMessage.test(thrownError.message)) {
        throw new AssertionError(
          `Thrown error "${thrownError.message}" did not match pattern ${expectedRegexOrMessage}`,
          thrownError.message,
          expectedRegexOrMessage.toString()
        );
      }
    } else if (typeof expectedRegexOrMessage === 'string') {
      if (!thrownError.message.includes(expectedRegexOrMessage)) {
        throw new AssertionError(
          `Thrown error "${thrownError.message}" did not contain "${expectedRegexOrMessage}"`,
          thrownError.message,
          expectedRegexOrMessage
        );
      }
    }
  },

  doesNotThrow(fn, message) {
    increment();
    try {
      fn();
    } catch (e) {
      throw new AssertionError(
        message || `Expected function not to throw, but caught error: ${e.message}`,
        e.message,
        null
      );
    }
  },

  greaterThan(actual, expected, message) {
    increment();
    if (!(actual > expected)) {
      throw new AssertionError(message || `Expected ${actual} > ${expected}`, actual, expected);
    }
  },

  greaterThanOrEqual(actual, expected, message) {
    increment();
    if (!(actual >= expected)) {
      throw new AssertionError(message || `Expected ${actual} >= ${expected}`, actual, expected);
    }
  },

  lessThan(actual, expected, message) {
    increment();
    if (!(actual < expected)) {
      throw new AssertionError(message || `Expected ${actual} < ${expected}`, actual, expected);
    }
  },

  lessThanOrEqual(actual, expected, message) {
    increment();
    if (!(actual <= expected)) {
      throw new AssertionError(message || `Expected ${actual} <= ${expected}`, actual, expected);
    }
  }
};

module.exports = assert;
