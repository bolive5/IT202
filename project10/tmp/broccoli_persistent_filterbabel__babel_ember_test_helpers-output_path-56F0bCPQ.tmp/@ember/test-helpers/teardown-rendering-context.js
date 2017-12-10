define('@ember/test-helpers/teardown-rendering-context', ['exports', '@ember/test-helpers/setup-rendering-context'], function (exports, _setupRenderingContext) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (context) {
    return new Promise(function (resolve) {
      // ensure "real" async and not "fake" RSVP based async
      next(function () {
        var guid = guidFor(context);
        var destroyables = _setupRenderingContext.RENDERING_CLEANUP[guid];

        for (var i = 0; i < destroyables.length; i++) {
          run(destroyables[i]);
        }

        delete _setupRenderingContext.RENDERING_CLEANUP[guid];
        resolve(context);
      });
    });
  };

  var guidFor = Ember.guidFor;
  var run = Ember.run;
  var next = Ember.run.next;
  var Promise = Ember.RSVP.Promise;
});