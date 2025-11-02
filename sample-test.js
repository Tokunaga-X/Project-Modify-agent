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

// Helper function to capitalize the first letter of a string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Greets a person by name, with optional customization for time of day.
 * @param {string} [name='friend'] - The name of the person to greet. Defaults to 'friend' if empty or not provided.
 * @param {string} [timeOfDay] - Optional time of day for a more specific greeting (e.g., 'morning', 'afternoon', 'evening', 'night').
 * @returns {string} A greeting message.
 */
function greet(name = 'friend', timeOfDay) {
  // Trim the name and default to 'friend' if empty or whitespace-only
  let finalName = name.trim();
  if (!finalName) finalName = 'friend';
  // Capitalize the name
  finalName = capitalize(finalName);
  const greeting = getGreeting(timeOfDay);
  return `${greeting}, ${finalName}!`;
}

/**
 * Greets multiple people with a single message, with optional time of day.
 * @param {string[]} names - An array of names to greet.
 * @param {string} [timeOfDay] - Optional time of day for a more specific greeting.
 * @returns {string} A greeting message for all names.
 */
function greetMultiple(names, timeOfDay) {
  const greeting = getGreeting(timeOfDay);
  // Filter non-null strings, trim, remove empty, and capitalize
  let validNames = names
    .filter(n => n != null && typeof n === 'string')
    .map(n => n.trim())
    .filter(n => n.length > 0)
    .map(capitalize);
  if (validNames.length === 0) {
    return `${greeting}, everyone!`;
  }
  let formattedNames;
  if (validNames.length === 1) {
    formattedNames = validNames[0];
  } else if (validNames.length === 2) {
    formattedNames = `${validNames[0]} and ${validNames[1]}`;
  } else {
    // Join all but the last with commas, then add 'and' before the last (Oxford comma)
    formattedNames = `${validNames.slice(0, -1).join(', ')}, and ${validNames[validNames.length - 1]}`;
  }
  return `${greeting}, ${formattedNames}!`;
}

// Test cases
const assert = require('assert');

// Test greet function
assert.strictEqual(greet('Alice'), 'Hello, Alice!', 'Should greet with default Hello');
assert.strictEqual(greet(), 'Hello, Friend!', 'Should use default name');
assert.strictEqual(greet(''), 'Hello, Friend!', 'Should use default for empty name');
assert.strictEqual(greet('Bob', 'morning'), 'Good morning, Bob!', 'Should greet with morning');
assert.strictEqual(greet('Charlie', 'afternoon'), 'Good afternoon, Charlie!', 'Should greet with afternoon');
assert.strictEqual(greet('David', 'evening'), 'Good evening, David!', 'Should greet with evening');
assert.strictEqual(greet('Eve', 'night'), 'Good night, Eve!', 'Should greet with night');
assert.strictEqual(greet('Frank', 'noon'), 'Hello, Frank!', 'Should fallback to Hello for unknown time');

// Test capitalization and trimming for greet
assert.strictEqual(greet('alice'), 'Hello, Alice!', 'Should capitalize name');
assert.strictEqual(greet('  bob  '), 'Hello, Bob!', 'Should trim and capitalize');
assert.strictEqual(greet(' '), 'Hello, Friend!', 'Should default to friend for whitespace name');

// Test greetMultiple function
assert.strictEqual(greetMultiple(['Alice', 'Bob']), 'Hello, Alice and Bob!', 'Should greet two names');
assert.strictEqual(greetMultiple(['Alice', 'Bob', 'Charlie']), 'Hello, Alice, Bob, and Charlie!', 'Should greet three names with Oxford comma');
assert.strictEqual(greetMultiple([]), 'Hello, everyone!', 'Should handle empty array');
assert.strictEqual(greetMultiple(['Charlie']), 'Hello, Charlie!', 'Should handle single name');
assert.strictEqual(greetMultiple(['Alice', 'Bob'], 'morning'), 'Good morning, Alice and Bob!', 'Should greet multiple with time of day');
assert.strictEqual(greetMultiple([], 'evening'), 'Good evening, everyone!', 'Should handle empty with time of day');

// Test capitalization, filtering, and trimming for greetMultiple
assert.strictEqual(greetMultiple(['alice', 'bob', 'charlie']), 'Hello, Alice, Bob, and Charlie!', 'Should capitalize multiple names');
assert.strictEqual(greetMultiple([' ', 'dave', '']), 'Hello, Dave!', 'Should filter out invalid names');
assert.strictEqual(greetMultiple(['eve  ', '  frank']), 'Hello, Eve and Frank!', 'Should trim names');
assert.strictEqual(greetMultiple([1, 'bob', null]), 'Hello, Bob!', 'Should filter non-string names');

console.log('All tests passed!');

module.exports = {
  greet,
  greetMultiple,
};