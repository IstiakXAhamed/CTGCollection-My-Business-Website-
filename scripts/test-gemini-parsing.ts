
import { parseAIJSON } from '../lib/gemini-ai';

console.log('Running parseAIJSON tests...');

const testCases = [
  {
    name: 'Direct JSON',
    input: '{"key": "value"}',
    expected: { key: "value" }
  },
  {
    name: 'Markdown JSON',
    input: '```json\n{"key": "value"}\n```',
    expected: { key: "value" }
  },
  {
    name: 'Markdown without json tag',
    input: '```\n{"key": "value"}\n```',
    expected: { key: "value" }
  },
  {
    name: 'Surrounding Text',
    input: 'Here is the JSON:\n{"key": "value"}\nHope it helps!',
    expected: { key: "value" }
  },
  {
    name: 'Nested Objects',
    input: '{"key": {"nested": "value"}}',
    expected: { key: { nested: "value" } }
  },
  {
      name: 'Markdown with surrounding text',
      input: 'Sure! Here is it:\n```json\n{"key": "value"}\n```\nThanks.',
      expected: { key: "value" }
  },
  {
      name: 'Array JSON',
      input: '[{"id": 1}, {"id": 2}]',
      expected: [{id: 1}, {id: 2}]
  }
];

let passed = 0;
let failed = 0;

testCases.forEach(test => {
  const result = parseAIJSON(test.input, null);
  const jsonResult = JSON.stringify(result);
  const jsonExpected = JSON.stringify(test.expected);
  
  if (jsonResult === jsonExpected) {
    console.log(`[PASS] ${test.name}`);
    passed++;
  } else {
    console.error(`[FAIL] ${test.name}`);
    console.error(`  Input: ${JSON.stringify(test.input)}`);
    console.error(`  Expected: ${jsonExpected}`);
    console.error(`  Actual: ${jsonResult}`);
    failed++;
  }
});

console.log(`\nTests Completed. Passed: ${passed}, Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
}
