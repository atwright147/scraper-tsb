import chai, { expect } from 'chai';
import sinon from 'sinon';

global.chai = chai;
global.expect = expect;
global.sinon = sinon;

// Fail tests on any warning
// console.error = message => {
//     throw new Error(message);
// };
