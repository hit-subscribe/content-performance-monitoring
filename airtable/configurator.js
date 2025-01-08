


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

import CredentialsStore from '../credential-store.js';

var keyFileContents = fs.readFileSync('./keys.crd','utf8');
var credentialStore = new CredentialsStore(keyFileContents);

var dataForSeoUsername = credentialStore.getCredential('dataForSeoUsername');
var dataforSeoPassword = credentialStore.getCredential('dataForSeoPassword');


import { Command } from 'commander';
const program = new Command();



// Each property has:
// name: the variable name. Used in env file, long command line, and code.
// argument: soingle letter command line argument
// help: help string for command line


export default class Configurator {
  constructor(name, description, version, properties) {

    this.configuration = [];

    // Define command line args
    program
      .name(name)
      .description(description)
      .version(version);

    properties.forEach(prop => {

      console.log(prop);

      let option = '-{0} --{1} <{2}>'.format(prop.argument, prop.name, prop.name);
      console.log(option);
      program.option(option, prop.help);
    });

    // Parse them
    program.parse();


    properties.forEach(prop => {

      if (typeof program.opts()[prop.name] !== 'undefined') {
        this.configuration[prop.name] = program.opts()[prop.name];
      } else {
        this.configuration[prop.name] = process.env[prop.name];
      }

    });

  }
}



