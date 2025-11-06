// Sample file for Grok automation testing

/**
 * Determines the time of day category based on the given hour.
 * @param {number} hour - The hour of the day (0-23).
 * @returns {string|undefined} The time of day category ('morning', 'afternoon', 'evening', 'night') or undefined if invalid.
 */
function getTimeOfDayFromHour(hour) {
  // Validate input: must be integer between 0 and 23 inclusive
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return undefined;
  // Time ranges:
  // 0-11: morning
  // 12-17: afternoon
  // 18-20: evening
  // 21-23: night
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
    // Check if the string represents a valid hour
    const hour = Number(tod);
    if (!isNaN(hour) && Number.isInteger(hour) && hour >= 0 && hour < 24) {
      tod = getTimeOfDayFromHour(hour);
    }
    // If not a number, it remains as string for lookup
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
 * Capitalizes the first letter of each word in a string, handling apostrophes and hyphens,
 * normalizing multiple spaces to single, trimming, and lowercasing the rest of the letters.
 * @param {string} str - The string to capitalize.
 * @returns {string} The capitalized string.
 */
function capitalize(str) {
  if (!str) return '';
  // Normalize multiple spaces to single and trim
  str = str.trim().replace(/\s+/g, ' ');
  // Split into words
  const words = str.split(' ');
  // Title case each word, handling apostrophes and hyphens
  const titleCased = words.map(word => {
    return word.toLowerCase().replace(/(^\w|['-]\w)/g, char => char.toUpperCase());
  });
  return titleCased.join(' ');
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
    // Join all but the last with commas, then add 'and' before the last (using Oxford comma)
    formattedNames = `${validNames.slice(0, -1).join(', ')}, and ${validNames[validNames.length - 1]}`;
  }
  return `${greeting}, ${formattedNames}!`;
}

// Test cases
const assert = require('assert');

// Test getTimeOfDayFromHour function
assert.strictEqual(getTimeOfDayFromHour(5), 'morning', 'Should return morning for hour 5');
assert.strictEqual(getTimeOfDayFromHour(12), 'afternoon', 'Should return afternoon for hour 12');
assert.strictEqual(getTimeOfDayFromHour(17), 'afternoon', 'Should return afternoon for hour 17');
assert.strictEqual(getTimeOfDayFromHour(18), 'evening', 'Should return evening for hour 18');
assert.strictEqual(getTimeOfDayFromHour(20), 'evening', 'Should return evening for hour 20');
assert.strictEqual(getTimeOfDayFromHour(21), 'night', 'Should return night for hour 21');
assert.strictEqual(getTimeOfDayFromHour(23), 'night', 'Should return night for hour 23');
assert.strictEqual(getTimeOfDayFromHour(0), 'morning', 'Should return morning for hour 0');
assert.strictEqual(getTimeOfDayFromHour(25), undefined, 'Should return undefined for hour 25');
assert.strictEqual(getTimeOfDayFromHour(-1), undefined, 'Should return undefined for negative hour');
assert.strictEqual(getTimeOfDayFromHour(10.5), undefined, 'Should return undefined for non-integer hour');

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

// Additional tests for string hours in getGreeting
assert.strictEqual(getGreeting('10'), 'Good morning', 'Should handle string hour 10 as morning');
assert.strictEqual(getGreeting('15'), 'Good afternoon', 'Should handle string hour 15 as afternoon');
assert.strictEqual(getGreeting('25'), 'Hello', 'Should fallback for invalid string hour');
assert.strictEqual(getGreeting('10.5'), 'Hello', 'Should fallback for non-integer string hour');
assert.strictEqual(getGreeting('morning'), 'Good morning', 'Should still handle string time of day');

// Test capitalize function
assert.strictEqual(capitalize('hello world'), 'Hello World', 'Should capitalize each word');
assert.strictEqual(capitalize('alice'), 'Alice', 'Should capitalize single word');
assert.strictEqual(capitalize('anna maria'), 'Anna Maria', 'Should capitalize multi-word');
assert.strictEqual(capitalize(''), '', 'Should return empty for empty string');
assert.strictEqual(capitalize('a b c'), 'A B C', 'Should capitalize single letters');
assert.strictEqual(capitalize("o'connor"), "O'Connor", 'Should handle apostrophe');
assert.strictEqual(capitalize("anna-maria"), "Anna-Maria", 'Should handle hyphen');
assert.strictEqual(capitalize("mcdonald"), "Mcdonald", 'Should capitalize simple word');
assert.strictEqual(capitalize("ALICE"), "Alice", 'Should lower rest');
assert.strictEqual(capitalize("hello   world"), "Hello World", 'Should normalize spaces');
assert.strictEqual(capitalize("von der leyen"), "Von Der Leyen", 'Should handle multi-word names');

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
assert.strictEqual(greet("o'connor"), "Hello, O'Connor!", 'Should handle apostrophe in name');
assert.strictEqual(greet("ANNA-MARIA"), "Hello, Anna-Maria!", 'Should handle mixed case and hyphen');

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
assert.strictEqual(greetMultiple([null, 123, '']), 'Hello, everyone!', 'Should handle no valid names');
assert.strictEqual(greetMultiple(["o'connor", "mcDonald"]), "Hello, O'Connor and Mcdonald!", 'Should handle special characters in names');

// Additional tests for greetMultiple with Date
assert.strictEqual(greetMultiple(['Alice', 'Bob'], greetDate), 'Good evening, Alice and Bob!', 'Should handle Date in greetMultiple');

console.log('All tests passed!');

module.exports = {
  greet,
  greetMultiple,
};