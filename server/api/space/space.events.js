/**
 * Space model events
 */

'use strict';

import {EventEmitter} from 'events';
var Space = require('../../sqldb').Space;
var SpaceEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
SpaceEvents.setMaxListeners(0);

// Model events
var events = {
  'afterCreate': 'save',
  'afterUpdate': 'save',
  'afterDestroy': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Space.hook(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc, options, done) {
    SpaceEvents.emit(event + ':' + doc._id, doc);
    SpaceEvents.emit(event, doc);
    done(null);
  }
}

export default SpaceEvents;
