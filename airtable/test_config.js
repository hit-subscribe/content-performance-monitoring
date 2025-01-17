

import Configurator from 'configurator';



let properties = [];

properties.push({name: 'one', argument: 'o', help: 'there is no help for you'})


var configurator = new Configurator("foo", "It's a foo", "0.1.0", properties);


console.log(configurator.configuration.one);
