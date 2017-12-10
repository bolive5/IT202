define('@ember/test-helpers/ext/rsvp', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports._setupPromiseListeners = _setupPromiseListeners;
  exports._teardownPromiseListeners = _teardownPromiseListeners;
  var RSVP = Ember.RSVP;
  var run = Ember.run;


  var originalAsync = void 0;
  function _setupPromiseListeners() {
    originalAsync = RSVP.configure('async');

    RSVP.configure('async', function (callback, promise) {
      run.backburner.schedule('actions', function () {
        callback(promise);
      });
    });
  }

  function _teardownPromiseListeners() {
    RSVP.configure('async', originalAsync);
  }
});