var SearchResult = require('./search-result');

//Getting Results Count from Custom Search
var realEmptyResult = JSON.parse('{"searchInformation": {"totalResults": 0}}');
var realOneResult = JSON.parse('{"searchInformation":{"totalResults":1}}');

test('throws an exception when response is invalid', () => {
  expect(() => {new SearchResult('').resultsCount();}).toThrow('Response error.');
})

test('returns 0 when result is valid with no results', () => {
  expect(new SearchResult(realEmptyResult).resultsCount()).toEqual(0);
})


test('returns 1 when result is valid with 1', () => {
  expect(new SearchResult(realOneResult).resultsCount()).toEqual(1);
})

