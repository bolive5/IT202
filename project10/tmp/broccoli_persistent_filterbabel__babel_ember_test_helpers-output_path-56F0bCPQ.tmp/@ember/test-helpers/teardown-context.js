define('@ember/test-helpers/teardown-context', ['exports', '@ember/test-helpers/ext/rsvp', '@ember/test-helpers/settled', '@ember/test-helpers/setup-context'], function (exports, _rsvp, _settled, _setupContext) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function (context) {
    return new Promise(function (resolve) {
      // ensure "real" async and not "fake" RSVP based async
      next(function () {
        var owner = context.owner;


        (0, _rsvp._teardownPromiseListeners)();
        (0, _settled._teardownAJAXHooks)();

        run(owner, 'destroy');
        Ember.testing = false;

        (0, _setupContext.unsetContext)();
        resolve(context);
      });
    });
  };

  var run = Ember.run;
  var next = Ember.run.next;
  var Promise = Ember.RSVP.Promise;
});