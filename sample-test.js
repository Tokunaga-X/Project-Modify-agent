// Sample file for Grok automation testing

/**
 * Determines the time of day category based on the given hour.
 * @param {number} hour - The hour of the day (0-23).
 * @returns {string} The time of day category ('morning', 'afternoon', 'evening', 'night').
 */
function getTimeOfDayFromHour(hour) {
  // Assumes hour is an integer between 0 and 23
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

/**
 * Retrieves the appropriate greeting based on the time of day.
 * @param {string|number|Date} [timeOfDay] - Optional time of day (e.g., 'morning', 'afternoon', 'evening', 'night'), hour (0-23), or Date object.
 * @returns {string} The greeting string.
 */
function getGreeting(timeOfDay) {
  let tod = timeOfDay;
  if (tod instanceof Date) {
    // Extract hour from Date object
    const hour = tod.getHours();
    tod = Number.isInteger(hour) && hour >= 0 && hour < 24 ? getTimeOfDayFromHour(hour) : undefined;
  } else if (typeof tod === 'number') {
    // Check if it's an integer hour between 0 and 23
    tod = Number.isInteger(tod) && tod >= 0 && tod < 24 ? getTimeOfDayFromHour(tod) : undefined;
  } else if (typeof tod === 'string') {
    // Convert string to lowercase for matching
    tod = tod.toLowerCase();
  } else {
    tod = undefined;
  }
  const greetings = {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    night: 'Good night',
  };
  // Return the matching greeting or default to 'Hello'
  return greetings[tod] || 'Hello';
}

/**
 * Capitalizes the first letter of each word in a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} The capitalized string.
 */
function capitalize(str) {
  if (!str) return '';
  // Regex matches the first character of each word and uppercases it
  return str.replace(/(^\w|\s\w)/g, char => char.toUpperCase());
}

/**
 * Greets a person by name, with optional customization for time of day.
 * @param {string} [name='friend'] - The name of the person to greet. Defaults to 'friend' if empty or not provided.
 * @param {string|number|Date} [timeOfDay] - Optional time of day for a more specific greeting (e.g., 'morning', 10, or a Date object).
 * @returns {string} A greeting message.
 */
function greet(name = 'friend', timeOfDay) {
  // Handle non-string names by defaulting to 'friend'
  let finalName = typeof name === 'string' ? name.trim() : '';
  if (!finalName) finalName = 'friend';
  // Capitalize the name
  finalName = capitalize(finalName);
  const greeting = getGreeting(timeOfDay);
  return `${greeting}, ${finalName}!`;
}

/**
 * Greets multiple people with a single message, with optional time of day.
 * @param {string[]} names - An array of names to greet.
 * @param {string|number|Date} [timeOfDay] - Optional time of day for a more specific greeting (e.g., 'morning', 10, or a Date object).
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

// Test getGreeting function
assert.strictEqual(getGreeting('morning'), 'Good morning', 'Should return morning greeting');
assert.strictEqual(getGreeting(10), 'Good morning', 'Should handle hour 10 as morning');
assert.strictEqual(getGreeting(15), 'Good afternoon', 'Should handle hour 15 as afternoon');
assert.strictEqual(getGreeting(19), 'Good evening', 'Should handle hour 19 as evening');
assert.strictEqual(getGreeting(22), 'Good night', 'Should handle hour 22 as night');
assert.strictEqual(getGreeting(25), 'Hello', 'Should fallback for invalid hour');
assert.strictEqual(getGreeting(), 'Hello', 'Should default to Hello');

// Additional tests for getGreeting with Date objects
const morningDate = new Date(2023, 0, 1, 10, 0, 0); // 10:00
assert.strictEqual(getGreeting(morningDate), 'Good morning', 'Should handle Date with morning hour');
const afternoonDate = new Date(2023, 0, 1, 15, 0, 0); // 15:00
assert.strictEqual(getGreeting(afternoonDate), 'Good afternoon', 'Should handle Date with afternoon hour');
const invalidDate = new Date(NaN);
assert.strictEqual(getGreeting(invalidDate), 'Hello', 'Should fallback for invalid Date');

// Additional tests for non-integer and negative hours
assert.strictEqual(getGreeting(10.5), 'Hello', 'Should fallback for non-integer hour');
assert.strictEqual(getGreeting(-1), 'Hello', 'Should fallback for negative hour');
assert.strictEqual(getGreeting(24), 'Hello', 'Should fallback for hour 24');

// Test greet function
assert.strictEqual(greet('Alice'), 'Hello, Alice!', 'Should greet with default Hello');
assert.strictEqual(greet(), 'Hello, Friend!', 'Should use default name');
assert.strictEqual(greet(''), 'Hello, Friend!', 'Should use default for empty name');
assert.strictEqual(greet('Bob', 'morning'), 'Good morning, Bob!', 'Should greet with morning');
assert.strictEqual(greet('Charlie', 'afternoon'), 'Good afternoon, Charlie!', 'Should greet with afternoon');
assert.strictEqual(greet('David', 'evening'), 'Good evening, David!', 'Should greet with evening');
assert.strictEqual(greet('Eve', 'night'), 'Good night, Eve!', 'Should greet with night');
assert.strictEqual(greet('Frank', 'noon'), 'Hello, Frank!', 'Should fallback to Hello for unknown time');
assert.strictEqual(greet('Alice', 'MORNING'), 'Good morning, Alice!', 'Should handle uppercase time');
assert.strictEqual(greet('Alice', 10), 'Good morning, Alice!', 'Should handle hour as timeOfDay');
assert.strictEqual(greet('Alice', 25), 'Hello, Alice!', 'Should fallback for invalid hour');

// Test capitalization and trimming for greet
assert.strictEqual(greet('alice'), 'Hello, Alice!', 'Should capitalize name');
assert.strictEqual(greet('  bob  '), 'Hello, Bob!', 'Should trim and capitalize');
assert.strictEqual(greet(' '), 'Hello, Friend!', 'Should default to friend for whitespace name');
assert.strictEqual(greet('anna maria'), 'Hello, Anna Maria!', 'Should capitalize multi-word name');
assert.strictEqual(greet(null), 'Hello, Friend!', 'Should handle null name');
assert.strictEqual(greet(123), 'Hello, Friend!', 'Should handle non-string name');

// Additional tests for greet with Date
const greetDate = new Date(2023, 0, 1, 19, 0, 0); // 19:00
assert.strictEqual(greet('Alice', greetDate), 'Good evening, Alice!', 'Should handle Date in greet');

// Test greetMultiple function
assert.strictEqual(greetMultiple(['Alice', 'Bob']), 'Hello, Alice and Bob!', 'Should greet two names');
assert.strictEqual(greetMultiple(['Alice', 'Bob', 'Charlie']), 'Hello, Alice, Bob, and Charlie!', 'Should greet three names with Oxford comma');
assert.strictEqual(greetMultiple([]), 'Hello, everyone!', 'Should handle empty array');
assert.strictEqual(greetMultiple(['Charlie']), 'Hello, Charlie!', 'Should handle single name');
assert.strictEqual(greetMultiple(['Alice', 'Bob'], 'morning'), 'Good morning, Alice and Bob!', 'Should greet multiple with time of day');
assert.strictEqual(greetMultiple([], 'evening'), 'Good evening, everyone!', 'Should handle empty with time of day');
assert.strictEqual(greetMultiple(['Alice', 'Bob'], 10), 'Good morning, Alice and Bob!', 'Should handle hour as timeOfDay');

// Test capitalization, filtering, and trimming for greetMultiple
assert.strictEqual(greetMultiple(['alice', 'bob', 'charlie']), 'Hello, Alice, Bob, and Charlie!', 'Should capitalize multiple names');
assert.strictEqual(greetMultiple([' ', 'dave', '']), 'Hello, Dave!', 'Should filter out invalid names');
assert.strictEqual(greetMultiple(['eve  ', '  frank']), 'Hello, Eve and Frank!', 'Should trim names');
assert.strictEqual(greetMultiple([1, 'bob', null]), 'Hello, Bob!', 'Should filter non-string names');
assert.strictEqual(greetMultiple(['anna maria', 'john doe']), 'Hello, Anna Maria and John Doe!', 'Should capitalize multi-word names');
assert.strictEqual(greetMultiple(['A', 'B', 'C', 'D']), 'Hello, A, B, C, and D!', 'Should handle four names');

// Additional tests for greetMultiple with Date
assert.strictEqual(greetMultiple(['Alice', 'Bob'], greetDate), 'Good evening, Alice and Bob!', 'Should handle Date in greetMultiple');

console.log('All tests passed!');

module.exports = {
  greet,
  greetMultiple,
};