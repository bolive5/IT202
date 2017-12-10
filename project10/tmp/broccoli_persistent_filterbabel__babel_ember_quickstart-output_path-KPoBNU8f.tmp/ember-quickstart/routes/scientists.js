define('ember-quickstart/routes/scientists', ['exports'], function (exports) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    var Route = Ember.Route;
    exports.default = Route.extend({
        model: function model() {
            return ['Marie Curie', 'Mae Jemison', 'Albert Hofmann'];
        }
    });
});