/* Test Helper for Functional Parser Library Tests
*  Includes helper functions to verify the parser state results to 
*  allow for future refactors and extensions.
*/

function toBeParserResult(received_state, expected_result) {
    let pass 
    
    if (Array.isArray(expected_result )) {
      pass = Array.isArray(received_state.result) &&
      received_state.result.length === expected_result.length &&
      received_state.result.every((val, index) => val === expected_result[index]);
    } else{
      pass = received_state.result === expected_result;
    }
    if (!pass){ logParserState(received_state); }
    
    return {
      pass,
      message: () => pass
      ? `expected ${JSON.stringify(received_state.result)} not to equal ${JSON.stringify(expected_result)}`
      : `expected ${JSON.stringify(received_state.result)} to equal ${JSON.stringify(expected_result)}`
    }
}

function toBeParserError(received_state, expected_error_msg) {
  const pass = received_state.isError === true &&
  received_state.error === expected_error_msg;
    return {
      pass,
      message: () => pass 
      ? `expected error message "${expected_error_msg}" not to equal "${received_state.error}"`
      : `expected error message "${expected_error_msg}" to equal "${received_state.error}"`
    }
  }


const fs = require('fs');
const path = require('path');
const LOG_FILE_PATH = path.join(__dirname, 'parser-test.log');

function clearLogFile() {
  try {
    fs.writeFileSync(LOG_FILE_PATH, '', 'utf8');
  } catch (error) {
    console.error('Error clearing log file:', error);
  }
}

function logParserState(state) {
  try {
    const logEntry = `${new Date().toISOString()} - ${JSON.stringify(state, null, 2)}\n`;
    fs.appendFileSync(LOG_FILE_PATH, logEntry, 'utf8');
  } catch (error) {
    console.error('Error logging parser state:', error);
  }
}

exports.toBeParserResult = toBeParserResult;
exports.toBeParserError = toBeParserError;
exports.logParserState = logParserState;
exports.clearLogFile = clearLogFile;