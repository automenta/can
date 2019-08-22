(() => {
    'use strict';
    const debounce = (function () {
        /**
         * lodash 3.1.1 (Custom Build) <https://lodash.com/>
         * Build: `lodash modern modularize exports="npm" -o ./`
         * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
         * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
         * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
         * Available under MIT license <https://lodash.com/license>
         */
        /** Used as the `TypeError` message for "Functions" methods. */
        const FUNC_ERROR_TEXT = 'Expected a function';

        /* Native method references for those with the same name as other `lodash` methods. */
        const nativeMax = Math.max,
            nativeNow = Date.now;

        /**
         * Gets the number of milliseconds that have elapsed since the Unix epoch
         * (1 January 1970 00:00:00 UTC).
         *
         * @static
         * @memberOf _
         * @category Date
         * @example
         *
         * _.defer(function(stamp) {
         *   console.log(_.now() - stamp);
         * }, _.now());
         * // => logs the number of milliseconds it took for the deferred function to be invoked
         */
        const now = nativeNow || Date.now;

        /**
         * Creates a debounced function that delays invoking `func` until after `wait`
         * milliseconds have elapsed since the last time the debounced function was
         * invoked. The debounced function comes with a `cancel` method to cancel
         * delayed invocations. Provide an options object to indicate that `func`
         * should be invoked on the leading and/or trailing edge of the `wait` timeout.
         * Subsequent calls to the debounced function return the result of the last
         * `func` invocation.
         *
         * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
         * on the trailing edge of the timeout only if the the debounced function is
         * invoked more than once during the `wait` timeout.
         *
         * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
         * for details over the differences between `_.debounce` and `_.throttle`.
         *
         * @static
         * @memberOf _
         * @category Function
         * @param {Function} func The function to debounce.
         * @param {number} [wait=0] The number of milliseconds to delay.
         * @param {Object} [options] The options object.
         * @param {boolean} [options.leading=false] Specify invoking on the leading
         *  edge of the timeout.
         * @param {number} [options.maxWait] The maximum time `func` is allowed to be
         *  delayed before it's invoked.
         * @param {boolean} [options.trailing=true] Specify invoking on the trailing
         *  edge of the timeout.
         * @returns {Function} Returns the new debounced function.
         * @example
         *
         * // avoid costly calculations while the window size is in flux
         * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
         *
         * // invoke `sendMail` when the click event is fired, debouncing subsequent calls
         * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
         *   'leading': true,
         *   'trailing': false
         * }));
         *
         * // ensure `batchLog` is invoked once after 1 second of debounced calls
         * var source = new EventSource('/stream');
         * jQuery(source).on('message', _.debounce(batchLog, 250, {
         *   'maxWait': 1000
         * }));
         *
         * // cancel a debounced call
         * var todoChanges = _.debounce(batchLog, 1000);
         * Object.observe(models.todo, todoChanges);
         *
         * Object.observe(models, function(changes) {
         *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {
         *     todoChanges.cancel();
         *   }
         * }, ['delete']);
         *
         * // ...at some point `models.todo` is changed
         * models.todo.completed = true;
         *
         * // ...before 1 second has passed `models.todo` is deleted
         * // which cancels the debounced `todoChanges` call
         * delete models.todo;
         */
        function debounce(func, wait, options) {
            let args,
                maxTimeoutId,
                result,
                stamp,
                thisArg,
                timeoutId,
                leadingCall,
                trailingCall,
                lastCalled = 0,
                maxWait = false,
                trailing = true;

            if (typeof func !== 'function')
                throw new TypeError(FUNC_ERROR_TEXT);

            wait = wait < 0 ? 0 : (+wait || 0);
            if (options === true) {
                var leading = true;
                trailing = false;
            } else if (isObject(options)) {
                leading = !!options.leading;
                maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
                trailing = 'trailing' in options ? !!options.trailing : trailing;
            }

            function cancel() {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                if (maxTimeoutId) {
                    clearTimeout(maxTimeoutId);
                }
                lastCalled = 0;
                maxTimeoutId = timeoutId = trailingCall = undefined;
            }

            function complete(isCalled, id) {
                if (id) {
                    clearTimeout(id);
                }
                maxTimeoutId = timeoutId = trailingCall = undefined;
                if (isCalled) {
                    lastCalled = now();
                    result = func.apply(thisArg, args);
                    if (!timeoutId && !maxTimeoutId) {
                        args = thisArg = undefined;
                    }
                }
            }

            function delayed() {
                const remaining = wait - (now() - stamp);
                if (remaining <= 0 || remaining > wait) {
                    complete(trailingCall, maxTimeoutId);
                } else {
                    timeoutId = setTimeout(delayed, remaining);
                }
            }

            function maxDelayed() {
                complete(trailing, timeoutId);
            }

            function debounced() {
                args = arguments;
                stamp = now();
                thisArg = this;
                trailingCall = trailing && (timeoutId || !leading);

                if (maxWait === false) {
                    leadingCall = leading && !timeoutId;
                } else {
                    if (!maxTimeoutId && !leading) {
                        lastCalled = stamp;
                    }
                    var remaining = maxWait - (stamp - lastCalled),
                        isCalled = remaining <= 0 || remaining > maxWait;

                    if (isCalled) {
                        if (maxTimeoutId) {
                            maxTimeoutId = clearTimeout(maxTimeoutId);
                        }
                        lastCalled = stamp;
                        result = func.apply(thisArg, args);
                    } else if (!maxTimeoutId) {
                        maxTimeoutId = setTimeout(maxDelayed, remaining);
                    }
                }
                if (isCalled && timeoutId) {
                    timeoutId = clearTimeout(timeoutId);
                } else if (!timeoutId && wait !== maxWait) {
                    timeoutId = setTimeout(delayed, wait);
                }
                if (leadingCall) {
                    isCalled = true;
                    result = func.apply(thisArg, args);
                }
                if (isCalled && !timeoutId && !maxTimeoutId) {
                    args = thisArg = undefined;
                }
                return result;
            }

            debounced.cancel = cancel;
            return debounced;
        }

        /**
         * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
         * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
         *
         * @static
         * @memberOf _
         * @category Lang
         * @param {*} value The value to check.
         * @returns {boolean} Returns `true` if `value` is an object, else `false`.
         * @example
         *
         * _.isObject({});
         * // => true
         *
         * _.isObject([1, 2, 3]);
         * // => true
         *
         * _.isObject(1);
         * // => false
         */
        function isObject(value) {
            // Avoid a V8 JIT bug in Chrome 19-20.
            // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
            const type = typeof value;
            return !!value && (type === 'object' || type === 'function');
        }

        return debounce;

    })();

    // registers the extension on a cytoscape lib ref
    const register = function (cytoscape, $, Konva) {

        // can't register if required libraries does not exist
        if (!cytoscape || !$ || !Konva) {
            return;
        }

        // var canvas;
        let stageId = 0;

        function defaults() {
            return {
                padding: 5, // spacing between node and grapples/rectangle
                undoable: true, // and if cy.undoRedo exists

                grappleSize: 8, // size of square dots
                grappleColor: "green", // color of grapples
                inactiveGrappleStroke: "inside 1px blue",
                boundingRectangle: true, // enable/disable bounding rectangle
                boundingRectangleLineDash: [4, 8], // line dash of bounding rectangle
                boundingRectangleLineColor: "red",
                boundingRectangleLineWidth: 1.5,
                zIndex: 999,

                moveSelectedNodesOnKeyEvents: function () {
                    return true;
                },

                minWidth: function (node) {
                    const data = node.data("resizeMinWidth");
                    return data ? data : 15;
                }, // a function returns min width of node
                minHeight: function (node) {
                    const data = node.data("resizeMinHeight");
                    return data ? data : 15;
                }, // a function returns min height of node

                // Getters for some style properties the defaults returns ele.css('property-name')
                // you are encouraged to override these getters
                getCompoundMinWidth: function (node) {
                    return node.css('min-width');
                },
                getCompoundMinHeight: function (node) {
                    return node.css('min-height');
                },
                getCompoundMinWidthBiasRight: function (node) {
                    return node.css('min-width-bias-right');
                },
                getCompoundMinWidthBiasLeft: function (node) {
                    return node.css('min-width-bias-left');
                },
                getCompoundMinHeightBiasTop: function (node) {
                    return node.css('min-height-bias-top');
                },
                getCompoundMinHeightBiasBottom: function (node) {
                    return node.css('min-height-bias-bottom');
                },

                // These optional function will be executed to set the width/height of a node in this extension
                // Using node.css() is not a recommended way (http://js.cytoscape.org/#eles.style) to do this. Therefore, overriding these defaults
                // so that a data field or something like that will be used to set node dimentions instead of directly calling node.css()
                // is highly recommended (Of course this will require a proper setting in the stylesheet).
                setWidth: function (node, width) {
                    node.css('width', width);
                },
                setHeight: function (node, height) {
                    node.css('height', height);
                },
                setCompoundMinWidth: function (node, minWidth) {
                    node.css('min-width', minWidth);
                },
                setCompoundMinHeight: function (node, minHeight) {
                    node.css('min-height', minHeight);
                },
                setCompoundMinWidthBiasLeft: function (node, minWidthBiasLeft) {
                    node.css('min-width-bias-left', minWidthBiasLeft);
                },
                setCompoundMinWidthBiasRight: function (node, minHeightBiasRight) {
                    node.css('min-width-bias-right', minHeightBiasRight);
                },
                setCompoundMinHeightBiasTop: function (node, minHeightBiasTop) {
                    node.css('min-height-bias-top', minHeightBiasTop);
                },
                setCompoundMinHeightBiasBottom: function (node, minHeightBiasBottom) {
                    node.css('min-height-bias-bottom', minHeightBiasBottom);
                },

                isFixedAspectRatioResizeMode: function (node) {
                    return node.is(".fixedAspectRatioResizeMode")
                },// with only 4 active grapples (at corners)
                isNoResizeMode: function (node) {
                    return node.is(".noResizeMode, :parent")
                }, // no active grapples

                cursors: { // See http://www.w3schools.com/cssref/tryit.asp?filename=trycss_cursor
                    // May take any "cursor" css property
                    default: "default", // to be set after resizing finished or mouseleave
                    inactive: "not-allowed",
                    nw: "nw-resize",
                    n: "n-resize",
                    ne: "ne-resize",
                    e: "e-resize",
                    se: "se-resize",
                    s: "s-resize",
                    sw: "sw-resize",
                    w: "w-resize"
                },

                resizeToContentFunction: undefined
            };
        }

        // Get the whole scratchpad reserved for this extension (on an element or core) or get a single property of it
        function getScratch(cyOrEle, name) {
            if (cyOrEle.scratch('_cyNodeResize') === undefined) {
                cyOrEle.scratch('_cyNodeResize', {});
            }

            const scratch = cyOrEle.scratch('_cyNodeResize');
            const retVal = (name === undefined) ? scratch : scratch[name];
            return retVal;
        }

        // Set a single property on scratchpad of an element or the core
        function setScratch(cyOrEle, name, val) {
            getScratch(cyOrEle)[name] = val;
        }

        cytoscape('core', 'nodeResize', function (opts) {

            const cy = this;

            // If options parameter is 'get' string then just return the api
            if (opts === 'get') {
                return getScratch(cy, 'api');
            }

            // the controls object represents the grapples and bounding rectangle
            // only one can exist at any time
            let controls;

            // Events to bind and unbind
            let eUnselectNode, ePositionNode, eZoom, ePan, eSelectNode, eRemoveNode, eAddNode, eFreeNode, eUndoRedo;

            const options = $.extend(true, defaults(), opts);

            const canvasElementId = 'cy-node-resize' + stageId;
            stageId++;

            const $canvasElement = $('<div id="' + canvasElementId + '"></div>');
            const $container = $(cy.container());
            $container.append($canvasElement);

            const stage = new Konva.Stage({
                container: canvasElementId,   // id of container <div>
                width: $container.width(),
                height: $container.height()
            });
            // then create layer
            const canvas = new Konva.Layer();

            // add the layer to the stage
            stage.add(canvas);

            // Resize the canvas
            const sizeCanvas = debounce(() => {
                $canvasElement
                    .attr('height', $container.height())
                    .attr('width', $container.width())
                    .css({
                        'position': 'absolute',
                        'top': 0,
                        'left': 0,
                        'z-index': '999'
                    });

                setTimeout(() => {
                    const canvasBb = $canvasElement.offset();
                    const containerBb = $container.offset();

                    $canvasElement
                        .css({
                            'top': -(canvasBb.top - containerBb.top),
                            'left': -(canvasBb.left - containerBb.left)
                        })
                    ;
                    canvas.getStage().setWidth($container.width());
                    canvas.getStage().setHeight($container.height());
                }, 0);

            }, 250);

            sizeCanvas();

            $(window).on('resize', sizeCanvas);


            /**
             * ResizeControls is the object representing the graphical controls presented to the user.
             * The controls are composed of:
             * - 1 BoundingRectangle object
             * - 8 Grapple objects
             *
             * It is assumed that only one can exist at any time, and it is sotred in the global variable: controls.
             */
            const ResizeControls = function (node) {
                this.parent = node;
                this.boundingRectangle = new BoundingRectangle(node);
                const grappleLocations = ["topleft", "topcenter", "topright", "centerright", "bottomright",
                    "bottomcenter", "bottomleft", "centerleft"];
                this.grapples = [];
                for (let i = 0; i < grappleLocations.length; i++) {
                    const location = grappleLocations[i];
                    let isActive = true;
                    if (options.isNoResizeMode(node) || (options.isFixedAspectRatioResizeMode(node) && location.indexOf("center") >= 0)) {
                        isActive = false;
                    }
                    this.grapples.push(new Grapple(node, this, location, isActive))
                }
                ;

                //if (options.resizeToContentCueEnabled(node) && !options.isNoResizeMode(node))
                //this.resizeCue = new ResizeCue(node, this);

                canvas.draw();
            };

            ResizeControls.prototype.update = function () {
                this.boundingRectangle.update();
                for (let i = 0; i < this.grapples.length; i++) {
                    this.grapples[i].update();
                }

                //var node = this.boundingRectangle.parent;
                //var rcEnabled = options.resizeToContentCueEnabled(node);
                /*if (this.resizeCue && rcEnabled)
                    this.resizeCue.update();
                else if (this.resizeCue && !rcEnabled) {
                    this.resizeCue.unbindEvents();
                    this.resizeCue.shape.destroy();
                    delete this.resizeCue;
                } else if (!this.resizeCue && rcEnabled)
                    this.resizeCue = new ResizeCue(node, this);*/

                canvas.draw();
            };

            ResizeControls.prototype.remove = function () {
                this.boundingRectangle.shape.destroy();
                delete this.boundingRectangle;
                for (let i = 0; i < this.grapples.length; i++) {
                    this.grapples[i].unbindAllEvents();
                    this.grapples[i].shape.destroy();
                }
                ;
                delete this.grapples;
                /*if (this.resizeCue) {
                    this.resizeCue.unbindEvents();
                    this.resizeCue.shape.destroy();
                    delete this.resizeCue;
                }*/
                canvas.draw();
            };

            function BoundingRectangle(node) {
                this.parent = node;
                this.shape = null;

                const nodePos = node.renderedPosition();
                const width = node.renderedOuterWidth() + getPadding();
                const height = node.renderedOuterHeight() + getPadding();
                const startPos = {
                    x: nodePos.x - width / 2,
                    y: nodePos.y - height / 2
                };
                // create our shape
                const rect = new Konva.Rect({
                    x: startPos.x,
                    y: startPos.y,
                    width: width,
                    height: height,
                    stroke: options.boundingRectangleLineColor,
                    strokeWidth: options.boundingRectangleLineWidth,
                    dash: options.boundingRectangleLineDash,
                    shadowForStrokeEnabled: false,
                    strokeHitEnabled: false,
                    shadowEnabled: false,
                    perfectDrawEnabled: false,
                    transformsEnabled: 'position'
                });
                rect.intersects = function () {
                    return false;
                };
                rect.transformsEnabled = 'position'; //https://konvajs.org/docs/performance/All_Performance_Tips.html
                rect.listening(false);
                // add the shape to the layer
                canvas.add(rect);
                this.shape = rect;
            };

            BoundingRectangle.prototype.update = function () {
                const nodePos = this.parent.renderedPosition();
                const width = this.parent.renderedOuterWidth() + getPadding();
                const height = this.parent.renderedOuterHeight() + getPadding();
                const startPos = {
                    x: nodePos.x - width / 2,
                    y: nodePos.y - height / 2
                };
                this.shape.x(startPos.x);
                this.shape.y(startPos.y);
                this.shape.width(width);
                this.shape.height(height);
            };

            var Grapple = function (node, resizeControls, location, isActive) {
                this.parent = node;
                this.location = location;
                this.isActive = isActive;
                this.resizeControls = resizeControls;

                const nodePos = node.renderedPosition();
                const width = node.renderedOuterWidth() + getPadding();
                const height = node.renderedOuterHeight() + getPadding();
                const startPos = {
                    x: nodePos.x - width / 2,
                    y: nodePos.y - height / 2
                };

                const gs = getGrappleSize(node);

                this.shape = new Konva.Rect({
                    width: gs,
                    height: gs,
                    storkeWidth: 0,
                    fill: options.grappleColor,
                    shadowForStrokeEnabled: false,
                    strokeHitEnabled: false,
                    shadowEnabled: false,
                    perfectDrawEnabled: false,
                    transformsEnabled: 'position'
                });


                this.shape.intersects = function () {
                    return false;
                };
                this.shape.getIntersection = function () {
                    return false;
                };

                this.updateShapePosition(startPos, width, height, gs);
                canvas.add(this.shape);

                if (this.isActive) {
                    this.bindActiveEvents();
                } else {
                    this.bindInactiveEvents();
                }
            };

            Grapple.prototype.bindInactiveEvents = function () {
                const self = this; // keep reference to the grapple object inside events

                const eMouseEnter = function (event) {
                    event.target.getStage().container().style.cursor = options.cursors.inactive;
                };

                const eMouseLeave = function (event) {
                    let s = event.target.getStage();
                    if (s !== undefined)
                        s.container().style.cursor = options.cursors.default;
                };

                const eMouseDown = function (event) {
                    cy.boxSelectionEnabled(false);
                    cy.panningEnabled(false);
                    cy.autounselectify(true);
                    cy.autoungrabify(true);
                    canvas.getStage().on("contentTouchend contentMouseup", eMouseUp);
                };
                const eMouseUp = function (event) {
                    // stage scope
                    canvas.getStage().off("contentTouchend contentMouseup", eMouseUp);
                    cy.boxSelectionEnabled(true);
                    cy.panningEnabled(true);
                    cy.autounselectify(false);
                    cy.autoungrabify(false);
                };

                this.shape.on("mouseenter", eMouseEnter);
                this.shape.on("mouseleave", eMouseLeave);
                this.shape.on("touchstart mousedown", eMouseDown);
            };


            const getWidthFcn = node => {
                if (node.isParent())
                    return Math.max(parseFloat(options.getCompoundMinWidth(node)), childrenBBox.w);
                else
                    return node.width();
            };

            const getHeightFcn = node => {
                if (node.isParent())
                    return Math.max(parseFloat(options.getCompoundMinHeight(node)), childrenBBox.h);
                else
                    return node.height();
            };
            Grapple.prototype.bindActiveEvents = function () {
                const self = this; // keep reference to the grapple object inside events
                const node = self.parent;

                const setWidthFcn = node.isParent() ? options.setCompoundMinWidth : options.setWidth;
                const setHeightFcn = node.isParent() ? options.setCompoundMinHeight : options.setHeight;


                const startPos = {};
                let tmpActiveBgOpacity;
                // BBox of children of a node. Of course is valid if the node is a compound.
                let childrenBBox;

                // helper object
                const translateLocation = {
                    "topleft": "nw",
                    "topcenter": "n",
                    "topright": "ne",
                    "centerright": "e",
                    "bottomright": "se",
                    "bottomcenter": "s",
                    "bottomleft": "sw",
                    "centerleft": "w"
                };

                const releaseFn = () => { // for some reason, making node unselectable before doesn't work
                    cy.autounselectify(false); // think about those 2
                    cy.autoungrabify(false);
                };

                var eMouseDown = function (event) {
                    childrenBBox = node.children().boundingBox();
                    // If the node is a compound use setCompoundMinWidth() and setCompoundMinHeight()
                    // instead of setWidth() and setHeight()


                    cy.trigger("noderesize.resizestart", [self.location, self.parent]);
                    /*let cyStyle = cy.style();
                    if (cyStyle._private.coreStyle["active-bg-opacity"]) {
                        tmpActiveBgOpacity = cyStyle._private.coreStyle["active-bg-opacity"].value;
                    }
                    cyStyle
                        .selector("core")
                        .style("active-bg-opacity", 0)
                        .update();*/
                    let stage = event.target.getStage();
                    stage.container().style.cursor = options.cursors[translateLocation[self.location]];
                    const currentPointer = stage.getPointerPosition();
                    startPos.x = currentPointer.x;
                    startPos.y = currentPointer.y;
                    cy.boxSelectionEnabled(false);
                    cy.panningEnabled(false);
                    cy.autounselectify(true);
                    cy.autoungrabify(true);
                    self.shape.off("mouseenter", eMouseEnter);
                    self.shape.off("mouseleave", eMouseLeave);
                    const canvasStage = canvas.getStage();
                    canvasStage.on("contentTouchend contentMouseup", eMouseUp);
                    canvasStage.on("contentTouchmove contentMousemove", eMouseMove);
                }, eMouseUp = event => {
                    cy.style()
                        .selector("core")
                        .style("active-bg-opacity", tmpActiveBgOpacity)
                        .update();
                    self.shape.getStage().container().style.cursor = options.cursors.default;
                    cy.boxSelectionEnabled(true);
                    cy.panningEnabled(true);
                    setTimeout(releaseFn, 0);
                    cy.trigger("noderesize.resizeend", [self.location, self.parent]);
                    canvas.getStage().off("contentTouchend contentMouseup", eMouseUp);
                    canvas.getStage().off("contentTouchmove contentMousemove", eMouseMove);
                    self.shape.on("mouseenter", eMouseEnter);
                    self.shape.on("mouseleave", eMouseLeave);

                }, eMouseMove = function (event) {
                    const location = self.location;
                    const isCrossCorners = (location === "topright" || location === "bottomleft");
                    const isAspectedMode = options.isFixedAspectRatioResizeMode(node);
                    if ((isAspectedMode && location.indexOf("center") >= 0) ||
                        options.isNoResizeMode(node))
                        return;

                    const currentPointer = self.shape.getStage().getPointerPosition();
                    const x = currentPointer.x;
                    const y = currentPointer.y;

                    let zoom = cy.zoom();
                    let xHeight = (y - startPos.y) / zoom;
                    let xWidth = (x - startPos.x) / zoom;


                    //cy.batch(() => {


                    const widthFn = getWidthFcn(node);
                    const heightFn = getHeightFcn(node);
                    if (isAspectedMode) {
                        const aspectRatio = heightFn / widthFn;

                        //var aspectedSize = Math.min(xWidth, xHeight);

                        if (xWidth > xHeight)
                            xHeight = xWidth * aspectRatio * (isCrossCorners ? -1 : 1);
                        else
                            xWidth = xHeight / aspectRatio * (isCrossCorners ? -1 : 1);
                    }

                    const nodePos = node.position();
                    let newX = nodePos.x;
                    let newY = nodePos.y;
                    let isXresized = false;
                    let isYresized = false;

                    // These are valid if the node is a compound
                    // Initial (before resize) sizes of compound
                    //var initialWidth, initialHeight;
                    // Extra space between node width and children bbox. Causes by 'min-width' and/or 'min-height'
                    let extraLeft = 0, extraRight = 0, extraTop = 0, extraBottom = 0;

                    let parent = node.isParent();
                    if (parent) {
                        const totalExtraWidth = widthFn - childrenBBox.w;
                        const totalExtraHeight = heightFn - childrenBBox.h;

                        if (totalExtraWidth > 0) {
                            extraLeft = totalExtraWidth * parseFloat(options.getCompoundMinWidthBiasLeft(node)) /
                                (parseFloat(options.getCompoundMinWidthBiasLeft(node)) + parseFloat(options.getCompoundMinWidthBiasRight(node)));
                            extraRight = totalExtraWidth - extraLeft;
                        }

                        if (totalExtraHeight > 0) {
                            extraTop = totalExtraHeight * parseFloat(options.getCompoundMinHeightBiasTop(node)) /
                                (parseFloat(options.getCompoundMinHeightBiasTop(node)) + parseFloat(options.getCompoundMinHeightBiasBottom(node)));
                            extraBottom = totalExtraHeight - extraTop;
                        }
                    }

                    if (location.startsWith("top")) {
                        // Note that xHeight is supposed to be negative
                        // If the node is simple min height should not be exceed, else if it is compound
                        // then extraTop should not be negative
                        if (heightFn - xHeight > options.minHeight(node)
                            && (!parent || extraTop - xHeight >= 0)) {
                            newY = nodePos.y + xHeight / 2;
                            isYresized = true;
                            setHeightFcn(node, heightFn - xHeight);
                        } else if (isAspectedMode)
                            return;
                    } else if (location.startsWith("bottom")) {
                        // Note that xHeight is supposed to be positive
                        // If the node is simple min height should not be exceed, else if it is compound
                        // then extraBottom should not be negative
                        if (heightFn + xHeight > options.minHeight(node)
                            && (!parent || extraBottom + xHeight >= 0)) {
                            newY = nodePos.y + xHeight / 2;
                            isYresized = true;
                            setHeightFcn(node, heightFn + xHeight);
                        } else if (isAspectedMode)
                            return;
                    }

                    if (location.endsWith("left") && widthFn - xWidth > options.minWidth(node)
                        && (!parent || extraLeft - xWidth >= 0)) {
                        // Note that xWidth is supposed to be negative
                        // If the node is simple min width should not be exceed, else if it is compound
                        // then extraLeft should not be negative
                        newX = nodePos.x + xWidth / 2;
                        isXresized = true;
                        setWidthFcn(node, widthFn - xWidth);
                    } else if (location.endsWith("right") && widthFn + xWidth > options.minWidth(node)
                        && (!parent || extraRight + xWidth >= 0)) {
                        // Note that xWidth is supposed to be positive
                        // If the node is simple min width should not be exceed, else if it is compound
                        // then extraRight should not be negative
                        newX = nodePos.x + xWidth / 2;
                        isXresized = true;
                        setWidthFcn(node, widthFn + xWidth);
                    }

                    // this will trigger a position event, leading to useless redraw.
                    // TODO find a way to avoid that
                    if (!parent && (isXresized || isYresized)) {
                        node.position({x: newX, y: newY});
                    }

                    // If the node is a compound we need to handle left/right/top/bottom biases conditionally
                    if (parent) {
                        var totalExtraWidth = widthFn - childrenBBox.w;
                        var totalExtraHeight = heightFn - childrenBBox.h;

                        if (isXresized && totalExtraWidth > 0) {
                            // If the location ends with right the left extra space should be fixed
                            // else if it ends with left the right extra space should be fixed
                            if (location.endsWith('right')) {
                                extraRight = totalExtraWidth - extraLeft;
                            } else if (location.endsWith('left')) {
                                extraLeft = totalExtraWidth - extraRight;
                            }

                            const biasLeft = extraLeft / (extraLeft + extraRight) * 100;
                            if (biasLeft < 0) return; //negative horizontal
                            const biasRight = 100 - biasLeft;
                            if (biasRight < 0) return; //negative horizontal

                            options.setCompoundMinWidthBiasLeft(node, biasLeft + '%');
                            options.setCompoundMinWidthBiasRight(node, biasRight + '%');
                        }

                        if (isYresized && totalExtraHeight > 0) {
                            // If the location starts with top the bottom extra space should be fixed
                            // else if it starst with bottom the top extra space should be fixed
                            if (location.startsWith('top')) {
                                extraTop = totalExtraHeight - extraBottom;
                            } else if (location.startsWith('bottom')) {
                                extraBottom = totalExtraHeight - extraTop;
                            }

                            const biasTop = extraTop / (extraTop + extraBottom) * 100;
                            if (biasTop < 0) return; //negative vertical
                            const biasBottom = 100 - biasTop;
                            if (biasBottom < 0) return; //negative vertical


                            options.setCompoundMinHeightBiasTop(node, biasTop + '%');
                            options.setCompoundMinHeightBiasBottom(node, biasBottom + '%');
                        }
                    }
                    //});

                    if (this.x === startPos.x || this.y === startPos.y) {
                        //TODO add timeout
                        return;
                    }

                    startPos.x = x;
                    startPos.y = y;
                    self.resizeControls.update(); // redundant update if the position has changed just before

                    cy.trigger("noderesize.resizedrag", [location, node]);
                }, eMouseEnter = function (event) {
                    event.target.getStage().container().style.cursor = options.cursors[translateLocation[self.location]];
                }, eMouseLeave = function (event) {
                    const s = event.target.getStage();
                    if (s !== undefined)
                        s.container().style.cursor = options.cursors.default;
                };


                this.shape.on("mouseenter", eMouseEnter);
                this.shape.on("mouseleave", eMouseLeave);
                this.shape.on("touchstart mousedown", eMouseDown);
            };

            Grapple.prototype.update = function () {
                const nodePos = this.parent.renderedPosition();
                const width = this.parent.renderedOuterWidth() + getPadding();
                const height = this.parent.renderedOuterHeight() + getPadding();
                const startPos = {
                    x: nodePos.x - width / 2,
                    y: nodePos.y - height / 2
                };

                const gs = getGrappleSize(this.parent);

                this.shape.width(gs);
                this.shape.height(gs);
                this.updateShapePosition(startPos, width, height, gs);
            };

            Grapple.prototype.unbindAllEvents = function () {
                this.shape.off('mouseenter');
                this.shape.off('mouseleave');
                this.shape.off('touchstart mousedown');
            };

            Grapple.prototype.updateShapePosition = function (startPos, width, height, gs) {
                switch (this.location) {
                    case "topleft":
                        this.shape.x(startPos.x - gs / 2);
                        this.shape.y(startPos.y - gs / 2);
                        break;
                    case "topcenter":
                        this.shape.x(startPos.x + width / 2 - gs / 2);
                        this.shape.y(startPos.y - gs / 2);
                        break;
                    case "topright":
                        this.shape.x(startPos.x + width - gs / 2);
                        this.shape.y(startPos.y - gs / 2);
                        break;
                    case "centerright":
                        this.shape.x(startPos.x + width - gs / 2);
                        this.shape.y(startPos.y + height / 2 - gs / 2);
                        break;
                    case "bottomright":
                        this.shape.x(startPos.x + width - gs / 2);
                        this.shape.y(startPos.y + height - gs / 2);
                        break;
                    case "bottomcenter":
                        this.shape.x(startPos.x + width / 2 - gs / 2);
                        this.shape.y(startPos.y + height - gs / 2);
                        break;
                    case "bottomleft":
                        this.shape.x(startPos.x - gs / 2);
                        this.shape.y(startPos.y + height - gs / 2);
                        break;
                    case "centerleft":
                        this.shape.x(startPos.x - gs / 2);
                        this.shape.y(startPos.y + height / 2 - gs / 2);
                        break;
                }
            };


            var getGrappleSize = function (node) {
                return Math.max(1, cy.zoom()) * options.grappleSize * Math.min(node.width() / 25, node.height() / 25, 1);
            };


            var getPadding = () => options.padding * Math.max(1, cy.zoom());

            var defaultResizeToContent = function (params) {
                const self = params.self;
                const node = self.parent;

                const setWidthFcn = node.isParent() ? options.setCompoundMinWidth : options.setWidth;
                const setHeightFcn = node.isParent() ? options.setCompoundMinHeight : options.setHeight;

                if (params.firstTime) {
                    delete params.firstTime;

                    params.oldWidth = node.width();
                    params.oldHeight = node.height();

                    const context = document.createElement('canvas').getContext("2d");
                    const style = node.style();
                    context.font = style['font-size'] + " " + style['font-family'];

                    const labelText = (style['label']).split("\n");

                    let minWidth = 0;
                    let minHeight = Math.max(context.measureText('M').width * 1.1, 30);
                    labelText.forEach(function (text) {
                        const textWidth = context.measureText(text).width;
                        if (minWidth < textWidth)
                            minWidth = textWidth;
                    });

                    if (minWidth !== 0) {
                        if (typeof options.isFixedAspectRatioResizeMode === 'function' &&
                            options.isFixedAspectRatioResizeMode(node)) {

                            const ratio = node.width() / node.height();
                            const tmpW = (minWidth < minHeight) ? minWidth : minHeight * ratio;
                            const tmpH = (minWidth < minHeight) ? minWidth / ratio : minHeight;

                            if (tmpW >= minWidth && tmpH >= minHeight) {
                                minWidth = tmpW;
                                minHeight = tmpH;
                            } else {
                                minWidth = (minWidth < minHeight) ? minHeight * ratio : minWidth;
                                minHeight = (minWidth < minHeight) ? minHeight : minWidth / ratio;
                            }
                        }

                        setWidthFcn(node, minWidth * 1.1);
                        setHeightFcn(node, minHeight * 1.1);
                    }

                    node.unselect();

                    return params;
                } else {
                    const newWidth = params.oldWidth;
                    const newHeight = params.oldHeight;

                    params.oldWidth = node.width();
                    params.oldHeight = node.height();

                    setWidthFcn(node, newWidth);
                    setHeightFcn(node, newHeight);

                    node.unselect();

                    return params;
                }

            };

            function getTopMostNodes(nodes) {
                const nodesMap = {};
                for (let i = 0; i < nodes.length; i++) {
                    nodesMap[nodes[i].id()] = true;
                }
                const roots = nodes.filter(function (ele, i) {
                    if (typeof ele === "number") {
                        ele = i;
                    }
                    let parent = ele.parent()[0];
                    while (parent != null) {
                        if (nodesMap[parent.id()]) {
                            return false;
                        }
                        parent = parent.parent()[0];
                    }
                    return true;
                });

                return roots;
            }

            function moveNodes(posDiff, nodes) {
                // Get the descendants of top most nodes. Note that node.position() can move just the simple nodes.
                const topMostNodes = getTopMostNodes(nodes);
                const nodesToMove = topMostNodes.union(topMostNodes.descendants());

                nodesToMove.positions((node, i) => {
                    if ("number" === typeof node) {
                        node = i;
                    }
                    const oldX = node.position("x"), oldY = node.position("y");
                    return node.isParent() ? {
                        x: oldX, y: oldY
                    } : {
                        x: oldX + posDiff.x, y: oldY + posDiff.y
                    };
                });
            }

            let selectedNodesToMove;
            let nodesMoving = false;

            const keys = {};

            function keyDown(e) {

                const shouldMove = typeof options.moveSelectedNodesOnKeyEvents === 'function'
                    ? options.moveSelectedNodesOnKeyEvents() : options.moveSelectedNodesOnKeyEvents;

                if (!shouldMove) {
                    return;
                }

                //Checks if the tagname is textarea or input
                const tn = document.activeElement.tagName;
                if (tn !== "TEXTAREA" && tn !== "INPUT") {
                    keys[e.keyCode] = true;
                    switch (e.keyCode) {
                        case 37:
                        case 39:
                        case 38:
                        case 40: // Arrow keys
                        case 32:
                            e.preventDefault();
                            break; // Space
                        default:
                            break; // do not block other keys
                    }


                    if (e.keyCode < '37' || e.keyCode > '40') {
                        return;
                    }

                    if (!nodesMoving) {
                        selectedNodesToMove = cy.nodes(':selected');
                        cy.trigger("noderesize.movestart", [selectedNodesToMove]);
                        nodesMoving = true;
                    }
                    if (e.altKey && e.which === '38') {
                        // up arrow and alt
                        moveNodes({x: 0, y: -1}, selectedNodesToMove);
                    } else if (e.altKey && e.which === '40') {
                        // down arrow and alt
                        moveNodes({x: 0, y: 1}, selectedNodesToMove);
                    } else if (e.altKey && e.which === '37') {
                        // left arrow and alt
                        moveNodes({x: -1, y: 0}, selectedNodesToMove);
                    } else if (e.altKey && e.which === '39') {
                        // right arrow and alt
                        moveNodes({x: 1, y: 0}, selectedNodesToMove);
                    } else if (e.shiftKey && e.which === '38') {
                        // up arrow and shift
                        moveNodes({x: 0, y: -10}, selectedNodesToMove);
                    } else if (e.shiftKey && e.which === '40') {
                        // down arrow and shift
                        moveNodes({x: 0, y: 10}, selectedNodesToMove);
                    } else if (e.shiftKey && e.which === '37') {
                        // left arrow and shift
                        moveNodes({x: -10, y: 0}, selectedNodesToMove);

                    } else if (e.shiftKey && e.which === '39') {
                        // right arrow and shift
                        moveNodes({x: 10, y: 0}, selectedNodesToMove);
                    } else if (e.keyCode === '38') {
                        // up arrow
                        moveNodes({x: 0, y: -3}, selectedNodesToMove);
                    } else if (e.keyCode === '40') {
                        // down arrow
                        moveNodes({x: 0, y: 3}, selectedNodesToMove);
                    } else if (e.keyCode === '37') {
                        // left arrow
                        moveNodes({x: -3, y: 0}, selectedNodesToMove);
                    } else if (e.keyCode === '39') {
                        //right arrow
                        moveNodes({x: 3, y: 0}, selectedNodesToMove);
                    }
                }
            }

            function keyUp(e) {
                if (e.keyCode < '37' || e.keyCode > '40') {
                    return;
                }

                const shouldMove = typeof options.moveSelectedNodesOnKeyEvents === 'function'
                    ? options.moveSelectedNodesOnKeyEvents() : options.moveSelectedNodesOnKeyEvents;

                if (!shouldMove) {
                    return;
                }

                cy.trigger("noderesize.moveend", [selectedNodesToMove]);
                selectedNodesToMove = undefined;
                nodesMoving = false;
            }

            const unBindEvents = function () {
                cy.off("unselect", "node", eUnselectNode);
                cy.off("position", "node", ePositionNode);
                cy.off("position", "node", eFreeNode);
                cy.off("zoom", eZoom);
                cy.off("pan", ePan);
                //cy.off("style", "node", redraw);
                cy.off("select", "node", eSelectNode);
                cy.off("remove", "node", eRemoveNode);
                cy.off("add", "node", eAddNode);
                cy.off("afterUndo afterRedo", eUndoRedo);
            };

            const bindEvents = function () {
                // declare old and current positions
                let oldPos = {x: undefined, y: undefined};
                let currentPos = {x: 0, y: 0};
                cy.on("unselect", "node", eUnselectNode = function (e) {
                    // reinitialize old and current compound positions
                    oldPos = {x: undefined, y: undefined};
                    currentPos = {x: 0, y: 0};

                    if (controls) {
                        controls.remove();
                        controls = null;
                    }

                    const selectedNodes = cy.nodes(':selected');
                    if (selectedNodes.size() === 1) {
                        controls = new ResizeControls(selectedNodes);
                    }
                });

                cy.on("select", "node", eSelectNode = function (e) {
                    const node = e.target;

                    if (controls) {
                        controls.remove();
                        controls = null;
                    }

                    const selectedNodes = cy.nodes(':selected');
                    if (selectedNodes.size() === 1) {
                        controls = new ResizeControls(selectedNodes);
                    }
                });

                cy.on("remove", "node", eRemoveNode = function (e) {
                    const node = e.target;
                    // If a selected node is removed we should regard this event just like an unselect event
                    if (node.selected()) {
                        eUnselectNode(e);
                    }
                });

                // is this useful ? adding a node never seems to select it, and it causes a bug when changing parent
                cy.on("add", "node", eAddNode = function (e) {
                    const node = e.target;
                    // If a selected node is added we should regard this event just like a select event
                    if (node.selected()) {
                        eSelectNode(e);
                    }
                });

                // listens for position event and refreshGrapples if necessary
                cy.on("position", "node", ePositionNode = function (e) {
                    if (controls) {
                        // It seems that parent.position() doesn't always give consistent result.
                        // But calling it here makes the results consistent, by updating it to the correct value, somehow.
                        // Maybe there is some cache on cytoscape side preventing a position update.
                        //var trash_var = controls.parent.position(); // trash_var isn't used, this line apparently makes position() correct
                        if (e.target.id() === controls.parent.id()) {
                            controls.update();
                        }
                        // if the position of compund changes by repositioning its children's
                        // Note: position event for compound is not triggered in this case
                        else if (currentPos.x !== oldPos.x || currentPos.y !== oldPos.y) {
                            currentPos = controls.parent.position();
                            controls.update();
                            oldPos = {x: currentPos.x, y: currentPos.y};
                        }
                    }
                });

                cy.on("zoom", eZoom = function () {
                    if (controls) {
                        controls.update();
                    }
                });

                cy.on("pan", ePan = function () {
                    if (controls) {
                        controls.update();
                    }
                });

                cy.on("afterUndo afterRedo", eUndoRedo = function () {
                    if (controls) {
                        controls.update();
                        oldPos = {x: undefined, y: undefined};
                    }
                });

                document.addEventListener("keydown", keyDown, true);
                document.addEventListener("keyup", keyUp, true);
            };
            bindEvents();

            if (cy.undoRedo && options.undoable) {

                let param;
                let moveparam;

                // On resize start fill param object to use it on undo/redo
                cy.on("noderesize.resizestart", function (e, type, node) {
                    param = {
                        node: node,
                        css: {}
                    };

                    // Some parts of param object are dependant on whether the node is a compound or simple node
                    if (node.isParent()) {
                        param.css.minWidth = parseFloat(options.getCompoundMinWidth(node));
                        param.css.minHeight = parseFloat(options.getCompoundMinHeight(node));
                        param.css.biasLeft = options.getCompoundMinWidthBiasLeft(node);
                        param.css.biasRight = options.getCompoundMinWidthBiasRight(node);
                        param.css.biasTop = options.getCompoundMinHeightBiasTop(node);
                        param.css.biasBottom = options.getCompoundMinHeightBiasBottom(node);
                    } else {
                        param.css.width = node.width();
                        param.css.height = node.height();
                        param.position = $.extend({}, node.position());
                    }
                });

                // On resize end do the action using param object
                cy.on("noderesize.resizeend", function (e, type, node) {
                    param.firstTime = true;
                    cy.undoRedo().do("resize", param);
                    param = undefined;
                });

                cy.on("noderesize.movestart", function (e, nodes) {
                    if (nodes[0] !== undefined) {
                        moveparam = {
                            firstTime: true,
                            firstNodePosition: {
                                x: nodes[0].position('x'),
                                y: nodes[0].position('y')
                            },
                            nodes: nodes
                        }
                    }
                });

                cy.on("noderesize.moveend", function (e, nodes) {
                    if (moveparam !== undefined) {
                        const initialPos = moveparam.firstNodePosition;

                        const n0px = nodes[0].position('x');
                        const n0py = nodes[0].position('y');
                        moveparam.positionDiff = {
                            x: -n0px + initialPos.x,
                            y: -n0py + initialPos.y
                        };

                        delete moveparam.firstNodePosition;

                        cy.undoRedo().do("noderesize.move", moveparam);
                        moveparam = undefined;
                    }
                });

                cy.on("noderesize.resizetocontent", function (e, self) {
                    const params = {
                        self: self,
                        firstTime: true
                    };

                    cy.undoRedo().do("resizeToContent", params);
                });

                const resizeDo = function (arg) {
                    // If this is the first time it means that resize is already performed through user interaction.
                    // In this case just removing the first time parameter is enough.
                    if (arg.firstTime) {
                        if (controls) {
                            controls.update(); // refresh grapplers after node resize
                        }
                        delete arg.firstTime;
                        return arg;
                    }

                    const node = arg.node;

                    const css = {};
                    // Result object is to be returned for undo/redo cases
                    const result = {
                        node: node,
                        css: css
                    };


                    // Some parts of result object is dependent on whether the node is simple or compound
                    if (node.isParent()) {
                        css.minWidth = parseFloat(options.getCompoundMinWidth(node));
                        css.minHeight = parseFloat(options.getCompoundMinHeight(node));
                        css.biasLeft = options.getCompoundMinWidthBiasLeft(node);
                        css.biasRight = options.getCompoundMinWidthBiasRight(node);
                        css.biasTop = options.getCompoundMinHeightBiasTop(node);
                        css.biasBottom = options.getCompoundMinHeightBiasBottom(node);
                    } else {
                        css.width = node.width();
                        css.height = node.height();
                        result.position = $.extend({}, node.position());
                    }

                    // Perform actual undo/redo part using args object
                    //cy.startBatch();

                    if (node.isParent()) {
                        options.setCompoundMinWidth(node, arg.css.minWidth);
                        options.setCompoundMinHeight(node, arg.css.minHeight);
                        options.setCompoundMinWidthBiasLeft(node, arg.css.biasLeft);
                        options.setCompoundMinWidthBiasRight(node, arg.css.biasRight);
                        options.setCompoundMinHeightBiasTop(node, arg.css.biasTop);
                        options.setCompoundMinHeightBiasBottom(node, arg.css.biasBottom);
                    } else {
                        node.position(arg.position);
                        options.setWidth(node, arg.css.width);
                        options.setHeight(node, arg.css.height);
                    }

                    //cy.endBatch();

                    if (controls)
                        controls.update(); // refresh grapplers after node resize

                    return result;
                };

                const moveDo = function (arg) {
                    if (arg.firstTime) {
                        delete arg.firstTime;
                        return arg;
                    }

                    const nodes = arg.nodes;

                    const positionDiff = arg.positionDiff;

                    const result = {
                        nodes: nodes,
                        positionDiff: {
                            x: -positionDiff.x,
                            y: -positionDiff.y
                        }
                    };


                    moveNodes(positionDiff, nodes);

                    return result;
                };

                cy.undoRedo().action("resize", resizeDo, resizeDo);
                cy.undoRedo().action("noderesize.move", moveDo, moveDo);
                cy.undoRedo().action("resizeToContent", defaultResizeToContent, defaultResizeToContent);
            }

            const api = {}; // The extension api to be exposed

            api.refreshGrapples = function () {
                if (controls) {
                    // We need to remove old controls and create a new one rather then just updating controls
                    // We need this because the parent may change status and become resizable or not-resizable
                    controls.remove();
                    controls = new ResizeControls(controls.parent);
                }
            };
            // Simply remove grapples even if node is selected
            api.removeGrapples = function () {
                if (controls) {
                    controls.remove();
                    controls = null;
                }
            };

            setScratch(cy, 'api', api);

            return api; // Return the api
        });

    };

    if (typeof module !== 'undefined' && module.exports) { // expose as a commonjs module
        module.exports = register;
    }

    if (typeof define !== 'undefined' && define.amd) { // expose as an amd/requirejs module
        define('cytoscape-node-resize', function () {
            return register;
        });
    }

    if (typeof cytoscape !== 'undefined' && typeof jQuery !== "undefined" && typeof Konva !== "undefined") { // expose to global cytoscape (i.e. window.cytoscape)
        register(cytoscape, jQuery, Konva);
    }

})();