/* Test Suite for Functional Parser Library 
*  
*/

const { toBeParserResult, toBeParserError, logParserState, clearLogFile } = require('../test/functional-parser-test-helper');
expect.extend({ toBeParserResult, toBeParserError });
beforeAll(() => {
  clearLogFile();
});

const { Parser, literal, regex, sequenceOf, lazy} = require('../plugins/parser/modules/functional-parser').parserLibrary;



describe('Functional Parser Library', () => {
  describe('Parser Class', () => {
    it('should initialize parser state with target string', () => {
      const parser = new Parser(state => state);
      const result_state = parser.run('hello');
      expect(result_state.target).toBe('hello');
      expect(result_state).toBeParserResult(null);
      //logParserState(result_state);
    });
    it('should modify the result through map function', () => {
      const parser = new Parser(state => ({...state, result: 'test'}));
      const mappedParser = parser.map(result => result.toUpperCase());
      const result_state = mappedParser.run('input');
      expect(result_state).toBeParserResult('TEST');
      //logParserState(result_state);
    } );
    it('should chain parsers correctly', () => {
      const parser1 = new Parser(state => ({...state, result: 'first'}));
      const parser2 = parser1.chain(result => 
        new Parser(state => ({...state, result: result + ' second'}))
      );
      const result_state = parser2.run('input');
      expect(result_state).toBeParserResult('first second');
      //logParserState(result_state);
    });
    it('should propagate errors through map', () => {
      const parser = new Parser(state => ({...state, isError: true, error: 'Initial error'}));
      const mappedParser = parser.map(result => result.toUpperCase());
      const result_state = mappedParser.run('input');
      expect(result_state).toBeParserError('Initial error');
      //logParserState(result_state);
    });
  });
  
  describe('Literal Parser', () => {
    it('should parse a literal string successfully', () => {
      const parser = literal('hello');
      const result_state = parser.run('hello world');
      //logParserState(result_state);   
      expect(result_state).toBeParserResult('hello');
    });
    it('should return error for non-matching literal', () => {
      const parser = literal('hello');
      const result_state = parser.run('hi world');
      //logParserState(result_state);
      expect(result_state).toBeParserError("literal('hello'): Couldn't find at index 0");
    });
    it('should handle special characters in literal', () => {
      const parser = literal('hello.*+?^${}()|[]\\');
      const result_state = parser.run('hello.*+?^${}()|[]\\ world');
      //logParserState(result_state);
      expect(result_state).toBeParserResult('hello.*+?^${}()|[]\\');
    });
  });

  describe('Regex Parser', () => {
    it('should parse a regex pattern successfully', () => {
      const parser = regex(/\d+/);
      const result_state = parser.run('123abc');
      expect(result_state).toBeParserResult('123');
    });
    it('should return error for non-matching regex', () => {
      const parser = regex(/^\d+/);
      const result_state = parser.run('abc123');
      expect(result_state).toBeParserError("regex: Couldn't find at index 0");
    });
  });

  describe('SequenceOf Parser', () => {
    it('should parse a sequence of literals successfully', () => {
      const parser = sequenceOf([literal('hello'), literal(' '), literal('world')]);
      const result_state = parser.run('hello world');
      expect(result_state).toBeParserResult(['hello', ' ', 'world']);
    });
    it('should parse a sequence with strings defaulted to literals successfully', () => {
      const parser = sequenceOf(['foo', '-', 'bar']);
      const result_state = parser.run('foo-bar baz');
     //logParserState(result_state);
      expect(result_state).toBeParserResult(['foo', '-', 'bar']); 
    });
    it('should return error if any parser in sequence fails', () => {
      const parser = sequenceOf([literal('hello'), literal(' '), literal('world')]);
      const result_state = parser.run('hello there');
      //logParserState(result_state);
      expect(result_state).toBeParserError("sequenceOf: literal('world'): Couldn't find at index 6");
    })
  });

  describe('Lazy Parser', () => {
    it('should defer parser creation until run time', () => {
      let created = false;  
      const lazyParser = lazy(() => {
        created = true;
        return literal('deferred');
      });
      expect(created).toBe(false);
      const result_state = lazyParser.run('deferred execution');
      expect(created).toBe(true);
      expect(result_state).toBeParserResult('deferred');
    });
    // it('should work with recursive parsers', () => {
    //   const recursiveParser = lazy(() => 
    //     sequenceOf([literal('a'), recursiveParser, literal('b')])
    //   ).map(results => {
    //     if (results.length === 0) return '';
    //     return 'a' + results[1] + 'b';
    //   }).or(literal('')); 
    //   const result_state = recursiveParser.run('aaabbb');
    //   expect(result_state).toBeParserResult('aaabbb');
    // });
  });
});

