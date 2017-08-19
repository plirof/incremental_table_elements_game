/* globals versionCompare, atob, btoa */
/**
 savegame
 Service that handles save/load related functions.

 @namespace Services
 */
'use strict';

angular
  .module('game')
  .service('savegame', ['$state',
    'state',
    'data',
    function ($state, state, data) {
      this.initSave = function () {
        state.player = {};
        this.versionControl();
        state.init();
        $state.go('matter');
      };

      this.save = function () {
        localStorage.setItem('player', JSON.stringify(state.player));
      };

      this.load = function () {
        try {
          let storedPlayer = localStorage.getItem('player');
          if (!storedPlayer) {
            this.initSave();
          } else {
            state.player = JSON.parse(storedPlayer);
            this.versionControl();
          }
        } catch (err) {
          alert('Error loading savegame, reset forced.');
          this.initSave();
        }
      };

      this.versionControl = function () {
        // delete saves older than this version
        if (state.player.version && versionCompare(state.player.version, '2.1.0') < 0) {
          state.player = {};
        }
        // we merge the properties of the player with the start player to
        // avoid undefined errors with new properties
        state.player = angular.merge({}, data.start_player, state.player);
        // append an id if it doesn't exist
        if (!state.player.id) {
          state.player.id = Math.random().toString().substring(3);
        }

        // old saves may have outdated reactions, which crash the game
        for(let react in state.player.reactions){
          if(typeof data.reactions[react] === 'undefined'){
            delete state.player.reactions[react];
          }
        }

        // old saves may have outdated resources, which crash the game
        for(let resource in state.player.resources){
          if(typeof data.resources[resource] === 'undefined'){
            delete state.player.resources[resource];
          }
        }
      };
    }
  ]);
