var classyxin = require('classyxin');

var Events = classyxin.createClass({

    init: function () {
        var events = this;
        events._events = {};
    },

    /**
     *
     * @param {String} eventName
     * @param {Function} handler
     * @param {*} [data]
     * @param {Object} [ctx]
     * @return {Events}
     */
    on: function (eventName, handler, data, ctx) {
        var events = this;
        var event = events._events[eventName];

        if (!event) {
            event = {
                isProcessed: false,

                handlers: [],
                data: [],
                ctx: [],

                handlersForAdd: [],
                dataForAdd: [],
                ctxForAdd: [],

                handlersForRemove: [],
                ctxForRemove: []

            };
            events._events[eventName] = event;
        }

        if (event.isProcessed) {
            event.handlersForAdd.push(handler);
            event.dataForAdd.push(data);
            event.ctxForAdd.push(ctx);
        } else {
            event.handlers.push(handler);
            event.data.push(data);
            event.ctx.push(ctx);
        }
        return events;
    },

    /**
     *
     * @param {String} eventName
     * @param {Function} handler
     * @param {Object} ctx
     * @return {Events}
     */
    off: function (eventName, handler, ctx) {
        var events = this;
        var event = events._events[eventName];

        if (event) {
            if (event.isProcessed) {
                event.handlersForRemove.push(handler);
                event.ctxForRemove.push(ctx);
            } else {
                var eventHandlers = event.handlers;
                var eventData = event.data;
                var eventCtx = event.ctx;

                var i = eventHandlers.length;
                for (; i-- ;) {
                    if ((eventHandlers[i] === handler)
                        && (eventCtx[i] === ctx)) {
                        eventHandlers.splice(i, 1);
                        eventData.splice(i, 1);
                        eventCtx.splice(i, 1);
                        break;
                    }
                }

                if (eventHandlers.length === 0) {
                    events._events[eventName] = null;
                }
            }

        }

        return events;
    },

    /**
     *
     * @param {String} eventName
     * @param {*|...} [eventParameter]
     * @return {Events}
     */
    trigger: function (eventName, eventParameter) {
        var events = this;
        var event = events._events[eventName];

        if (event) {
            event.isProcessed = true;

            var eventHandlers = event.handlers;
            var eventData = event.data;
            var eventCtx = event.ctx;

            var u;

            var args = arguments;
            var parameters = [];

            var i = 1;
            var iMax = args.length;

            for (; i < iMax; i += 1) {
                parameters.push(args[i]);
            }

            for (i = 0, iMax = eventHandlers.length; i < iMax; i += 1) {
                var data = eventData[i];
                if ((data !== u)
                    && (data !== null)) {
                    parameters.unshift(data);
                    eventHandlers[i].apply(eventCtx[i] || events, parameters);
                    parameters.shift();
                } else {
                    eventHandlers[i].apply(eventCtx[i] || events, parameters);
                }
            }

            var handlersForAdd = event.handlersForAdd;
            if (handlersForAdd.length !== 0) {

                var dataForAdd = event.dataForAdd;
                var ctxForAdd = event.ctxForAdd;
                for (i = 0, iMax = handlersForAdd.length; i < iMax; i += 1) {
                    eventHandlers.push(handlersForAdd[i]);
                    eventData.push(dataForAdd[i]);
                    eventCtx.push(ctxForAdd[i]);
                }

                handlersForAdd.length = 0;
                dataForAdd.length = 0;
                ctxForAdd.length = 0;
            }

            var handlersForRemove = event.handlersForRemove;
            var ctxForRemove = event.ctxForRemove;
            if (handlersForRemove.length !== 0) {
                for (i = 0, iMax = handlersForRemove.length; i < iMax; i += 1) {
                    var jMax = eventHandlers.length;
                    if (jMax !== 0) {
                        for (var j = 0; j < jMax; j += 1) {
                            if ((eventHandlers[j] === handlersForRemove[i])
                                && (eventCtx[j] === ctxForRemove[i])) {
                                eventHandlers.splice(j, 1);
                                eventData.splice(j, 1);
                                eventCtx.splice(j, 1);
                                break;
                            }
                        }
                    } else {
                        break;
                    }
                }
                handlersForRemove.length = 0;
                ctxForRemove.length = 0;
            }

            if (eventHandlers.length === 0) {
                events._events[eventName] = null;
            } else {
                event.isProcessed = false;
            }

        }

        return events;
    }

});

module.exports = Events;