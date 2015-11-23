var container;
var stats;

var camera;
var scene;
var renderer;
//var gObject = null;
var gObjects = [];

var uGeometry;

var vertices = [];
var uVertices = [];

var objects = [];

var loader;


function fallingVertex(movingVert)
{
    vertAccel = movingVert.getAcceleration();
    //movingVert..getSpeed().y += movingVert.getAcceleration();
    newSpeed = movingVert.getSpeed();
    newSpeed.y += vertAccel;
    movingVert.setSpeed(newSpeed);
    
    if(movingVert.getVert().y > movingVert.getTarget())
    {
        if(Math.abs(movingVert.getVert().y - movingVert.getTarget()) <= movingVert.getSpeed().y)
        {
            movingVert.getVert().y = movingVert.getTarget();
        }
        else
        {
            moveSpeed = movingVert.getSpeed();
            //this.vert.y -= this.speed;
            newVert = movingVert.getVert();
            newVert.sub(moveSpeed);
            movingVert.setVert(newVert);
        }
    }
}

function movingVertex(vert, speed, target, acceleration, func)
{
    this.vert = vert;
    this.speed = speed;
    this.acceleration = acceleration
    this.target = target

    this.speed.x = (speed.x * Math.random()) - speed.x / 2
    this.speed.z = (speed.z * Math.random()) - speed.z / 2

    this.func = func;

    this.update = function()
    {
        func(this);

        var a = 0;
    };

    this.getVert = function(){return vert;};
    this.getSpeed = function(){return speed;};
    this.getAcceleration = function(){return acceleration};
    this.getTarget = function(){return target;};
    this.setSpeed = function(speed)
        {
            this.speed = speed;
        }
    this.setVert = function(vert)
        {
            this.vert = vert;
        }
}   

function uVertex(vert, pos, target)
{
    this.vert = vert;
    this.target = new THREE.Vector3(0,0,0);
    this.pos = new THREE.Vector3(0,0,0);

    this.pos.x = pos.x;
    this.pos.y = pos.y;
    this.pos.z = pos.z;

    this.target.x = target.x;
    this.target.y = target.y;
    this.target.z = target.z;

    //this.target = new THREE.Vector3(0,3,0);

    this.update = function(time)
    {
        var diff = new THREE.Vector3(0,0,0);
        //diff = diff.subVectors(this.pos, new THREE.Vector3(0, 1, 0));
        diff.x = this.pos.x - this.target.x;
        diff.y = this.pos.y - this.target.y;
        diff.z = this.pos.z - this.target.z;

        moveFactor = 0.05;
        var speed = new THREE.Vector3(diff.x * moveFactor, diff.y * moveFactor, diff.z * moveFactor);
        //speed = speed.multiplyScalar(time * 0.06);
        
        //console.log(pos.x);
        
        //console.log(this.pos.x + ",,," + (this.pos.x - speed.x) + "   " + this.target.x + "   " + diff.x);

        this.pos.x = this.pos.x - speed.x;
        this.pos.y = this.pos.y - speed.y;
        this.pos.z = this.pos.z - speed.z;

        this.vert.x = this.pos.x;
        this.vert.y = this.pos.y;
        this.vert.z = this.pos.z;
    };
}

var pointCloudMaterial;

function loadMesh(filename)
{
    var loader = new THREE.ColladaLoader();
    loader.load(filename, function(object){
        dae = object.scene;
        
        meshes = [];
        dae.traverse(function(child){
            if(child instanceof THREE.Mesh)
            {
                uGeometry = child.geometry;

                meshes[meshes.length] = uGeometry


                var gObject = new THREE.PointCloud(uGeometry , pointCloudMaterial);
                //gObject.scale.x = gObject.scale.y = gObject.scale.z = 4;
                gObject.position.y = - 5
                scene.add(gObject)

                for(var i = 0; i < uGeometry.vertices.length; i++)
                {
                    vertex = new movingVertex(gObject.geometry.vertices[i], new THREE.Vector3(0.005, -0.001, 0.005), -0.1, 0.0006, fallingVertex)
                    vertices[vertices.length] = vertex;
                }

                gObjects[gObjects.length] = gObject;
            }
        });
        
        dae.scale.x = dae.scale.y = dae.scale.z = 50;
        dae.updateMatrix();
    });
}

function loadU(filename)
{
    var loader = new THREE.ColladaLoader();
    loader.load(filename, function(object){
        dae = object.scene;
        
        meshes = [];
        dae.traverse(function(child){
            if(child instanceof THREE.Mesh)
            {
                uGeometry = child.geometry;

                meshes[meshes.length] = uGeometry

                var gObject = new THREE.PointCloud(uGeometry , pointCloudMaterial);
                //gObject.scale.x = gObject.scale.y = gObject.scale.z = 10;
                gObject.position.y = - 5
                scene.add(gObject)

                
                for(var i = 0; i < uGeometry.vertices.length; i++)
                {
                    vertex = new uVertex(gObject.geometry.vertices[i], vertices[Math.floor(vertices.length * Math.random())].getVert(), gObject.geometry.vertices[i]);

                    uVertices[uVertices.length] = vertex;
                }

                gObjects[gObjects.length] = gObject;
            }
        });
        
        dae.scale.x = dae.scale.y = dae.scale.z = 50;
        dae.updateMatrix();
    });
}

//Init function, runs once when the page loads
function init()
{
    loader= new THREE.ColladaLoader();

    container = document.createElement('div');
    document.body.appendChild(container);
 
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.y = -4;
    camera.position.z = 6;
 
    scene = new THREE.Scene();
 
    var light;
 
    scene.add(new THREE.AmbientLight(0x404040));
 
    light = new THREE.DirectionalLight(0xffffff);
    scene.add(light);

    var manager = new THREE.LoadingManager();



    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
        }
    };
    var onError = function ( xhr ) {
    };


    //var material = new THREE.MeshLambertMaterial( { ambient: 0xbbbbbb, side: THREE.DoubleSide } );
    pointCloudMaterial = new THREE.PointCloudMaterial( {color: 0xff0000, size:0.04 } );

    var fallTime = 2000;

    loadMesh("media/5.dae");
    setTimeout(function(){loadMesh("media/4.dae")}, fallTime);
    setTimeout(function(){loadMesh("media/3.dae")}, fallTime * 2);
    setTimeout(function(){loadU("media/u.dae")}, fallTime * 3);
 
    //gObject = new THREE.Mesh(new THREE.SphereGeometry(75, 75, 75), material);
    //gObject = new THREE.PointCloud(new THREE.SphereGeometry(75, 75, 75), material);
    //gObject = new THREE.PointCloud(uGeometry , material);
    //scene.add(gObject)
 
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
 
    container.appendChild(renderer.domElement);
 
}

function animate()
{
    requestAnimationFrame(animate);

    render();
}
function render()
{
    var timer = Date.now() * 0.0001;

    
    for(var i = 0; i < vertices.length; i++)
    {
        vertices[i].update();
    }
    for(var i = 0; i < uVertices.length; i++)
    {
        uVertices[i].update(0);
    }
    //if(vertices.length != 0)
    for(var i = 0; i < gObjects.length; i++)
    {
        gObject = gObjects[i];

        gObject.updateMatrix();
        gObject.geometry.dynamic = true;
        gObject.geometry.__dirtyVertices = true;
        gObject.geometry.__dirtyNormals = true;
        gObject.geometry.verticesNeedUpdate = true
    }
    

    renderer.render(scene, camera);
}
