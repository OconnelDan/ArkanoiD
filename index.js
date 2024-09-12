



const canvas = document.querySelector('canvas')
const ctx =canvas.getContext('2d') //dibujado 2d

const $sprite = document.querySelector('#sprite')
const $bricks = document.querySelector('#bricks')

canvas.width = 448
canvas.height = 400
/* Variables de nuestro juego */
let counter = 0

/*Variables de la Pelota */
const ballRadius = 3;

//posicion de la pelota
let x = canvas.width / 2
let y = canvas.height -30
//velocidad de la pelota
let dx = -3
let dy = -3

/*variables de la Paleta*/
const PADDLE_SENSITITIVITY = 5 // sensibilidad del paddle

const paddleHeight = 10;
const paddleWidth = 50;

let paddLeX = (canvas.width - paddleWidth) / 2
let paddLeY = canvas.height - paddleHeight -10

let rightPressed = false
let leftPressed = false

/*Variables de los Ladrillos */
const brickRowCount = 6;
const brickColumnCount = 13;
const brickWidth = 32;
const brickHeight = 16;
const brickPadding = 0;
const brickOffsetTop = 80;
const brickOffsetLeft = 18;
const bricks = [];

const BRICK_STATUS = {
    ACTIVE: 1,
    DESTROYED: 0
}


for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [] //inicializamos con un array vacio
    for ( let r = 0; r < brickRowCount; r++) {
        //calculamos la posicion del ladrillo en la pantalla
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop
        //asignamos un color aleatorio a cada ladrillo
        const random = Math.floor(Math.random() * 8)
        //guardamos la info de cada ladrillo
        bricks[c][r] = {
            x: brickX,
             y: brickY,
             status: BRICK_STATUS.ACTIVE,
             color: random
        }
    }
}


function drawBall () {
   ctx.beginPath() // iniciar el trazado
   ctx.arc( x, y, ballRadius, 0, Math.PI *2 )
   ctx.fillStyle = '#fff'
   ctx.fill()
   ctx.closePath() // terminar el trazado
}

function drawPaddle (){

   /* ctx.fillStyle = '#09f'
    ctx.fillRect(
        paddLeX, // la  cordenada x 
        paddLeY, // la coordenada y
        paddleWidth, // el ancho del dibujo        
        paddleHeight // el alto del dibujo
    )
    */

    ctx.drawImage(
        
        $sprite, //la imagen
        29, // clipX : coordenadas de recorte
        174, //clipY: coordenadas de recorte
        paddleWidth, // tamaño del recorte
        paddleHeight, // tamaño del recorte
        paddLeX, // posicion X del dibujo
        paddLeY, // posicion Y del dibujo 
        paddleWidth, // ancho del dibujo
        paddleHeight // alto del dibujo
        
    )

}

function drawBricks (){
    for (let c = 0; c < brickColumnCount; c++) {
        for ( let r = 0; r < brickRowCount; r++){
            const currentBrick = bricks[c][r]
            if (currentBrick.status === BRICK_STATUS.DESTROYED)
                continue;

           /* ctx.fillStyle ='yellow'
            ctx.rect (
                currentBrick.x,
                currentBrick.y,
                brickWidth,
                brickHeight
            )
            ctx.strokeStyle = '#000'
            ctx.stroke()
            ctx.fill()

            */

            const clipX = currentBrick.color * 32

            ctx.drawImage(
                $bricks,
                clipX,
                0,
                brickWidth, //31
                brickHeight, //14
                currentBrick.x,
                currentBrick.y,
                brickWidth,
                brickHeight

            )
            

        }
    }    
}

function drawUI() {
    ctx.fillText(`FPS: ${framesPerSec}`, 5, 10)
  }

function collisionDetection (){
    for (let c = 0; c < brickColumnCount; c++) {
        for ( let r = 0; r < brickRowCount; r++){
            const currentBrick = bricks[c][r]
            if (currentBrick.status === BRICK_STATUS.DESTROYED) continue;

            // Tener en cuenta el radio de la pelota en las comparaciones
            const issBallSameXAsBrick =
                x + ballRadius > currentBrick.x &&
                x - ballRadius < currentBrick.x + brickWidth;

            const issBallSameYAsBrick =
                y + ballRadius > currentBrick.y &&
                y - ballRadius < currentBrick.y + brickHeight;

            if ( issBallSameXAsBrick && issBallSameYAsBrick){
                dy = -dy
                currentBrick.status = BRICK_STATUS.DESTROYED
            }
        
        }

    }    
}

function ballMovement (){
    // rebotar las pelotas en los laterales
    if (
        x + dx > canvas.width - ballRadius || // pared derecha
        x + dx <  ballRadius // pared izquierda
    ){
        dx = -dx
    }

    //rebotar en la parte de arriba

    if ( y + dy < ballRadius) {
        dy = -dy 
    }

    //la pelota toca la pala
    const issBallSameXAsPaddle =
    x > paddLeX &&
    x < paddLeX + paddleWidth

    const issBallTouchingPaddle = 
    y + dy > paddLeY;


    if( issBallTouchingPaddle && issBallSameXAsPaddle ) {
        dy = -dy // cambiamos la direccion de la pelota 
    }  else if ( // la pelota toca el suelo
         y + dy > canvas.height - ballRadius || y + dy > paddLeY + paddleHeight
        ) {
        gameOver = true
        console.log('Game Over')
        document.location.reload()

        //resetGame();
    }

    //mover la pelota
    x += dx    
    y += dy
}

function paddleMovement (){
    if (rightPressed && paddLeX < canvas.width - paddleWidth){
        paddLeX += PADDLE_SENSITITIVITY
    } else if (leftPressed && paddLeX > 0){
        paddLeX -= PADDLE_SENSITITIVITY
    }   
}



function cleanCanvas(){
ctx.clearRect(0, 0, canvas.width, canvas.height)
}

// Función para reiniciar el juego
function resetGame() {
    // Restablecer posición y velocidad de la pelota
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = -2;
    dy = -2;

    // Reiniciar la posición de la paleta
    paddleX = (canvas.width - paddleWidth) / 2;
}

function iniEvents (){
    document.addEventListener('keydown', keyDownHandler)
    document.addEventListener('keyup', keyUpHandler)

    function keyDownHandler(event) {
        const { key } = event
        if (key === 'Right' || key === 'ArrowRight' || key.toLowerCase() === 'd') {
          rightPressed = true
        } else if (key === 'Left' || key === 'ArrowLeft' || key.toLowerCase() === 'a') {
          leftPressed = true
        }
      }


    
      function keyUpHandler(event) {
        const { key } = event
        if (key === 'Right' || key === 'ArrowRight' || key.toLowerCase() === 'd') {
          rightPressed = false
        } else if (key === 'Left' || key === 'ArrowLeft' || key.toLowerCase() === 'a') {
          leftPressed = false
        }
      }
    }

    // a que velocidad de fps queremos que renderice nuestro juego
     const fps = 60

     let msPrev = window.performance.now()
     let msFPSPrev = window.performance.now() + 1000;
     const msPerFrame = 1000 / fps
     let frames = 0
     let framesPerSec = fps;
   
     let gameOver = false;

function draw (){
     if (gameOver) return
    
    window.requestAnimationFrame(draw)

    const msNow = window.performance.now()
    const msPassed = msNow - msPrev

    if (msPassed < msPerFrame) return

    const excessTime = msPassed % msPerFrame
    msPrev = msNow - excessTime

    frames++

    if (msFPSPrev < msNow)
    {
      msFPSPrev = window.performance.now() + 1000
      framesPerSec = frames;
      frames = 0;
    }

    cleanCanvas()
    //aqui haremos tus dibujos y checks de colisiones
    //dibujar los elemeentos
    drawBall()
    drawPaddle()
    drawBricks()
    // drawScore()

    //colisiones y movimiento
    collisionDetection()
    ballMovement()
    paddleMovement()




    window.requestAnimationFrame(draw)
}

draw()
iniEvents()
