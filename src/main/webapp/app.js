
const app = document.querySelector("#app");
const PUZZLE_NAME = "Cherry Blossom Memory";
const IMAGE_URL = "assets/cherry-blossom-garden.png";
const COLUMNS = 4, ROWS = 3, TOTAL = 12;
const state = { name: "", seconds: 0, placed: 0, timer: null, complete: false };
let pieces = [], drag = null;

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c])); }
function formatTime(value) { return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`; }
function score() { return Math.max(100, 1800 - state.seconds * 2); }
function stopGame() { if (state.timer) clearInterval(state.timer); state.timer = null; pieces = []; drag = null; document.removeEventListener("pointermove", movePiece); document.removeEventListener("pointerup", dropPiece); }
function header() { return `<header><a href="#" id="home"> JIGSAW</a>${state.name ? `<span>Hello, ${escapeHtml(state.name)}</span>` : ""}</header>`; }
function bindHome() { document.querySelector("#home")?.addEventListener("click", event => { event.preventDefault(); welcome(); }); }

function welcome() {
  stopGame();
  app.innerHTML = `<main class="welcome">${header()}<section class="card intro"><p class="label">MEMORY JIGSAW</p><h1>Look. Remember. Solve.</h1><p>Study a cherry-blossom scene, then rebuild it from its 12 mixed-up pieces.</p><button id="play">Play puzzle</button><button class="secondary" id="scores">View leaderboard</button></section></main>`;
  bindHome(); document.querySelector("#play").onclick = nameScreen; document.querySelector("#scores").onclick = leaderboard;
}

function nameScreen() {
  stopGame();
  app.innerHTML = `<main class="welcome">${header()}<section class="card"><p class="label">PLAYER</p><h1>Enter your name</h1><p>Your name appears on the leaderboard after completion.</p><form id="nameForm"><label for="playerName">Name</label><input id="playerName" maxlength="24" value="${escapeHtml(state.name)}" placeholder="Your name"><small id="error"></small><button>Continue</button></form></section></main>`;
  bindHome(); document.querySelector("#playerName").focus();
  document.querySelector("#nameForm").onsubmit = event => {
    event.preventDefault();
    const name = document.querySelector("#playerName").value.trim();
    if (!/^[A-Za-z0-9 ]{1,24}$/.test(name)) { document.querySelector("#error").textContent = "Use 1–24 letters, numbers, or spaces."; return; }
    state.name = name; preview();
  };
}

function preview() {
  stopGame();
  app.innerHTML = `<main class="welcome">${header()}<section class="card preview"><p class="label">STUDY THE PICTURE</p><h1>Remember this scene</h1><p>This image disappears when you start. Use your memory to solve the puzzle.</p><img src="${IMAGE_URL}" alt="Cherry blossom trees beside a river"><button id="start">I remember — start puzzle</button><button class="secondary" id="back">Back</button></section></main>`;
  bindHome(); document.querySelector("#start").onclick = game; document.querySelector("#back").onclick = nameScreen;
}

function game() {
  stopGame(); Object.assign(state, { seconds: 0, placed: 0, complete: false });
  app.innerHTML = `<main>${header()}<section class="game"><div class="game-head"><div><p class="label">CHERRY BLOSSOM MEMORY</p><h1>Put the picture back together</h1></div><div class="stats"><span>Time <b id="time">00:00</b></span><span>Pieces <b id="pieces">0/12</b></span></div></div><div id="stage"><section><h2>Board</h2><div id="board" aria-label="Puzzle board"></div></section><section><h2>Pieces</h2><div id="tray"></div></section></div><p class="tip">The board is blank. A piece snaps into place only when it is dropped in its correct position.</p><button class="secondary" id="restart">Restart</button></section></main>`;
  bindHome(); document.querySelector("#restart").onclick = preview;
  requestAnimationFrame(() => { createPieces(); startTimer(); });
}

function createPieces() {
  const stage = document.querySelector("#stage"), board = document.querySelector("#board"), tray = document.querySelector("#tray");
  const stageRect = stage.getBoundingClientRect(), boardRect = board.getBoundingClientRect(), trayRect = tray.getBoundingClientRect();
  const width = boardRect.width / COLUMNS, height = boardRect.height / ROWS, scale = .57, gap = 8;

  for (let index = 0; index < TOTAL; index += 1) {
    const target = document.createElement("div"), column = index % COLUMNS, row = Math.floor(index / COLUMNS);
    target.className = "target"; target.dataset.index = index;
    Object.assign(target.style, { left: `${column * width}px`, top: `${row * height}px`, width: `${width}px`, height: `${height}px` });
    board.appendChild(target);
  }

  const order = Array.from({ length: TOTAL }, (_, index) => index).sort(() => Math.random() - .5);
  const smallWidth = width * scale, smallHeight = height * scale;
  const trayColumns = Math.max(2, Math.floor((trayRect.width - 22) / (smallWidth + gap)));
  tray.style.height = `${Math.ceil(TOTAL / trayColumns) * (smallHeight + gap) + 18}px`;

  order.forEach((index, position) => {
    const column = index % COLUMNS, row = Math.floor(index / COLUMNS), trayColumn = position % trayColumns, trayRow = Math.floor(position / trayColumns);
    const element = document.createElement("div"); element.className = "piece"; stage.appendChild(element);
    const homeX = trayRect.left - stageRect.left + 11 + trayColumn * (smallWidth + gap);
    const homeY = trayRect.top - stageRect.top + 10 + trayRow * (smallHeight + gap);
    const piece = { element, index, column, row, width, height, scale, homeX, homeY, placed: false };
    pieces.push(piece); setPieceScale(piece, scale); element.style.left = `${homeX}px`; element.style.top = `${homeY}px`;
    element.addEventListener("pointerdown", event => beginDrag(event, piece));
  });
}

function setPieceScale(piece, scale) {
  const board = document.querySelector("#board").getBoundingClientRect();
  Object.assign(piece.element.style, { width: `${piece.width * scale}px`, height: `${piece.height * scale}px`, backgroundImage: `url("${IMAGE_URL}")`, backgroundSize: `${board.width * scale}px ${board.height * scale}px`, backgroundPosition: `-${piece.column * piece.width * scale}px -${piece.row * piece.height * scale}px` });
}

function beginDrag(event, piece) {
  if (piece.placed) return;
  event.preventDefault(); setPieceScale(piece, 1); piece.element.classList.add("dragging"); drag = { piece, pointerId: event.pointerId };
  moveToPointer(event); document.addEventListener("pointermove", movePiece); document.addEventListener("pointerup", dropPiece);
}
function movePiece(event) { if (drag?.pointerId === event.pointerId) moveToPointer(event); }
function moveToPointer(event) { const box = document.querySelector("#stage").getBoundingClientRect(), piece = drag.piece; piece.element.style.left = `${event.clientX - box.left - piece.width / 2}px`; piece.element.style.top = `${event.clientY - box.top - piece.height / 2}px`; }
function dropPiece(event) {
  if (drag?.pointerId !== event.pointerId) return;
  const piece = drag.piece, stage = document.querySelector("#stage"), board = document.querySelector("#board"), stageRect = stage.getBoundingClientRect(), boardRect = board.getBoundingClientRect();
  document.removeEventListener("pointermove", movePiece); document.removeEventListener("pointerup", dropPiece); drag = null; piece.element.classList.remove("dragging");
  const centerX = stageRect.left + parseFloat(piece.element.style.left) + piece.width / 2;
  const centerY = stageRect.top + parseFloat(piece.element.style.top) + piece.height / 2;
  const column = Math.floor((centerX - boardRect.left) / piece.width), row = Math.floor((centerY - boardRect.top) / piece.height);
  if (centerX >= boardRect.left && centerX <= boardRect.right && centerY >= boardRect.top && centerY <= boardRect.bottom && row * COLUMNS + column === piece.index) snap(piece, stageRect, boardRect);
  else returnPiece(piece);
}
function snap(piece, stageRect, boardRect) {
  piece.placed = true; piece.element.classList.add("placed");
  piece.element.style.left = `${boardRect.left - stageRect.left + piece.column * piece.width}px`; piece.element.style.top = `${boardRect.top - stageRect.top + piece.row * piece.height}px`;
  document.querySelector(`.target[data-index="${piece.index}"]`).classList.add("filled"); state.placed += 1; updateStats();
  if (state.placed === TOTAL) setTimeout(finish, 350);
}
function returnPiece(piece) {
  piece.element.classList.add("wrong");
  setTimeout(() => { piece.element.classList.remove("wrong"); setPieceScale(piece, piece.scale); piece.element.style.left = `${piece.homeX}px`; piece.element.style.top = `${piece.homeY}px`; }, 280);
}
function startTimer() { updateStats(); state.timer = setInterval(() => { state.seconds += 1; updateStats(); }, 1000); }
function updateStats() { document.querySelector("#time").textContent = formatTime(state.seconds); document.querySelector("#pieces").textContent = `${state.placed}/12`; }

async function finish() {
  if (state.complete) return; state.complete = true; clearInterval(state.timer); let saved = false;
  try { const response = await fetch("api/results", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ playerName: state.name, puzzleName: PUZZLE_NAME, difficulty: "Standard", completionSeconds: state.seconds }) }); saved = response.ok; } catch (_) { }
  completeScreen(saved);
}
function completeScreen(saved) {
  stopGame(); app.innerHTML = `<main class="welcome">${header()}<section class="card"><p class="label">PUZZLE COMPLETE</p><div class="celebrate">🎉</div><h1>Well done!</h1><p>You rebuilt the cherry-blossom scene from memory.</p><p class="final-score">Score: ${score().toLocaleString()}<br><small>Time: ${formatTime(state.seconds)}</small></p><button id="again">Play again</button><button class="secondary" id="leaderboard">View leaderboard</button><small class="save-status">${saved ? "Score saved successfully." : "Score was not saved. Check that the Java server is running."}</small></section></main>`;
  bindHome(); document.querySelector("#again").onclick = preview; document.querySelector("#leaderboard").onclick = leaderboard;
}
async function leaderboard() {
  stopGame(); app.innerHTML = `<main class="welcome">${header()}<section class="card board-card"><p class="label">LOCAL SCORES</p><h1>Leaderboard</h1><div id="results">Loading…</div><button class="secondary" id="back">${state.name ? "Play puzzle" : "Home"}</button></section></main>`;
  bindHome(); document.querySelector("#back").onclick = () => state.name ? preview() : welcome();
  try { const response = await fetch("api/leaderboard"), results = await response.json(); document.querySelector("#results").innerHTML = results.length ? `<table><tr><th>#</th><th>Player</th><th>Time</th><th>Score</th></tr>${results.map((result, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(result.playerName)}</td><td>${formatTime(result.completionSeconds)}</td><td>${Number(result.score).toLocaleString()}</td></tr>`).join("")}</table>` : "No scores yet. Be the first!"; } catch (_) { document.querySelector("#results").textContent = "Start the Java server to view saved scores."; }
}
welcome();

