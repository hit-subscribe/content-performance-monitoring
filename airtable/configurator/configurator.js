
import { Command } from 'commander';
const program = new Command();

import 'dotenv/config';

import format from 'format';

String.prototype.format = format;

// Each property has:
// name: the variable name. Used in env file, long command line, and code.
// argument: soingle letter command line argument
// help: help string for command line
// envName: value name in .env file

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
        this.configuration[prop.name] = process.env[prop.envName];
      }

    });

  }
}



