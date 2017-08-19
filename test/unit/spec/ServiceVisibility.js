/* eslint no-var: 0 */
/* globals describe,commonSpec,it,expect */
/* jshint varstmt: false */
'use strict';

describe('Visible service', function() {
  let spec = {};

  commonSpec(spec);

  describe('visibility functions', function() {
    it('should show visible elements', function() {
      spec.data.elements = {'H':{disabled:false},'C':{disabled:true},'O':{disabled:false}};
      spec.state.player.elements.H = {unlocked:true};
      spec.data.elements.H.includes = ['1H'];
      spec.state.player.elements.C = {unlocked:false};
      spec.data.elements.C.includes = ['8C'];
      spec.state.player.elements.O = {unlocked:false};
      spec.data.elements.O.includes = ['16O'];
      spec.state.player.resources['1H'] = {unlocked:true};
      spec.state.player.resources['8C'] = {unlocked:false};
      spec.state.player.resources['16O'] = {unlocked:false};

      let values = spec.elementSelect.visibleElements();

      expect(values).toEqual(['H']);
    });

    it('should show visible resources', function() {
      spec.state.player.resources = {
        '1H': {unlocked:true},
        '2H': {unlocked:false},
        eV: {unlocked:true},
        '16O': {unlocked:true}
      };
      spec.data.resources = {
        '1H': {elements: {H:1}},
        '2H': {elements: {H:1}},
        eV: {elements: {}},
        '16O': {elements: {O:1}}
      };

      let values = spec.sidebar.visibleResources('H');

      expect(values).toEqual(['1H', 'eV']);
    });
  });
});
