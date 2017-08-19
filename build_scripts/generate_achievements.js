/* eslint-env node */
/*jslint node: true */
'use strict';

const jsonfile = require('jsonfile');

const args = process.argv.slice(2);

let achievements = jsonfile.readFileSync(args[0]+'/data/achievements.json');
let elements = jsonfile.readFileSync(args[0]+'/data/elements.json');
let resources = jsonfile.readFileSync(args[0]+'/data/resources.json');
let radioisotopes = jsonfile.readFileSync(args[0]+'/data/radioisotopes.json');

for(let element in elements){
  if(elements[element].disabled){
    continue;
  }
  let main = elements[element].main;
  let name = elements[element].name;
  let goals = [1e6, 1e9, 1e12, 1e15];
  let key = 'progress_'+element;

  // Generate production achievements
  achievements[key] = {
    name: name,
    description: 'Gather '+name,
    goals: goals,
    progress: 'player.resources["'+main+'"].number'
  };

  let isotopeNumber = Object.keys(elements[element].isotopes).length;
  key = 'isotopes_'+element;
  // Generate isotopes achievements
  achievements[key] = {
    name: name+' isotopes',
    description: 'Unlock all '+name+' isotopes',
    goals: [isotopeNumber],
    progress: ['(() => {',
      'let count = 0;',
      'for(let key in data.elements["'+element+'"].isotopes){',
      '  if (player.resources[key].unlocked) {',
      '    count++;',
      '  }',
      '}',
      'return count;',
      '})()'
    ]
  };

  let ionNumber = 0;
  for(let resource of elements[element].includes){
    if (resources[resource].type.indexOf('ion') !== -1) {
      ionNumber++;
    }
  }
  if(ionNumber > 0){
    key = 'ions_'+element;
    // Generate ions achievements
    achievements[key] = {
      name: name+' ions',
      description: 'Unlock all '+name+' ions',
      goals: [ionNumber],
      progress: ['(() => {',
        'let count = 0;',
        'for(let key of data.elements["'+element+'"].includes){',
        '  if (data.resources[key].type.indexOf("ion") !== -1 &&',
        '      player.resources[key].unlocked) {',
        '    count++;',
        '  }',
        '}',
        'return count;',
        '})()'
      ]
    };
  }

  let moleculeNumber = 0;
  for(let resource of elements[element].includes){
    if (resources[resource].type.indexOf('molecule') !== -1) {
      moleculeNumber++;
    }
  }

  if(moleculeNumber > 0){
    key = 'molecules_'+element;
    // Generate ions achievements
    achievements[key] = {
      name: name+' molecules',
      description: 'Unlock all '+name+' molecules',
      goals: [moleculeNumber],
      progress: ['(() => {',
        'let count = 0;',
        'for(let key of data.elements["'+element+'"].includes){',
        '  if (data.resources[key].type.indexOf("molecule") !== -1 &&',
        '      player.resources[key].unlocked) {',
        '    count++;',
        '  }',
        '}',
        'return count;',
        '})()'
      ]
    };
  }
}

// Total achievements
let totalElements = 0;
for(let element in elements){
  if(!elements[element].disabled){
    totalElements++;
  }
}

achievements.total_elements = {
  name: 'Elements',
  description: 'Unlock all elements',
  goals: [totalElements],
  progress: ['(() => {',
    'let count = 0;',
    'for(let key in state.player.elements){',
    '  if (state.player.elements[key].unlocked) {',
    '    count++;',
    '  }',
    '}',
    'return count;',
    '})()'
  ]
};

// Total isotopes
let totalIsotopes = 0;
for(let resource in resources){
  if(resources[resource].type.indexOf('isotope') !== -1){
    totalIsotopes++;
  }
}

achievements.total_isotopes = {
  name: 'Isotopes',
  description: 'Unlock all isotopes',
  goals: [totalIsotopes],
  progress: ['(() => {',
    'let count = 0;',
    'for(let key in state.player.resources){',
    '  if (data.resources[key].type.indexOf("isotope") !== -1 &&',
    '      state.player.resources[key].unlocked) {',
    '    count++;',
    '  }',
    '}',
    'return count;',
    '})()'
  ]
};

// Total ions
let totalIons = 0;
for(let resource in resources){
  if(resources[resource].type.indexOf('ion') !== -1){
    totalIons++;
  }
}

achievements.total_ions = {
  name: 'Ions',
  description: 'Unlock all ions',
  goals: [totalIons],
  progress: ['(() => {',
    'let count = 0;',
    'for(let key in state.player.resources){',
    '  if (data.resources[key].type.indexOf("ion") !== -1 &&',
    '      state.player.resources[key].unlocked) {',
    '    count++;',
    '  }',
    '}',
    'return count;',
    '})()'
  ]
};

// Total molecules
let totalMolecules = 0;
for(let resource in resources){
  if(resources[resource].type.indexOf('molecule') !== -1){
    totalMolecules++;
  }
}

achievements.total_molecules = {
  name: 'Molecules',
  description: 'Unlock all molecules',
  goals: [totalMolecules],
  progress: ['(() => {',
    'let count = 0;',
    'for(let key in state.player.resources){',
    '  if (data.resources[key].type.indexOf("molecule") !== -1 &&',
    '      player.resources[key].unlocked) {',
    '    count++;',
    '  }',
    '}',
    'return count;',
    '})()'
  ]
};

// Total misc
let totalMisc = 0;
for(let resource in resources){
  if(Object.keys(resources[resource].elements).length === 0){
    totalMisc++;
  }
}

achievements.total_misc = {
  name: 'Misc',
  description: 'Unlock all meta resources',
  goals: [totalMisc],
  progress: ['(() => {',
    'let count = 0;',
    'for(let key in state.player.resources){',
    '  if (Object.keys(data.resources[key].elements).length === 0 &&',
    '      player.resources[key].unlocked) {',
    '    count++;',
    '  }',
    '}',
    'return count;',
    '})()'
  ]
};

// Total radioisotopes
let totalRadioisotopes = Object.keys(radioisotopes).length;

achievements.total_radioisotopes = {
  name: 'Radioisotopes',
  description: 'Unlock all radioactive isotopes',
  goals: [totalRadioisotopes],
  progress: ['(() => {',
    'let count = 0;',
    'for(let key of '+JSON.stringify(radioisotopes)+'){',
    '  if (player.resources[key].unlocked) {',
    '    count++;',
    '  }',
    '}',
    'return count;',
    '})()'
  ]
};

// 'The most' achievements
let mostUnstable = '';
let lowestHalfLife = Infinity;
for(let isotope of radioisotopes){
  let element = Object.keys(resources[isotope].elements)[0];
  let halfLife = elements[element].isotopes[isotope].decay.half_life;
  if(halfLife < lowestHalfLife){
    lowestHalfLife = halfLife;
    mostUnstable = isotope;
  }
}

achievements.most_unstable = {
  name: 'Most unstable',
  description: 'Unlock the shortest lived isotope',
  goals: [1],
  condition: ['(() => {',
    'if (player.resources["'+mostUnstable+'"].unlocked) {',
    '  return true;',
    '}',
    'return false;',
    '})()'
  ]
};

let mostCharged = 0;
for(let resource in resources){
  if(resources[resource].charge > mostCharged){
    mostCharged = resources[resource].charge;
  }
}

let mostChargedIons = [];
for(let resource in resources){
  if(resources[resource].charge === mostCharged){
    mostChargedIons.push(resource);
  }
}

achievements.most_charged = {
  name: 'Most charged',
  description: 'Unlock an extremely charged ion',
  goals: [1],
  condition: ['(() => {',
    'let count = 0;',
    'for(let key of '+JSON.stringify(mostChargedIons)+'){',
    '  if (player.resources[key].unlocked) {',
    '    return true;',
    '  }',
    '}',
    'return false;',
    '})()'
  ]
};

let largestSize = 0;
for(let resource in resources){
  let size = 0;
  for(let element in resources[resource].elements){
    size += resources[resource].elements[element];
  }
  if(size >= largestSize){
    largestSize = size;
  }
}

let largestMolecules = [];
for(let resource in resources){
  let size = 0;
  for(let element in resources[resource].elements){
    size += resources[resource].elements[element];
  }
  if(size === largestSize){
    largestMolecules.push(resource);
  }
}

achievements.most_large = {
  name: 'Largest molecule',
  description: 'Unlock a gargantuan molecule',
  goals: [1],
  condition: ['(() => {',
    'let count = 0;',
    'for(let key of '+JSON.stringify(largestMolecules)+'){',
    '  if (player.resources[key].unlocked) {',
    '    return true;',
    '  }',
    '}',
    'return false;',
    '})()'
  ]
};

// All
achievements.resources_all = {
  name: 'All resources',
  description: 'Unlock every single resource',
  goals: [Object.keys(resources).length],
  progress: ['(() => {',
    'let count = 0;',
    'for(let key in data.resources){',
    '  if (player.resources[key].unlocked) {',
    '    count++;',
    '  }',
    '}',
    'return count;',
    '})()'
  ]
};

jsonfile.writeFileSync(args[0] + '/data/achievements.json', achievements, {
  spaces: 2
});
