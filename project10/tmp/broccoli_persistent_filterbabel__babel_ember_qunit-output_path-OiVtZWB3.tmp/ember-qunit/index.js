define('ember-qunit/index', ['exports', 'ember-qunit/legacy-2-x/module-for', 'ember-qunit/legacy-2-x/module-for-component', 'ember-qunit/legacy-2-x/module-for-model', 'ember-qunit/adapter', '@ember/test-helpers', 'qunit', 'ember-qunit/test-loader'], function (exports, _moduleFor, _moduleForComponent, _moduleForModel, _adapter, _testHelpers, _qunit, _testLoader) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.loadTests = exports.todo = exports.only = exports.skip = exports.test = exports.module = exports.resumeTest = exports.pauseTest = exports.settled = exports.clearRender = exports.render = exports.setResolver = exports.QUnitAdapter = exports.moduleForModel = exports.moduleForComponent = exports.moduleFor = undefined;
  Object.defineProperty(exports, 'moduleFor', {
    enumerable: true,
    get: function () {
      return _moduleFor.default;
    }
  });
  Object.defineProperty(exports, 'moduleForComponent', {
    enumerable: true,
    get: function () {
      return _moduleForComponent.default;
    }
  });
  Object.defineProperty(exports, 'moduleForModel', {
    enumerable: true,
    get: function () {
      return _moduleForModel.default;
    }
  });
  Object.defineProperty(exports, 'QUnitAdapter', {
    enumerable: true,
    get: function () {
      return _adapter.default;
    }
  });
  Object.defineProperty(exports, 'setResolver', {
    enumerable: true,
    get: function () {
      return _testHelpers.setResolver;
    }
  });
  Object.defineProperty(exports, 'render', {
    enumerable: true,
    get: function () {
      return _testHelpers.render;
    }
  });
  Object.defineProperty(exports, 'clearRender', {
    enumerable: true,
    get: function () {
      return _testHelpers.clearRender;
    }
  });
  Object.defineProperty(exports, 'settled', {
    enumerable: true,
    get: function () {
      return _testHelpers.settled;
    }
  });
  Object.defineProperty(exports, 'pauseTest', {
    enumerable: true,
    get: function () {
      return _testHelpers.pauseTest;
    }
  });
  Object.defineProperty(exports, 'resumeTest', {
    enumerable: true,
    get: function () {
      return _testHelpers.resumeTest;
    }
  });
  Object.defineProperty(exports, 'module', {
    enumerable: true,
    get: function () {
      return _qunit.module;
    }
  });
  Object.defineProperty(exports, 'test', {
    enumerable: true,
    get: function () {
      return _qunit.test;
    }
  });
  Object.defineProperty(exports, 'skip', {
    enumerable: true,
    get: function () {
      return _qunit.skip;
    }
  });
  Object.defineProperty(exports, 'only', {
    enumerable: true,
    get: function () {
      return _qunit.only;
    }
  });
  Object.defineProperty(exports, 'todo', {
    enumerable: true,
    get: function () {
      return _qunit.todo;
    }
  });
  Object.defineProperty(exports, 'loadTests', {
    enumerable: true,
    get: function () {
      return _testLoader.loadTests;
    }
  });
  exports.setupTest = setupTest;
  exports.setupRenderingTest = setupRenderingTest;
  exports.setupTestContainer = setupTestContainer;
  exports.startTests = startTests;
  exports.setupTestAdapter = setupTestAdapter;
  exports.start = start;
  function setupTest(hooks, options) {
    hooks.beforeEach(function (assert) {
      var _this = this;

      return (0, _testHelpers.setupContext)(this, options).then(function () {
        var originalPauseTest = _this.pauseTest;
        _this.pauseTest = function QUnit_pauseTest() {
          assert.timeout(-1); // prevent the test from timing out

          return originalPauseTest.call(this);
        };
      });
    });

    hooks.afterEach(function () {
      return (0, _testHelpers.teardownContext)(this);
    });
  }

  function setupRenderingTest(hooks, options) {
    setupTest(hooks, options);

    hooks.beforeEach(function () {
      return (0, _testHelpers.setupRenderingContext)(this);
    });

    hooks.afterEach(function () {
      return (0, _testHelpers.teardownRenderingContext)(this);
    });
  }

  /**
     Uses current URL configuration to setup the test container.
  
     * If `?nocontainer` is set, the test container will be hidden.
     * If `?dockcontainer` or `?devmode` are set the test container will be
       absolutely positioned.
     * If `?devmode` is set, the test container will be made full screen.
  
     @method setupTestContainer
   */
  function setupTestContainer() {
    var testContainer = document.getElementById('ember-testing-container');
    if (!testContainer) {
      return;
    }

    var params = _qunit.default.urlParams;

    var containerVisibility = params.nocontainer ? 'hidden' : 'visible';
    var containerPosition = params.dockcontainer || params.devmode ? 'fixed' : 'relative';

    if (params.devmode) {
      testContainer.className = ' full-screen';
    }

    testContainer.style.visibility = containerVisibility;
    testContainer.style.position = containerPosition;

    var qunitContainer = document.getElementById('qunit');
    if (params.dockcontainer) {
      qunitContainer.style.marginBottom = window.getComputedStyle(testContainer).height;
    }
  }

  /**
     Instruct QUnit to start the tests.
     @method startTests
   */
  function startTests() {
    _qunit.default.start();
  }

  /**
     Sets up the `Ember.Test` adapter for usage with QUnit 2.x.
  
     @method setupTestAdapter
   */
  function setupTestAdapter() {
    Ember.Test.adapter = _adapter.default.create();
  }

  /**
     @method start
     @param {Object} [options] Options to be used for enabling/disabling behaviors
     @param {Boolean} [options.loadTests] If `false` tests will not be loaded automatically.
     @param {Boolean} [options.setupTestContainer] If `false` the test container will not
     be setup based on `devmode`, `dockcontainer`, or `nocontainer` URL params.
     @param {Boolean} [options.startTests] If `false` tests will not be automatically started
     (you must run `QUnit.start()` to kick them off).
     @param {Boolean} [options.setupTestAdapter] If `false` the default Ember.Test adapter will
     not be updated.
   */
  function start() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    if (options.loadTests !== false) {
      (0, _testLoader.loadTests)();
    }

    if (options.setupTestContainer !== false) {
      setupTestContainer();
    }

    if (options.setupTestAdapter !== false) {
      setupTestAdapter();
    }

    if (options.startTests !== false) {
      startTests();
    }
  }
});