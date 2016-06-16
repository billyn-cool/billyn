/**
 * Role model events
 */

'use strict';

import {EventEmitter} from 'events';
var Role = require('../../sqldb').Role;
var RoleEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
RoleEvents.setMaxListeners(0);

// Model events
var events = {
  'afterCreate': 'save',
  'afterUpdate': 'save',
  'afterDestroy': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Role.hook(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc, options, done) {
    RoleEvents.emit(event + ':' + doc._id, doc);
    RoleEvents.emit(event, doc);
    done(null);
  }
}

export default RoleEvents;
