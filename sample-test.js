```
// Sample file for Grok automation testing

/**
 * Greets a person by name, with optional customization for time of day.
 * @param {string} [name='friend'] - The name of the person to greet. Defaults to 'friend'.
 * @param {string} [timeOfDay] - Optional time of day for a more specific greeting (e.g., 'morning', 'afternoon', 'evening').
 * @returns {string} A greeting message.
 */
function greet(name = 'friend', timeOfDay) {
  let greeting = 'Hello';
  if (timeOfDay) {
    if (timeOfDay.toLowerCase() === 'morning') {
      greeting = 'Good morning';
    } else if (timeOfDay.toLowerCase() === 'afternoon') {
      greeting = 'Good afternoon';
    } else if (timeOfDay.toLowerCase() === 'evening') {
      greeting = 'Good evening';
    }
  }
  return `${greeting}, ${name}!`;
}

/**
 * Greets multiple people with a single message.
 * @param {string[]} names - An array of names to greet.
 * @returns {string} A greeting message for all names.
 */
function greetMultiple(names) {
  if (names.length === 0) {
    return 'Hello, everyone!';
  }
  const formattedNames = names.join(', ');
  return `Hello, ${formattedNames}!`;
}

// Test cases
const assert = require('assert');

// Test greet function
assert.strictEqual(greet('Alice'), 'Hello, Alice!', 'Should greet with default Hello');
assert.strictEqual(greet(), 'Hello, friend!', 'Should use default name');
assert.strictEqual(greet('Bob', 'morning'), 'Good morning, Bob!', 'Should greet with morning');
assert.strictEqual(greet('Charlie', 'afternoon'), 'Good afternoon, Charlie!', 'Should greet with afternoon');
assert.strictEqual(greet('David', 'evening'), 'Good evening, David!', 'Should greet with evening');
assert.strictEqual(greet('Eve', 'night'), 'Hello, Eve!', 'Should fallback to Hello for unknown time');

// Test greetMultiple function
assert.strictEqual(greetMultiple(['Alice', 'Bob']), 'Hello, Alice, Bob!', 'Should greet multiple names');
assert.strictEqual(greetMultiple([]), 'Hello, everyone!', 'Should handle empty array');
assert.strictEqual(greetMultiple(['Charlie']), 'Hello, Charlie!', 'Should handle single name');

console.log('All tests passed!');

module.exports = {
  greet,
  greetMultiple,
};