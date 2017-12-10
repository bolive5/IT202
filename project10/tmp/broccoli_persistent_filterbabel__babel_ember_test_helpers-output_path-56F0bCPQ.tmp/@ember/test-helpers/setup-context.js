define('@ember/test-helpers/setup-context', ['exports', '@ember/test-helpers/build-owner', '@ember/test-helpers/ext/rsvp', '@ember/test-helpers/settled', '@ember/test-helpers/global', '@ember/test-helpers/resolver', '@ember/test-helpers/application'], function (exports, _buildOwner, _rsvp, _settled, _global, _resolver, _application) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.setContext = setContext;
  exports.getContext = getContext;
  exports.unsetContext = unsetContext;
  exports.pauseTest = pauseTest;
  exports.resumeTest = resumeTest;

  exports.default = function (context) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    Ember.testing = true;
    setContext(context);

    return new Promise(function (resolve) {
      // ensure "real" async and not "fake" RSVP based async
      next(resolve);
    }).then(function () {
      var resolver = options.resolver;

      var buildOwnerOptions = void 0;

      // This handles precendence, specifying a specific option of
      // resolver always trumps whatever is auto-detected, then we fallback to
      // the suite-wide registrations
      //
      // At some later time this can be extended to support specifying a custom
      // engine or application...
      if (resolver) {
        buildOwnerOptions = { resolver: resolver };
      } else {
        buildOwnerOptions = {
          resolver: (0, _resolver.getResolver)(),
          application: (0, _application.getApplication)()
        };
      }

      return (0, _buildOwner.default)(buildOwnerOptions);
    }).then(function (owner) {
      context.owner = owner;

      context.set = function (key, value) {
        var ret = run(function () {
          return set(context, key, value);
        });

        return ret;
      };

      context.setProperties = function (hash) {
        var ret = run(function () {
          return setProperties(context, hash);
        });

        return ret;
      };

      context.get = function (key) {
        return get(context, key);
      };

      context.getProperties = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return getProperties(context, args);
      };

      var resume = void 0;
      context.resumeTest = function resumeTest() {
        (true && !(resume) && Ember.assert('Testing has not been paused. There is nothing to resume.', resume));

        resume();
        _global.default.resumeTest = resume = undefined;
      };

      context.pauseTest = function pauseTest() {
        console.info('Testing paused. Use `resumeTest()` to continue.'); // eslint-disable-line no-console

        return new Promise(function (resolve) {
          resume = resolve;
          _global.default.resumeTest = resumeTest;
        }, 'TestAdapter paused promise');
      };

      (0, _settled._setupAJAXHooks)();
      (0, _rsvp._setupPromiseListeners)();

      return context;
    });
  };

  var run = Ember.run;
  var next = Ember.run.next;
  var set = Ember.set;
  var setProperties = Ember.setProperties;
  var get = Ember.get;
  var getProperties = Ember.getProperties;
  var Promise = Ember.RSVP.Promise;


  var __test_context__ = void 0;

  function setContext(context) {
    __test_context__ = context;
  }

  function getContext() {
    return __test_context__;
  }

  function unsetContext() {
    __test_context__ = undefined;
  }

  function pauseTest() {
    var context = getContext();

    if (!context || typeof context.pauseTest !== 'function') {
      throw new Error('Cannot call `pauseTest` without having first called `setupTest` or `setupRenderingTest`.');
    }

    return context.pauseTest();
  }

  function resumeTest() {
    var context = getContext();

    if (!context || typeof context.resumeTest !== 'function') {
      throw new Error('Cannot call `resumeTest` without having first called `setupTest` or `setupRenderingTest`.');
    }

    return context.resumeTest();
  }

  /*
   * Responsible for:
   *
   * - sets the "global testing context" to the provided context
   * - create an owner object and set it on the provided context (e.g. this.owner)
   * - setup this.set, this.setProperties, this.get, and this.getProperties to the provided context
   * - setting up AJAX listeners
   * - setting up RSVP promise integration
   */
});