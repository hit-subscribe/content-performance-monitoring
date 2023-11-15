const CredentialsStore = require('./credential-store');

const validCredFile = `customSearchCx:aCx
customSearchKey:aKey`;

test('Returns cx for a validCredFile', () => {
    expect(new CredentialsStore(validCredFile).getCredential('customSearchCx')).toEqual('aCx');
})

test('Returns key for a validCredFile', () => {
    expect(new CredentialsStore(validCredFile).getCredential('customSearchKey')).toEqual('aKey');
})

test('Throws an exception when fileContents is empty', () => {
    expect(() => {new CredentialsStore('');}).toThrow('Invalid credentials file.');
})

