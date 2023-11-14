const CustomSearchCredentials = require('./custom-search-credentials');
var CustomSearchCredential = require('./custom-search-credentials');

const validCredFile = `cx:aCx
key:aKey`;

test('Returns cx for a validCredFile', () => {
    expect(new CustomSearchCredentials(validCredFile).getCx()).toEqual('aCx');
})

test('Returns key for a validCredFile', () => {
    expect(new CustomSearchCredentials(validCredFile).getApiKey()).toEqual('aKey');
})

test('Throws an exception when fileContents is empty', () => {
    expect(() => {new CustomSearchCredentials('');}).toThrow('Invalid credentials file.');
  })