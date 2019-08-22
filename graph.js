"use strict";

function graph(container) {
    const cy = cytoscape({
        container: container,
        pixelRatio: 1
                    //0.5 //low-res
        ,
        motionBlur: true,

        ready: ()=>{

            /* https://github.com/iVis-at-Bilkent/cytoscape.js-node-resize/tree/3051babea3e9f72581c1b0212802426e293317c4 */
            cy.nodeResize({
                grappleColor: 'rgba(250, 250, 250, 0.5)',
                boundingRectangleLineColor: 'rgba(250, 120, 0, 0.8)',
                boundingRectangleLineWidth: 1,
                //TODO boundingRectangleLineStroke
                resizeToContentCueImage:
                    'https://cdn.jsdelivr.net/gh/iVis-at-Bilkent/cytoscape.js-node-resize@unstable/resizeCue.svg'
            });
        },
        wheelSensitivity: 0.5,
        style: [
            {
                selector: 'node',
                style: {
                    'label': "",
                    'width': 300,
                    'height': 300,
                    'shape': 'hexagon',
                    'background-color': 'gray'
                }
            }
        ],
        layout: {
            name: 'cose'
        },
        elements: { // your cy elements
            nodes: [
                {data: {id: 'j', name: '1'}, classes: 'l1'},
                {data: {id: 'e', name: '2'}, classes: 'l2'},
                {data: {id: 'k', name: '3'}, classes: 'l3'},
                {data: {id: 'g', name: '4'}, classes: 'l4'}
            ],
            edges: [
                {data: {source: 'j', target: 'e'}},
                {data: {source: 'j', target: 'k'}},
                {data: {source: 'j', target: 'g'}},
                {data: {source: 'e', target: 'j'}},
                {data: {source: 'e', target: 'k'}},
                {data: {source: 'k', target: 'j'}},
                {data: {source: 'k', target: 'e'}},
                {data: {source: 'k', target: 'g'}},
                {data: {source: 'g', target: 'j'}}
            ]
        }
    });



    const zoomDuration = 125; //ms

    cy.zoomTo = (ele)=>{
        /*var pos;
        if (!ele || !ele.position)
            pos = { x: 0, y: 0 };
        else
            pos = ele.position();*/

        cy.animate({
            fit: {
                eles: ele,
                padding: 10
            }
        }, {
            duration: zoomDuration
            /*step: function() {
             }*/
        });

    };

    cy.on('cxttapstart', (e) => {
        console.log(e.originalEvent);
        e.originalEvent.stopPropagation();
        e.originalEvent.stopImmediatePropagation();
        const target = e.target;
        if (!target) cy.zoomTo(); else cy.zoomTo(target);
    });

// set nodeHtmlLabel for your Cy instance
    cy.nodeHtmlLabel([{
        query: ".l1",
        /*valign: "top",
        halign: "left",
        valignBox: "top",
        halignBox: "left",*/
        tpl: (container, data) => {

             jsonEdit({
                 "Array": [1, 2, 3],
                 "Boolean": true,
                 "Null": null,
                 "Number": 123,
                 "Object": {"a": "b", "c": "d"},
                 "String": "Hello World"
             }, container)

            //container.innerHTML = '<iframe src="http://openjdk.java.net"></iframe>';
            }
        }, {
            query: ".l2",
            tpl: (container, data) => {
                container.innerHTML = //'<a class="cy-title__p2">' + data.id + '</a>' + '<p  class="cy-title__p2">' + data.name + '</p>';
                    '<div style="background-color:rgba(0,0,255.0,0.25)"><button>test</button><div contentEditable>sd hfsrpf23h2 phf3f32 kjh23kjh 23kh23khk2hf 23h k23hf23 hf2 h2khf23k</div></div>';
            }
        }, {
            query: ".l3",
            tpl: (container, data) => {
                container.innerHTML = "<input type='text' size='10'></input><button>HTML</button><textarea cols='25' rows='3'></textarea>";
            }
        }]);



    return cy;
}


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
