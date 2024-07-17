const fs = require('fs');
const axios = require('axios');
const CredentialsStore = require('./credential-store');

var keyFileContents = fs.readFileSync('./keys.crd','utf8');
var credentialStore = new CredentialsStore(keyFileContents);

var apiKey = credentialStore.getCredential('airtableApiKey');
var workspaceId = credentialStore.getCredential('airtableWorkspaceId');

const args = process.argv.slice(2);
var baseName = args[0];

if (!baseName) {
    console.error('Error: Base name is required');
    process.exit(1);
}

baseName = `Panoply:${baseName}`;

const url = `https://api.airtable.com/v0/meta/bases`;
const schema = JSON.parse(fs.readFileSync('airtable_schema.json', 'utf8'));

var data = {
    name: baseName,
    tables: schema.tables,
    workspaceId: workspaceId
};

console.log(data);

axios.post(url, data, {
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
    }
}).then(response => {
    console.log('Base created successfully:', response.data);
}).catch(error => {
    console.error('Error creating base:', error.response ? error.response.data : error.message);
});
