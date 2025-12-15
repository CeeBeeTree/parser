/* Test Suite for Trial Parser Library for textnodes and rules 
*  
*/

const { toBeParserResult, toBeParserError, logParserState, clearLogFile } = require('./functional-parser-test-helper');
expect.extend({ toBeParserResult, toBeParserError });
beforeAll(() => {
  clearLogFile();
});

const { Parser, literal, sequenceOf, regex, lookaheadRegex} = require('../plugins/parser/modules/functional-parser').parserLibrary;

/* Combined Parser Tests for textnodes and rules */

const ruleParser = (ruleName, lookaheadParser, mainParser, terminator) => ({
  ruleName,
  lookaheadParser,
  mainParser,
  terminator                                                                             
});

const textNodeParser = text => new Parser(parserState => {
  return {...parserState, index: parserState.index + text.length, result: text};
});

const rulesParser = (defaultParser, rules, terminator) => new Parser(parserState => {
  const { target, index } = parserState;
  const results = []
  let nextState = parserState, testState = parserState;

  //loop until terminator is found or end of input
  while(true){
    let bestRule = null, minIndex = target.length
    // get terminator position - if at beginning break out of loop
    if (nextState.index >= target.length) { break; }
    if (terminator) {
      testState = terminator.step(nextState);
      if (!testState.isError) { console.log('Found terminator at index ', testState.index, ' current index ', nextState.index );
        if (testState.index === nextState.index) { break; }
        else { minIndex = testState.index;}
      }
    }


    // find best matching rule
    for (let r of rules) {
      testState = r.lookaheadParser.step(nextState);
      if (!testState.isError) {
        if (testState.index < minIndex) {
          minIndex = testState.index;
          bestRule = r;
        }
      }
    }

    // add textnode to results if any text before match
    if (minIndex > nextState.index){
      nextState = defaultParser(target.slice(nextState.index, minIndex)).step(nextState);
      results.push(nextState.result);
    }

    // add best rule's main parser to results
    if (bestRule !== null){
      nextState = bestRule.mainParser.step(nextState);
      results.push(nextState.result);
    }
    //if (results.length === 4) { break; } // temp break to avoid infinite loops
  }
  return {...nextState, result: results};
});

describe('Trial Parser Library', () => {
  describe('TextNode Parser', () => {
    it('should parse text nodes until a rule is matched', () => {
      const rules = [ 
        ruleParser( 'RuleA',
          lookaheadRegex(/\*\*/), sequenceOf(['**', 'bol_d text', '**']))
      , ruleParser('RuleB',
          lookaheadRegex (/__/), sequenceOf(['__', 'italic text', '__']))
      ];

      const defaultParser = textNodeParser;
      const terminator = null;

      const parser = rulesParser(defaultParser, rules, terminator);

      const result_state = parser.run('This is a _ test of s_ome **bol_d text** _ and some __italic text__.');
      logParserState(result_state);
      //expect(result_state).toBeParserResult(['This is some ', 'bold text']);
    });
    it('should parse text nodes and rules recuresively', () => {
      const rules = [ 
        ruleParser( 'Bold',
          lookaheadRegex(/\*\*/), sequenceOf(['**', rulesParser(textNodeParser, [], lookaheadRegex(/\*\*/)), '**']))
      , ruleParser('Italic',
          lookaheadRegex (/__/), sequenceOf(['__', rulesParser(textNodeParser, [], lookaheadRegex(/__/)), '__']))
      ];

      const parser = rulesParser(textNodeParser, rules, null);

      const result_state = parser.run('This is some **bold and __italic__ text** in a sentence.');
      logParserState(result_state);
      //expect(result_state).toBeParserResult(['This is some ', 'bold text']);
    });
  });
});
