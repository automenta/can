
function attention(g, nodizer) {
    const layout = debounce(()=> g.layout({name: 'cose'}).run(), 100);

    this.map = new LRUMap({
        maxSize: 512,
        accessUpdatesTimestamp: true,
        onAdd: (key,value)=>{
            console.log('add', key, value);

            const a = {
                group: 'nodes',
                classes: 'html',
                data: { id:key, value:value, tpl: nodizer },
            };
            
            var eles = g.add([a]);

            layout();
        },
        onRemove: (key,value)=>{
            console.log('rem', key, value);
            g.remove({ group: 'nodes', data: {
                    id: key } });
        }
    });

    this.put = function(k, x=k) {
        if (!this.map.has(k)) {
            map.set(k, x);
        }
    };

    return this;
}