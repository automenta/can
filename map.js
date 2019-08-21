function map(contanier) {
    const osmb = new OSMBuildings({
        container: container,
        position: {
            //latitude: 52.52000, longitude: 13.41000
            latitude: 28.5860718, longitude: -80.652923
        },
        zoom: 16,
        minZoom: 15,
        maxZoom: 22
    });

    osmb.addMapTiles(
        'https://{s}.tiles.mapbox.com/v3/osmbuildings.kbpalbpk/{z}/{x}/{y}.png',
        {
            attribution: '© Data <a href="http://openstreetmap.org/copyright/">OpenStreetMap</a> · © Map <a href="http://mapbox.com">Mapbox</a>'
        }
    );

    osmb.addGeoJSONTiles('http://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');
}