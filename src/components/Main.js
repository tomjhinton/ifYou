//pic size 687*687
import React from 'react'
const CANNON = require('cannon')
const THREE = require('three')
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Typed from 'typed.js'
import '../debug.js'


let playing = true

var resetT = {
  strings: ['', 'GAME OVER   : R TO RESET'],
  typeSpeed: 100,
  loop: true,
  loopCount: Infinity,
  backSpeed: 100,
  showCursor: false

}


class Main extends React.Component{
  constructor(){
    super()
    this.state = {
      data: {},
      error: ''

    }
    this.componentDidMount = this.componentDidMount.bind(this)





  }


  componentDidMount(){

    //mic STUFF
    var Recording = function(cb){
      var recorder = null
      var recording = true
      var audioInput = null
      var volume = null
      var audioContext = null
      var callback = cb

      navigator.getUserMedia = navigator.getUserMedia    || navigator.webkitGetUserMedia ||
                               navigator.mozGetUserMedia || navigator.msGetUserMedia

      if(navigator.getUserMedia){
        navigator.getUserMedia({audio: true},
          function(e){ //success
            var AudioContext = window.AudioContext || window.webkitAudioContext
            audioContext = new AudioContext()
            volume = audioContext.createGain() // creates a gain node
            audioInput = audioContext.createMediaStreamSource(e) // creates an audio node from the mic stream
            audioInput.connect(volume)// connect the stream to the gain node
            recorder = audioContext.createScriptProcessor(2048, 1, 1)

            recorder.onaudioprocess = function(e){
              if(!recording) return
              var left = e.inputBuffer.getChannelData(0)
              //var right = e.inputBuffer.getChannelData(1);
              callback(new Float32Array(left))
            }
            volume.connect(recorder)// connect the recorder
            recorder.connect(audioContext.destination)
          },
          function(){ //failure
            alert('Error capturing audio.')
          }
        )
      } else {
        alert('getUserMedia not supported in this browser.')
      }
    }

    var lastClap = (new Date()).getTime()

    function detectClap(data){
      var t = (new Date()).getTime()
      if(t - lastClap < 200) return false // TWEAK HERE
      var zeroCrossings = 0, highAmp = 0
      for(var i = 1; i < data.length; i++){
        if(Math.abs(data[i]) > 0.25) highAmp++ // TWEAK HERE
        if(data[i] > 0 && data[i-1] < 0 || data[i] < 0 && data[i-1] > 0) zeroCrossings++
      }
      if(highAmp > 20 && zeroCrossings > 30){ // TWEAK HERE
        //console.log(highAmp+' / '+zeroCrossings);
        lastClap = t
        return true
      }
      return false
    }

    var rec = new Recording(function(data){
      if(detectClap(data)){
        console.log('clap!')
        if (!player.jumping && player.grounded) {
          player.jumping = true
          player.grounded = false
          player.velY = -player.speed * 4

        }
        if(groundBody.position.y<1){

        //groundBody.velocity.y+=0.1
      }
        document.bgColor = 'rgb('+Math.random()*255+','+Math.random()*255+','+Math.random()*255+')'
      }
    })





    //Canvas
    const resetTyped = new Typed('#reset', resetT)

    const canvas = document.getElementById('canvas')
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 0.2
    ctx.fillStyle = 'green'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    var grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    var grd2 = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)






    //DISPLAY  STATS
    const scoreDisplay = document.getElementById('score')
    const livesDisplay = document.getElementById('lives')
    const reset = document.getElementById('reset')
    let score = 0
    let lives = 6


    //KeyBoard Controls
    const keys =[]
    document.body.addEventListener('keydown', function (e) {
      e.preventDefault()
      if(e.keyCode===38){

      }
      if(e.keyCode===82){
        playerScreenBody.position =  startPos
        playerScreenBody.quaternion = startQuart
        playerScreenBody.position.set(0,0,0)
        playerScreenBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
        playerScreenBody.angularVelocity.x = 0
        playerScreenBody.angularVelocity.y = 0
        playerScreenBody.angularVelocity.z = 0
        playerScreenBody.velocity.x = 0
        playerScreenBody.velocity.y = 0
        playerScreenBody.velocity.z = 0
        console.log(playerScreenBody)
        score = 0
        lives = 6
        setup()
        reset.innerHTML = ''
        canvas.classList.remove('over')
        reset.classList.add('hide')
        balls.map(x=>{

          world.remove(x)

        } )
        ballMeshes.map(x=>{
          x.geometry.dispose()
          x.material.dispose()
          scene.remove( x )
        } )
        playing = true



      }

      keys[e.keyCode] = true
    })

    document.body.addEventListener('keyup', function (e) {
      keys[e.keyCode] = false
    })



    //Element Setup
    const player = {
      height: 50,
      width: 20,
      posX: 400,
      posY: 400,
      velX: 0,
      velY: 0,
      speed: 3,
      jumping: false,
      grounded: false

    }



    const worldG = {
      gravity: 0.2,
      friction: 0.9
    }




    var boxes = []
    let check

    function Box(posX, posY, width){
      this.posX = posX,
      this.posY = posY,
      this.width = width,
      this.height= 10
      check = boxes.filter(x => x.posY !== this.posY && this.posY > (x.posY-10) && this.posY < (x.posY+10) )
      if(check.length === 0){
        boxes.push(this)
      }
    }


    //Start / Reset
    function setup(){
      lives--


      boxes = []


      // border walls
      boxes.push({
        posX: 0,
        posY: 490,
        width: 1200,
        height: 110
      })




    }
    setup()


    //Collision Detection
    function collisionDetection(shapeA, shapeB){
      var vX = (shapeA.posX + (shapeA.width / 2)) - (shapeB.posX + (shapeB.width / 2)),
        vY = (shapeA.posY + (shapeA.height / 2)) - (shapeB.posY + (shapeB.height / 2)),
        // add the half widths and half heights of the objects
        hWidths = (shapeA.width / 2) + (shapeB.width / 2),
        hHeights = (shapeA.height / 2) + (shapeB.height / 2),
        colDir = null

      // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
      if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        //  figures out on which side we are colliding (top, bottom, left, or right)
        var oX = hWidths - Math.abs(vX),
          oY = hHeights - Math.abs(vY)
        if (oX >= oY) {
          if (vY > 0) {
            colDir = 't'
            shapeA.posY += oY
          } else {
            colDir = 'b'
            shapeA.posY -= oY

          }
        } else {
          if (vX > 0) {
            colDir = 'l'
            shapeA.posX += oX
          } else {
            colDir = 'r'
            shapeA.posX -= oX
          }
        }
      }
      return colDir
    }



    //UPDATE LOOP
    const wall ={
      posX: canvas.width-10,
      posY: 410,
      height: 80,
      width: 40


    }
    function gameLoop() {

      if(lives <= 0){
        canvas.classList.add('over')
        reset.classList.remove('hide')
        lives = 0
        livesDisplay.innerHTML = lives
        playing = false
      }
      if(lives>0){
        scoreDisplay.innerHTML = score
        livesDisplay.innerHTML = lives



        if (keys[32] ) {
          playerScreenBody.velocity.y+=2
          // up arrow or space
          // if (!player.jumping && player.grounded) {
          //   player.jumping = true
          //   player.grounded = false
          //   player.velY = -player.speed * 4
          //
          // }
        }if (keys[39]) {
        // right arrow
          if (player.velX < player.speed) {
            // player.velX++

          }
        }
        if (keys[37]) {         // left arrow
          if (player.velX > -player.speed) {
            // player.velX--

          }
        }





        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.globalAlpha = 0.3
        grd.addColorStop(0, '#8ED6FF')
        grd.addColorStop(0.2, '#004CB3')
        grd.addColorStop(0.8, '#EE4CB3')
        //grd.addColorStop(0.6, '#E000EE')
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, canvas.width, canvas.height)


        player.velX *= worldG.friction
        player.velY += worldG.gravity






        player.grounded = false
        boxes.map(x => {
          ctx.fillStyle = 'rgb(74,246,38)'
          ctx.fillRect(x.posX, x.posY, x.width, x.height)
          var dir  = collisionDetection(player, x)

          if (dir === 'l' || dir === 'r') {
            player.velX = 0
            player.jumping = false
          } else if (dir === 'b') {

            player.grounded = true
            player.jumping = false
          } else if (dir === 't') {
            player.velY = 0

          }



        })



        if(player.grounded){
          player.velY = 0
        }


        let impactCheck = collisionDetection(player, wall)
        if (impactCheck === 'l' || impactCheck === 'r') {
          lives--
            wall.posX = canvas.width
        } else if (impactCheck === 'b') {

          lives--
            wall.posX = canvas.width
        } else if (impactCheck === 't') {
          lives--
            wall.posX = canvas.width

        }


        player.posX += player.velX
        player.posY += player.velY






        grd2.addColorStop(0.8, '#8ED6FF')

        grd2.addColorStop(0.2, '#EE4CB3')



        ctx.fillStyle = grd2

        ctx.fillRect(player.posX, player.posY, player.width, player.height)

        ctx.globalAlpha = 1
        ctx.fillStyle = 'rgba(255,255,255,0.8 )'
        ctx.fillStyle = 'blue'
        ctx.fillRect(wall.posX, wall.posY, 30, wall.height)
        wall.posX-=2
        if(wall.posX < -10){
          wall.posX = canvas.width
        }


      }
      requestAnimationFrame(gameLoop)

    }




    gameLoop()




    let container
    let camera, scene, renderer



    const world  = new CANNON.World()
    world.broadphase = new CANNON.NaiveBroadphase()
    world.gravity.set(0,-20,0)
    world.solver.iterations = 20

    init()
    animate()


    const dt = 1/60

    function init() {

      container = document.createElement( 'div' )
      document.body.appendChild( container )

      // scene

      scene = new THREE.Scene()

      scene.fog = new THREE.Fog( 0x000000, 500, 10000 )

      // camera

      camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 0.5, 10000 )



      scene.add( camera )




      // lights
      var light
      scene.add( new THREE.AmbientLight( 0x666666 ) )

      light = new THREE.DirectionalLight( 0xffffff, 1.75 )
      var d = 5

      light.position.set( d, d, d )

      light.castShadow = true
      //light.shadowCameraVisible = true;



      scene.add( light )

      scene.background = new THREE.Color( 0x000000 )


      renderer = new THREE.WebGLRenderer( {alpha: false } ) ;              renderer.setSize( window.innerWidth, window.innerHeight )

      container.appendChild( renderer.domElement )

      window.addEventListener( 'resize', onWindowResize, false )

      // camera.lookAt( sphereMesh.position );
    }



    function onWindowResize() {

      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      // controls.handleResize();

      renderer.setSize( window.innerWidth, window.innerHeight )

    }

    // var controls = new OrbitControls( camera, renderer.domElement )

    const  texture = new THREE.CanvasTexture(canvas)
    console.log(texture)

    texture.minFilter = THREE.LinearFilter

    var geometry = new THREE.BoxBufferGeometry( 4, 2, 2 )
    var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, map: texture} )
    const playerScreen = new THREE.Mesh( geometry, material )
    playerScreen.matrixWorldNeedsUpdate = true
    playerScreen.elementsNeedUpdate = true
    playerScreen.verticesNeedUpdate = true
    scene.add( playerScreen )

    camera.position.x=0
    camera.position.y=4
    camera.position.z=25
    camera.lookAt( playerScreen.position );

    const playerMaterial = new CANNON.Material('playerMaterial')

    const groundMaterial = new CANNON.Material('groundMaterial')

    const ballMaterial = new CANNON.Material('ballMaterial')





    const playerScreenCannonShape = new CANNON.Box(new CANNON.Vec3(2,1,1))
    const playerScreenBody = new  CANNON.Body({ mass: 10, material: playerMaterial})

    playerScreenBody.addShape(playerScreenCannonShape)
    // playerScreenBody.fixedRotation = true
    playerScreenBody.linearDamping = 0.1
    world.addBody(playerScreenBody)

  //   playerScreenBody.addEventListener('collide',function(e){
  //     playerScreenBody.velocity.y+=1
  //
  //
  // })

    const groundShape = new CANNON.Box(new CANNON.Vec3(300,300,2))
    const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial })
    groundBody.addShape(groundShape)
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
    groundBody.position.set(0,0,0)
    groundBody.position.y = -3

    world.addBody(groundBody)
    var groundPlayerContactMaterial = new CANNON.ContactMaterial(groundMaterial, playerMaterial, { friction: 0.0, restitution: 0.0 })
    world.addContactMaterial(groundPlayerContactMaterial)
    world.solver.iterations = 10

    world.defaultContactMaterial.contactEquationStiffness = 1e7
    world.defaultContactMaterial.contactEquationRelaxation = 4
    const cannonDebugRenderer = new THREE.CannonDebugRenderer( scene, world )
    let balls = []
    let ballMeshes = []
    console.log(playerScreenBody)
    function ballCreate(x,y){
      const materialBall = new THREE.MeshPhongMaterial( { color: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)`, specular: `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},1)` , shininess: 100, side: THREE.DoubleSide, opacity: 1,
        transparent: true } )

      const ballGeometry = new THREE.SphereGeometry(0.2, 32, 32)
      const ballMesh = new THREE.Mesh( ballGeometry, materialBall )
      ballMesh.name = 'ball'
      scene.add(ballMesh)
      ballMeshes.push(ballMesh)




      const ballShape = new CANNON.Sphere(0.1)
      const ballBody = new CANNON.Body({ mass: 1, material: ballMaterial })
      ballBody.addShape(ballShape)
      ballBody.linearDamping = 0
      world.addBody(ballBody)
      balls.push(ballBody)
      ballBody.position.set(x,y,60)
      ballBody.velocity.z = -10
      ballBody.addEventListener('collide',function(e){

        console.log(e.contact.bj.material.name)
        if(e.contact.bj.material.name === 'playerMaterial'){

          lives--


        }
      })
    }
    let startPos =  playerScreenBody.position
    let startQuart = playerScreenBody.quaternion
    console.log(startPos)
    console.log(startQuart)


    ballCreate(0, Math.floor(Math.random()*25))
    setInterval(function () {
      console.log('hiya')
      if(playing){
        ballCreate(-2+Math.floor(Math.random()*4), Math.floor(Math.random()*25))
        score+=1
      }
    }, 5000)

    function animate() {
      if(playerScreen){
        //playerScreen.rotation.x+=0.01
      }
      requestAnimationFrame( animate )
      // controls.update();
      world.step(dt)


      if(cannonDebugRenderer){
        // cannonDebugRenderer.update()
      }
      render()
      if(texture){
        texture.needsUpdate = true
      }
    }

    function render() {

      if(playerScreen){
        playerScreen.position.copy(playerScreenBody.position)
        playerScreen.quaternion.copy(playerScreenBody.quaternion)
      }
      if(balls){
        for(var j=0; j<balls.length; j++){
          ballMeshes[j].position.copy(balls[j].position)
          ballMeshes[j].quaternion.copy(balls[j].quaternion)
        }
      }
      //console.log(camera)

      renderer.render( scene, camera)

    }


  }

  componentDidUpdate(){



  }




  render() {

    //console.log(this.state)

    return (
      <div>

        <div className="info">
     Score  :<span id="score" className="banner"></span>
     Lives  :<span id="lives" className="banner"></span>
        <div>Clap and Space Bar To Jump</div>
        </div>
        <div id="reset" className="hide"></div>
        <canvas id='canvas' width="1200" height="600"> </canvas>
      </div>


    )
  }
}
export default Main
