var container;
var stats;

var camera;
var scene;
var renderer;
var gObject = null;

var uGeometry;

var vertices = [];

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

//Init function, runs once when the page loads
function init()
{
    container = document.createElement('div');
    document.body.appendChild(container);
 
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.y = 0;
    camera.position.z = 20;
 
    scene = new THREE.Scene();
 
    var light;
 
    scene.add(new THREE.AmbientLight(0x404040));
 
    light = new THREE.DirectionalLight(0xffffff);
    scene.add(light);

    var manager = new THREE.LoadingManager();
    

    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };
    var onError = function ( xhr ) {
        console.log("Error");
    };

    //var objLoader = new THREE.OBJLoader( manager );
    //objLoader.load('media/u.obj', function( gObject ){
    /*
     * objLoader.load('media/male02.obj', function( gObject ){
            gObject.traverse( function(child){
                    if(child instanceof THREE.Mesh)
                    {
                        uGeometry = child.geometry;
                    }
                });
        }, onProgress, onError);

    */

    var loader = new THREE.ColladaLoader();
    loader.load("media/4.dae", function(object){
        dae = object.scene;
        
        meshes = [];
        dae.traverse(function(child){
            if(child instanceof THREE.Mesh)
            {
                uGeometry = child.geometry;

                meshes[meshes.length] = uGeometry

                gObject = new THREE.PointCloud(uGeometry , material);
                gObject.scale.x = gObject.scale.y = gObject.scale.z = 10;
                gObject.position.y = - 5
                scene.add(gObject)

                for(var i = 0; i < uGeometry.vertices.length; i++)
                {
                    vertex = new movingVertex(gObject.geometry.vertices[i], new THREE.Vector3(0.005, -0.001, 0.005), -0.1, 0.0006, fallingVertex)
                    vertices[vertices.length] = vertex;
                }
            }
        });
        
        
        
        dae.scale.x = dae.scale.y = dae.scale.z = 50;
        dae.updateMatrix();
    });

    //var material = new THREE.MeshLambertMaterial( { ambient: 0xbbbbbb, side: THREE.DoubleSide } );
    var material = new THREE.PointCloudMaterial( {color: 0xff0000, size:0.1 } );
 
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
    if(vertices.length != 0)
    {
        gObject.updateMatrix();
        gObject.geometry.dynamic = true;
        gObject.geometry.__dirtyVertices = true;
        gObject.geometry.__dirtyNormals = true;
        gObject.geometry.verticesNeedUpdate = true
    }
    

    renderer.render(scene, camera);
}
