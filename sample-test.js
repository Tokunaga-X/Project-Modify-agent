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

// Multilingual support for greetings and defaults
// Supported languages: en (English), es (Spanish), fr (French), de (German), it (Italian), pt (Portuguese)
const greetings = {
  en: {
    morning: 'Good morning',
    afternoon: 'Good afternoon',
    evening: 'Good evening',
    night: 'Good night',
    default: 'Hello'
  },
  es: {
    morning: 'Buenos días',
    afternoon: 'Buenas tardes',
    evening: 'Buenas noches',
    night: 'Buenas noches',
    default: 'Hola'
  },
  fr: {
    morning: 'Bonjour',
    afternoon: 'Bonjour',
    evening: 'Bonsoir',
    night: 'Bonne nuit',
    default: 'Salut'
  },
  de: {
    morning: 'Guten Morgen',
    afternoon: 'Guten Tag',
    evening: 'Guten Abend',
    night: 'Gute Nacht',
    default: 'Hallo'
  },
  it: {
    morning: 'Buongiorno',
    afternoon: 'Buon pomeriggio',
    evening: 'Buonasera',
    night: 'Buonanotte',
    default: 'Ciao'
  },
  pt: {
    morning: 'Bom dia',
    afternoon: 'Boa tarde',
    evening: 'Boa noite',
    night: 'Boa noite',
    default: 'Olá'
  },
  ja: {
    morning: 'おはようございます',
    afternoon: 'こんにちは',
    evening: 'こんばんは',
    night: 'おやすみなさい',
    default: 'こんにちは'
  },
  zh: {
    morning: '早上好',
    afternoon: '下午好',
    evening: '晚上好',
    night: '晚安',
    default: '你好'
  },
  ru: {
    morning: 'Доброе утро',
    afternoon: 'Добрый день',
    evening: 'Добрый вечер',
    night: 'Доброй ночи',
    default: 'Привет'
  }
};

const defaultNames = {
  en: 'friend',
  es: 'amigo',
  fr: 'ami',
  de: 'Freund',
  it: 'amico',
  pt: 'amigo',
  ja: 'tomodachi',
  zh: '朋友',
  ru: 'друг'
};

const defaultGroups = {
  en: 'everyone',
  es: 'todos',
  fr: 'tout le monde',
  de: 'alle',
  it: 'tutti',
  pt: 'todos',
  ja: 'minasan',
  zh: '大家',
  ru: 'все'
};

/**
 * Helper function to get the effective language code, falling back to 'en' if invalid.
 * @param {string} [lang='en'] - The language code.
 * @returns {string} The effective language code.
 */
function getEffectiveLang(lang = 'en') {
  // Normalize to lowercase and fallback to 'en' if not supported
  const l = typeof lang === 'string' ? lang.toLowerCase() : 'en';
  return l in greetings ? l : 'en';
}

/**
 * Normalizes the timeOfDay input to a string category or undefined.
 * Handles trimming for string inputs to improve robustness.
 * @param {string|number|Date} tod - The time of day input.
 * @returns {string|undefined} The normalized time of day category.
 */
function normalizeTimeOfDay(tod) {
  // Handle null or undefined inputs
  if (tod == null) return undefined;

  // Handle Date objects by extracting hour
  if (tod instanceof Date) {
    const hour = tod.getHours();
    return getTimeOfDayFromHour(hour);
  }

  // Handle numeric hours directly
  if (typeof tod === 'number') {
    return getTimeOfDayFromHour(tod);
  }

  // Handle string inputs with trimming and normalization
  if (typeof tod === 'string') {
    const trimmed = tod.trim();
    if (trimmed === '') return undefined;
    const lower = trimmed.toLowerCase();

    // Special case for 'now' to use current time
    if (lower === 'now') {
      const hour = new Date().getHours();
      return getTimeOfDayFromHour(hour);
    }

    // Attempt to parse as 12-hour time string (e.g., '10 am' or '10:00 am')
    const time12Match = lower.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
    if (time12Match) {
      let h = parseInt(time12Match[1], 10);
      const m = time12Match[2] ? parseInt(time12Match[2], 10) : 0;
      const period = time12Match[3];
      if (h >= 1 && h <= 12 && m >= 0 && m < 60) {
        if (period === 'pm' && h < 12) h += 12;
        if (period === 'am' && h === 12) h = 0;
        return getTimeOfDayFromHour(h);
      }
    }

    // Attempt to parse as 24-hour time string (e.g., '10' or '10:00')
    const timeMatch = lower.match(/^(\d{1,2})(?::(\d{2}))?$/);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      if (h >= 0 && h <= 23 && m >= 0 && m < 60) {
        return getTimeOfDayFromHour(h);
      }
    }

    // Attempt to parse as hour number
    const hour = Number(lower);
    if (!isNaN(hour) && Number.isInteger(hour) && hour >= 0 && hour <= 23) {
      return getTimeOfDayFromHour(hour);
    }

    // Assume it's a time of day category (e.g., 'morning')
    return lower;
  }

  // Fallback for invalid types
  return undefined;
}

/**
 * Retrieves the appropriate greeting based on the time of day.
 * @param {string|number|Date} [timeOfDay] - Optional time of day (e.g., 'morning', 'afternoon', 'evening', 'night', 'now', or a Date object) or hour (0-23).
 * @param {string} [lang='en'] - The language code (e.g., 'en' for English, 'es' for Spanish, 'fr' for French, 'de' for German, 'it' for Italian, 'pt' for Portuguese).
 * @returns {string} The greeting string.
 */
function getGreeting(timeOfDay, lang = 'en') {
  // Get effective language
  lang = getEffectiveLang(lang);

  // Normalize the time of day input
  const tod = normalizeTimeOfDay(timeOfDay);

  // Return the matching greeting or language-specific default
  return greetings[lang][tod] || greetings[lang].default;
}

/**
 * Capitalizes the first letter of each word in a string, handling apostrophes and hyphens,
 * normalizing multiple spaces to single, trimming, and lowercasing the rest of the letters.
 * Supports Unicode characters.
 * @param {string} str - The string to capitalize.
 * @returns {string} The capitalized string.
 */
function capitalize(str) {
  if (!str) return '';

  // Trim leading/trailing spaces and normalize multiple spaces to single
  str = str.trim().replace(/\s+/g, ' ');

  // Split into words based on spaces
  const words = str.split(' ');

  // Title case each word, handling apostrophes, hyphens, and Unicode characters
  const titleCased = words.map(word => {
    return word.toLowerCase().replace(/(^\p{L}|['-]\p{L})/gu, char => char.toUpperCase());
  });

  // Join the words back into a single string
  return titleCased.join(' ');
}

/**
 * Greets a person by name, with optional customization for time of day and language.
 * @param {string} [name='friend'] - The name of the person to greet. Defaults to a language-specific term if empty or not provided.
 * @param {string|number|Date} [timeOfDay] - Optional time of day for a more specific greeting (e.g., 'morning', 10, 'now', or a Date object).
 * @param {string} [lang='en'] - The language code (e.g., 'en' for English, 'es' for Spanish, 'fr' for French, 'de' for German, 'it' for Italian, 'pt' for Portuguese).
 * @returns {string} A greeting message.
 */
function greet(name = 'friend', timeOfDay, lang = 'en') {
  const effectiveLang = getEffectiveLang(lang);

  // Handle non-string or empty names by using language-specific default
  let finalName = typeof name === 'string' ? name.trim() : '';
  if (!finalName) finalName = defaultNames[effectiveLang];

  // Capitalize the name
  finalName = capitalize(finalName);

  // Get the appropriate greeting
  const greeting = getGreeting(timeOfDay, effectiveLang);

  // Construct and return the greeting message
  return `${greeting}, ${finalName}!`;
}

/**
 * Greets multiple people with a single message, with optional time of day and language.
 * @param {string[]} names - An array of names to greet.
 * @param {string|number|Date} [timeOfDay] - Optional time of day for a more specific greeting (e.g., 'morning', 10, 'now', or a Date object).
 * @param {string} [lang='en'] - The language code (e.g., 'en' for English, 'es' for Spanish, 'fr' for French, 'de' for German, 'it' for Italian, 'pt' for Portuguese).
 * @returns {string} A greeting message for all names.
 */
function greetMultiple(names, timeOfDay, lang = 'en') {
  const effectiveLang = getEffectiveLang(lang);

  // Get the appropriate greeting
  const greeting = getGreeting(timeOfDay, effectiveLang);

  // Filter valid string names, trim, remove empty, and capitalize
  let validNames = names
    .filter(n => n != null && typeof n === 'string')
    .map(n => n.trim())
    .filter(n => n.length > 0)
    .map(capitalize);

  // If no valid names, use default group greeting
  if (validNames.length === 0) {
    return `${greeting}, ${defaultGroups[effectiveLang]}!`;
  }

  // Use Intl.ListFormat for locale-appropriate formatting of the name list
  const formatter = new Intl.ListFormat(effectiveLang, { style: 'long', type: 'conjunction' });
  const formattedNames = formatter.format(validNames);

  // Construct and return the greeting message
  return `${greeting}, ${formattedNames}!`;
}

/**
 * Adds support for a new language or overrides an existing one.
 * @param {string} lang - The language code (e.g., 'nl' for Dutch).
 * @param {object} greets - The greetings object with keys: morning, afternoon, evening, night, default.
 * @param {string} defName - Default name for single greetings (e.g., 'vriend').
 * @param {string} defGroup - Default group for multiple greetings (e.g., 'iedereen').
 */
function addLanguage(lang, greets, defName, defGroup) {
  // Validate language code
  if (typeof lang !== 'string' || lang.trim().length === 0) throw new Error('Invalid language code');

  // Validate greetings object
  if (!(greets && typeof greets === 'object' && 'default' in greets)) throw new Error('Invalid greetings object');

  // Normalize language to lowercase and add/override
  const lowerLang = lang.toLowerCase();
  greetings[lowerLang] = greets;
  defaultNames[lowerLang] = defName;
  defaultGroups[lowerLang] = defGroup;
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

// Tests for time string parsing in getGreeting
assert.strictEqual(getGreeting('10:00'), 'Good morning', 'Should handle 10:00 as morning');
assert.strictEqual(getGreeting('15:30'), 'Good afternoon', 'Should handle 15:30 as afternoon');
assert.strictEqual(getGreeting('18:45'), 'Good evening', 'Should handle 18:45 as evening');
assert.strictEqual(getGreeting('22:15'), 'Good night', 'Should handle 22:15 as night');
assert.strictEqual(getGreeting('00:00'), 'Good morning', 'Should handle 00:00 as morning');
assert.strictEqual(getGreeting('23:59'), 'Good night', 'Should handle 23:59 as night');
assert.strictEqual(getGreeting('24:00'), 'Hello', 'Should fallback for invalid hour 24');
assert.strictEqual(getGreeting('10:60'), 'Hello', 'Should fallback for invalid minute 60');
assert.strictEqual(getGreeting('1:00'), 'Good morning', 'Should handle single digit hour');
assert.strictEqual(getGreeting('10:00 am'), 'Good morning', 'Should handle 10:00 am as morning');
assert.strictEqual(getGreeting('3:30 pm'), 'Good afternoon', 'Should handle 3:30 pm as afternoon');
assert.strictEqual(getGreeting('6:45 PM'), 'Good evening', 'Should handle 6:45 PM as evening (case insensitive)');
assert.strictEqual(getGreeting('10:15 pm'), 'Good night', 'Should handle 10:15 pm as night');
assert.strictEqual(getGreeting('12:00 am'), 'Good morning', 'Should handle 12:00 am as midnight');
assert.strictEqual(getGreeting('12:00 pm'), 'Good afternoon', 'Should handle 12:00 pm as noon');
assert.strictEqual(getGreeting('13:00 am'), 'Hello', 'Should fallback for invalid 13:00 am');
assert.strictEqual(getGreeting('0:00 am'), 'Hello', 'Should fallback for invalid 0:00 am');
assert.strictEqual(getGreeting('10 am'), 'Good morning', 'Should handle 10 am without minutes');
assert.strictEqual(getGreeting('3 pm'), 'Good afternoon', 'Should handle 3 pm without minutes');
assert.strictEqual(getGreeting('12 am'), 'Good morning', 'Should handle 12 am without minutes');
assert.strictEqual(getGreeting('12 pm'), 'Good afternoon', 'Should handle 12 pm without minutes');
assert.strictEqual(getGreeting('15'), 'Good afternoon', 'Should handle 15 without colon');

// Test getGreeting with language
assert.strictEqual(getGreeting('morning', 'es'), 'Buenos días', 'Should return Spanish morning greeting');
assert.strictEqual(getGreeting('afternoon', 'es'), 'Buenas tardes', 'Spanish afternoon');
assert.strictEqual(getGreeting('evening', 'es'), 'Buenas noches', 'Spanish evening');
assert.strictEqual(getGreeting('night', 'es'), 'Buenas noches', 'Spanish night');
assert.strictEqual(getGreeting(undefined, 'es'), 'Hola', 'Spanish default');
assert.strictEqual(getGreeting('unknown', 'es'), 'Hola', 'Spanish fallback');
assert.strictEqual(getGreeting(10, 'es'), 'Buenos días', 'Spanish with hour');
assert.strictEqual(getGreeting('morning', 'fr'), 'Bonjour', 'French morning');

// Test getGreeting with German language
assert.strictEqual(getGreeting('morning', 'de'), 'Guten Morgen', 'Should return German morning greeting');
assert.strictEqual(getGreeting('afternoon', 'de'), 'Guten Tag', 'German afternoon');
assert.strictEqual(getGreeting('evening', 'de'), 'Guten Abend', 'German evening');
assert.strictEqual(getGreeting('night', 'de'), 'Gute Nacht', 'German night');
assert.strictEqual(getGreeting(undefined, 'de'), 'Hallo', 'German default');
assert.strictEqual(getGreeting('unknown', 'de'), 'Hallo', 'German fallback');
assert.strictEqual(getGreeting(10, 'de'), 'Guten Morgen', 'German with hour');

// Test getGreeting with Italian language
assert.strictEqual(getGreeting('morning', 'it'), 'Buongiorno', 'Should return Italian morning greeting');
assert.strictEqual(getGreeting('afternoon', 'it'), 'Buon pomeriggio', 'Italian afternoon');
assert.strictEqual(getGreeting('evening', 'it'), 'Buonasera', 'Italian evening');
assert.strictEqual(getGreeting('night', 'it'), 'Buonanotte', 'Italian night');
assert.strictEqual(getGreeting(undefined, 'it'), 'Ciao', 'Italian default');
assert.strictEqual(getGreeting('unknown', 'it'), 'Ciao', 'Italian fallback');
assert.strictEqual(getGreeting(10, 'it'), 'Buongiorno', 'Italian with hour');
assert.strictEqual(getGreeting(15, 'it'), 'Buon pomeriggio', 'Italian with afternoon hour');

// Test getGreeting with Portuguese language
assert.strictEqual(getGreeting('morning', 'pt'), 'Bom dia', 'Should return Portuguese morning greeting');
assert.strictEqual(getGreeting('afternoon', 'pt'), 'Boa tarde', 'Portuguese afternoon');
assert.strictEqual(getGreeting('evening', 'pt'), 'Boa noite', 'Portuguese evening');
assert.strictEqual(getGreeting('night', 'pt'), 'Boa noite', 'Portuguese night');
assert.strictEqual(getGreeting(undefined, 'pt'), 'Olá', 'Portuguese default');
assert.strictEqual(getGreeting('unknown', 'pt'), 'Olá', 'Portuguese fallback');
assert.strictEqual(getGreeting(10, 'pt'), 'Bom dia', 'Portuguese with hour');
assert.strictEqual(getGreeting(15, 'pt'), 'Boa tarde', 'Portuguese with afternoon hour');

// Test getGreeting with Japanese language
assert.strictEqual(getGreeting('morning', 'ja'), 'おはようございます', 'Should return Japanese morning greeting');
assert.strictEqual(getGreeting('afternoon', 'ja'), 'こんにちは', 'Japanese afternoon');
assert.strictEqual(getGreeting('evening', 'ja'), 'こんばんは', 'Japanese evening');
assert.strictEqual(getGreeting('night', 'ja'), 'おやすみなさい', 'Japanese night');
assert.strictEqual(getGreeting(undefined, 'ja'), 'こんにちは', 'Japanese default');
assert.strictEqual(getGreeting('unknown', 'ja'), 'こんにちは', 'Japanese fallback');
assert.strictEqual(getGreeting(10, 'ja'), 'おはようございます', 'Japanese with hour');
assert.strictEqual(getGreeting(15, 'ja'), 'こんにちは', 'Japanese with afternoon hour');

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
assert.strictEqual(capitalize('maría'), 'María', 'Should capitalize accented name');
assert.strictEqual(capitalize('ángel'), 'Ángel', 'Should capitalize starting with accent');
assert.strictEqual(capitalize('garcía-lópez'), 'García-López', 'Should handle accented hyphenated name');
assert.strictEqual(capitalize('étienne'), 'Étienne', 'Should capitalize accented name');
assert.strictEqual(capitalize('garçon'), 'Garçon', 'Should capitalize French word');
assert.strictEqual(capitalize('giovanni'), 'Giovanni', 'Should capitalize Italian name');
assert.strictEqual(capitalize('d\'alessandro'), 'D\'Alessandro', 'Should handle Italian apostrophe');

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

// Test greet with language
assert.strictEqual(greet('Alice', 'morning', 'es'), 'Buenos días, Alice!', 'Spanish morning greet');
assert.strictEqual(greet(undefined, undefined, 'es'), 'Hola, Amigo!', 'Spanish default name');
assert.strictEqual(greet('maría', undefined, 'es'), 'Hola, María!', 'Spanish with accented name');

// Test greet with German language
assert.strictEqual(greet('Alice', 'morning', 'de'), 'Guten Morgen, Alice!', 'German morning greet');
assert.strictEqual(greet(undefined, undefined, 'de'), 'Hallo, Freund!', 'German default name');
assert.strictEqual(greet('Jürgen', undefined, 'de'), 'Hallo, Jürgen!', 'German with umlaut name');

// Test greet with Italian language
assert.strictEqual(greet('Giovanni', 'morning', 'it'), 'Buongiorno, Giovanni!', 'Italian morning greet');
assert.strictEqual(greet(undefined, undefined, 'it'), 'Ciao, Amico!', 'Italian default name');
assert.strictEqual(greet('Maria', 'afternoon', 'it'), 'Buon pomeriggio, Maria!', 'Italian afternoon greet');
assert.strictEqual(greet('d\'Alessandro', undefined, 'it'), 'Ciao, D\'Alessandro!', 'Italian with apostrophe name');

// Test greet with Portuguese language
assert.strictEqual(greet('Alice', 'morning', 'pt'), 'Bom dia, Alice!', 'Portuguese morning greet');
assert.strictEqual(greet(undefined, undefined, 'pt'), 'Olá, Amigo!', 'Portuguese default name');
assert.strictEqual(greet('João', undefined, 'pt'), 'Olá, João!', 'Portuguese with accented name');

// Test greet with Japanese language
assert.strictEqual(greet('Alice', 'morning', 'ja'), 'おはようございます, Alice!', 'Japanese morning greet');
assert.strictEqual(greet(undefined, undefined, 'ja'), 'こんにちは, Tomodachi!', 'Japanese default name');
assert.strictEqual(greet('太郎', undefined, 'ja'), 'こんにちは, 太郎!', 'Japanese with name');

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
assert.strictEqual(greetMultiple(["o'connor", "mcDonald"]), "Hello, O'Connor and McDonald!", 'Should handle special characters in names');

// Additional tests for greetMultiple with Date
assert.strictEqual(greetMultiple(['Alice', 'Bob'], greetDate), 'Good evening, Alice and Bob!', 'Should handle Date in greetMultiple');

// Test greetMultiple with language
assert.strictEqual(greetMultiple(['Alice', 'Bob'], undefined, 'es'), 'Hola, Alice y Bob!', 'Spanish two names');
assert.strictEqual(greetMultiple(['Alice', 'Bob', 'Charlie'], undefined, 'es'), 'Hola, Alice, Bob y Charlie!', 'Spanish three names');
assert.strictEqual(greetMultiple([], undefined, 'es'), 'Hola, todos!', 'Spanish no names');
assert.strictEqual(greetMultiple(['ángel', 'maría'], 'morning', 'es'), 'Buenos días, Ángel y María!', 'Spanish with accents');

// Tests for French language
assert.strictEqual(getGreeting('morning', 'fr'), 'Bonjour', 'Should return French morning greeting');
assert.strictEqual(getGreeting('afternoon', 'fr'), 'Bonjour', 'French afternoon');
assert.strictEqual(getGreeting('evening', 'fr'), 'Bonsoir', 'French evening');
assert.strictEqual(getGreeting('night', 'fr'), 'Bonne nuit', 'French night');
assert.strictEqual(getGreeting(undefined, 'fr'), 'Salut', 'French default');
assert.strictEqual(getGreeting('unknown', 'fr'), 'Salut', 'French fallback');
assert.strictEqual(getGreeting(10, 'fr'), 'Bonjour', 'French with hour');
assert.strictEqual(getGreeting('morning', 'xx'), 'Good morning', 'Fallback to en for unknown lang');

assert.strictEqual(greet('Alice', 'morning', 'fr'), 'Bonjour, Alice!', 'French morning greet');
assert.strictEqual(greet(undefined, undefined, 'fr'), 'Salut, Ami!', 'French default name');
assert.strictEqual(greet('étienne', undefined, 'fr'), 'Salut, Étienne!', 'French with accented name');

assert.strictEqual(greetMultiple(['Alice', 'Bob'], undefined, 'fr'), 'Salut, Alice et Bob!', 'French two names');
assert.strictEqual(greetMultiple(['Alice', 'Bob', 'Charlie'], undefined, 'fr'), 'Salut, Alice, Bob et Charlie!', 'French three names');
assert.strictEqual(greetMultiple([], undefined, 'fr'), 'Salut, tout le monde!', 'French no names');
assert.strictEqual(greetMultiple(['étienne', 'marie'], 'morning', 'fr'), 'Bonjour, Étienne et Marie!', 'French with accents');

// Test greetMultiple with German language
assert.strictEqual(greetMultiple(['Alice', 'Bob'], undefined, 'de'), 'Hallo, Alice und Bob!', 'German two names');
assert.strictEqual(greetMultiple(['Alice', 'Bob', 'Charlie'], undefined, 'de'), 'Hallo, Alice, Bob und Charlie!', 'German three names');
assert.strictEqual(greetMultiple([], undefined, 'de'), 'Hallo, alle!', 'German no names');
assert.strictEqual(greetMultiple(['Jürgen', 'Müller'], 'morning', 'de'), 'Guten Morgen, Jürgen und Müller!', 'German with umlauts');

// Test greetMultiple with Italian language
assert.strictEqual(greetMultiple(['Giovanni', 'Maria'], undefined, 'it'), 'Ciao, Giovanni e Maria!', 'Italian two names');
assert.strictEqual(greetMultiple(['Giovanni', 'Maria', 'Luca'], undefined, 'it'), 'Ciao, Giovanni, Maria e Luca!', 'Italian three names');
assert.strictEqual(greetMultiple([], undefined, 'it'), 'Ciao, tutti!', 'Italian no names');
assert.strictEqual(greetMultiple(['d\'Alessandro', 'Rossi'], 'evening', 'it'), 'Buonasera, D\'Alessandro e Rossi!', 'Italian with apostrophe');

// Test greetMultiple with Portuguese language
assert.strictEqual(greetMultiple(['Alice', 'Bob'], undefined, 'pt'), 'Olá, Alice e Bob!', 'Portuguese two names');
assert.strictEqual(greetMultiple(['Alice', 'Bob', 'Charlie'], undefined, 'pt'), 'Olá, Alice, Bob e Charlie!', 'Portuguese three names');
assert.strictEqual(greetMultiple([], undefined, 'pt'), 'Olá, todos!', 'Portuguese no names');
assert.strictEqual(greetMultiple(['João', 'Maria'], 'morning', 'pt'), 'Bom dia, João e Maria!', 'Portuguese with accents');

// Test greetMultiple with Japanese language
assert.strictEqual(greetMultiple(['Alice', 'Bob'], undefined, 'ja'), 'こんにちは, AliceとBob!', 'Japanese two names');
assert.strictEqual(greetMultiple(['Alice', 'Bob', 'Charlie'], undefined, 'ja'), 'こんにちは, Alice、B、とCharlie!', 'Japanese three names');
assert.strictEqual(greetMultiple([], undefined, 'ja'), 'こんにちは, minasan!', 'Japanese no names');

// Test getGreeting with Chinese language
assert.strictEqual(getGreeting('morning', 'zh'), '早上好', 'Should return Chinese morning greeting');
assert.strictEqual(getGreeting('afternoon', 'zh'), '下午好', 'Chinese afternoon');
assert.strictEqual(getGreeting('evening', 'zh'), '晚上好', 'Chinese evening');
assert.strictEqual(getGreeting('night', 'zh'), '晚安', 'Chinese night');
assert.strictEqual(getGreeting(undefined, 'zh'), '你好', 'Chinese default');
assert.strictEqual(getGreeting('unknown', 'zh'), '你好', 'Chinese fallback');
assert.strictEqual(getGreeting(10, 'zh'), '早上好', 'Chinese with hour');
assert.strictEqual(getGreeting(15, 'zh'), '下午好', 'Chinese with afternoon hour');

// Test greet with Chinese language
assert.strictEqual(greet('Alice', 'morning', 'zh'), '早上好, Alice!', 'Chinese morning greet');
assert.strictEqual(greet(undefined, undefined, 'zh'), '你好, 朋友!', 'Chinese default name');
assert.strictEqual(greet('李明', undefined, 'zh'), '你好, 李明!', 'Chinese with name');

// Test greetMultiple with Chinese language
assert.strictEqual(greetMultiple(['Alice', 'Bob'], undefined, 'zh'), '你好, Alice和Bob!', 'Chinese two names');
assert.strictEqual(greetMultiple(['Alice', 'Bob', 'Charlie'], undefined, 'zh'), '你好, Alice、Bob和Charlie!', 'Chinese three names');
assert.strictEqual(greetMultiple([], undefined, 'zh'), '你好, 大家!', 'Chinese no names');

// Test getGreeting with Russian language
assert.strictEqual(getGreeting('morning', 'ru'), 'Доброе утро', 'Should return Russian morning greeting');
assert.strictEqual(getGreeting('afternoon', 'ru'), 'Добрый день', 'Russian afternoon');
assert.strictEqual(getGreeting('evening', 'ru'), 'Добрый вечер', 'Russian evening');
assert.strictEqual(getGreeting('night', 'ru'), 'Доброй ночи', 'Russian night');
assert.strictEqual(getGreeting(undefined, 'ru'), 'Привет', 'Russian default');
assert.strictEqual(getGreeting('unknown', 'ru'), 'Привет', 'Russian fallback');
assert.strictEqual(getGreeting(10, 'ru'), 'Доброе утро', 'Russian with hour');
assert.strictEqual(getGreeting(15, 'ru'), 'Добрый день', 'Russian with afternoon hour');

// Test greet with Russian language
assert.strictEqual(greet('Alice', 'morning', 'ru'), 'Доброе утро, Alice!', 'Russian morning greet');
assert.strictEqual(greet(undefined, undefined, 'ru'), 'Привет, Друг!', 'Russian default name');
assert.strictEqual(greet('Иван', undefined, 'ru'), 'Привет, Иван!', 'Russian with name');

// Test greetMultiple with Russian language
assert.strictEqual(greetMultiple(['Alice', 'Bob'], undefined, 'ru'), 'Привет, Alice и Bob!', 'Russian two names');
assert.strictEqual(greetMultiple(['Alice', 'Bob', 'Charlie'], undefined, 'ru'), 'Привет, Alice, Bob и Charlie!', 'Russian three names');
assert.strictEqual(greetMultiple([], undefined, 'ru'), 'Привет, все!', 'Russian no names');

// Tests for 'now' feature (non-deterministic, check if valid)
const nowGreeting = getGreeting('now');
assert.ok(['Good morning', 'Good afternoon', 'Good evening', 'Good night'].includes(nowGreeting), 'Now should return a time-based greeting in English');

const nowGreetingUpper = getGreeting('NOW');
assert.ok(['Good morning', 'Good afternoon', 'Good evening', 'Good night'].includes(nowGreetingUpper), 'NOW should return a time-based greeting in English (case-insensitive)');

const nowGreetingFr = getGreeting('now', 'fr');
assert.ok(['Bonjour', 'Bonsoir', 'Bonne nuit'].includes(nowGreetingFr), 'Now should return a time-based greeting in French');

const nowGreetingDe = getGreeting('now', 'de');
assert.ok(['Guten Morgen', 'Guten Tag', 'Guten Abend', 'Gute Nacht'].includes(nowGreetingDe), 'Now should return a time-based greeting in German');

const nowGreetingIt = getGreeting('now', 'it');
assert.ok(['Buongiorno', 'Buon pomeriggio', 'Buonasera', 'Buonanotte'].includes(nowGreetingIt), 'Now should return a time-based greeting in Italian');

const nowGreetingPt = getGreeting('now', 'pt');
assert.ok(['Bom dia', 'Boa tarde', 'Boa noite'].includes(nowGreetingPt), 'Now should return a time-based greeting in Portuguese');

// Tests for trimming in getGreeting
assert.strictEqual(getGreeting('morning '), 'Good morning', 'Should trim time of day string');
assert.strictEqual(getGreeting(' 10 '), 'Good morning', 'Should handle trimmed hour string');
assert.strictEqual(getGreeting(' '), 'Hello', 'Should fallback for empty string after trim');
assert.strictEqual(getGreeting('foo '), 'Hello', 'Should fallback for invalid trimmed string');
assert.ok(['Good morning', 'Good afternoon', 'Good evening', 'Good night'].includes(getGreeting('now ')), 'Should trim now string');

// Tests for addLanguage
assert.throws(() => addLanguage('', {}, 'a', 'b'), Error, 'Should throw for invalid language code');
assert.throws(() => addLanguage('xx', {}, 'a', 'b'), Error, 'Should throw for invalid greetings object');

addLanguage('nl', {
  morning: 'Goedemorgen',
  afternoon: 'Goedemiddag',
  evening: 'Goedenavond',
  night: 'Goedenacht',
  default: 'Hallo'
}, 'vriend', 'iedereen');

assert.strictEqual(getGreeting('morning', 'nl'), 'Goedemorgen', 'Should return Dutch morning greeting');
assert.strictEqual(getGreeting('afternoon', 'nl'), 'Goedemiddag', 'Dutch afternoon');
assert.strictEqual(getGreeting(undefined, 'nl'), 'Hallo', 'Dutch default');

assert.strictEqual(greet('Alice', 'morning', 'nl'), 'Goedemorgen, Alice!', 'Dutch morning greet');
assert.strictEqual(greet(undefined, undefined, 'nl'), 'Hallo, Vriend!', 'Dutch default name');

assert.strictEqual(greetMultiple(['Alice', 'Bob'], undefined, 'nl'), 'Hallo, Alice en Bob!', 'Dutch two names');
assert.strictEqual(greetMultiple([], undefined, 'nl'), 'Hallo, iedereen!', 'Dutch no names');

console.log('All tests passed!');

module.exports = {
  greet,
  greetMultiple,
};