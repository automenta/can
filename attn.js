"use strict";

function attention(g) {

    const nodizer = /* deprecated */ (container, x)=>{

        if (x.value)
            x = x.value; //dereference

        if (typeof(x)==="object" && x.jquery && x.length===1)
            x = x[0]; //unwrap 1-element jquery selector

        if (typeof x === "string") {
            container.innerHTML = x.toString();
        } else if (isDOM(x)) {

            container.appendChild(x);

        } else {

            jsonEdit(x, container);

        }
    };

    var currentLayout = undefined;
    const layout = throttle(()=> {
        if (currentLayout)
            currentLayout.stop();
        currentLayout = g.layout( {
            name:
                'cose'
                //'cola' //https://github.com/cytoscape/cytoscape.js-cola#api
                    ,
            randomize: false,
                    //'flow': { axis: 'y', minSeparation: 10 },
            componentSpacing: 10,
            idealEdgeLength: 10,

            padding: 0,

            //'infinite': true
            stop: ()=>{
                currentLayout = undefined;
            }
        }).run();

    }, 50);

    const map = new LRUMap({
        maxSize: 512,
        accessUpdatesTimestamp: true,
        onAdd: (key,value)=>{

            console.log('add', key, value);


            var a;
            if (typeof value==="string" && !isHTMLish(value)) {
                //raw label
                a = {
                    group: 'nodes',
                    data: { label: value }
                };
            } else  {
                a = {
                    group: 'nodes',
                    classes: 'html',
                    data: {
                        shape: value.shape || 'hexagon',
                        //shape: 'rectangle',
                        tpl: nodizer }
                };

            }

            var positioned;
            if (value.pos && typeof(value.pos)=="object") {
                positioned = true;
                a.position = value.pos;
            } else
                positioned = false;

            a.data.value = value;
            a.data.id = key;

            var added = g.add([a]);

            if (value._grow) {
                //apply grow
                // TODO use destructuring
                const originID = value._grow[0];
                const scaling = value._grow[1];
                if (originID == key)
                    throw 'circular reference';
                const origin = g.getElementById(originID);
                if (origin.length === 0)
                    throw 'origin node not found: ' + originID;


                const scalingSqrt = Math.sqrt(scaling);
                const w = origin.width() * scalingSqrt;
                const h = origin.height() * scalingSqrt;
                added.style('width', w);
                added.style('height', h);


                const edgesAdded = g.add([ {group: 'edges', data: { /*id: originID+'_'+key, */source: originID, target: key }}]);
                //console.log(edgesAdded);
            }

            if (!positioned)
                layout();
        },
        onRemove: (key,value)=>{
            console.log('rem', key, value);
            g.getElementById(key).remove();
            //g.remove({ group: 'nodes', data: { id: key } });
        }
    });



    const a = {
        map: map,

        clear: function () {
            map.clear();
        },

        put: function (k, x = k) {
            //if (!this.map.has(k)) {
            map.set(k, x);
            //}
        }
    };





    var lastClick = undefined;
    g.on('tap',  e=> lastClick = e.position); //HACK for saving the model coordinates for dblclick

    const d = $(g._private.container);
    d.dblclick((e)=>{
        const teContainer = $('<div/>');
        teContainer.css({
            'height': '4em',
            'width': '16em',
            'display': 'table' //??
        });
        const te = textedit(teContainer[0]);
        teContainer.pos = lastClick;
        teContainer.shape = 'rectangle';

        lastClick = undefined;
        //console.log(e);
        //te.setText(JSON.stringify(e.originalEvent, null));

        a.put(uuid(), teContainer)
    });


    return a;

}