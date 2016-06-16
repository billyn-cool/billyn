/**
 * Permit model events
 */

'use strict';

import {EventEmitter} from 'events';
var Permit = require('../../sqldb').Permit;
var PermitEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
PermitEvents.setMaxListeners(0);

// Model events
var events = {
  'afterCreate': 'save',
  'afterUpdate': 'save',
  'afterDestroy': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Permit.hook(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc, options, done) {
    PermitEvents.emit(event + ':' + doc._id, doc);
    PermitEvents.emit(event, doc);
    done(null);
  }
}

export default PermitEvents;
