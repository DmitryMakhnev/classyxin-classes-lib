var Events = require('classes-lib').Events;
var classyxin = require('classyxin');

describe('Events', function () {

    it('is define', function () {
        expect(Events).toBeDefined();
    });

    it('is constructor', function () {
        expect(Events).toEqual(jasmine.any(Function));
    });

    describe('check instance', function () {
        var events = new Events();

        it('has method Events.on', function () {
            expect(events.on).toEqual(jasmine.any(Function));
        });

        it('has method Events.off', function () {
            expect(events.off).toEqual(jasmine.any(Function));
        });

        it('has method Events.trigger', function () {
            expect(events.trigger).toEqual(jasmine.any(Function));
        });
    });

    describe('simple workflow', function () {
        var events = new Events();
        var counter = 0;
        var context = null;

        function handleTestEvent (parameter) {
            counter += parameter;
            context = this;
        }

        it('correct add event', function () {
            var returnedEvents = events.on('testEvent', handleTestEvent);
            expect(returnedEvents).toBe(events);
            expect(counter).toBe(0);
        });

        it('correct trigger event', function () {
            var returnedEvents = events.trigger('testEvent', 1);
            expect(counter).toBe(1);
            expect(context).toBe(events);
            expect(returnedEvents).toBe(events);
        });

        it('correct remove event', function () {
            var returnedEvents = events.off('testEvent', handleTestEvent);
            events.trigger('testEvent', 1);
            expect(counter).toBe(1);
            expect(returnedEvents).toBe(events);
        });

    });

    describe('workflow with adding and removing events in event trigger process', function () {
        var events = new Events();
        var counter = 0;

        function handleTestEvent (parameter) {
            counter += parameter;

            events.off('testEvent', handleTestEvent2)
                .on('testEvent', handleTestEvent3);
        }

        function handleTestEvent2 (parameter) {
            counter -= parameter;
        }

        function handleTestEvent3 (parameter) {
            counter += parameter;
        }

        events.on('testEvent', handleTestEvent)
            .on('testEvent', handleTestEvent2)
            .trigger('testEvent', 1);

        var firstCounter = counter;

        it('correct trigger() result', function () {
            expect(firstCounter).toBe(0);
        });

        events.trigger('testEvent', 1);

        it('correct trigger() result, after first trigger()', function () {
            expect(counter).toBe(2);
        });

    });

    describe('workflow with data parameter', function () {

        it('correct Events.trigger with data parameter', function () {
            var events = new Events();
            var result = 10;
            var testForResult;

            function handler (data, eventParameter) {
                testForResult = data + eventParameter;
            }

            events.on('test', handler, 5)
                .trigger('test', 5);

            //noinspection JSUnusedAssignment
            expect(testForResult).toBe(result);
        });


        describe('workflow with adding and removing events in event trigger process', function () {

            it('correct data with Events.on()', function () {
                var events = new Events();
                var data = 5;
                var data2 = 3;
                var eventParameter = 1;
                var result = 16;
                var resultFomEvents = 0;

                function handler (data, parameter) {
                    events.on('test', handler2, data2);
                    resultFomEvents += data + parameter;
                }

                function handler2 (data, parameter) {
                    resultFomEvents += data + parameter;
                }

                events.on('test', handler, data)
                    .trigger('test', eventParameter)
                    .trigger('test', eventParameter);

                expect(resultFomEvents).toBe(result);

            });

            it('correct data with Events.off()', function () {
                var events = new Events();
                var data = 5;
                var data2 = 3;
                var eventParameter = 1;
                var result = 16;
                var resultFomEvents = 0;

                function handler (data, parameter) {
                    events.off('test', handler2);
                    resultFomEvents += data + parameter;
                }

                function handler2 (data, parameter) {
                    resultFomEvents += data + parameter;
                }

                events.on('test', handler, data)
                    .on('test', handler2, data2)
                    .trigger('test', eventParameter)
                    .trigger('test', eventParameter);

                expect(resultFomEvents).toBe(result);

            });

        });
    });
    
    describe('Event.trigger() with 2 and more parameters', function () {

        it('3 parameters', function () {
            var events = new Events();

            var result = 10;
            var resultFromEvent = 0;

            function handler (parameter1, parameter2, parameter3) {
                resultFromEvent = parameter1 + parameter2 + parameter3;
            }

            events.on('test', handler)
                .trigger('test', 5, 3, 2);

            expect(result).toBe(resultFromEvent);
        });

        it('3 parameters with data', function () {
            var events = new Events();

            var result = 14;
            var resultFromEvent = 0;

            function handler (data, parameter1, parameter2, parameter3) {
                resultFromEvent = data + parameter1 + parameter2 + parameter3;
            }

            events.on('test', handler, 4)
                .trigger('test', 5, 3, 2);

            expect(result).toBe(resultFromEvent);
        });

    });

    describe('workflow with context', function () {

        it('correct with Event.on()', function () {
            var events = new Events();
            var object = {};
            var eventContext;

            function eventHandler () {
                eventContext = this;
            }

            events.on('test', eventHandler, null, object)
                .trigger('test');

            //noinspection JSUnusedAssignment
            expect(eventContext).toBe(object);
        });

        describe('remove handler by context', function () {
            var events = new Events();
            var ctx1 = {
                id: '1'
            };
            var ctx2 = {
                id: '2'
            };
            var result = '122';
            var eventResult = '';
            var parametersResult = '112';
            var eventParametersResult = '';

            function handler (parameter) {
                eventResult += this.id;
                eventParametersResult += parameter;
            }

            events.on('test', handler, null, ctx1)
                .on('test', handler, null, ctx2)
                .trigger('test', '1')
                .off('test', handler, ctx1)
                .trigger('test', '2');

            it('correct contexts', function () {
                expect(eventResult).toBe(result);
            });

            it('correct parameters', function () {
                expect(eventParametersResult).toBe(parametersResult);
            });

        });

        describe('workflow with adding and removing events in event trigger process', function () {
            it('correct data with Events.on()', function () {
                var events = new Events();
                var ctx = {};
                var resultCtx;

                function handler () {
                    events.on('test', handler2, null, ctx);
                }

                function handler2 () {
                    resultCtx = this;
                }

                events.on('test', handler)
                    .trigger('test')
                    .trigger('test');

                //noinspection JSUnusedAssignment
                expect(resultCtx).toBe(ctx);
            });

            it('correct data with Events.off()', function () {
                var events = new Events();
                var ctx = {
                    cd: 1
                };
                var result = 9;
                var eventResult = 0;

                function handler (data) {
                    events.off('test', handler, ctx);
                    eventResult += data;
                }

                events.on('test', handler, 1, ctx)
                    .on('test', handler, 4)
                    .trigger('test')
                    .trigger('test');

                expect(eventResult).toBe(result);
            });
        });

    });

});