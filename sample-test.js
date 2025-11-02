```
// Sample file for Grok automation testing

/**
 * Retrieves the appropriate greeting based on the time of day.
 * @param {string} [timeOfDay] - Optional time of day (e.g., 'morning', 'afternoon', 'evening', 'night').
 * @returns {string} The greeting string.
 */
function getGreeting(timeOfDay) {
  const greetings = {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    night: 'Good night',
  };
  // Use lowercase for case-insensitive matching, default to 'Hello' if not found
  return greetings[timeOfDay?.toLowerCase()] || 'Hello';
}

/**
 * Greets a person by name, with optional customization for time of day.
 * @param {string} [name='friend'] - The name of the person to greet. Defaults to 'friend' if empty or not provided.
 * @param {string} [timeOfDay] - Optional time of day for a more specific greeting (e.g., 'morning', 'afternoon', 'evening', 'night').
 * @returns {string} A greeting message.
 */
function greet(name = 'friend', timeOfDay) {
  // Ensure default name if provided name is falsy
  if (!name) name = 'friend';
  const greeting = getGreeting(timeOfDay);
  return `${greeting}, ${name}!`;
}

/**
 * Greets multiple people with a single message, with optional time of day.
 * @param {string[]} names - An array of names to greet.
 * @param {string} [timeOfDay] - Optional time of day for a more specific greeting.
 * @returns {string} A greeting message for all names.
 */
function greetMultiple(names, timeOfDay) {
  const greeting = getGreeting(timeOfDay);
  if (names.length === 0) {
    return `${greeting}, everyone!`;
  }
  let formattedNames;
  if (names.length === 1) {
    formattedNames = names[0];
  } else if (names.length === 2) {
    formattedNames = `${names[0]} and ${names[1]}`;
  } else {
    // Join all but the last with commas, then add 'and' before the last
    formattedNames = `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
  }
  return `${greeting}, ${formattedNames}!`;
}

// Test cases
const assert = require('assert');

// Test greet function
assert.strictEqual(greet('Alice'), 'Hello, Alice!', 'Should greet with default Hello');
assert.strictEqual(greet(), 'Hello, friend!', 'Should use default name');
assert.strictEqual(greet(''), 'Hello, friend!', 'Should use default for empty name');
assert.strictEqual(greet('Bob', 'morning'), 'Good morning, Bob!', 'Should greet with morning');
assert.strictEqual(greet('Charlie', 'afternoon'), 'Good afternoon, Charlie!', 'Should greet with afternoon');
assert.strictEqual(greet('David', 'evening'), 'Good evening, David!', 'Should greet with evening');
assert.strictEqual(greet('Eve', 'night'), 'Good night, Eve!', 'Should greet with night');
assert.strictEqual(greet('Frank', 'noon'), 'Hello, Frank!', 'Should fallback to Hello for unknown time');

// Test greetMultiple function
assert.strictEqual(greetMultiple(['Alice', 'Bob']), 'Hello, Alice and Bob!', 'Should greet two names');
assert.strictEqual(greetMultiple(['Alice', 'Bob', 'Charlie']), 'Hello, Alice, Bob, and Charlie!', 'Should greet three names with Oxford comma');
assert.strictEqual(greetMultiple([]), 'Hello, everyone!', 'Should handle empty array');
assert.strictEqual(greetMultiple(['Charlie']), 'Hello, Charlie!', 'Should handle single name');
assert.strictEqual(greetMultiple(['Alice', 'Bob'], 'morning'), 'Good morning, Alice and Bob!', 'Should greet multiple with time of day');
assert.strictEqual(greetMultiple([], 'evening'), 'Good evening, everyone!', 'Should handle empty with time of day');

console.log('All tests passed!');

module.exports = {
  greet,
  greetMultiple,
};