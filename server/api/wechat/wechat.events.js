/**
 * Wechat model events
 */

'use strict';

import {EventEmitter} from 'events';
var Wechat = require('../../sqldb').Wechat;
var WechatEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
WechatEvents.setMaxListeners(0);

// Model events
var events = {
  'afterCreate': 'save',
  'afterUpdate': 'save',
  'afterDestroy': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Wechat.hook(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc, options, done) {
    WechatEvents.emit(event + ':' + doc._id, doc);
    WechatEvents.emit(event, doc);
    done(null);
  }
}

export default WechatEvents;
