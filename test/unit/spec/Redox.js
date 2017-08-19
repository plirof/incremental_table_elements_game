/* eslint no-var: 0 */
/* globals describe,commonSpec,it,expect */
/* jshint varstmt: false */
'use strict';

describe('Redox component', function () {
  let spec = {};

  commonSpec(spec);

  beforeEach(function () {
    spec.data.global_upgrades = {
      redox_slots: {
        price: {
          eV: 10000
        },
        tiers: [],
        deps: [],
        exotic_deps: [],
        dark_deps: [],
        power: 1,
        power_mult: 1,
        price_exp: 2,
        repeatable: true
      },
      redox_bandwidth: {
        price: {
          eV: 100
        },
        tiers: [],
        deps: [],
        exotic_deps: [],
        dark_deps: [],
        power: 100,
        power_poly: 2,
        price_exp: 1.15,
        repeatable: true
      }
    };
    spec.data.elements = {
      H: {
        main: '1H'
      }
    };
    spec.data.redox = {
      H: {
        '0': 0,
        '1': 13.5984,
        '-1': 0.7545,
        '-2': -5.9498
      }
    };
  });

  describe('redox', function () {
    it('should add redox', function () {
      spec.state.player.global_upgrades.redox_slots = 1;

      spec.redox.addRedox(spec.state.player);

      expect(spec.state.player.redox.length).toEqual(1);
    });

    it('should not add redox if no slots are available', function () {
      spec.state.player.global_upgrades.redox_slots = 1;
      spec.state.player.redox = [1];

      expect(spec.state.player.redox.length).toEqual(1);

      spec.redox.addRedox(spec.state.player);

      expect(spec.state.player.redox.length).toEqual(1);
    });

    it('should remove redox', function () {
      spec.state.player.redox = [1];

      expect(spec.state.player.redox.length).toEqual(1);

      spec.redox.removeRedox(spec.state.player, 0);

      expect(spec.state.player.redox.length).toEqual(0);
    });

    it('should generate the ion name', function () {
      let ion = spec.redox.generateName('H', 0);

      expect(ion).toEqual('1H');
    });

    it('should generate the ion name 2', function () {
      let ion = spec.redox.generateName('H', -2);

      expect(ion).toEqual('H2-');
    });

    it('should generate the ion name 3', function () {
      let ion = spec.redox.generateName('H', 2);

      expect(ion).toEqual('H2+');
    });

    it('should generate the ion name for protons', function () {
      let ion = spec.redox.generateName('H', 1);

      expect(ion).toEqual('p');
    });

    it('should create a reaction from a redox', function () {
      let redox = {
        resource: '1H',
        active: false,
        element: 'H',
        from: 0,
        to: -2
      };

      let reaction = spec.redox.redoxReaction(redox);

      expect(reaction).toEqual({
        'reactant': {'1H': 1, 'e-': 2, 'eV': 5.1953},
        'product': {'H2-': 1}
      });
    });

    it('should create a reaction from a redox 2', function () {
      let redox = {
        resource: '1H',
        active: false,
        element: 'H',
        from: 0,
        to: -1
      };

      let reaction = spec.redox.redoxReaction(redox);

      expect(reaction).toEqual({
        'reactant': {'1H': 1, 'e-': 1},
        'product': {'H-': 1, 'eV': 0.7545}
      });
    });

    it('should create a reaction from a redox 3', function () {
      let redox = {
        resource: '1H',
        active: false,
        element: 'H',
        from: 0,
        to: 1
      };

      let reaction = spec.redox.redoxReaction(redox);

      expect(reaction).toEqual({
        'reactant': {'1H': 1, 'eV': 13.5984},
        'product': {'p': 1, 'e-': 1}
      });
    });

    it('should create a reaction from a redox 4', function () {
      let redox = {
        resource: '1H',
        active: false,
        element: 'H',
        from: 1,
        to: 1
      };

      let reaction = spec.redox.redoxReaction(redox);

      expect(reaction).toEqual({
        'reactant': {'p': 1},
        'product': {'p': 1}
      });
    });

    it('should process redoxes', function () {
      spec.state.player.redox = [{
        resource: '1H',
        active: true,
        element: 'H',
        from: 0,
        to: 1
      }];
      spec.state.player.resources = {
        '1H': {number: 100},
        'e-': {number: 0},
        p: {number: 0},
        eV: {number: 200}
      };
      spec.state.player.resources['1H'].number = 100;
      spec.state.player.resources['e-'].number = 0;
      spec.state.player.resources.p.number = 0;
      spec.state.player.resources.eV.number = 200;
      // mock redoxPower
      spec.redox.redoxPower = function() {return 10;};

      spec.state.update(spec.state.player);

      expect(spec.state.player.resources['1H'].number).toEqual(90);
      expect(spec.state.player.resources.eV.number).toBeCloseTo(64.016);
      expect(spec.state.player.resources['e-'].number).toEqual(10);
      expect(spec.state.player.resources.p.number).toEqual(10);
    });

    it('should not process inactive redoxes', function () {
      let redox = {
        resource: '1H',
        active: false,
        element: 'H',
        from: 0,
        to: 1
      };
      spec.state.player.redox = [redox];
      spec.state.player.resources = {
        '1H': {number: 100},
        'e-': {number: 0},
        p: {number: 0},
        eV: {number: 200}
      };
      // mock redoxPower
      spec.redox.redoxPower = function() {return 10;};

      spec.state.update(spec.state.player);

      expect(spec.state.player.resources['1H'].number).toEqual(100);
      expect(spec.state.player.resources.eV.number).toEqual(200);
      expect(spec.state.player.resources['e-'].number).toEqual(0);
      expect(spec.state.player.resources.p.number).toEqual(0);
    });

    it('should cap at the resource number', function () {
      let redox = {
        resource: '1H',
        active: true,
        element: 'H',
        from: 0,
        to: 1
      };
      spec.state.player.redox = [redox];
      spec.state.player.resources = {
        '1H': {number: 100},
        'e-': {number: 0},
        p: {number: 0},
        eV: {number: 2000}
      };
      // mock redoxPower
      spec.redox.redoxPower = function() {return 2000;};

      spec.state.update(spec.state.player);

      expect(spec.state.player.resources['1H'].number).toEqual(0);
      expect(spec.state.player.resources.eV.number).toBeCloseTo(640.16);
      expect(spec.state.player.resources['e-'].number).toEqual(100);
      expect(spec.state.player.resources.p.number).toEqual(100);
    });

    it('should not react of not enough colaterals are available', function () {
      let redox = {
        resource: '1H',
        active: true,
        element: 'H',
        from: 0,
        to: 1
      };
      spec.state.player.redox = [redox];
      spec.state.player.resources = {
        '1H': {number: 100},
        'e-': {number: 0},
        p: {number: 0},
        eV: {number: 200}
      };
      // mock redoxPower
      spec.redox.redoxPower = function() {return 2000;};

      spec.state.update(spec.state.player);

      expect(spec.state.player.resources['1H'].number).toEqual(100);
      expect(spec.state.player.resources.eV.number).toEqual(200);
      expect(spec.state.player.resources['e-'].number).toEqual(0);
      expect(spec.state.player.resources.p.number).toEqual(0);
    });
  });

  describe('visibility functions', function() {
    it('should show visible redoxes', function() {
      spec.state.player.redox.push({
        resource: '1H',
        number: 50,
        active: false,
        element: 'H',
        from: 0,
        to: 1
      });
      spec.state.player.redox.push({
        resource: '16O',
        number: 50,
        active: false,
        element: 'O',
        from: 0,
        to: 1
      });

      let values = spec.redox.visibleRedox('H');

      expect(values).toEqual([{
        resource: '1H',
        number: 50,
        active: false,
        element: 'H',
        from: 0,
        to: 1
      }]);
    });

    it('should not show redoxes if they are locked', function() {
      spec.state.player.resources['1H'] = {unlocked:true};
      spec.state.player.resources.eV = {unlocked:true};
      spec.state.player.resources['e-'] = {unlocked:false};

      let values = spec.redox.visibleRedox('H');

      expect(values).toEqual([]);
    });

    it('should not show redoxes of other elements', function() {
      spec.state.player.resources['1H'] = {unlocked:true};
      spec.state.player.resources.eV = {unlocked:true};
      spec.state.player.resources['e-'] = {unlocked:false};

      let values = spec.redox.visibleRedox('O');

      expect(values).toEqual([]);
    });
  });
});
