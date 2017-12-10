define('@ember/test-helpers/setup-rendering-context', ['exports', '@ember/test-helpers/global', '@ember/test-helpers/setup-context'], function (exports, _global, _setupContext) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.RENDERING_CLEANUP = undefined;
  exports.render = render;
  exports.clearRender = clearRender;

  exports.default = function (context) {
    var guid = guidFor(context);

    var testElementContainer = document.getElementById('ember-testing-container');
    var fixtureResetValue = testElementContainer.innerHTML;

    RENDERING_CLEANUP[guid] = [function () {
      testElementContainer.innerHTML = fixtureResetValue;
    }];

    return new Promise(function (resolve) {
      // ensure "real" async and not "fake" RSVP based async
      next(function () {
        var owner = context.owner;

        // When the host app uses `setApplication` (instead of `setResolver`) the event dispatcher has
        // already been setup via `applicationInstance.boot()` in `./build-owner`. If using
        // `setResolver` (instead of `setApplication`) a "mock owner" is created by extending
        // `Ember._ContainerProxyMixin` and `Ember._RegistryProxyMixin` in this scenario we need to
        // manually start the event dispatcher.

        if (owner._emberTestHelpersMockOwner) {
          var dispatcher = owner.lookup('event_dispatcher:main') || Ember.EventDispatcher.create();
          dispatcher.setup({}, '#ember-testing');
        }

        var OutletView = owner.factoryFor ? owner.factoryFor('view:-outlet') : owner._lookupFactory('view:-outlet');
        var OutletTemplate = owner.lookup('template:-outlet');
        var toplevelView = OutletView.create();
        RENDERING_CLEANUP[guid].push(function () {
          return toplevelView.destroy();
        });

        var hasOutletTemplate = Boolean(OutletTemplate);
        var outletState = {
          render: {
            owner: owner,
            into: undefined,
            outlet: 'main',
            name: 'application',
            controller: context,
            ViewClass: undefined,
            template: OutletTemplate
          },

          outlets: {}
        };

        var element = void 0,
            hasRendered = void 0;
        var templateId = 0;

        if (hasOutletTemplate) {
          run(function () {
            toplevelView.setOutletState(outletState);
          });
        }

        context.render = function render(template) {
          if (!template) {
            throw new Error('you must pass a template to `render()`');
          }

          // ensure context.element is reset until after rendering has completed
          element = undefined;

          return new Promise(function asyncRender(resolve) {
            // manually enter async land, so that rendering itself is always async (even though
            // Ember <= 2.18 do not require async rendering)
            next(function asyncRenderSetup() {
              templateId += 1;
              var templateFullName = 'template:-undertest-' + templateId;
              owner.register(templateFullName, template);
              var stateToRender = {
                owner: owner,
                into: undefined,
                outlet: 'main',
                name: 'index',
                controller: context,
                ViewClass: undefined,
                template: owner.lookup(templateFullName),
                outlets: {}
              };

              if (hasOutletTemplate) {
                stateToRender.name = 'index';
                outletState.outlets.main = { render: stateToRender, outlets: {} };
              } else {
                stateToRender.name = 'application';
                outletState = { render: stateToRender, outlets: {} };
              }

              toplevelView.setOutletState(outletState);
              if (!hasRendered) {
                // TODO: make this id configurable
                run(toplevelView, 'appendTo', '#ember-testing');
                hasRendered = true;
              }

              // using next here because the actual rendering does not happen until
              // the renderer detects it is dirty (which happens on backburner's end
              // hook), see the following implementation details:
              //
              // * [view:outlet](https://github.com/emberjs/ember.js/blob/f94a4b6aef5b41b96ef2e481f35e07608df01440/packages/ember-glimmer/lib/views/outlet.js#L129-L145) manually dirties its own tag upon `setOutletState`
              // * [backburner's custom end hook](https://github.com/emberjs/ember.js/blob/f94a4b6aef5b41b96ef2e481f35e07608df01440/packages/ember-glimmer/lib/renderer.js#L145-L159) detects that the current revision of the root is no longer the latest, and triggers a new rendering transaction
              next(function asyncUpdateElementAfterRender() {
                // ensure the element is based on the wrapping toplevel view
                // Ember still wraps the main application template with a
                // normal tagged view
                //
                // In older Ember versions (2.4) the element itself is not stable,
                // and therefore we cannot update the `this.element` until after the
                // rendering is completed
                element = document.querySelector('#ember-testing > .ember-view');

                resolve();
              });
            });
          });
        };

        Object.defineProperty(context, 'element', {
          enumerable: true,
          configurable: true,
          get: function get() {
            return element;
          }
        });

        if (_global.default.jQuery) {
          context.$ = function $(selector) {
            // emulates Ember internal behavor of `this.$` in a component
            // https://github.com/emberjs/ember.js/blob/v2.5.1/packages/ember-views/lib/views/states/has_element.js#L18
            return selector ? _global.default.jQuery(selector, element) : _global.default.jQuery(element);
          };
        }

        context.clearRender = function clearRender() {
          return new Promise(function async_clearRender(resolve) {
            element = undefined;

            next(function async_clearRender() {
              toplevelView.setOutletState({
                render: {
                  owner: owner,
                  into: undefined,
                  outlet: 'main',
                  name: 'application',
                  controller: context,
                  ViewClass: undefined,
                  template: undefined
                },
                outlets: {}
              });

              // RE: next usage, see detailed comment above
              next(resolve);
            });
          });
        };

        resolve(context);
      });
    });
  };

  var guidFor = Ember.guidFor;
  var run = Ember.run;
  var next = Ember.run.next;
  var Promise = Ember.RSVP.Promise;
  var RENDERING_CLEANUP = exports.RENDERING_CLEANUP = Object.create(null);

  function render(template) {
    var context = (0, _setupContext.getContext)();

    if (!context || typeof context.render !== 'function') {
      throw new Error('Cannot call `render` without having first called `setupRenderingContext`.');
    }

    return context.render(template);
  }

  function clearRender() {
    var context = (0, _setupContext.getContext)();

    if (!context || typeof context.clearRender !== 'function') {
      throw new Error('Cannot call `clearRender` without having first called `setupRenderingContext`.');
    }

    return context.clearRender();
  }

  /*
   * Responsible for:
   *
   * - Creating a basic rendering setup (e.g. setting up the main outlet view)
   * - Adding `this.render` to the provided context
   * - Adding `this.clearRender` to the provided context
   */
});