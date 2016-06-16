/**
 * App model events
 */

'use strict';

import {EventEmitter} from 'events';
var App = require('../../sqldb').App;
var AppEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
AppEvents.setMaxListeners(0);

// Model events
var events = {
  'afterCreate': 'save',
  'afterUpdate': 'save',
  'afterDestroy': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  App.hook(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc, options, done) {
    AppEvents.emit(event + ':' + doc._id, doc);
    AppEvents.emit(event, doc);
    done(null);
  }
}

export default AppEvents;
