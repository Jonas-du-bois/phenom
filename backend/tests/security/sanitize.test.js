import { escapeRegex } from '../../src/utils/sanitize.js';

describe('Sanitize Utils', () => {
  describe('escapeRegex', () => {
    it('should escape all special regex characters', () => {
      const specialChars = '.*+?^${}()|[]\\';
      const escaped = escapeRegex(specialChars);

      // Each special char should be preceded by a backslash
      expect(escaped).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    });

    it('should return empty string for non-string input', () => {
      expect(escapeRegex(null)).toBe('');
      expect(escapeRegex(undefined)).toBe('');
      expect(escapeRegex(123)).toBe('');
      expect(escapeRegex({})).toBe('');
    });

    it('should not modify safe strings', () => {
      const safeString = 'Hello World 123';
      expect(escapeRegex(safeString)).toBe(safeString);
    });

    it('should handle strings with mixed content', () => {
      const input = 'Hello (World)?';
      expect(escapeRegex(input)).toBe('Hello \\(World\\)\\?');
    });
  });
});
