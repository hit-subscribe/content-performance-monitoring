

import Configurator from 'configurator';


import fs from 'fs';
import('dotenv/config');

String.prototype.format = String.prototype.format ||
function () {
    "use strict";
    var str = this.toString();
    if (arguments.length) {
        var t = typeof arguments[0];
        var key;
        var args = ("string" === t || "number" === t) ?
            Array.prototype.slice.call(arguments)
            : arguments[0];

        for (key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }

    return str;
};

import CredentialsStore from './credential-store.js';

var keyFileContents = fs.readFileSync('./keys.crd','utf8');
var credentialStore = new CredentialsStore(keyFileContents);

var dataForSeoUsername = credentialStore.getCredential('dataForSeoUsername');
var dataforSeoPassword = credentialStore.getCredential('dataForSeoPassword');



let properties = [];

properties.push({name: 'one', argument: 'o', help: 'there is no help for you'})


var configurator = new Configurator("foo", "It's a foo", "0.1.0", properties);


console.log(configurator.configuration.one);
