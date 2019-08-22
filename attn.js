
function attention(g, valueFn) {
    this.map = new LRUMap({
        maxSize: 512,
        accessUpdatesTimestamp: true,
        onAdd: (key,value)=>{

            var eles = g.add([
                {
                    group: 'nodes',
                    data: {
                        id: key,
                        tpl: (container) => {
                            valueFn(value, container);
                        }
                    },
                    classes: 'html'
                }
            ]);

            setTimeout(()=>
            g.layout({
                name: 'cose'
            }).run());
        },
        onRemove: (key,value)=>{
            console.log('rem: ', key, value);
        }
    });

    this.put = function(k, x=k) {
        if (!this.map.has(k)) {
            map.set(k, x);
        }
    };

    return this;
}