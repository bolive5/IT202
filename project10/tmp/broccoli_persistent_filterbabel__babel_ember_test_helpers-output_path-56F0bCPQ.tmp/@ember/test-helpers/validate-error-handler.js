define('@ember/test-helpers/validate-error-handler', ['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  exports.default = function () {
    var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Ember.onerror;

    if (callback === undefined || callback === null) {
      return VALID;
    }

    var error = new Error('Error handler validation error!');

    var originalEmberTesting = Ember.testing;
    Ember.testing = true;
    try {
      callback(error);
    } catch (e) {
      if (e === error) {
        return VALID;
      }
    } finally {
      Ember.testing = originalEmberTesting;
    }

    return INVALID;
  };

  var VALID = Object.freeze({ isValid: true, message: null });
  var INVALID = Object.freeze({
    isValid: false,
    message: 'error handler should have re-thrown the provided error'
  });
});