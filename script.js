// Obtener el canvas y el contexto
const canvas = document.getElementById("tetrisCanvas");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

const TETROMINOS = [
  [[1, 1, 1, 1]], // I
  [[1, 1], [1, 1]], // O
  [[0, 1, 0], [1, 1, 1]], // T
  [[1, 0, 0], [1, 1, 1]], // L
  [[0, 0, 1], [1, 1, 1]], // J
  [[1, 1, 0], [0, 1, 1]], // S
  [[0, 1, 1], [1, 1, 0]], // Z
];

let currentPiece = createPiece();
let board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
let gameOver = false;
let score = 0;
let speed = 500; // Velocidad inicial en milisegundos (más lento)

// Función para crear una pieza aleatoria
function createPiece() {
  const randomIndex = Math.floor(Math.random() * TETROMINOS.length);
  return {
    shape: TETROMINOS[randomIndex],
    x: Math.floor(COLS / 2) - Math.floor(TETROMINOS[randomIndex][0].length / 2),
    y: 0,
    color: getPieceColor(randomIndex),
    rotationState: 0 // Empezamos en la rotación "0" (izquierda)
  };
}

// Función para obtener un color para cada pieza
function getPieceColor(index) {
  const colors = ["#1abc9c", "#f39c12", "#8e44ad", "#3498db", "#e67e22", "#2ecc71", "#e74c3c"];
  return colors[index];
}

// Función para dibujar la pieza
function drawPiece(piece) {
  for (let row = 0; row < piece.shape.length; row++) {
    for (let col = 0; col < piece.shape[row].length; col++) {
      if (piece.shape[row][col]) {
        ctx.fillStyle = piece.color;
        ctx.fillRect((piece.x + col) * BLOCK_SIZE, (piece.y + row) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = "black";
        ctx.strokeRect((piece.x + col) * BLOCK_SIZE, (piece.y + row) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
}

// Función para dibujar el tablero
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col]) {
        ctx.fillStyle = board[row][col];
        ctx.fillRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = "black";
        ctx.strokeRect(col * BLOCK_SIZE, row * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
      }
    }
  }
  drawPiece(currentPiece);
  displayScore();
}

// Mostrar la puntuación
function displayScore() {
  const scoreElement = document.getElementById("score");
  scoreElement.textContent = score;
}

// Función para mover la pieza hacia abajo
function movePieceDown() {
  currentPiece.y++;
  if (isPieceOutOfBounds()) {
    currentPiece.y--;
    addPieceToBoard();
    checkLines();
    currentPiece = createPiece();
    if (isPieceOutOfBounds()) {
      gameOver = true;
      alert("Game Over! Puntuación final: " + score);
    }
  }
}

// Comprobar si la pieza está fuera de los límites
function isPieceOutOfBounds() {
  for (let row = 0; row < currentPiece.shape.length; row++) {
    for (let col = 0; col < currentPiece.shape[row].length; col++) {
      if (currentPiece.shape[row][col]) {
        if (currentPiece.y + row >= ROWS || currentPiece.x + col < 0 || currentPiece.x + col >= COLS || board[currentPiece.y + row][currentPiece.x + col]) {
          return true;
        }
      }
    }
  }
  return false;
}

// Añadir pieza al tablero
function addPieceToBoard() {
  for (let row = 0; row < currentPiece.shape.length; row++) {
    for (let col = 0; col < currentPiece.shape[row].length; col++) {
      if (currentPiece.shape[row][col]) {
        board[currentPiece.y + row][currentPiece.x + col] = currentPiece.color;
      }
    }
  }
}

// Eliminar las líneas completas
function checkLines() {
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row].every(cell => cell)) {
      board.splice(row, 1);
      board.unshift(Array(COLS).fill(null));
      score += 100;
      if (score >= 1000) {
        increaseSpeed();
      }
      row++;
    }
  }
}

// Función para aumentar la velocidad del juego
function increaseSpeed() {
  if (speed > 100) { // Asegurarse de que no se vuelva demasiado rápido
    speed -= 50; // Disminuir el tiempo de espera, aumentando la velocidad
  }
}

// Función para manejar las teclas
function movePiece(e) {
  if (gameOver) return;
  if (e.key === "ArrowLeft") {
    currentPiece.x--;
    if (isPieceOutOfBounds()) {
      currentPiece.x++;
    }
  } else if (e.key === "ArrowRight") {
    currentPiece.x++;
    if (isPieceOutOfBounds()) {
      currentPiece.x--;
    }
  } else if (e.key === "ArrowDown") {
    movePieceDown();
  } else if (e.key === "ArrowUp") {
    rotatePiece(); // Permite rotar en un ciclo
  }
  drawBoard();
}

// Función para rotar la pieza en un ciclo de rotaciones
function rotatePiece() {
  const rotations = [
    currentPiece.shape, // Estado original (izquierda)
    rotateMatrix(currentPiece.shape), // Rotación hacia abajo
    rotateMatrix(rotateMatrix(currentPiece.shape)) // Rotación hacia derecha
  ];

  currentPiece.rotationState = (currentPiece.rotationState + 1) % 3; // Cambiar entre 0, 1, 2
  currentPiece.shape = rotations[currentPiece.rotationState];
}

// Función para rotar una matriz 90 grados
function rotateMatrix(matrix) {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex])).reverse();
}

// Añadir el evento de teclado
document.addEventListener("keydown", movePiece);

// Función de actualización del juego
function gameLoop() {
  if (gameOver) {
    alert("Game Over! Puntuación final: " + score);
    return;
  }
  movePieceDown();
  drawBoard();
  setTimeout(gameLoop, speed); // Usar la velocidad dinámica
}

gameLoop();
