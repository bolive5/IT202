

var EmberError = Ember.Error;

var SOURCE_POINTER_REGEXP = /^\/?data\/(attributes|relationships)\/(.*)/;
var SOURCE_POINTER_PRIMARY_REGEXP = /^\/?data/;
var PRIMARY_ATTRIBUTE_KEY = 'base';

/**
  A `DS.AdapterError` is used by an adapter to signal that an error occurred
  during a request to an external API. It indicates a generic error, and
  subclasses are used to indicate specific error states. The following
  subclasses are provided:

  - `DS.InvalidError`
  - `DS.TimeoutError`
  - `DS.AbortError`
  - `DS.UnauthorizedError`
  - `DS.ForbiddenError`
  - `DS.NotFoundError`
  - `DS.ConflictError`
  - `DS.ServerError`

  To create a custom error to signal a specific error state in communicating
  with an external API, extend the `DS.AdapterError`. For example if the
  external API exclusively used HTTP `503 Service Unavailable` to indicate
  it was closed for maintenance:

  ```app/adapters/maintenance-error.js
  import DS from 'ember-data';

  export default DS.AdapterError.extend({ message: "Down for maintenance." });
  ```

  This error would then be returned by an adapter's `handleResponse` method:

  ```app/adapters/application.js
  import DS from 'ember-data';
  import MaintenanceError from './maintenance-error';

  export default DS.JSONAPIAdapter.extend({
    handleResponse(status) {
      if (503 === status) {
        return new MaintenanceError();
      }

      return this._super(...arguments);
    }
  });
  ```

  And can then be detected in an application and used to send the user to an
  `under-maintenance` route:

  ```app/routes/application.js
  import Ember from 'ember';
  import MaintenanceError from '../adapters/maintenance-error';

  export default Ember.Route.extend({
    actions: {
      error(error, transition) {
        if (error instanceof MaintenanceError) {
          this.transitionTo('under-maintenance');
          return;
        }

        // ...other error handling logic
      }
    }
  });
  ```

  @class AdapterError
  @namespace DS
*/
export function AdapterError(errors) {
  var message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Adapter operation failed';

  this.isAdapterError = true;
  EmberError.call(this, message);

  this.errors = errors || [{
    title: 'Adapter Error',
    detail: message
  }];
}

function extendFn(ErrorClass) {
  return function () {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        defaultMessage = _ref.message;

    return extend(ErrorClass, defaultMessage);
  };
}

function extend(ParentErrorClass, defaultMessage) {
  var ErrorClass = function ErrorClass(errors, message) {
    (true && !(Array.isArray(errors || [])) && Ember.assert('`AdapterError` expects json-api formatted errors array.', Array.isArray(errors || [])));

    ParentErrorClass.call(this, errors, message || defaultMessage);
  };
  ErrorClass.prototype = Object.create(ParentErrorClass.prototype);
  ErrorClass.extend = extendFn(ErrorClass);

  return ErrorClass;
}

AdapterError.prototype = Object.create(EmberError.prototype);

AdapterError.extend = extendFn(AdapterError);

/**
  A `DS.InvalidError` is used by an adapter to signal the external API
  was unable to process a request because the content was not
  semantically correct or meaningful per the API. Usually this means a
  record failed some form of server side validation. When a promise
  from an adapter is rejected with a `DS.InvalidError` the record will
  transition to the `invalid` state and the errors will be set to the
  `errors` property on the record.

  For Ember Data to correctly map errors to their corresponding
  properties on the model, Ember Data expects each error to be
  a valid json-api error object with a `source/pointer` that matches
  the property name. For example if you had a Post model that
  looked like this.

  ```app/models/post.js
  import DS from 'ember-data';

  export default DS.Model.extend({
    title: DS.attr('string'),
    content: DS.attr('string')
  });
  ```

  To show an error from the server related to the `title` and
  `content` properties your adapter could return a promise that
  rejects with a `DS.InvalidError` object that looks like this:

  ```app/adapters/post.js
  import Ember from 'ember';
  import DS from 'ember-data';

  export default DS.RESTAdapter.extend({
    updateRecord() {
      // Fictional adapter that always rejects
      return Ember.RSVP.reject(new DS.InvalidError([
        {
          detail: 'Must be unique',
          source: { pointer: '/data/attributes/title' }
        },
        {
          detail: 'Must not be blank',
          source: { pointer: '/data/attributes/content'}
        }
      ]));
    }
  });
  ```

  Your backend may use different property names for your records the
  store will attempt extract and normalize the errors using the
  serializer's `extractErrors` method before the errors get added to
  the the model. As a result, it is safe for the `InvalidError` to
  wrap the error payload unaltered.

  @class InvalidError
  @namespace DS
*/
export var InvalidError = extend(AdapterError, 'The adapter rejected the commit because it was invalid');

/**
  A `DS.TimeoutError` is used by an adapter to signal that a request
  to the external API has timed out. I.e. no response was received from
  the external API within an allowed time period.

  An example use case would be to warn the user to check their internet
  connection if an adapter operation has timed out:

  ```app/routes/application.js
  import Ember from 'ember';
  import DS from 'ember-data';

  const { TimeoutError } = DS;

  export default Ember.Route.extend({
    actions: {
      error(error, transition) {
        if (error instanceof TimeoutError) {
          // alert the user
          alert('Are you still connected to the internet?');
          return;
        }

        // ...other error handling logic
      }
    }
  });
  ```

  @class TimeoutError
  @namespace DS
*/
export var TimeoutError = extend(AdapterError, 'The adapter operation timed out');

/**
  A `DS.AbortError` is used by an adapter to signal that a request to
  the external API was aborted. For example, this can occur if the user
  navigates away from the current page after a request to the external API
  has been initiated but before a response has been received.

  @class AbortError
  @namespace DS
*/
export var AbortError = extend(AdapterError, 'The adapter operation was aborted');

/**
  A `DS.UnauthorizedError` equates to a HTTP `401 Unauthorized` response
  status. It is used by an adapter to signal that a request to the external
  API was rejected because authorization is required and has failed or has not
  yet been provided.

  An example use case would be to redirect the user to a log in route if a
  request is unauthorized:

  ```app/routes/application.js
  import Ember from 'ember';
  import DS from 'ember-data';

  const { UnauthorizedError } = DS;

  export default Ember.Route.extend({
    actions: {
      error(error, transition) {
        if (error instanceof UnauthorizedError) {
          // go to the sign in route
          this.transitionTo('login');
          return;
        }

        // ...other error handling logic
      }
    }
  });
  ```

  @class UnauthorizedError
  @namespace DS
*/
export var UnauthorizedError = extend(AdapterError, 'The adapter operation is unauthorized');

/**
  A `DS.ForbiddenError` equates to a HTTP `403 Forbidden` response status.
  It is used by an adapter to signal that a request to the external API was
  valid but the server is refusing to respond to it. If authorization was
  provided and is valid, then the authenticated user does not have the
  necessary permissions for the request.

  @class ForbiddenError
  @namespace DS
*/
export var ForbiddenError = extend(AdapterError, 'The adapter operation is forbidden');

/**
  A `DS.NotFoundError` equates to a HTTP `404 Not Found` response status.
  It is used by an adapter to signal that a request to the external API
  was rejected because the resource could not be found on the API.

  An example use case would be to detect if the user has entered a route
  for a specific model that does not exist. For example:

  ```app/routes/post.js
  import Ember from 'ember';
  import DS from 'ember-data';

  const { NotFoundError } = DS;

  export default Ember.Route.extend({
    model(params) {
      return this.get('store').findRecord('post', params.post_id);
    },

    actions: {
      error(error, transition) {
        if (error instanceof NotFoundError) {
          // redirect to a list of all posts instead
          this.transitionTo('posts');
        } else {
          // otherwise let the error bubble
          return true;
        }
      }
    }
  });
  ```

  @class NotFoundError
  @namespace DS
*/
export var NotFoundError = extend(AdapterError, 'The adapter could not find the resource');

/**
  A `DS.ConflictError` equates to a HTTP `409 Conflict` response status.
  It is used by an adapter to indicate that the request could not be processed
  because of a conflict in the request. An example scenario would be when
  creating a record with a client generated id but that id is already known
  to the external API.

  @class ConflictError
  @namespace DS
*/
export var ConflictError = extend(AdapterError, 'The adapter operation failed due to a conflict');

/**
  A `DS.ServerError` equates to a HTTP `500 Internal Server Error` response
  status. It is used by the adapter to indicate that a request has failed
  because of an error in the external API.

  @class ServerError
  @namespace DS
*/
export var ServerError = extend(AdapterError, 'The adapter operation failed due to a server error');

/**
  Convert an hash of errors into an array with errors in JSON-API format.

  ```javascript
  import DS from 'ember-data';

  const { errorsHashToArray } = DS;

  let errors = {
    base: 'Invalid attributes on saving this record',
    name: 'Must be present',
    age: ['Must be present', 'Must be a number']
  };

  let errorsArray = errorsHashToArray(errors);
  // [
  //   {
  //     title: "Invalid Document",
  //     detail: "Invalid attributes on saving this record",
  //     source: { pointer: "/data" }
  //   },
  //   {
  //     title: "Invalid Attribute",
  //     detail: "Must be present",
  //     source: { pointer: "/data/attributes/name" }
  //   },
  //   {
  //     title: "Invalid Attribute",
  //     detail: "Must be present",
  //     source: { pointer: "/data/attributes/age" }
  //   },
  //   {
  //     title: "Invalid Attribute",
  //     detail: "Must be a number",
  //     source: { pointer: "/data/attributes/age" }
  //   }
  // ]
  ```

  @method errorsHashToArray
  @public
  @namespace
  @for DS
  @param {Object} errors hash with errors as properties
  @return {Array} array of errors in JSON-API format
*/
export function errorsHashToArray(errors) {
  var out = [];

  if (Ember.isPresent(errors)) {
    Object.keys(errors).forEach(function (key) {
      var messages = Ember.makeArray(errors[key]);
      for (var i = 0; i < messages.length; i++) {
        var title = 'Invalid Attribute';
        var pointer = '/data/attributes/' + key;
        if (key === PRIMARY_ATTRIBUTE_KEY) {
          title = 'Invalid Document';
          pointer = '/data';
        }
        out.push({
          title: title,
          detail: messages[i],
          source: {
            pointer: pointer
          }
        });
      }
    });
  }

  return out;
}

/**
  Convert an array of errors in JSON-API format into an object.

  ```javascript
  import DS from 'ember-data';

  const { errorsArrayToHash } = DS;

  let errorsArray = [
    {
      title: 'Invalid Attribute',
      detail: 'Must be present',
      source: { pointer: '/data/attributes/name' }
    },
    {
      title: 'Invalid Attribute',
      detail: 'Must be present',
      source: { pointer: '/data/attributes/age' }
    },
    {
      title: 'Invalid Attribute',
      detail: 'Must be a number',
      source: { pointer: '/data/attributes/age' }
    }
  ];

  let errors = errorsArrayToHash(errorsArray);
  // {
  //   "name": ["Must be present"],
  //   "age":  ["Must be present", "must be a number"]
  // }
  ```

  @method errorsArrayToHash
  @public
  @namespace
  @for DS
  @param {Array} errors array of errors in JSON-API format
  @return {Object}
*/
export function errorsArrayToHash(errors) {
  var out = {};

  if (Ember.isPresent(errors)) {
    errors.forEach(function (error) {
      if (error.source && error.source.pointer) {
        var key = error.source.pointer.match(SOURCE_POINTER_REGEXP);

        if (key) {
          key = key[2];
        } else if (error.source.pointer.search(SOURCE_POINTER_PRIMARY_REGEXP) !== -1) {
          key = PRIMARY_ATTRIBUTE_KEY;
        }

        if (key) {
          out[key] = out[key] || [];
          out[key].push(error.detail || error.title);
        }
      }
    });
  }

  return out;
}