/**
 * Attribute model events
 */

'use strict';

import {EventEmitter} from 'events';
var Attribute = require('../../sqldb').Attribute;
var AttributeEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
AttributeEvents.setMaxListeners(0);

// Model events
var events = {
  'afterCreate': 'save',
  'afterUpdate': 'save',
  'afterDestroy': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Attribute.hook(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc, options, done) {
    AttributeEvents.emit(event + ':' + doc._id, doc);
    AttributeEvents.emit(event, doc);
    done(null);
  }
}

export default AttributeEvents;
