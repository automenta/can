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
    contentExpand?: Boolean;
}

(function () {
    "use strict";
    const $$find = function <T>(arr: T[], predicate: (a: T) => boolean) {
        if (typeof predicate !== "function") {
            throw new TypeError("predicate must be a function");
        }
        const length = arr.length;
        const thisArg = arguments[1];

        for (let i = 0; i < length; i++) {
            const value = arr[i];
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
        //public tpl: (container: any, data: any) => void;

        private _position: number[] = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
        private _node: HTMLElement;
        private _align: [number, number, number, number];
        private contentExpand: Boolean = false;


        constructor(node : HTMLElement, payload: any,
                    params: CytoscapeNodeHtmlParams) {



            this.contentExpand = params.contentExpand || (payload.data && payload.data.value ? payload.data.value.contentExpand : false);

            this.updateParams(params);
            this._node = node;

            this.initStyles(params.cssClass);

            /*const data = payload.data;
            if (data) {
                this.updateData(data);
            }*/
            const position = payload.position;
            if (position) {
                this.updatePosition(position);
            }
        }


        updateParams({
                         cssClass = null,
                         halign = "center",
                         valign = "center",
                         halignBox = "center",
                         valignBox = "center"
                     }: CytoscapeNodeHtmlParams) {


            const NOP = () => "";

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



        }

        //updateData(data: any) {
            //data.tpl(this._node, data);
        //}

        getNode(): HTMLElement {
            return this._node;
        }

        updatePosition(pos: ICytoscapeNodeHtmlPosition) {

            var prev = this._position;

            const x = pos.x;// + this._align[0] * position.w;
            const y = pos.y;// + this._align[1] * position.h;


            const thresh = 0.5;
            if (Math.abs(x - prev[0]) > thresh || Math.abs(y - prev[1]) > thresh) {
                prev[0] = x;
                prev[1] = y;


                //TODO cache better
                const val = `translate(${
                    this._align[2]
                }%,${
                    this._align[3]
                }%)translate(${
                    x.toFixed(0)
                }px,${
                    y.toFixed(0)
                }px) `;


                const stl = this._node.style;
                /*stl.webkitTransform = val;
                stl.msTransform = val;*/
                stl.transform = val;

                if (this.contentExpand) {
                    stl.width = pos.w.toFixed(0);
                    stl.height = pos.h.toFixed(0);
                } else {
                    //stl.scale =
                }

            }
        }

        private initStyles(cssClass: string) {
            let stl = this._node.style;
            if (cssClass && cssClass.length)
                this._node.classList.add(cssClass);
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
            node.classList.add('htmlOverlays');
            this._elements = <HashTableElements>{};
        }

        addOrUpdateElem(id: string, param: CytoscapeNodeHtmlParams, payload: { data?: any, position?: ICytoscapeNodeHtmlPosition } = {}) {



            var cur = this._elements[id];


            if (cur) {
                cur.updateParams(param);
                //cur.updateData(payload.data);
                cur.updatePosition(payload.position);
            } else {
                const nodeContainer = document.createElement("div")

                //nodeContainer.style.scale = '1';
                this._node.appendChild(nodeContainer);

                cur = new LabelElement(nodeContainer, payload, param);

                const tpl = param.tpl || payload.data.tpl;
                if (tpl)
                    tpl(cur["_node"], payload.data);

                this._elements[id] = cur;

            }
        }

        removeElemById(id: string) {
            if (this._elements[id]) {
                this._node.removeChild(this._elements[id].getNode());
                delete this._elements[id];
            }
        }

        updateElemPosition(id: string, position?: ICytoscapeNodeHtmlPosition) {
            const ele = this._elements[id];
            if (ele)
                ele.updatePosition(position);
        }

        updatePanZoom({pan, zoom}: { pan: { x: number, y: number }, zoom: number }) {
            //setTimeout(()=>{
            const val = `translate(${pan.x.toFixed(0)}px,${pan.y.toFixed(0)}px) scale(${zoom})`;

            const stl = <any>this._node.style;
            /*stl.webkitTransform = val;
            stl.msTransform = val;*/
            stl.transform = val;
            //});
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
        _cy.on("remove", removeCyHandler);
        _cy.on("data", updateDataCyHandler);
        _cy.on("pan zoom", wrapCyHandler);
        _cy.on("position bounds", moveCyHandler); // "bounds" - not documented event
        //_cy.on("layoutstop", layoutstopHandler);

        return _cy;

        function createLabelContainer(): LabelContainer {
            let containerNode = document.createElement("div");

            /*let cur = _cyContainer.querySelector("[class^='cy-node-html']");
            if (cur) {
                _cyCanvas.parentNode.removeChild(cur);
            }*/


            /*stl.webkitTransformOrigin = origin;
            stl.msTransformOrigin = origin;
            stl.transformOrigin = origin;*/


            let _cyContainer = _cy.container();
            let _cyCanvas = _cyContainer.querySelector("canvas");

            _cyCanvas.parentNode.parentNode.parentNode.append(containerNode);

            return new LabelContainer(containerNode);
        }

        function createNodesCyHandler({cy}: ICyEventObject) {
            _params.forEach(x => {
                cy.nodes(x.query).forEach((d: any) => {
                    //if (d.isNode()) {
                        labels.addOrUpdateElem(d.id(), x, {
                            position: getNodePosition(d),
                            data: d.data()
                        });
                    //}
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

        /*function layoutstopHandler({cy}: ICyEventObject) {
            _params.forEach(x => {
                cy.nodes(x.query).forEach((d: any) => {
                    //if (d.isNode()) {
                        labels.updateElemPosition(d.id(), getNodePosition(d));
                    //}
                });
            });
        }*/

        function removeCyHandler(ev: ICyEventObject) {
            labels.removeElemById(ev.target.id());
        }

        function moveCyHandler(ev: ICyEventObject) {

            labels.updateElemPosition(ev.target.id(), getNodePosition(ev.target));
        }

        function updateDataCyHandler(ev: ICyEventObject) {
            const target = ev.target;
            const param = $$find(_params.slice().reverse(), x => target.is(x.query));
            //setTimeout(() => {
                let targetID = target.id();
                if (param) {
                    labels.addOrUpdateElem(targetID, param, {
                        position: getNodePosition(target),
                        data: target.data()
                    });
                } else {
                    labels.removeElemById(targetID);
                }
            //}, 0);
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

        if (!cy)
            return; // can't register if cytoscape unspecified

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
