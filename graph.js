"use strict";

function graph(container) {


    const styleFrom = (style, dataKey=style) => {
        const s = {
            "selector": "node[" + dataKey + "]",
            "style": { }
        };
        s.style[style] = 'data(' + dataKey + ')';
        return s;
    };

    var fps = 30;

    const cy = cytoscape({
        container: container,
        pixelRatio: 1
                    //0.5 //low-res
        ,
        //motionBlur: true,
        //textureOnViewport: true,
        hideEdgesOnViewport: false,
        'ghost': false,
        //wheelSensitivity: 0.5,
        ready: (x)=>{


        },
        style: [
            {
                selector: 'core',
                style:{
                    'active-bg-opacity': 0,
                }
            },
            {
                selector: 'node',
                style: {
                    'overlay-opacity': 0,
                    "source-label": "",
                    "target-label": "",
                    'width': 300,
                    'height': 300,
                    'text-outline-width': 0,
                    'text-border-width': 0,
                    'border-width': 0,
                    'background-color': 'gray',
                    "text-valign": "center",
                    "text-halign": "center"
                }
            },
            styleFrom('label'),
            styleFrom('shape'),
            //styleFrom('background-color')
        ]
    });


    cy.renderer.fullFpsTime = 1000/fps;


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
        e.originalEvent.stopPropagation();
        e.originalEvent.stopImmediatePropagation();
        const target = e.target;
        if (!target) cy.zoomTo(); else cy.zoomTo(target);
    });

// set nodeHtmlLabel for your Cy instance
    //cy.nodeHtmlLabel([{query: ".l1"}]);
    //cy.nodeHtmlLabel([{query: ".l2"}]);
        // //query: ".l1",
        // /*valign: "top",
        // halign: "left",
        // valignBox: "top",
        // halignBox: "left",*/
        //

        //
    //console.log(x);
    //const c  = x.cy;

    /* https://github.com/iVis-at-Bilkent/cytoscape.js-node-resize/tree/3051babea3e9f72581c1b0212802426e293317c4 */
    cy.nodeResize({
        undoable: false,
        grappleColor: 'rgba(250, 250, 250, 0.5)',
        boundingRectangleLineColor: 'rgba(250, 120, 0, 0.5)',
        boundingRectangleLineWidth: 2,
        boundingRectangleLineDash: null,
        resizeToContentCueImage:
            'https://cdn.jsdelivr.net/gh/iVis-at-Bilkent/cytoscape.js-node-resize@unstable/resizeCue.svg'
    });




    setTimeout(()=>{
        $(cy.container()).find('canvas').first().remove(); //HACK to remove useless layers
        //TODO 2, etc
    });

    cy.renderer().skipFrame = true;

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
