



const canvas = document.querySelector('canvas')
const ctx =canvas.getContext('2d') //dibujado 2d


const $sprite = document.querySelector('#sprite')
const $bricks = document.querySelector('#bricks')
const $borde = document.querySelector('#borde')


// Ajuste del tamaño del canvas
canvas.width = 448
canvas.height = 400

/* Variables de nuestro juego */
let score = 0;
let lives = 3;
let time = 0; // Tiempo en segundos
let destroyedBricks = 0; // Contador de ladrillos destruidos

function updateGameInfo() {
    document.getElementById('score-value').innerText = score;
    document.getElementById('lives-value').innerText = lives;
    document.getElementById('time-value').innerText = formatTime(time);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Lógica para actualizar el tiempo, el puntaje y las vidas en tu juego
setInterval(() => {
    time++;
    updateGameInfo();
}, 1000);



/*Variables de la Pelota */
const ballRadius = 3;

//posicion de la pelota
let x = canvas.width / 2
let y = canvas.height -30
//velocidad de la pelota
let dx = -3
let dy = -3

/*variables de la Paleta*/
let PADDLE_SENSITITIVITY = 5 // sensibilidad del paddle

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

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const currentBrick = bricks[c][r];
            if (currentBrick.status === BRICK_STATUS.DESTROYED) continue;

            // Tener en cuenta el radio de la pelota en las comparaciones
            const isBallSameXAsBrick =
                x + ballRadius > currentBrick.x &&
                x - ballRadius < currentBrick.x + brickWidth;

            const isBallSameYAsBrick =
                y + ballRadius > currentBrick.y &&
                y - ballRadius < currentBrick.y + brickHeight;

            if (isBallSameXAsBrick && isBallSameYAsBrick) {
                dy = -dy; // Rebota la pelota
                currentBrick.status = BRICK_STATUS.DESTROYED; // Marca el ladrillo como destruido
                score += 10; // Suma puntos por destruir el ladrillo
                destroyedBricks++; // Aumenta el contador de ladrillos destruidos
                updateGameInfo(); // Actualiza la información en pantalla

                // Aumentar la dificultad después de destruir un ladrillo
                if (destroyedBricks % 10 === 0) { // Cada 5 ladrillos aumenta la dificultad
                    dx *= 1.2; // Aumenta la velocidad de la pelota
                    dy *= 1.2; 
                    PADDLE_SENSITITIVITY *= 1.55; // Aumentar la sensibilidad del paddle
                    console.log(`Paddle Speed Increased: ${PADDLE_SENSITITIVITY}`);                   
                }         

                // Comprobar si todos los ladrillos fueron destruidos
                checkForVictory(); // Llamada aquí       
            }
        }
    }
}

function checkForVictory() {
    let allBricksDestroyed = true;

    // Recorre todos los ladrillos para ver si aún queda alguno activo
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === BRICK_STATUS.ACTIVE) {
                allBricksDestroyed = false;
                break;
            }
        }
    }

    // Si todos los ladrillos están destruidos, muestra la alerta de victoria
    if (allBricksDestroyed) {
        showVictoryMessage(); // Mostrar mensaje de victoria y detener el juego
    }
}

function showVictoryMessage() {
    gameOver = true; // Detener el juego

    // Crear enlace para abrir el gestor de correos
    const mailtoLink = "mailto:danielh.fsdev@gmail.com?subject=Victoria en Arkanoid&body=¡He ganado el juego! Aquí está la captura de pantalla adjunta.";
    
    // Mostrar mensaje de victoria
    const message = `
        ¡Enhorabuena, has ganado el juego!
        Haz una captura de pantalla de tu victoria y envíala haciendo clic en el enlace.
        <a href="${mailtoLink}" target="_blank">Enviar correo</a>
        <br><br>
        <button id="continue-btn">Continuar</button>
    `;
    
    // Mostrar alerta con HTML personalizado
    const victoryAlert = document.createElement('div');
    victoryAlert.innerHTML = message;
    victoryAlert.style.cssText = `
        position: fixed;
        top: 30%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 0 10px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(victoryAlert);

    // Añadir funcionalidad al botón para reiniciar el juego
    document.getElementById('continue-btn').addEventListener('click', () => {
        document.body.removeChild(victoryAlert);
        document.location.reload(); // Reiniciar el juego
    });
}

function ballMovement() {
    // Rebotar las pelotas en los laterales
    if (
        x + dx > canvas.width - ballRadius || // pared derecha
        x + dx < ballRadius // pared izquierda
    ) {
        dx = -dx;
    }

    // Rebotar en la parte de arriba
    if (y + dy < ballRadius) {
        dy = -dy;
    } else if (y + dy > paddLeY + paddleHeight) {
        lives--;
        updateGameInfo();
        if (lives === 0) {
            gameOver = true;
            alert('Game Over');
            document.location.reload();
        } else {
            resetGameAfterLifeLoss(); // Reiniciar el juego con la mitad de la velocidad
        }
    }

    // La pelota toca la paleta
    const isBallSameXAsPaddle =
        x > paddLeX &&
        x < paddLeX + paddleWidth;

    const isBallTouchingPaddle =
        y + dy > paddLeY;

    if (isBallTouchingPaddle && isBallSameXAsPaddle) {
        // Calcular el punto de impacto en la paleta
        const impactPoint = (x - paddLeX) / paddleWidth;
        const angle = (impactPoint - 0.5) * Math.PI / 3; // Ajusta el ángulo según el impacto

        // Cambiar la dirección de la pelota, manteniendo una velocidad constante
        const speed = Math.sqrt(dx * dx + dy * dy); // Obtener la velocidad actual
        dx = speed * Math.sin(angle); // Actualizar dx
        dy = -speed * Math.cos(angle); // Actualizar dy

        // Asegúrate de que la pelota no se quede atrapada en el paddle
        if (dy > 0) {
            dy = -dy; // Asegúrate de que la pelota se mueva hacia arriba
        }
    } else if (y + dy > canvas.height - ballRadius || y + dy > paddLeY + paddleHeight) {
        // Verificar si la pelota cae por debajo del canvas o de la paleta
        gameOver = true;
        console.log('Game Over');
        document.location.reload();
    }

    // Mover la pelota
    x += dx;
    y += dy;
}

function paddleMovement (){

    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });


    if (rightPressed && paddLeX < canvas.width - paddleWidth){
        paddLeX += PADDLE_SENSITITIVITY
    } else if (leftPressed && paddLeX > 0){
        paddLeX -= PADDLE_SENSITITIVITY
    }   

    // Mueve el paddle según la posición del dedo
    function onTouchMove(event) {
        const touch = event.touches[0]; // Tomar el primer toque (si hay más de uno)
        const touchX = touch.clientX - canvas.offsetLeft; // Obtener la coordenada X del toque, relativa al canvas
    
    // Mover el paddle según la posición del toque
    paddLeX = touchX - paddleWidth / 2;

    // Evitar que el paddle se salga del canvas
    if (paddLeX < 0) paddLeX = 0;
    if (paddLeX > canvas.width - paddleWidth) paddLeX = canvas.width - paddleWidth;
}

// Si el dedo se levanta o termina el toque
    function onEnd() {
        rightPressed = false;
        leftPressed = false;
}

}

function cleanCanvas(){
ctx.clearRect(0, 0, canvas.width, canvas.height)
}

// Variables para almacenar los valores iniciales
const INITIAL_DX = -3;
const INITIAL_DY = -3;
const INITIAL_PADDLE_SENSITIVITY = 5;

function resetGameAfterLifeLoss() {
    // Restablecer posición de la pelota
    x = canvas.width / 2;
    y = canvas.height - 30;
    
    // Reducir la velocidad de la bola y la sensibilidad de la paleta a la mitad,
    // pero asegurando que no bajen de los valores iniciales.
    dx = Math.sign(dx) * Math.max(Math.abs(dx) * 0.5, Math.abs(INITIAL_DX));
    dy = Math.sign(dy) * Math.max(Math.abs(dy) * 0.5, Math.abs(INITIAL_DY));
    PADDLE_SENSITITIVITY = Math.max(PADDLE_SENSITITIVITY * 0.5, INITIAL_PADDLE_SENSITIVITY);

    // Reiniciar la posición de la paleta
    paddLeX = (canvas.width - paddleWidth) / 2;
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
    PADDLE_SENSITITIVITY = 5
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

function simulateVictory() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r].status = BRICK_STATUS.DESTROYED; // Marcar todos los ladrillos como destruidos
        }
    }

    // Llamar a la verificación de victoria
    checkForVictory();
}

// Ejecutar la simulación de victoria inmediatamente después de inicializar el juego
//simulateVictory();

draw()
iniEvents()
