const fs = require('fs');
const axios = require('axios');
const CredentialsStore = require('./credential-store');

var keyFileContents = fs.readFileSync('./keys.crd','utf8');
var credentialStore = new CredentialsStore(keyFileContents);

var baseId = credentialStore.getCredential('airtableBaseId');
var apiKey = credentialStore.getCredential('airtableApiKey');

const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables`;

axios.get(url, {
    headers: {
        'Authorization': `Bearer ${apiKey}`
    }
}).then(response => {
    const data = response.data;
    
    fs.writeFile('airtable_schema.json', JSON.stringify(data, null, 4), (err) => {
        if (err) throw err;
        console.log('Schema saved as airtable_schema.json');
    });
}).catch(error => {
    console.error('Error fetching schema:', error);
});