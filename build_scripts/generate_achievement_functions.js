/*jslint node: true */
'use strict';

const jsonfile = require('jsonfile');
const template = require('lodash.template');
const crypto = require('crypto');
const fs = require('fs');

const args = process.argv.slice(2);

var achievements = jsonfile.readFileSync(args[0]+'/data/achievements.json');
var achievement_service = fs.readFileSync(args[0]+'/scripts/services/achievement.js').toString();

const FUNCTION_TEMPLATE = `this.<%= name %> = function (player){
  return <%= condition %>;
};`;

var function_template = template(FUNCTION_TEMPLATE);

var functions = {};
for(var i in achievements){
  var achievement = achievements[i];
  var name = '_'+crypto.createHash('md5').update(achievement.condition).digest("hex");
  functions[name] = function_template({ 'name': name, 'condition': achievement.condition });
  // we overwrite the condition with the name
  achievements[i].condition = name;
}

var concat_functions = "";
for(var i in functions){
  concat_functions += functions[i]+"\n";
}

var service_template = template(achievement_service);

fs.writeFileSync(args[0]+'/scripts/services/achievement.js', service_template({'functions': concat_functions}));
jsonfile.writeFileSync(args[0] + '/data/achievements.json', achievements, {
  spaces: 2
});