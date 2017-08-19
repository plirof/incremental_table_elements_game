/**
 reaction
 Service that processes a reaction i.e. it converts reactants to products.
 Many phenomenons, including decay, redox and reactions, use the react function.

 @namespace Services
 */
'use strict';

angular
  .module('game')
  .service('reaction', ['state',
    function(state) {
      // FIXME: move to util?
        this.isReactionCostMet = function(number, reaction, playerData) {
          let keys = Object.keys(reaction.reactant);
          for (let i = 0; i < keys.length; i++) {
            let available = playerData.resources[keys[i]].number;
            let required = number * reaction.reactant[keys[i]];
            if (required > available) {
              return false;
            }
          }
          return true;
        };

      /* Transforms reactants to products */
      this.react = function(number, reaction, playerData) {
        if (!Number.isInteger(number) || number <= 0 ||
            !reaction.reactant || !reaction.product) {
          return;
        }
        if (this.isReactionCostMet(number, reaction, playerData)) {
          let reactant = Object.keys(reaction.reactant);
          for (let i = 0; i < reactant.length; i++) {
            let required = number * reaction.reactant[reactant[i]];
            playerData.resources[reactant[i]].number -= required;
            playerData.resources[reactant[i]].number = playerData.resources[reactant[i]].number;
          }
          let product = Object.keys(reaction.product);
          for (let i = 0; i < product.length; i++) {
            let produced = number * reaction.product[product[i]];
            let current = playerData.resources[product[i]].number;
            playerData.resources[product[i]].number = current + produced;
            if (!playerData.resources[product[i]].unlocked) {
              playerData.resources[product[i]].unlocked = true;
              state.addNew(product[i]);
            }
          }
        }
      };
    }
  ]);
