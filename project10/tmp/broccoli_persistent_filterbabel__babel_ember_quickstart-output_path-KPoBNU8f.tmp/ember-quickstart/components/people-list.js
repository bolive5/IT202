define('ember-quickstart/components/people-list', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  var Component = Ember.Component;
  exports.default = Component.extend({
    actions: {
      showPerson: function showPerson(person) {
        alert(person);
      }
    }
  });
});