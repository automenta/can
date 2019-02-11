"use strict";
window.addEventListener('DOMContentLoaded', function(){

var cy = cytoscape({
    container: document.getElementById('cy'),
    layout: {
        name: 'cose'
    },
    elements: { // your cy elements
        nodes: [
          { data: { id: 'j', name: '1' }, classes: 'l1' },
          { data: { id: 'e', name: '2' }, classes: 'l1' },
          { data: { id: 'k', name: '3' }, classes: 'l2' },
          { data: { id: 'g', name: '4' }, classes: 'l2' }
        ],
        edges: [
          { data: { source: 'j', target: 'e' } },
          { data: { source: 'j', target: 'k' } },
          { data: { source: 'j', target: 'g' } },
          { data: { source: 'e', target: 'j' } },
          { data: { source: 'e', target: 'k' } },
          { data: { source: 'k', target: 'j' } },
          { data: { source: 'k', target: 'e' } },
          { data: { source: 'k', target: 'g' } },
          { data: { source: 'g', target: 'j' } }
        ]
    }
});

function editNode(d) {
    
    var container = document.createElement("div");
    container.setAttribute('style', "scale:0.5;width: 400px; height: 400px; pointer-events:all;");
    
    var options = {};
    var editor = new JSONEditor(container, options);

    // set json
    var json = {
        "Array": [1, 2, 3],
        "Boolean": true,
        "Null": null,
        "Number": 123,
        "Object": {"a": "b", "c": "d"},
        "String": "Hello World"
    };
    editor.set(json);

    // get json
    //var json = editor.get();
    //console.log(editor);
    
    return container;
}

// set nodeHtmlLabel for your Cy instance
cy.nodeHtmlLabel([{
        query: '.l1',
        /*valign: "top",
        halign: "left",
        valignBox: "top",
        halignBox: "left",*/
        tpl: function(data) {
            //return '<div class="cy-form"><button class="cy-title__p1">' + data.id + '</button>' + '<input type="text"  style="width:4em" value="' + data.name + '"/></div>';
            return editNode(data);
        }
    },
    {
        query: '.l2',
        tpl: function(data) {
            return '<a class="cy-title__p2">' + data.id + '</a>' + '<p  class="cy-title__p2">' + data.name + '</p>';
        }
    }
]);
/*
				cy.cxtmenu({
					selector: 'node, edge',

					commands: [
						{
							content: '<span class="fa fa-flash fa-2x"></span>',
							select: function(ele){
								console.log( ele.id() );
							}
						},

						{
							content: '<span class="fa fa-star fa-2x"></span>',
							select: function(ele){
								console.log( ele.data('name') );
							},
							enabled: false
						},

						{
							content: 'Text',
							select: function(ele){
								console.log( ele.position() );
							}
						}
					]
				});

				cy.cxtmenu({
					selector: 'core',

					commands: [
						{
							content: 'bg1',
							select: function(){
								console.log( 'bg1' );
							}
						},

						{
							content: 'bg2',
							select: function(){
								console.log( 'bg2' );
							}
						}
					]
				});
*/
        /*cy.nodeHtmlLabel([
                {
                    query: 'node',
                    cssClass: 'cy-title',
                    valign: "top",
                    valignBox: "top",
                    tpl: function (data) {
                        return '<p class="cy-title__name">' + data.name + '</p>' +
                            '<p  class="cy-title__info">' + data.id + '</p>';
                    }
                },
                {
                    query: 'node[type=0]',
                    cssClass: 'cy-title',
                    valign: "top",
                    valignBox: "top",
                    tpl: function (data) {
                        return '<p class="cy-title__main">' + data.name + '</p>';
                    }
                },
                {
                    query: 'node[type=2]',
                    cssClass: 'cy-title',
                    valign: "bottom",
                    valignBox: "bottom",
                    tpl: function (data) {
                        return '<p class="cy-title__none">' + data.name + '</p>';
                    }
                }
            ]); */


            {
              var osmb = new OSMBuildings({
                container: 'map',
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

});



/*				var cy = window.cy = cytoscape({
					container: document.getElementById('cy'),

					ready: function(){
					},

					style: [
						{
							selector: 'node',
							css: {
								'content': 'data(name)'
							}
						},

						{
							selector: 'edge',
							css: {
								'curve-style': 'bezier',
								'target-arrow-shape': 'triangle'
							}
						}
					],

					elements: {
						nodes: [
							{ data: { id: 'j', name: 'A' } },
							{ data: { id: 'e', name: 'B' } },
							{ data: { id: 'k', name: 'C' } },
							{ data: { id: 'g', name: 'C' } }
						],
						edges: [
							{ data: { source: 'j', target: 'e' } },
							{ data: { source: 'j', target: 'k' } },
							{ data: { source: 'j', target: 'g' } },
							{ data: { source: 'e', target: 'j' } },
							{ data: { source: 'e', target: 'k' } },
							{ data: { source: 'k', target: 'j' } },
							{ data: { source: 'k', target: 'e' } },
							{ data: { source: 'k', target: 'g' } },
							{ data: { source: 'g', target: 'j' } }
						]
					}
				});*/

        // create Cy instance
