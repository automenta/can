//https://github.com/kaluginserg/cytoscape-node-html-label/blob/master/src/cytoscape-node-html-label.ts

type IHAlign = "left" | "center" | "right";
type IVAlign = "top" | "center" | "bottom";
declare var module: any;
declare var define: any;
declare var cytoscape: any;

interface CytoscapeNodeHtmlParams {
    query?: string;
    halign?: IHAlign;
    valign?: IVAlign;
    halignBox?: IHAlign;
    valignBox?: IVAlign;
    cssClass?: string;
    tpl?: (d: any) => string;
}

(function () {
    "use strict";
    const $$find = function <T>(arr: T[], predicate: (a: T) => boolean) {
        if (typeof predicate !== "function") {
            throw new TypeError("predicate must be a function");
        }
        const length = arr.length;
        const thisArg = arguments[1];
        let value;

        for (let i = 0; i < length; i++) {
            value = arr[i];
            if (predicate.call(thisArg, value, i, arr)) {
                return value;
            }
        }
        return undefined;
    };

    interface ICyEventObject {
        cy: any;
        type: string;
        target: any;
    }

    interface ICytoscapeNodeHtmlPosition {
        x: number;
        y: number;
        w: number;
        h: number;
    }

    interface ILabelElement {
        data?: any;
        position?: ICytoscapeNodeHtmlPosition;
        node: HTMLElement;
    }

    interface HashTableElements {
        [key: string]: LabelElement;
    }

    class LabelElement {
        public tpl: (container: any, data: any) => void;

        private _position: number[];
        private _node: HTMLElement;
        private _align: [number, number, number, number];


        constructor({
                        node,
                        position = null,
                        data = null
                    }: ILabelElement,
                    params: CytoscapeNodeHtmlParams) {

            this.updateParams(params);
            this._node = node;

            this.initStyles(params.cssClass);

            if (data) {
                this.updateData(data);
            }
            if (position) {
                this.updatePosition(position);
            }
        }

        updateParams({
                         tpl = () => "",
                         cssClass = null,
                         halign = "center",
                         valign = "center",
                         halignBox = "center",
                         valignBox = "center"
                     }: CytoscapeNodeHtmlParams) {

            const _align = {
                "top": -.5,
                "left": -.5,
                "center": 0,
                "right": .5,
                "bottom": .5
            };

            this._align = [
                _align[halign],
                _align[valign],
                100 * (_align[halignBox] - 0.5), //pct
                100 * (_align[valignBox] - 0.5)  //pct
            ];

            this.tpl = tpl;
        }

        updateData(data: any) {
            this.tpl(this._node, data);
        }

        getNode(): HTMLElement {
            return this._node;
        }

        updatePosition(pos: ICytoscapeNodeHtmlPosition) {
            this._renderPosition(pos);
        }

        private initStyles(cssClass: string) {
            let stl = this._node.style;


            stl['pointer-events'] = 'all';
            stl.position = 'absolute';

            if (cssClass && cssClass.length)
                this._node.classList.add(cssClass);
        }

        private _renderPosition(position: ICytoscapeNodeHtmlPosition) {
            var prev = this._position;
            if (!prev)
                this._position = prev = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
            const x = position.x;// + this._align[0] * position.w;
            const y = position.y;// + this._align[1] * position.h;

            const thresh = 0.5;
            if (Math.abs(x - prev[0]) > thresh || Math.abs(y - prev[1]) > thresh) {
                prev[0] = x;
                prev[1] = y;

                //TODO cache better
                const valRel = `translate(${this._align[2]}%,${this._align[3]}%) `;
                const valAbs = `translate(${x.toFixed(0)}px,${y.toFixed(0)}px) `; //0.5 if higher res?
                const val = valRel + valAbs;

                const stl = <any>this._node.style;
                stl.webkitTransform = val;
                stl.msTransform = val;
                stl.transform = val;

            }
        }
    }

    /**
     * LabelContainer
     * Html manipulate, find and upgrade nodes
     * it don't know about cy.
     */
    class LabelContainer {
        private _elements: HashTableElements;
        private _node: HTMLElement;

        constructor(node: HTMLElement) {
            this._node = node;
            this._elements = <HashTableElements>{};
        }

        addOrUpdateElem(id: string, param: CytoscapeNodeHtmlParams, payload: { data?: any, position?: ICytoscapeNodeHtmlPosition } = {}) {

            let cur = this._elements[id];
            if (cur) {
                cur.updateParams(param);
                cur.updateData(payload.data);
                cur.updatePosition(payload.position);
            } else {
                let nodeContainer = document.createElement("div");
                //nodeContainer.style.scale = '1';
                this._node.appendChild(nodeContainer);

                this._elements[id] = new LabelElement({
                    node: nodeContainer,
                    data: payload.data,
                    position: payload.position
                }, param);
            }
        }

        removeElemById(id: string) {
            if (this._elements[id]) {
                this._node.removeChild(this._elements[id].getNode());
                delete this._elements[id];
            }
        }

        updateElemPosition(id: string, position?: ICytoscapeNodeHtmlPosition) {
            let ele = this._elements[id];
            if (ele) {
                ele.updatePosition(position);
            }
        }

        updatePanZoom({pan, zoom}: { pan: { x: number, y: number }, zoom: number }) {
            const val = `translate(${pan.x.toFixed(0)}px,${pan.y.toFixed(0)}px) scale(${zoom})`;

            const stl = <any>this._node.style;
            stl.webkitTransform = val;
            stl.msTransform = val;
            stl.transform = val;
        }
    }

    function cyNodeHtmlLabel(_cy: any, params: CytoscapeNodeHtmlParams[]) {
        const _params = (!params || typeof params !== "object") ? [] : params;
        const labels = createLabelContainer();

        _cy.one("render", (e: any) => {
            createNodesCyHandler(e);
            wrapCyHandler(e);
        });
        _cy.on("add", addCyHandler);
        _cy.on("layoutstop", layoutstopHandler);
        _cy.on("remove", removeCyHandler);
        _cy.on("data", updateDataCyHandler);
        _cy.on("pan zoom", wrapCyHandler);
        _cy.on("position bounds", moveCyHandler); // "bounds" - not documented event

        return _cy;

        function createLabelContainer(): LabelContainer {
            let containerNode = document.createElement("div");

            /*let cur = _cyContainer.querySelector("[class^='cy-node-html']");
            if (cur) {
                _cyCanvas.parentNode.removeChild(cur);
            }*/

            let stl = containerNode.style;
            stl.position = 'absolute';
            stl['z-index'] = 2000;
            //stl.width = '500px';
            stl['pointer-events'] = 'none';
            stl.margin = '0px';
            stl.padding = '0px';
            stl.border = '0px';
            stl.outline = '0px';

            const origin = "top left";
            stl.transformOrigin = origin;
            /*stl.webkitTransformOrigin = origin;
            stl.msTransformOrigin = origin;
            stl.transformOrigin = origin;*/


            let _cyContainer = _cy.container();
            let _cyCanvas = _cyContainer.querySelector("canvas");

            _cyCanvas.parentNode.parentNode.parentNode.prepend(containerNode);

            return new LabelContainer(containerNode);
        }

        function createNodesCyHandler({cy}: ICyEventObject) {
            _params.forEach(x => {
                cy.elements(x.query).forEach((d: any) => {
                    if (d.isNode()) {
                        labels.addOrUpdateElem(d.id(), x, {
                            position: getNodePosition(d),
                            data: d.data()
                        });
                    }
                });
            });
        }

        function addCyHandler(ev: ICyEventObject) {
            let target = ev.target;
            let param = $$find(_params.slice().reverse(), x => target.is(x.query));
            if (param) {
                labels.addOrUpdateElem(target.id(), param, {
                    position: getNodePosition(target),
                    data: target.data()
                });
            }
        }

        function layoutstopHandler({cy}: ICyEventObject) {
            _params.forEach(x => {
                cy.elements(x.query).forEach((d: any) => {
                    if (d.isNode()) {
                        labels.updateElemPosition(d.id(), getNodePosition(d));
                    }
                });
            });
        }

        function removeCyHandler(ev: ICyEventObject) {
            labels.removeElemById(ev.target.id());
        }

        function moveCyHandler(ev: ICyEventObject) {

            labels.updateElemPosition(ev.target.id(), getNodePosition(ev.target));
        }

        function updateDataCyHandler(ev: ICyEventObject) {
            const target = ev.target;
            const param = $$find(_params.slice().reverse(), x => target.is(x.query));
            setTimeout(() => {
                let targetID = target.id();
                if (param) {
                    labels.addOrUpdateElem(targetID, param, {
                        position: getNodePosition(target),
                        data: target.data()
                    });
                } else {
                    labels.removeElemById(targetID);
                }
            }, 0);
        }

        function wrapCyHandler({cy}: ICyEventObject) {
            labels.updatePanZoom({
                pan: cy.pan(),
                zoom: cy.zoom()
            });
        }

        function getNodePosition(node: any): ICytoscapeNodeHtmlPosition {
            return {
                w: node.width(),
                h: node.height(),
                x: node.position("x"),
                y: node.position("y")
            };
        }
    }

// registers the extension on a cytoscape lib ref
    let register = function (cy: any) {

        if (!cy) {
            return;
        } // can't register if cytoscape unspecified

        cy("core", "nodeHtmlLabel", function (optArr: any) {
            return cyNodeHtmlLabel(this, optArr);
        });
    };

    if (typeof module !== "undefined" && module.exports) { // expose as a commonjs module
        module.exports = function (cy: any) {
            register(cy);
        };
    } else {
        if (typeof define !== "undefined" && define.amd) { // expose as an amd/requirejs module
            define("cytoscape-nodeHtmlLabel", function () {
                return register;
            });
        }
    }

    if (typeof cytoscape !== "undefined") { // expose to global cytoscape (i.e. window.cytoscape)
        register(cytoscape);
    }

}());
