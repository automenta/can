"use strict";

function lerp(x, a, b) {
    return x * b + (1-x) * a;
}


const graphPhysScene = (canvas, engine, scene) => {

    /*var flatPlane = new BABYLON.StandardMaterial("flatPlane", scene);
    //flatPlane.diffuseTexture = new BABYLON.Texture("textures/grass.jpg", scene);
    //flatPlane.diffuseTexture.uScale = 5.0;//Repeat 5 times on the Vertical Axes
    //flatPlane.diffuseTexture.vScale = 5.0;//Repeat 5 times on the Horizontal Axes
    //flatPlane.alpha = 0.5;
    flatPlane.backFaceCulling = false;//Allways show the front and the back of an element
     */

    var gravityVector = new BABYLON.Vector3(0,0, 0);
    var physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    // Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
    var ground = BABYLON.Mesh.CreateGround("ground1", 36, 36, 2, scene);
    ground.position.y = -20;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.9 }, scene);
    {
        //Create dynamic texture
        //var textureResolution = 512;
        var textureGround = new BABYLON.DynamicTexture("dynamic texture", {width:512, height:256}, scene);
        var textureContext = textureGround.getContext('2d', { alpha: false });

        var materialGround = new BABYLON.StandardMaterial("Mat", scene);
        materialGround.diffuseTexture = textureGround;
        ground.material = materialGround;

        /*var img = new Image();
        img.src = '';
        img.onload = function() {

            textureContext.drawImage(this, 0, 0);
            textureGround.update();
        };*/


        var font = "bold 44px monospace";
        textureGround.drawText("ABCDEF", 75, 135, font, "green", "white", true, true);

        //    textureGround.update();
        //const html = '<button>x</button>';

        ////<p><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABWElEQVQ4jZ2Tu07DQBBFz9jjvEAQqAlQ0CHxERQ0/AItBV9Ew8dQUNBQIho6qCFE4Nhex4u85OHdWAKxzfWsx0d3HpazdGITA4kROjl0ckFrnYJmQlJrKsQZxFOIMyEqIMpADGhSZpikB1hAGsovdxABGuepC/4L0U7xRTG/riG3J8fuvdifPKnmasXp5c2TB1HNPl24gNTnpeqsgmj1eFgayoHvRDWbLBOKJbn9WLGYflCCpmM/2a4Au6/PTjdH+z9lCJQ9vyeq0w/ve2kA3vaOnI6k4Pz+0Y24yP3Gapy+Bw6qdfsCRZfWSWgclCCVXTZu5LZFXKJJ2sepW2KYNCENB3U5pw93zLoDjNK6E7rTFcgbkGYJtiLckxCiw4W1OURsxUE5BokQiQj3JIToVtKwlhsurq+YDYbMBjuU/W3KtT3xIbrpAD7E60lwQohuaMtP8ldI0uMbGfC1r1zyWPUAAAAASUVORK5CYII=">
        //render_html_to_canvas(html, textureContext, 0, 0, 512, 256);


    }

    var sphere1 = BABYLON.Mesh.CreateSphere("Sphere1", 10.0, 9.0, scene);
    sphere1.position.x = -7;
    sphere1.physicsImpostor =
        new BABYLON.PhysicsImpostor(sphere1, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, scene);


    var sphere2 = BABYLON.Mesh.CreateSphere("Sphere2", 10.0, 9.0, scene);
    sphere2.position.x = +7;
    sphere2.physicsImpostor =
        new BABYLON.PhysicsImpostor(sphere2, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, scene);

    var springJoing = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.SpringJoint, {
        length: 8,
        stiffness: 1,
        damping: 0.1
    });
    sphere1.physicsImpostor.addJoint(sphere2.physicsImpostor, springJoing);
    sphere1.physicsImpostor.applyImpulse(new BABYLON.Vector3(1, 0, 1), sphere1.getAbsolutePosition());

    //Array of paths to construct tube
    var myPath = [
        new BABYLON.Vector3(5.0, 0, 0.0),
        new BABYLON.Vector3(-4.0, 6, 0.2)
    ];

    var tube = BABYLON.MeshBuilder.CreateTube("tube", {path: myPath, radius: 1.5,
        //sideOrientation: BABYLON.Mesh.DOUBLESIDE,
        updatable: true}, scene);



    //scene.registerBeforeRender(function () {
    //});
    ground.physicsImpostor.registerBeforePhysicsStep(()=>{
        //tube.material = flatPlane;


            //Update tube radius and path

            //TODO update only if changed significantly
            myPath[0] = sphere1.position;
            myPath[1] = sphere2.position;

            tube = BABYLON.MeshBuilder.CreateTube("tube", {path: myPath, instance: tube} );


            //sphere.rotate(BABYLON.Axis.Z, 0.1);
            //sphere.position.z -= 0.1;
            /*const pos = edge.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            pos[0] = sphere1.position.x;
            pos[1] = sphere1.position.y;
            pos[2] = sphere1.position.z;
            pos[3] = sphere2.position.x;
            pos[4] = sphere2.position.y;
            pos[5] = sphere2.position.z;
            //edge.updateVerticesData(BABYLON.VertexBuffer.PositionKind, pos);

            edge.updateVerticesData(BABYLON.VertexBuffer.PositionKind, pos, false, false);
            BABYLON.VertexData.ComputeNormals(pos, indices, normals);
            edge.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals, false, false);
            */


            //vertexData.updateMesh(edge);



    });


    return scene;
};

const guiDemoScene = (canvas, engine, scene) => {

    function resizeFrame(x) {

        var boundingBox = BABYLON.BoundingBoxGizmo.MakeNotPickableAndWrapInBoundingBox(x);
        boundingBox.rotateAround(new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(0, 1, 0), Math.PI);
        boundingBox.position.y = 2;

        // Create bounding box gizmo
        var utilLayer = new BABYLON.UtilityLayerRenderer(scene);
        utilLayer.utilityLayerScene.autoClearDepthAndStencil = false;
        var gizmo = new BABYLON.BoundingBoxGizmo(BABYLON.Color3.FromHexString("#0984e3"), utilLayer);
        gizmo.attachedMesh = boundingBox;

        // Create behaviors to drag and scale with pointers in VR
        var sixDofDragBehavior = new BABYLON.SixDofDragBehavior();
        boundingBox.addBehavior(sixDofDragBehavior);
        var multiPointerScaleBehavior = new BABYLON.MultiPointerScaleBehavior();
        boundingBox.addBehavior(multiPointerScaleBehavior);

    }



    var sphereMaterial = new BABYLON.StandardMaterial();

    //Creation of 6 spheres
    var sphere1 = BABYLON.Mesh.CreateSphere("Sphere1", 10.0, 9.0, scene);
    var sphere2 = BABYLON.Mesh.CreateSphere("Sphere2", 2.0, 9.0, scene);//Only two segments
    var sphere3 = BABYLON.Mesh.CreateSphere("Sphere3", 10.0, 9.0, scene);
    var sphere4 = BABYLON.Mesh.CreateSphere("Sphere4", 10.0, 2.0, scene);
    var sphere5 = BABYLON.Mesh.CreateSphere("Sphere5", 10.0, 9.0, scene);
    var sphere6 = BABYLON.Mesh.CreateSphere("Sphere6", 10.0, 9.0, scene);
    var sphere7 = BABYLON.Mesh.CreateSphere("Sphere7", 10.0, 9.0, scene);

    sphere1.position.x = -30;
    sphere2.position.x = -20;
    sphere3.position.x = -10;
    sphere4.position.x = 0;
    sphere5.position.x = 10;
    sphere6.position.x = 20;
    sphere7.position.x = 30;

    sphere1.material = sphereMaterial;
    sphere2.material = sphereMaterial;
    sphere3.material = sphereMaterial;
    sphere4.material = sphereMaterial;
    sphere5.material = sphereMaterial;
    sphere6.material = sphereMaterial;
    sphere7.material = sphereMaterial;

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui1");

    var panel = new BABYLON.GUI.StackPanel();
    panel.width = 0.25;
    panel.rotation = 0.2;
    panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    advancedTexture.addControl(panel);

    var button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "Click Me");
    button1.width = 0.2;
    button1.height = "40px";
    button1.color = "white";
    button1.cornerRadius = 20;
    button1.background = "green";
    button1.onPointerUpObservable.add(() => {
        circle.scaleX += 0.1;
    });
    panel.addControl(button1);

    var circle = new BABYLON.GUI.Ellipse();
    circle.width = "50px";
    circle.color = "white";
    circle.thickness = 5;
    circle.height = "50px";
    circle.paddingTop = "2px";
    circle.paddingBottom = "2px";
    panel.addControl(circle);

    var button2 = BABYLON.GUI.Button.CreateSimpleButton("but2", "Click Me 2");
    button2.width = 0.2;
    button2.height = "40px";
    button2.color = "white";
    button2.background = "green";
    button2.onPointerUpObservable.add(() => {
        circle.scaleX -= 0.1;
    });
    panel.addControl(button2);

    var createLabel = mesh => {
        var label = new BABYLON.GUI.Rectangle("label for " + mesh.name);
        label.background = "black";
        label.height = "30px";
        label.alpha = 0.5;
        label.width = "100px";
        label.cornerRadius = 20;
        label.thickness = 1;
        label.linkOffsetY = 30;
        advancedTexture.addControl(label);
        label.linkWithMesh(mesh);

        var text1 = new BABYLON.GUI.TextBlock();
        text1.text = mesh.name;
        text1.color = "white";
        label.addControl(text1);
    };

    //createLabel(sphere1);
    //createLabel(sphere2);
    createLabel(sphere3);
    createLabel(sphere4);
    createLabel(sphere5);
    createLabel(sphere6);

    var label = new BABYLON.GUI.Rectangle("label for " + sphere7.name);
    label.background = "black";
    label.height = "30px";
    label.alpha = 0.5;
    label.width = "100px";
    label.cornerRadius = 20;
    label.thickness = 1;
    label.linkOffsetY = 30;
    label.top = "10%";
    label.zIndex = 5;
    label.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(label);

    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = sphere7.name;
    text1.color = "white";
    label.addControl(text1);

    var line = new BABYLON.GUI.Line();
    line.alpha = 0.5;
    line.lineWidth = 5;
    line.dash = [5, 10];
    advancedTexture.addControl(line);
    line.linkWithMesh(sphere7);
    line.connectedControl = label;

    var endRound = new BABYLON.GUI.Ellipse();
    endRound.width = "10px";
    endRound.background = "black";
    endRound.height = "10px";
    endRound.color = "white";
    advancedTexture.addControl(endRound);
    endRound.linkWithMesh(sphere7);

    // Plane
    var plane = BABYLON.Mesh.CreatePlane("plane", 20);
    plane.parent = sphere4;
    plane.position.y = -10;


    var panelVol = new BABYLON.GUI.StackPanel();
    panelVol.top = "100px";

    var button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "Click Me");
    button1.width = 1;
    button1.height = "100px";
    button1.color = "white";
    button1.fontSize = 50;
    button1.background = "green";
    panelVol.addControl(button1);

    var textblock = new BABYLON.GUI.TextBlock();
    textblock.height = "150px";
    textblock.fontSize = 100;
    textblock.text = "please pick an option:";
    panelVol.addControl(textblock);

    var input = new BABYLON.GUI.InputText();
    input.width = 0.5;
    input.height = "50px";
    input.text = "edit me";
    input.color = "orange";
    input.background = "black";
    panelVol.addControl(input);


    var addRadio = (text, parent) => {

        var button = new BABYLON.GUI.RadioButton();
        button.width = "40px";
        button.height = "40px";
        button.color = "white";
        button.background = "green";

        button.onIsCheckedChangedObservable.add(state => {
            if (state)
                textblock.text = "You selected " + text;
        });

        var header = BABYLON.GUI.Control.AddHeader(button, text, "400px", {
            isHorizontal: true,
            controlFirst: true
        });
        header.height = "100px";
        header.children[1].fontSize = 80;
        header.children[1].onPointerDownObservable.add(() => {
            button.isChecked = !button.isChecked;
        });

        parent.addControl(header);
    };


    addRadio("option 1", panelVol);
    addRadio("option 2", panelVol);
    addRadio("option 3", panelVol);
    addRadio("option 4", panelVol);
    addRadio("option 5", panelVol);

    scene.registerBeforeRender(() => panel.rotation += 0.01);


    var panelOrtho = new BABYLON.GUI.StackPanel();
    panelOrtho.width = "220px";
    panelOrtho.fontSize = "14px";
    panelOrtho.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    panelOrtho.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

    var checkbox = new BABYLON.GUI.Checkbox();
    checkbox.width = "20px";
    checkbox.height = "20px";
    checkbox.isChecked = true;
    checkbox.color = "green";

    var panelForCheckbox = BABYLON.GUI.Control.AddHeader(checkbox, "checkbox", "180px", {
        isHorizontal: true,
        controlFirst: true
    });
    panelForCheckbox.color = "white";
    panelForCheckbox.height = "20px";
    panelForCheckbox.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    panelOrtho.addControl(panelForCheckbox);


    {
        var header = new BABYLON.GUI.TextBlock();
        header.text = "Slider:";
        header.height = "40px";
        header.color = "white";
        header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        header.paddingTop = "10px";
        panelOrtho.addControl(header);
    }

    var slider = new BABYLON.GUI.Slider();
    slider.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    slider.minimum = 0;
    slider.maximum = 2 * Math.PI;
    slider.color = "green";
    slider.value = 0;
    slider.height = "20px";
    slider.width = "200px";
    panelOrtho.addControl(slider);

    {
        const header = new BABYLON.GUI.TextBlock();
        header.text = "Sphere diffuse:";
        header.height = "40px";
        header.color = "white";
        header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        header.paddingTop = "10px";
        panelOrtho.addControl(header);
    }

    var picker = new BABYLON.GUI.ColorPicker();
    picker.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    picker.value = sphereMaterial.diffuseColor;
    picker.height = "150px";
    picker.width = "150px";
    picker.onValueChangedObservable.add(value => { // value is a color3
        sphereMaterial.diffuseColor = value;
    });
    panelOrtho.addControl(picker);


    var uiOrtho = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI"); // Another GUI on the right
    uiOrtho.layer.layerMask = 2;
    uiOrtho.addControl(panelOrtho);

    var uiVol = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);
    uiVol.addControl(panelVol);


    resizeFrame(sphere1);
    resizeFrame(sphere2);
    resizeFrame(sphere3);


    var gravityVector = new BABYLON.Vector3(0, -9.81, 0);
    var physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);


    return scene;
};
