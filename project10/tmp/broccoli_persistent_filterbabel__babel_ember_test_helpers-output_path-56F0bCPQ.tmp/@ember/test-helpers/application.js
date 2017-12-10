define('@ember/test-helpers/application', ['exports', '@ember/test-helpers/resolver'], function (exports, _resolver) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.setApplication = setApplication;
  exports.getApplication = getApplication;


  var __application__;

  function setApplication(application) {
    __application__ = application;

    if (!(0, _resolver.getResolver)()) {
      var Resolver = application.Resolver;
      var resolver = Resolver.create({ namespace: application });

      (0, _resolver.setResolver)(resolver);
    }
  }

  function getApplication() {
    return __application__;
  }
});