// ═══════════════════════════════════════════════════════════════
//  CHESS.JS — Complete Chess Game Engine
//  Castling · En Passant · Promotion · Check · Checkmate · Stalemate
// ═══════════════════════════════════════════════════════════════
'use strict';

const W = 'white', B = 'black';
const KING='K', QUEEN='Q', ROOK='R', BISHOP='B', KNIGHT='N', PAWN='P';

const UNICODE = {
  white: { K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙' },
  black: { K:'♚', Q:'♛', R:'♜', B:'♝', N:'♞', P:'♟' }
};

// ── State ─────────────────────────────────────────────────────
let board = [];
let turn  = W;
let selected = null;
let legalMoves = [];
let history = [];
let capturedByWhite = [];
let capturedByBlack = [];

let castlingRights  = { white:{kSide:true,qSide:true}, black:{kSide:true,qSide:true} };
let enPassantTarget = null;
let promotionPending = null;

let timeWhite, timeBlack, clockInterval, gameStarted = false;
let elapsedSeconds = 0;

let playerWhite = '백 플레이어', playerBlack = '흑 플레이어';
let selectedTime = 600;

let lastMoveFrom = null, lastMoveTo = null;

// ── Helpers ──────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const cellId = (r,c) => `cell-${r}-${c}`;

function formatTime(s) {
  return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
}

// ── Board Init ───────────────────────────────────────────────
function createInitialBoard() {
  const b = Array.from({length:8},()=>Array(8).fill(null));
  const order = [ROOK,KNIGHT,BISHOP,QUEEN,KING,BISHOP,KNIGHT,ROOK];
  for(let c=0;c<8;c++){
    b[0][c]={color:B,type:order[c]};
    b[1][c]={color:B,type:PAWN};
    b[6][c]={color:W,type:PAWN};
    b[7][c]={color:W,type:order[c]};
  }
  return b;
}

// ── DOM Build ────────────────────────────────────────────────
function buildBoard() {
  const cb=$('chessboard');
  cb.innerHTML='';
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      const cell=document.createElement('div');
      cell.id=cellId(r,c);
      cell.className='cell '+((r+c)%2===0?'light':'dark');
      cell.dataset.r=r; cell.dataset.c=c;
      cell.addEventListener('click',()=>onCellClick(r,c));
      cb.appendChild(cell);
    }
  }
}

function buildLabels() {
  const files='abcdefgh';
  const fl=$('file-labels');
  fl.innerHTML='';
  for(let c=0;c<8;c++){
    const d=document.createElement('div');
    d.className='file-label-item';
    d.textContent=files[c];
    fl.appendChild(d);
  }
  [$('rank-labels-left'),$('rank-labels-right')].forEach(el=>{
    el.innerHTML='';
    for(let r=0;r<8;r++){
      const d=document.createElement('div');
      d.className='rank-label-item';
      d.textContent=8-r;
      el.appendChild(d);
    }
  });
}

// ── Render ───────────────────────────────────────────────────
function renderBoard() {
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      const cell=document.getElementById(cellId(r,c));
      cell.querySelectorAll('.piece,.move-dot,.capture-ring').forEach(e=>e.remove());
      cell.classList.remove('selected','last-move','in-check');

      if(lastMoveFrom&&lastMoveFrom.r===r&&lastMoveFrom.c===c) cell.classList.add('last-move');
      if(lastMoveTo  &&lastMoveTo.r  ===r&&lastMoveTo.c  ===c) cell.classList.add('last-move');

      if(board[r][c]&&board[r][c].type===KING&&board[r][c].color===turn){
        if(isInCheck(turn,board)) cell.classList.add('in-check');
      }

      const p=board[r][c];
      if(p){
        const span=document.createElement('span');
        span.className='piece '+(p.color===W?'white-p':'black-p');
        span.textContent=UNICODE[p.color][p.type];
        cell.appendChild(span);
      }
    }
  }

  if(selected){
    document.getElementById(cellId(selected.r,selected.c)).classList.add('selected');
    legalMoves.forEach(({r,c})=>{
      const cell=document.getElementById(cellId(r,c));
      if(board[r][c]&&board[r][c].color!==turn){
        const ring=document.createElement('div');
        ring.className='capture-ring';
        cell.appendChild(ring);
      } else {
        const dot=document.createElement('div');
        dot.className='move-dot';
        cell.appendChild(dot);
      }
    });
  }
}

// ── Click ────────────────────────────────────────────────────
function onCellClick(r,c){
  if(!gameStarted||promotionPending) return;
  const piece=board[r][c];

  if(selected){
    const move=legalMoves.find(m=>m.r===r&&m.c===c);
    if(move){
      executeMove(selected.r,selected.c,r,c);
      selected=null; legalMoves=[];
      renderBoard(); return;
    }
    if(piece&&piece.color===turn){
      selected={r,c};
      legalMoves=getLegalMoves(r,c,board);
      renderBoard(); return;
    }
    selected=null; legalMoves=[];
    renderBoard(); return;
  }

  if(piece&&piece.color===turn){
    selected={r,c};
    legalMoves=getLegalMoves(r,c,board);
    renderBoard();
  }
}

// ── Execute Move ─────────────────────────────────────────────
function executeMove(fr,fc,tr,tc){
  const piece=board[fr][fc];
  const captured=board[tr][tc];
  let specialNote='', epCaptured=null;

  history.push({
    board:JSON.parse(JSON.stringify(board)),
    turn,
    castlingRights:JSON.parse(JSON.stringify(castlingRights)),
    enPassantTarget, lastMoveFrom, lastMoveTo,
    capturedByWhite:[...capturedByWhite],
    capturedByBlack:[...capturedByBlack]
  });

  let newEP=null;

  if(piece.type===PAWN){
    const dir=piece.color===W?-1:1;
    if(Math.abs(tr-fr)===2) newEP={r:fr+dir,c:fc};
    if(enPassantTarget&&tr===enPassantTarget.r&&tc===enPassantTarget.c){
      epCaptured=board[fr][tc];
      board[fr][tc]=null;
      (piece.color===W?capturedByWhite:capturedByBlack).push(epCaptured);
      specialNote='e.p.';
    }
  }

  let castleSide=null;
  if(piece.type===KING){
    const dc=tc-fc;
    if(dc===2) { board[fr][5]=board[fr][7]; board[fr][7]=null; castleSide='O-O'; }
    if(dc===-2){ board[fr][3]=board[fr][0]; board[fr][0]=null; castleSide='O-O-O'; }
    castlingRights[piece.color].kSide=false;
    castlingRights[piece.color].qSide=false;
  }
  if(piece.type===ROOK){
    if(fc===0) castlingRights[piece.color].qSide=false;
    if(fc===7) castlingRights[piece.color].kSide=false;
  }

  if(captured) (piece.color===W?capturedByWhite:capturedByBlack).push(captured);

  board[tr][tc]=piece;
  board[fr][fc]=null;
  enPassantTarget=newEP;
  lastMoveFrom={r:fr,c:fc};
  lastMoveTo  ={r:tr,c:tc};

  if(piece.type===PAWN&&(tr===0||tr===7)){
    promotionPending={r:tr,c:tc,color:piece.color};
    showPromotionModal(piece.color);
    addNotationEntry(fr,fc,tr,tc,piece,captured||epCaptured,castleSide,specialNote,true);
    updateCapturedUI();
    turn=turn===W?B:W;
    updateStatus();
    return;
  }

  addNotationEntry(fr,fc,tr,tc,piece,captured||epCaptured,castleSide,specialNote,false);
  updateCapturedUI();
  turn=turn===W?B:W;
  updateStatus();
  checkGameOver();
}

// ── Promotion ────────────────────────────────────────────────
function showPromotionModal(color){
  const container=$('promotion-choices');
  container.innerHTML='';
  [QUEEN,ROOK,BISHOP,KNIGHT].forEach(type=>{
    const btn=document.createElement('button');
    btn.className='promo-btn';
    btn.textContent=UNICODE[color][type];
    btn.addEventListener('click',()=>completePromotion(type));
    container.appendChild(btn);
  });
  $('promotion-modal').classList.remove('hidden');
}

function completePromotion(type){
  if(!promotionPending) return;
  const {r,c,color}=promotionPending;
  board[r][c]={color,type};
  promotionPending=null;
  $('promotion-modal').classList.add('hidden');

  const rows=$('notation-list').querySelectorAll('.notation-row');
  if(rows.length>0){
    const lastRow=rows[rows.length-1];
    const cell=turn===W
      ? lastRow.querySelector('.notation-black')
      : lastRow.querySelector('.notation-white');
    if(cell&&!cell.textContent.includes('=')) cell.textContent+=('='+type);
  }

  renderBoard();
  checkGameOver();
}

// ── Move Generation ──────────────────────────────────────────
function getLegalMoves(r,c,b){
  const piece=b[r][c];
  if(!piece) return [];
  return getPseudoMoves(r,c,b).filter(({r:tr,c:tc})=>{
    return !isInCheck(piece.color, applyMove(r,c,tr,tc,b));
  });
}

function getPseudoMoves(r,c,b){
  const piece=b[r][c];
  if(!piece) return [];
  const {color,type}=piece;
  const moves=[];
  const opp=color===W?B:W;
  const inBounds=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
  const isEmpty=(r,c)=>inBounds(r,c)&&!b[r][c];
  const isOpp=(r,c)=>inBounds(r,c)&&b[r][c]&&b[r][c].color===opp;
  const slide=(dr,dc)=>{
    let nr=r+dr,nc=c+dc;
    while(inBounds(nr,nc)){
      if(!b[nr][nc]){moves.push({r:nr,c:nc});}
      else if(isOpp(nr,nc)){moves.push({r:nr,c:nc});break;}
      else break;
      nr+=dr;nc+=dc;
    }
  };

  switch(type){
    case KING:{
      [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc])=>{
        const nr=r+dr,nc=c+dc;
        if(inBounds(nr,nc)&&(!b[nr][nc]||isOpp(nr,nc))) moves.push({r:nr,c:nc});
      });
      const rights=castlingRights[color];
      const base=color===W?7:0;
      if(r===base&&c===4){
        if(rights.kSide&&isEmpty(base,5)&&isEmpty(base,6)
          &&!isInCheck(color,b)
          &&!isSquareAttacked(base,5,color,b)
          &&!isSquareAttacked(base,6,color,b))
          moves.push({r:base,c:6});
        if(rights.qSide&&isEmpty(base,3)&&isEmpty(base,2)&&isEmpty(base,1)
          &&!isInCheck(color,b)
          &&!isSquareAttacked(base,3,color,b)
          &&!isSquareAttacked(base,2,color,b))
          moves.push({r:base,c:2});
      }
      break;
    }
    case QUEEN: [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]].forEach(([dr,dc])=>slide(dr,dc)); break;
    case ROOK:  [[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>slide(dr,dc)); break;
    case BISHOP:[[-1,-1],[-1,1],[1,-1],[1,1]].forEach(([dr,dc])=>slide(dr,dc)); break;
    case KNIGHT:
      [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dr,dc])=>{
        const nr=r+dr,nc=c+dc;
        if(inBounds(nr,nc)&&(!b[nr][nc]||isOpp(nr,nc))) moves.push({r:nr,c:nc});
      });
      break;
    case PAWN:{
      const dir=color===W?-1:1;
      const start=color===W?6:1;
      if(isEmpty(r+dir,c)) moves.push({r:r+dir,c});
      if(r===start&&isEmpty(r+dir,c)&&isEmpty(r+2*dir,c)) moves.push({r:r+2*dir,c});
      [-1,1].forEach(dc=>{
        if(isOpp(r+dir,c+dc)) moves.push({r:r+dir,c:c+dc});
        if(enPassantTarget&&r+dir===enPassantTarget.r&&c+dc===enPassantTarget.c)
          moves.push({r:r+dir,c:c+dc});
      });
      break;
    }
  }
  return moves;
}

function applyMove(fr,fc,tr,tc,b){
  const nb=b.map(row=>row.map(p=>p?{...p}:null));
  const piece=nb[fr][fc];
  if(piece.type===PAWN&&enPassantTarget&&tr===enPassantTarget.r&&tc===enPassantTarget.c)
    nb[fr][tc]=null;
  if(piece.type===KING){
    if(tc-fc===2)  {nb[fr][5]=nb[fr][7];nb[fr][7]=null;}
    if(tc-fc===-2) {nb[fr][3]=nb[fr][0];nb[fr][0]=null;}
  }
  nb[tr][tc]=piece;
  nb[fr][fc]=null;
  return nb;
}

function findKing(color,b){
  for(let r=0;r<8;r++)
    for(let c=0;c<8;c++)
      if(b[r][c]&&b[r][c].type===KING&&b[r][c].color===color) return {r,c};
  return null;
}

function isSquareAttacked(r,c,defendingColor,b){
  const atk=defendingColor===W?B:W;
  const savedEP=enPassantTarget;
  enPassantTarget=null;
  for(let rr=0;rr<8;rr++)
    for(let cc=0;cc<8;cc++){
      const p=b[rr][cc];
      if(p&&p.color===atk)
        if(getPseudoMoves(rr,cc,b).some(m=>m.r===r&&m.c===c)){
          enPassantTarget=savedEP;
          return true;
        }
    }
  enPassantTarget=savedEP;
  return false;
}

function isInCheck(color,b){
  const king=findKing(color,b);
  if(!king) return false;
  return isSquareAttacked(king.r,king.c,color,b);
}

function hasAnyLegalMove(color){
  for(let r=0;r<8;r++)
    for(let c=0;c<8;c++)
      if(board[r][c]&&board[r][c].color===color)
        if(getLegalMoves(r,c,board).length>0) return true;
  return false;
}

// ── Game Over ────────────────────────────────────────────────
function checkGameOver(){
  if(!hasAnyLegalMove(turn)){
    if(isInCheck(turn,board)){
      const winner     = turn===W ? playerBlack : playerWhite;
      const loser      = turn===W ? playerWhite : playerBlack;
      const winnerColor= turn===W ? B : W;

      markCheckmateInNotation();
      stopClock();
      gameStarted=false;

      $('cm-crown').textContent = UNICODE[winnerColor][KING];
      $('cm-winner-name').textContent = winner + ' 승리!';
      $('cm-sub-text').textContent = loser + '의 킹이 체크메이트 되었습니다.';
      $('cm-total-moves').textContent = history.length + '수';
      $('cm-elapsed').textContent = formatTime(elapsedSeconds);
      $('checkmate-modal').classList.remove('hidden');

      setTimeout(()=>launchConfetti(), 100);
    } else {
      endGame('스테일메이트!','½','스테일메이트입니다. 무승부입니다.');
    }
  }
}

function markCheckmateInNotation(){
  const rows=$('notation-list').querySelectorAll('.notation-row');
  if(!rows.length) return;
  const lastRow=rows[rows.length-1];
  const cell = turn===W
    ? lastRow.querySelector('.notation-black')
    : lastRow.querySelector('.notation-white');
  if(cell&&cell.textContent&&!cell.textContent.endsWith('#'))
    cell.textContent+='#';
}

function endGame(title,icon,sub){
  stopClock();
  gameStarted=false;
  $('gameover-icon').textContent=icon;
  $('gameover-title').textContent=title;
  $('gameover-sub').textContent=sub;
  $('gameover-modal').classList.remove('hidden');
}

// ── Confetti ─────────────────────────────────────────────────
function launchConfetti(){
  const colors=['#f5c842','#1a1a1a','#d97757','#4caf50','#2196f3','#e91e63','#ffffff'];
  const count=80;
  for(let i=0;i<count;i++){
    setTimeout(()=>{
      const p=document.createElement('div');
      p.className='confetti-particle';
      p.style.left=Math.random()*100+'vw';
      p.style.top='-12px';
      p.style.background=colors[Math.floor(Math.random()*colors.length)];
      p.style.width=(6+Math.random()*8)+'px';
      p.style.height=(6+Math.random()*8)+'px';
      p.style.borderRadius=Math.random()>0.5?'50%':'2px';
      const dur=(1.8+Math.random()*1.8).toFixed(2);
      p.style.animationDuration=dur+'s';
      p.style.animationDelay=(Math.random()*0.5)+'s';
      document.body.appendChild(p);
      setTimeout(()=>p.remove(),(parseFloat(dur)+0.6)*1000);
    }, i*18);
  }
}

// ── Status Bar ───────────────────────────────────────────────
function updateStatus(){
  const bar=$('status-bar');
  const name=turn===W?playerWhite:playerBlack;
  if(isInCheck(turn,board)){
    bar.textContent=`⚠ ${name}의 킹이 체크 상태입니다!`;
    bar.classList.add('check-status');
  } else {
    bar.textContent=`${name}의 차례입니다`;
    bar.classList.remove('check-status');
  }
  $('white-card').classList.toggle('active-player',turn===W);
  $('black-card').classList.toggle('active-player',turn===B);
  $('white-clock').classList.toggle('running',turn===W);
  $('black-clock').classList.toggle('running',turn===B);
  $('current-move-num').textContent=`${Math.ceil(history.length/2)}수`;
}

// ── Notation ─────────────────────────────────────────────────
function addNotationEntry(fr,fc,tr,tc,piece,captured,castleSide,specialNote,isPromotion){
  const files='abcdefgh';
  const toSq=files[tc]+(8-tr);
  let notation;
  if(castleSide){
    notation=castleSide;
  } else {
    const p=piece.type!==PAWN?piece.type:'';
    const cap=captured?'x':'';
    const disambig=(piece.type===PAWN&&captured)?files[fc]:'';
    notation=disambig+p+cap+toSq+(specialNote?' '+specialNote:'');
  }
  const nextColor=piece.color===W?B:W;
  if(!isPromotion && isInCheck(nextColor,board)) notation+='+';

  const list=$('notation-list');
  const moveNum=Math.ceil(history.length/2);
  const isWhiteMove=piece.color===W;

  let row=list.querySelector(`[data-move="${moveNum}"]`);
  if(!row){
    row=document.createElement('div');
    row.className='notation-row';
    row.dataset.move=moveNum;
    const num=document.createElement('span');
    num.className='notation-num';
    num.textContent=moveNum+'.';
    const wCell=document.createElement('span'); wCell.className='notation-white';
    const bCell=document.createElement('span'); bCell.className='notation-black';
    row.appendChild(num); row.appendChild(wCell); row.appendChild(bCell);
    list.appendChild(row);
  }

  const target=isWhiteMove
    ? row.querySelector('.notation-white')
    : row.querySelector('.notation-black');
  target.textContent=notation;

  $('move-count-label').textContent=history.length+'수';
  list.scrollTop=list.scrollHeight;
}

// ── Captured UI ──────────────────────────────────────────────
function updateCapturedUI(){
  $('white-captured-pieces').textContent=capturedByWhite.map(p=>UNICODE.white[p.type]).join('');
  $('black-captured-pieces').textContent=capturedByBlack.map(p=>UNICODE.black[p.type]).join('');
}

// ── Clock ────────────────────────────────────────────────────
function startClock(){
  if(clockInterval) clearInterval(clockInterval);
  clockInterval=setInterval(()=>{
    elapsedSeconds++;
    $('elapsed-time').textContent=formatTime(elapsedSeconds);
    if(turn===W) timeWhite--; else timeBlack--;

    const wClock=$('white-clock'), bClock=$('black-clock');
    wClock.textContent=formatTime(timeWhite);
    bClock.textContent=formatTime(timeBlack);
    wClock.classList.toggle('low-time',timeWhite<=30&&turn===W);
    bClock.classList.toggle('low-time',timeBlack<=30&&turn===B);

    if(timeWhite<=0){ stopClock(); endGame('시간 초과!','⏱',`${playerBlack} 플레이어가 시간 초과로 승리하였습니다.`); }
    else if(timeBlack<=0){ stopClock(); endGame('시간 초과!','⏱',`${playerWhite} 플레이어가 시간 초과로 승리하였습니다.`); }
  },1000);
}

function stopClock(){ clearInterval(clockInterval); clockInterval=null; }

// ── Undo ─────────────────────────────────────────────────────
function undoMove(){
  if(!history.length) return;
  const snap=history.pop();
  board=snap.board; turn=snap.turn;
  castlingRights=snap.castlingRights;
  enPassantTarget=snap.enPassantTarget;
  lastMoveFrom=snap.lastMoveFrom; lastMoveTo=snap.lastMoveTo;
  capturedByWhite=snap.capturedByWhite; capturedByBlack=snap.capturedByBlack;
  selected=null; legalMoves=[];

  const rows=$('notation-list').querySelectorAll('.notation-row');
  if(rows.length>0){
    const last=rows[rows.length-1];
    const bCell=last.querySelector('.notation-black');
    if(bCell.textContent){ bCell.textContent=''; }
    else { last.remove(); }
  }
  $('move-count-label').textContent=history.length+'수';
  $('current-move-num').textContent=`${Math.ceil(history.length/2)}수`;
  updateCapturedUI(); updateStatus(); renderBoard();
}

// ── Export: PNG via html2canvas ───────────────────────────────
function exportBoardAsPNG(){
  const boardEl = document.getElementById('chessboard');
  if(!boardEl){ alert('보드를 찾을 수 없습니다.'); return; }

  if(typeof html2canvas === 'undefined'){
    alert('html2canvas 라이브러리 로드 중입니다. 잠시 후 다시 시도해주세요.');
    return;
  }

  // 잠깐 선택/힌트 표시 숨기기
  const dots = document.querySelectorAll('.move-dot,.capture-ring');
  dots.forEach(d => d.style.opacity = '0');
  const selCell = document.querySelector('.cell.selected');
  if(selCell) selCell.classList.remove('selected');

  html2canvas(boardEl, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false
  }).then(canvas => {
    // 복원
    dots.forEach(d => d.style.opacity = '');
    if(selCell) selCell.classList.add('selected');

    const now = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    const link = document.createElement('a');
    link.download = `chess_${stamp}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }).catch(err => {
    dots.forEach(d => d.style.opacity = '');
    if(selCell) selCell.classList.add('selected');
    console.error(err);
    alert('저장 중 오류가 발생했습니다: ' + err.message);
  });
}

// ── Export: PGN 기보 복사 ─────────────────────────────────────
function buildPGNText(){
  const rows = document.getElementById('notation-list').querySelectorAll('.notation-row');
  if(!rows.length) return null;

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;
  let pgn = `[Date "${dateStr}"]\n`;
  pgn += `[White "${playerWhite}"]\n`;
  pgn += `[Black "${playerBlack}"]\n`;
  pgn += `[TimeControl "${selectedTime}"]\n\n`;

  const parts = [];
  rows.forEach(row => {
    const num   = row.querySelector('.notation-num').textContent;
    const white = row.querySelector('.notation-white').textContent.trim();
    const black = row.querySelector('.notation-black').textContent.trim();
    let entry = num;
    if(white) entry += ' ' + white;
    if(black) entry += ' ' + black;
    parts.push(entry);
  });
  pgn += parts.join('  ') + '\n';
  return pgn;
}

function copyPGN(){
  const pgn = buildPGNText();
  if(!pgn){ alert('아직 기보가 없습니다.'); return; }

  const pgnArea   = $('extra-pgn-area');
  const pgnOutput = $('pgn-text-output');

  // 항상 텍스트박스에 채워두기 (폴백 대비)
  pgnOutput.value = pgn;
  pgnArea.classList.remove('hidden');

  // clipboard API 시도
  if(navigator.clipboard && window.isSecureContext){
    navigator.clipboard.writeText(pgn).then(()=>{
      showPGNCopied();
    }).catch(()=>{
      // 실패 시 텍스트박스로 폴백 (이미 열려있음)
    });
  }
  // 폴백: execCommand
  else {
    try {
      pgnOutput.select();
      pgnOutput.setSelectionRange(0, 99999);
      const ok = document.execCommand('copy');
      if(ok) showPGNCopied();
    } catch(e) {
      // 텍스트박스 직접 선택 안내 (이미 열려있음)
    }
  }
}

function showPGNCopied(){
  const btn = $('extra-pgn-btn');
  const strong = btn.querySelector('strong');
  const orig = strong.textContent;
  strong.textContent = '✓ 복사 완료!';
  btn.style.borderColor = '#2e7d32';
  setTimeout(()=>{
    strong.textContent = orig;
    btn.style.borderColor = '';
  }, 2000);
}

// ── Start ────────────────────────────────────────────────────
function startGame(){
  playerWhite=$('white-name').value.trim()||'백 플레이어';
  playerBlack=$('black-name').value.trim()||'흑 플레이어';

  board=createInitialBoard();
  turn=W; selected=null; legalMoves=[];
  history=[]; capturedByWhite=[]; capturedByBlack=[];
  castlingRights={white:{kSide:true,qSide:true},black:{kSide:true,qSide:true}};
  enPassantTarget=null; promotionPending=null;
  lastMoveFrom=null; lastMoveTo=null; elapsedSeconds=0;
  timeWhite=selectedTime; timeBlack=selectedTime;

  $('white-display-name').textContent=playerWhite;
  $('black-display-name').textContent=playerBlack;
  $('white-clock').textContent=formatTime(timeWhite);
  $('black-clock').textContent=formatTime(timeBlack);
  $('white-clock').classList.remove('running','low-time');
  $('black-clock').classList.remove('running','low-time');
  $('notation-list').innerHTML='';
  $('move-count-label').textContent='0수';
  $('current-move-num').textContent='1수';
  $('elapsed-time').textContent='00:00';
  $('white-captured-pieces').textContent='';
  $('black-captured-pieces').textContent='';
  $('status-bar').textContent=`${playerWhite}의 차례입니다`;
  $('status-bar').classList.remove('check-status');

  buildBoard(); buildLabels(); renderBoard(); updateStatus();

  $('start-screen').classList.add('hidden');
  $('game-screen').classList.remove('hidden');
  gameStarted=true;
  startClock();
}

function resetToMenu(){
  stopClock(); gameStarted=false;
  $('gameover-modal').classList.add('hidden');
  $('checkmate-modal').classList.add('hidden');
  $('extra-modal').classList.add('hidden');
  $('game-screen').classList.add('hidden');
  $('start-screen').classList.remove('hidden');
}

// ── Events ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{

  document.querySelectorAll('.time-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.time-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      selectedTime=parseInt(btn.dataset.time);
    });
  });

  $('start-btn').addEventListener('click', startGame);
  $('undo-btn').addEventListener('click',()=>{ if(gameStarted) undoMove(); });

  $('draw-btn').addEventListener('click',()=>{
    if(!gameStarted) return;
    const opp=turn===W?playerBlack:playerWhite;
    $('draw-modal-sub').textContent=`${opp}에게 무승부를 제안합니다. 수락하시겠습니까?`;
    $('draw-modal').classList.remove('hidden');
  });

  $('draw-accept').addEventListener('click',()=>{
    $('draw-modal').classList.add('hidden');
    endGame('무승부','½','양측이 합의하여 무승부입니다.');
  });

  $('draw-decline').addEventListener('click',()=>{ $('draw-modal').classList.add('hidden'); });

  $('resign-btn').addEventListener('click',()=>{
    if(!gameStarted) return;
    const loser=turn===W?playerWhite:playerBlack;
    const winner=turn===W?playerBlack:playerWhite;
    endGame(`${loser} 기권`,'⚑',`${loser} 플레이어가 기권하여 ${winner} 플레이어가 승리하였습니다.`);
  });

  $('newgame-btn').addEventListener('click',()=>{
    stopClock(); gameStarted=false;
    $('game-screen').classList.add('hidden');
    $('start-screen').classList.remove('hidden');
  });

  // ── 기타 버튼 ──
  $('extra-btn').addEventListener('click',()=>{
    // PGN 영역 숨기고 열기
    $('extra-pgn-area').classList.add('hidden');
    $('pgn-text-output').value = '';
    $('extra-modal').classList.remove('hidden');
  });

  $('extra-close').addEventListener('click',()=>{
    $('extra-modal').classList.add('hidden');
  });

  // 모달 배경 클릭 시 닫기
  $('extra-modal').addEventListener('click', e=>{
    if(e.target === $('extra-modal')) $('extra-modal').classList.add('hidden');
  });

  $('extra-png-btn').addEventListener('click',()=>{
    $('extra-modal').classList.add('hidden');
    setTimeout(exportBoardAsPNG, 120); // 모달 닫힌 후 캡처
  });

  $('extra-pgn-btn').addEventListener('click', copyPGN);

  $('pgn-select-all-btn').addEventListener('click',()=>{
    const ta = $('pgn-text-output');
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, 99999);
    try {
      document.execCommand('copy');
      showPGNCopied();
    } catch(e){}
  });

  // Checkmate modal
  $('cm-newgame').addEventListener('click',()=>{
    $('checkmate-modal').classList.add('hidden');
    startGame();
  });
  $('cm-menu').addEventListener('click',resetToMenu);

  // Generic gameover modal
  $('modal-newgame').addEventListener('click',()=>{ $('gameover-modal').classList.add('hidden'); startGame(); });
  $('modal-menu').addEventListener('click', resetToMenu);
});
