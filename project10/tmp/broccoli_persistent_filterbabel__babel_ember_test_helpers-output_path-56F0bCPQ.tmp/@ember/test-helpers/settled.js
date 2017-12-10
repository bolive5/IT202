define('@ember/test-helpers/settled', ['exports', '@ember/test-helpers/global'], function (exports, _global) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports._teardownAJAXHooks = _teardownAJAXHooks;
  exports._setupAJAXHooks = _setupAJAXHooks;
  exports.getState = getState;
  exports.isSettled = isSettled;
  exports.default = settled;

  var _slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  var run = Ember.run;
  var EmberPromise = Ember.RSVP.Promise;
  var jQuery = Ember.$;


  var requests = void 0;
  function incrementAjaxPendingRequests(_, xhr) {
    requests.push(xhr);
  }

  function decrementAjaxPendingRequests(_, xhr) {
    // In most Ember versions to date (current version is 2.16) RSVP promises are
    // configured to flush in the actions queue of the Ember run loop, however it
    // is possible that in the future this changes to use "true" micro-task
    // queues.
    //
    // The entire point here, is that _whenever_ promises are resolved, this
    // counter will decrement. In the specific case of AJAX, this means that any
    // promises chained off of `$.ajax` will properly have their `.then` called
    // _before_ this is decremented (and testing continues)
    EmberPromise.resolve().then(function () {
      for (var i = 0; i < requests.length; i++) {
        if (xhr === requests[i]) {
          requests.splice(i, 1);
        }
      }
    });
  }

  function _teardownAJAXHooks() {
    if (!jQuery) {
      return;
    }

    jQuery(document).off('ajaxSend', incrementAjaxPendingRequests);
    jQuery(document).off('ajaxComplete', decrementAjaxPendingRequests);
  }

  function _setupAJAXHooks() {
    requests = [];

    if (!jQuery) {
      return;
    }

    jQuery(document).on('ajaxSend', incrementAjaxPendingRequests);
    jQuery(document).on('ajaxComplete', decrementAjaxPendingRequests);
  }

  var _internalCheckWaiters = void 0;
  if (Ember.__loader.registry['ember-testing/test/waiters']) {
    _internalCheckWaiters = Ember.__loader.require('ember-testing/test/waiters').checkWaiters;
  }

  function checkWaiters() {
    if (_internalCheckWaiters) {
      return _internalCheckWaiters();
    } else if (Ember.Test.waiters) {
      if (Ember.Test.waiters.any(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            context = _ref2[0],
            callback = _ref2[1];

        return !callback.call(context);
      })) {
        return true;
      }
    }

    return false;
  }

  function getState() {
    var pendingRequestCount = requests !== undefined ? requests.length : 0;

    return {
      hasPendingTimers: Boolean(run.hasScheduledTimers()),
      hasRunLoop: Boolean(run.currentRunLoop),
      hasPendingWaiters: checkWaiters(),
      hasPendingRequests: pendingRequestCount > 0,
      pendingRequestCount: pendingRequestCount
    };
  }

  function isSettled(options) {
    var waitForTimers = true;
    var waitForAJAX = true;
    var waitForWaiters = true;

    if (options !== undefined) {
      waitForTimers = 'waitForTimers' in options ? options.waitForTimers : true;
      waitForAJAX = 'waitForAJAX' in options ? options.waitForAJAX : true;
      waitForWaiters = 'waitForWaiters' in options ? options.waitForWaiters : true;
    }

    var _getState = getState(),
        hasPendingTimers = _getState.hasPendingTimers,
        hasRunLoop = _getState.hasRunLoop,
        hasPendingRequests = _getState.hasPendingRequests,
        hasPendingWaiters = _getState.hasPendingWaiters;

    if (waitForTimers && (hasPendingTimers || hasRunLoop)) {
      return false;
    }

    if (waitForAJAX && hasPendingRequests) {
      return false;
    }

    if (waitForWaiters && hasPendingWaiters) {
      return false;
    }

    return true;
  }

  function settled(options) {
    return new EmberPromise(function (resolve) {
      var watcher = _global.default.setInterval(function () {
        var settled = isSettled(options);
        if (settled) {
          // Stop polling
          _global.default.clearInterval(watcher);

          // Synchronously resolve the promise
          run(null, resolve);
        }
      }, 10);
    });
  }
});