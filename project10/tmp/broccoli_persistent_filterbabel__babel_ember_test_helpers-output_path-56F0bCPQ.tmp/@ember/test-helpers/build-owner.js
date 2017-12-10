define('@ember/test-helpers/build-owner', ['exports', 'ember-test-helpers/legacy-0-6-x/build-registry'], function (exports, _buildRegistry) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (_ref) {
    var application = _ref.application,
        resolver = _ref.resolver;

    if (application) {
      return application.boot().then(function (app) {
        return app.buildInstance().boot();
      });
    }

    if (!resolver) {
      throw new Error('You must set up the ember-test-helpers environment with either `setResolver` or `setApplication` before running any tests.');
    }

    var _legacyBuildRegistry = (0, _buildRegistry.default)(resolver),
        owner = _legacyBuildRegistry.owner;

    return Promise.resolve(owner);
  };

  var Promise = Ember.RSVP.Promise;
});