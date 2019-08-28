

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

    const layout = throttle(()=> {
        g.layout( {
            name:
                'cose'
                //'cola' //https://github.com/cytoscape/cytoscape.js-cola#api
                    ,
            randomize: false,
                    'flow': { axis: 'y', minSeparation: 30 }
            //'infinite': true
        }).run();

    }, 50);

    this.map = new LRUMap({
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
                        shape: 'hexagon',
                        //shape: 'rectangle',
                        tpl: nodizer }
                };
            }

            a.data.value = value;
            a.data.id = key;

            var eles = g.add([a]);



            layout();
        },
        onRemove: (key,value)=>{
            console.log('rem', key, value);
            g.remove({ group: 'nodes', data: { id: key } });
        }
    });

    this.put = function(k, x=k) {
        if (!this.map.has(k)) {
            map.set(k, x);
        }
    };

    return this;
}