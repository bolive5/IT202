define("@ember/test-helpers/resolver", ["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.setResolver = setResolver;
  exports.getResolver = getResolver;
  var __resolver__;

  function setResolver(resolver) {
    __resolver__ = resolver;
  }

  function getResolver() {
    return __resolver__;
  }
});