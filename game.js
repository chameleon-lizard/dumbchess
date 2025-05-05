// --- Constants and State ---
const rulesModal = document.getElementById('rules-modal');
const shopModal = document.getElementById('shop-modal');
const playButton = document.getElementById('play-button');
const startNextGameButton = document.getElementById('start-next-game-button');
const gameContainer = document.querySelector('.game-container');
const rowsSlider = document.getElementById('rows-slider');
const colsSlider = document.getElementById('cols-slider');
const depthSlider = document.getElementById('depth-slider');
const shopRowsSlider = document.getElementById('shop-rows-slider');
const shopColsSlider = document.getElementById('shop-cols-slider');
const rowsOutput = document.getElementById('rows-output');
const colsOutput = document.getElementById('cols-output');
const depthOutput = document.getElementById('depth-output');
const shopRowsOutput = document.getElementById('shop-rows-output');
const shopColsOutput = document.getElementById('shop-cols-output');
const shopScoreDisplay = document.getElementById('shop-score');
const shopItemsContainer = document.getElementById('shop-items-buy');
const playerInventoryDisplay = document.getElementById('player-inventory-display');
const boardElement = document.getElementById('board');
const turnIndicator = document.getElementById('turn-indicator');
const turnLabel = document.getElementById('turn-label');
const capturedByWhiteElement = document.getElementById('captured-by-white');
const capturedByBlackElement = document.getElementById('captured-by-black');
const capturedByWhiteArea = document.getElementById('captured-by-white-area');
const capturedByBlackArea = document.getElementById('captured-by-black-area');
const whiteHandArea = document.getElementById('white-hand-area');
const whiteHandElement = document.getElementById('white-hand');
const themeToggleButton = document.getElementById('theme-toggle');
const restartButton = document.getElementById('restart-button');
const messageBox = document.getElementById('message-box');
const scoreDisplay = document.getElementById('score-display');

// --- Pawn Upgrade Modal ---
const upgradeModal = document.getElementById('upgrade-modal');
const upgradeButtons = {
    rook: document.getElementById('upgrade-to-rook'), queen: document.getElementById('upgrade-to-queen'), bishop: document.getElementById('upgrade-to-bishop'), knight: document.getElementById('upgrade-to-knight'),
};
let boardRows = 6; let boardCols = 4;

const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" /></svg>`;
const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" /></svg>`;

const PIECES = { 'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔' };
const EMPTY = null;
const DEFAULT_PLAYER_INVENTORY = ['K', 'Q', 'B', 'R', 'P', 'P', 'P', 'P'];
const DEFAULT_AI_INVENTORY = ['k', 'q', 'b', 'n', 'r', 'p', 'p', 'p', 'p']; // AI default set
const PIECE_VALUES = { 'p': 1, 'r': 5, 'n': 3, 'b': 3, 'q': 9, 'k': 1000, 'P': 1, 'R': 5, 'N': 3, 'B': 3, 'Q': 9, 'K': 1000 };
const SHOP_COSTS = { 'P': 100, 'N': 250, 'B': 250, 'R': 400, 'Q': 500, 'K': 500 };
const AI_DELAY = 500;

let boardState, cellColors, whiteHand, blackHandPieces, gameState, selectedHandPiece, selectedSquare, currentPlayer, validMoves, validPlacementSquares, capturedByWhite, capturedByBlack;
let currentTheme = 'night';
let isPlayerTurn = true;
let aiSearchDepth = 2;
let playerScore = 0;
let aiScore = 0; // AI Score
let playerInventory = [...DEFAULT_PLAYER_INVENTORY];
let aiInventory = [...DEFAULT_AI_INVENTORY]; // AI Inventory

// --- Game Initialization and Reset ---
function initializeGame(useShopSettings = false) {
    console.log(`DEBUG: Initializing game. useShopSettings=${useShopSettings}`);
    if (useShopSettings) {
        boardRows = parseInt(shopRowsSlider.value);
        boardCols = parseInt(shopColsSlider.value);
        console.log(`DEBUG: Using shop settings - Rows: ${boardRows}, Cols: ${boardCols}`);
        console.log("DEBUG: Player Inventory:", playerInventory);
        console.log("DEBUG: AI Inventory:", aiInventory);
    } else {
        boardRows = parseInt(rowsSlider.value);
        boardCols = parseInt(colsSlider.value);
        aiSearchDepth = parseInt(depthSlider.value);
        playerInventory = [...DEFAULT_PLAYER_INVENTORY];
        aiInventory = [...DEFAULT_AI_INVENTORY];
        playerScore = 0; // Reset scores only for the very first game
        aiScore = 0;
        console.log(`DEBUG: Using initial settings - Rows: ${boardRows}, Cols: ${boardCols}, Depth: ${aiSearchDepth}`);
    }

    if (boardCols < 4) { alert("Minimum 4 columns required."); boardCols = 4; colsSlider.value = 4; colsOutput.textContent = 4; shopColsSlider.value = 4; shopColsOutput.textContent = 4; }
    // *** FIX: Ensure minimum rows is 6 ***
    if (boardRows < 6) { alert("Minimum 6 rows required."); boardRows = 6; rowsSlider.value = 6; rowsOutput.textContent = 6; shopRowsSlider.value = 6; shopRowsOutput.textContent = 6; }


    boardState = Array(boardRows).fill(null).map(() => Array(boardCols).fill(EMPTY));
    cellColors = Array(boardRows).fill(null).map(() => Array(boardCols).fill('light'));
    whiteHand = [...playerInventory];
    blackHandPieces = [...aiInventory];
    gameState = 'setup-white-turn'; selectedHandPiece = null; selectedSquare = null; currentPlayer = 'white';
    isPlayerTurn = true; validMoves = []; validPlacementSquares = []; capturedByWhite = []; capturedByBlack = [];

    randomizeCellColors(); updateStatus(); renderScore(); renderHands(); renderBoard();
    if (currentTheme === 'dark' || currentTheme === 'night') { document.body.classList.add('dark-theme'); themeToggleButton.innerHTML = sunIcon; themeToggleButton.title = 'Switch to Day Theme'; }
    else { document.body.classList.remove('dark-theme'); themeToggleButton.innerHTML = moonIcon; themeToggleButton.title = 'Switch to Night Theme'; }
    console.log("DEBUG: Game initialized.");
}

// --- AI Setup ---
function calculatePlacementScore(pieceToPlace, targetRow, targetCol, currentBoardState, currentCellColors) { let score = 0; const pieceType = pieceToPlace.toLowerCase(); const tempBoard = currentBoardState.map(row => [...row]); tempBoard[targetRow][targetCol] = pieceToPlace; const moves = getValidMoves(targetRow, targetCol, tempBoard, cellColors); let mobilityScore = moves.length; if (['q', 'r', 'b', 'n'].includes(pieceType)) mobilityScore *= 1.5; score += mobilityScore; let isAttacked = false; for (let r = boardRows - 2; r < boardRows; r++) { for (let c = 0; c < boardCols; c++) { const attackerPiece = currentBoardState[r][c]; if (attackerPiece && attackerPiece === attackerPiece.toUpperCase()) { const attackerMoves = getValidMoves(r, c, currentBoardState, cellColors); if (attackerMoves.some(move => move.to.row === targetRow && move.to.col === targetCol)) { isAttacked = true; break; } } } if (isAttacked) break; } if (isAttacked) score -= 50; if (cellColors[targetRow][targetCol] === 'dark' && ['q', 'r', 'b'].includes(pieceType)) { score -= 0.5; } if (targetCol > 0 && targetCol < boardCols - 1) score += 0.2; if (pieceType === 'k' && targetRow === 0) score += 1; score += (Math.random() - 0.5) * 0.1; return score; }

function placeOneAIPieceCalculated() {
    console.log(`DEBUG: placeOneAIPieceCalculated called. AI Pieces left: ${blackHandPieces.length}`);
    if (blackHandPieces.length === 0) {
        console.log("DEBUG: AI has no more pieces to place.");
        if (whiteHand.length === 0) { // Both done
            gameState = 'playing'; currentPlayer = 'white'; isPlayerTurn = true; updateStatus(); showMessage("Setup complete! Your turn.");
        } else { // AI done, player not
            gameState = 'setup-white-turn'; isPlayerTurn = true; updateStatus();
        }
        renderBoard(); renderHands(); return;
    }

    let availableSquares = getAIAvailablePlacementSquares();
    // *** Corrected Check: Only end setup if NO squares are available for the AI ***
    if (availableSquares.length === 0) {
        console.warn("No available squares for AI placement! Ending setup.");
        gameState = 'playing'; currentPlayer = 'white'; isPlayerTurn = true;
        showMessage("AI cannot place remaining pieces. Your turn.");
        updateStatus(); renderBoard(); renderHands();
        return;
    }

    console.log("DEBUG: AI calculating piece placement...");
    let bestScore = -Infinity; let bestPlacement = null;
    const aiPiecesPlaced = aiInventory.length - blackHandPieces.length;
    const canPlaceKing = aiPiecesPlaced >= 2;
    let piecesToConsider = [...blackHandPieces];
    if (!canPlaceKing) {
        piecesToConsider = piecesToConsider.filter(p => p !== 'k');
        if (piecesToConsider.length === 0 && blackHandPieces.includes('k')) { piecesToConsider = ['k']; }
    }
    if (piecesToConsider.length === 0) {
        console.log("DEBUG: Only King left for AI, but cannot place yet. Switching to player.");
        gameState = 'setup-white-turn'; isPlayerTurn = true; updateStatus();
        renderBoard(); renderHands(); return;
    }

    // Forced King Placement for AI
    if (blackHandPieces.length === 1 && blackHandPieces[0] === 'k' && availableSquares.length === 1) {
        console.log("DEBUG: AI forced King placement.");
        bestPlacement = { piece: 'k', row: availableSquares[0].row, col: availableSquares[0].col };
    } else {
        // Find best placement normally
        piecesToConsider.forEach(piece => {
            availableSquares.forEach(square => {
                const score = calculatePlacementScore(piece, square.row, square.col, boardState, cellColors);
                if (score > bestScore) { bestScore = score; bestPlacement = { piece: piece, row: square.row, col: square.col }; }
            });
        });
        if (!bestPlacement) { console.log("AI placement fallback to random among considered pieces."); const randomPieceIndex = Math.floor(Math.random() * piecesToConsider.length); const randomPiece = piecesToConsider[randomPieceIndex]; const squareIndex = Math.floor(Math.random() * availableSquares.length); bestPlacement = { piece: randomPiece, row: availableSquares[squareIndex].row, col: availableSquares[squareIndex].col }; }
    }

    boardState[bestPlacement.row][bestPlacement.col] = bestPlacement.piece;
    const placedPieceIndex = blackHandPieces.indexOf(bestPlacement.piece);
    if (placedPieceIndex > -1) blackHandPieces.splice(placedPieceIndex, 1);
    console.log(`DEBUG: AI placed ${bestPlacement.piece} at (${bestPlacement.row}, ${bestPlacement.col}). Pieces left: ${blackHandPieces.length}`);

    // Check if setup is complete OR switch back to player
    if (whiteHand.length === 0 && blackHandPieces.length === 0) {
        console.log("DEBUG: Both players done placing. Starting game.");
        gameState = 'playing'; currentPlayer = 'white'; isPlayerTurn = true; updateStatus(); showMessage("Setup complete! Your turn.");
    } else if (whiteHand.length > 0) {
        // *** Corrected Check: Check if PLAYER has available squares BEFORE switching ***
        const playerSquares = getPlayerAvailablePlacementSquares();
        if (playerSquares.length === 0) { // Player has pieces but no squares
            console.log("DEBUG: Player has no squares left. Ending setup.");
            gameState = 'playing'; currentPlayer = 'white'; isPlayerTurn = true; showMessage("No more space to place pieces. Your turn.");
        } else {
            console.log("DEBUG: Switching back to player setup turn.");
            gameState = 'setup-white-turn'; isPlayerTurn = true; updateStatus();
        }
    } else { // Player is done, AI still has pieces
        console.log("DEBUG: Player done, AI placing next piece.");
        gameState = 'setup-black-turn'; isPlayerTurn = false; updateStatus();
        setTimeout(placeOneAIPieceCalculated, AI_DELAY); // AI continues placement
    }
    renderBoard(); renderHands();
}


// --- Game Logic Functions ---
function isCurrentPlayerPiece(piece) { if (!piece || gameState !== 'playing' || currentPlayer !== 'white') return false; return piece === piece.toUpperCase(); }


/**
 * Function to determine the squares under attack by a certain color
 * @param {string} player - The color of the player to check for attacked squares ('white' or 'black')
 * @returns {Array<object>} - An array of objects representing squares under attack
 */
function getSquaresUnderAttack(player) {
    const attackedSquares = new Set(); // Use a Set to avoid duplicates
    const isWhitePlayer = player === 'white';
    const piecesToCheck = [];


    // Find pieces of the specified player
    for (let r = 0; r < boardRows; r++) {
        for (let c = 0; c < boardCols; c++) {
            const piece = boardState[r][c];
            if (piece !== EMPTY && (piece === piece.toUpperCase()) === isWhitePlayer) {
                piecesToCheck.push({ row: r, col: c });
            }
        }
    }

    // Check squares attacked by each piece
    for (const { row, col } of piecesToCheck) {
        const moves = getValidMoves(row, col, boardState, cellColors);
        for (let i = 0; i < moves.length; i++) {
            
            // Check if we're checking the moves of a pawn
            if(boardState[row][col].toLowerCase() === 'p') {
                if (moves[i].to.col === col) continue; // Skip if it's a straight move
            }
            
            attackedSquares.add(`${moves[i].to.row},${moves[i].to.col}`);
        }
    }
    return Array.from(attackedSquares).map(square => { const [row, col] = square.split(',').map(Number); return { row, col }; });
}

/**
 * Function to check if the king is under check
 * @param {string} player - The color of the player whose king to check ('white' or 'black')
 * @returns {boolean} - True if the king is under check, false otherwise
 */
function isKingUnderCheck(player) {
  if (gameState !== 'playing') return false; // Only check if the game is in the playing state

  const isWhitePlayer = player === 'white';
  const kingPiece = isWhitePlayer ? 'K' : 'k';
  let kingPosition = null;

  // Find the king's position
  for (let r = 0; r < boardRows; r++) {
    for (let c = 0; c < boardCols; c++) {
      if (boardState[r][c] === kingPiece) {
        kingPosition = { row: r, col: c };
        break;
      }
    }
    if (kingPosition) break;
  }

  if (!kingPosition) {
    console.error(`King not found for player ${player}!`);
    return false;
  }

  const squaresUnderAttack = getSquaresUnderAttack(isWhitePlayer ? 'black' : 'white');
  // Check if the king's position is in the attacked squares
  const isUnderAttack = squaresUnderAttack.some(square => square.row === kingPosition.row && square.col === kingPosition.col);

  if (isUnderAttack) console.warn(`${player} King is under attack!`);

  return isUnderAttack;
}
function isWithinBoard(row, col) { return row >= 0 && row < boardRows && col >= 0 && col < boardCols; }
function getValidPlacementSquares() { const sq = []; if (gameState !== 'setup-white-turn') return []; for (let r = boardRows - 2; r < boardRows; r++) { for (let c = 0; c < boardCols; c++) { if (boardState[r][c] === EMPTY) { sq.push({ row: r, col: c }); } } } console.log(`DEBUG: Player valid placement squares: ${sq.length}`, sq); return sq; }
function getValidMoves(row, col, currentBoardState, currentCellColors) { const piece = currentBoardState[row][col]; if (!piece) return []; const moves = []; const pieceType = piece.toLowerCase(); const isWhite = piece === piece.toUpperCase(); const addMove = (targetRow, targetCol, isSliding = false) => { if (!isWithinBoard(targetRow, targetCol)) return false; const targetPiece = currentBoardState[targetRow][targetCol]; const targetIsDark = currentCellColors[targetRow][targetCol] === 'dark'; if (targetPiece === EMPTY) { moves.push({ from: { row, col }, to: { row: targetRow, col: targetCol }, piece: piece }); return isSliding && !targetIsDark; } else { const targetIsWhite = targetPiece === targetPiece.toUpperCase(); if (isWhite !== targetIsWhite) { moves.push({ from: { row, col }, to: { row: targetRow, col: targetCol }, piece: piece, captured: targetPiece }); } return false; } }; if (pieceType === 'p') { const dir = isWhite ? -1 : 1; const step = row + dir; if (isWithinBoard(step, col) && currentBoardState[step][col] === EMPTY) addMove(step, col, false);[col - 1, col + 1].forEach(c => { if (isWithinBoard(step, c)) { const tp = currentBoardState[step][c]; if (tp !== EMPTY && isWhite !== (tp === tp.toUpperCase())) addMove(step, c, false); } }); } if (pieceType === 'r' || pieceType === 'q') { [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => { let r = row + dr, c = col + dc; while (addMove(r, c, true)) { r += dr; c += dc; } }); } if (pieceType === 'b' || pieceType === 'q') { [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dr, dc]) => { let r = row + dr, c = col + dc; while (addMove(r, c, true)) { r += dr; c += dc; } }); } if (pieceType === 'n') { const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]]; knightMoves.forEach(([dr, dc]) => { if (isWithinBoard(row + dr, col + dc)) { addMove(row + dr, col + dc, false); } }); } if (pieceType === 'k') { for (let dr = -1; dr <= 1; dr++) { for (let dc = -1; dc <= 1; dc++) { if (dr === 0 && dc === 0) continue; if (isWithinBoard(row + dr, col + dc)) { addMove(row + dr, col + dc, false); } } } } return moves; }
function getAllLegalMoves(player, currentBoardState, currentCellColors) { const allMoves = []; const isWhitePlayer = player === 'white'; for (let r = 0; r < boardRows; r++) { for (let c = 0; c < boardCols; c++) { const piece = currentBoardState[r][c]; if (piece !== EMPTY && (piece === piece.toUpperCase()) === isWhitePlayer) { const pieceMoves = getValidMoves(r, c, currentBoardState, currentCellColors); allMoves.push(...pieceMoves); } } } return allMoves; }
function performMove(move, targetBoardState) { const from = move.from; const to = move.to; const pieceToMove = targetBoardState[from.row][from.col]; const capturedPiece = targetBoardState[to.row][to.col]; targetBoardState[to.row][to.col] = pieceToMove; targetBoardState[from.row][from.col] = EMPTY; return capturedPiece; }
function simulateMove(move, currentBoardState) { const tempBoardState = currentBoardState.map(row => [...row]); performMove(move, tempBoardState); return tempBoardState; }
function countKings(player, currentBoardState) { let kingCount = 0; const kingChar = (player === 'white') ? 'K' : 'k'; for (let r = 0; r < boardRows; r++) { for (let c = 0; c < boardCols; c++) { if (currentBoardState[r][c] === kingChar) { kingCount++; } } } return kingCount; }
function closeUpgradeModal() { upgradeModal.style.display = 'none'; }


// --- Pawn Upgrade Modal ---
function openUpgradeModal(row, col) {
    upgradeModal.style.display = 'flex';
    upgradeModal.dataset.row = row;
    upgradeModal.dataset.col = col;
}

Object.keys(upgradeButtons).forEach(upgradeType => {
    upgradeButtons[upgradeType].addEventListener('click', () => {
        const row = parseInt(upgradeModal.dataset.row);
        const col = parseInt(upgradeModal.dataset.col);
        const newPiece = upgradeType.charAt(0).toUpperCase();
        boardState[row][col] = newPiece;
        closeUpgradeModal();
        currentPlayer = 'black'; isPlayerTurn = false; updateStatus(); renderBoard(); renderHands(); setTimeout(makeAIMove, AI_DELAY);
    });
});


// --- Player/AI Move Execution ---
function makePlayerMove(fromRow, fromCol, toRow, toCol) { const pieceToMove = boardState[fromRow][fromCol]; const move = { from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol }, piece: pieceToMove }; const captured = performMove(move, boardState); if (captured) { capturedByWhite.push(captured); if (captured.toLowerCase() === 'k' && countKings('black', boardState) === 0) { showGameOver('white'); return; } }
    boardState[toRow][toCol] = pieceToMove; // Move the piece
    boardState[fromRow][fromCol] = EMPTY; // Clear the original square
    if(isKingUnderCheck('white')) {
        
      // Revert the move
      boardState[fromRow][fromCol] = pieceToMove;
      boardState[toRow][toCol] = captured || EMPTY;
      showMessage('King cannot move into check!');
      
      selectedSquare = null;
      validMoves = [];
      renderBoard();
      return; // Don't proceed further if the king is under check after the move
    }
    
    selectedSquare = null;
    validMoves = [];
    if(isKingUnderCheck('white')){
      showMessage('King is under check!');
    }

    if ((pieceToMove === 'P' && toRow === 0) || (pieceToMove === 'p' && toRow === boardRows - 1)) { openUpgradeModal(toRow, toCol); } else { currentPlayer = 'black'; isPlayerTurn = false; updateStatus(); renderBoard(); renderHands(); setTimeout(makeAIMove, AI_DELAY); }
}

function makeAIMove() { if (gameState !== 'playing') return; console.log("AI thinking..."); const aiMove = getBestAIMove(aiSearchDepth); if (aiMove) { console.log("AI Move:", aiMove); const captured = performMove(aiMove, boardState); if (captured) { capturedByBlack.push(captured); if (captured.toLowerCase() === 'k' && countKings('white', boardState) === 0) { showGameOver('black'); return; } } 
    if(isKingUnderCheck('black')) {
        showMessage('King is under check!');
    }
    showMessage(`AI moved ${PIECES[aiMove.piece]} from (${aiMove.from.row},${aiMove.from.col}) to (${aiMove.to.row},${aiMove.to.col})` + (captured ? ` capturing ${PIECES[captured]}` : '')); } else { const playerMoves = getAllLegalMoves('white', boardState, cellColors); if (playerMoves.length === 0) { showMessage("Stalemate! It's a draw."); playerScore += 350; aiScore += 150; renderScore(); gameState = 'game-over'; updateStatus(); setTimeout(openShop, 1500); return; } else { showMessage("AI has no moves! You win?"); playerScore += 500; renderScore(); gameState = 'game-over'; updateStatus(); setTimeout(openShop, 1500); return; } } if (gameState !== 'game-over') { currentPlayer = 'white'; isPlayerTurn = true; updateStatus(); renderBoard(); renderHands(); } }

// --- AI Logic ---
function evaluateBoard(board) { let wS = 0; let bS = 0; for (let r = 0; r < boardRows; r++) { for (let c = 0; c < boardCols; c++) { const p = board[r][c]; if (p !== EMPTY) { const v = PIECE_VALUES[p.toLowerCase()] || 0; if (p === p.toUpperCase()) wS += v; else bS += v; } } } const r = (Math.random() - 0.5) * 0.1; return wS - bS + r; }
function minimax(board, depth, alpha, beta, maximizingPlayer, currentCellColors) { if (depth === 0) { return evaluateBoard(board); } const player = maximizingPlayer ? 'white' : 'black'; const moves = getAllLegalMoves(player, board, currentCellColors); if (moves.length === 0) { return maximizingPlayer ? -Infinity : +Infinity; } if (maximizingPlayer) { let maxEval = -Infinity; for (const move of moves) { const childBoard = simulateMove(move, board); const evalScore = minimax(childBoard, depth - 1, alpha, beta, false, currentCellColors); maxEval = Math.max(maxEval, evalScore); alpha = Math.max(alpha, evalScore); if (beta <= alpha) break; } return maxEval; } else { let minEval = +Infinity; for (const move of moves) { const boardAfterAIMove = simulateMove(move, board); const playerResponses = getAllLegalMoves('white', boardAfterAIMove, currentCellColors); let leadsToImmediateLoss = false; for (const pMove of playerResponses) { if (pMove.captured && pMove.captured.toLowerCase() === 'k' && countKings('black', boardAfterAIMove) === 0) { leadsToImmediateLoss = true; break; } } if (leadsToImmediateLoss && depth === aiSearchDepth) { minEval = Math.min(minEval, 9999); continue; } const evalScore = minimax(boardAfterAIMove, depth - 1, alpha, beta, true, currentCellColors); minEval = Math.min(minEval, evalScore); beta = Math.min(beta, evalScore); if (beta <= alpha) break; } return minEval; } }
function getBestAIMove(depth) { let bestScore = +Infinity; let bestMove = null; let candidateMoves = []; const possibleAIMoves = getAllLegalMoves('black', boardState, cellColors); if (possibleAIMoves.length === 0) return null; possibleAIMoves.forEach(aiMove => { const boardAfterAIMove = simulateMove(aiMove, boardState); const playerResponses = getAllLegalMoves('white', boardAfterAIMove, cellColors); let leadsToImmediateLoss = false; for (const pMove of playerResponses) { if (pMove.captured && pMove.captured.toLowerCase() === 'k' && countKings('black', boardAfterAIMove) === 0) { leadsToImmediateLoss = true; break; } } let moveScore; if (leadsToImmediateLoss) { moveScore = 9999; } else { moveScore = minimax(boardAfterAIMove, depth - 1, -Infinity, +Infinity, true, cellColors); } candidateMoves.push({ move: aiMove, score: moveScore, isLosing: leadsToImmediateLoss }); }); const safeMoves = candidateMoves.filter(m => !m.isLosing); const losingMoves = candidateMoves.filter(m => m.isLosing); if (safeMoves.length > 0) { safeMoves.sort((a, b) => a.score - b.score); bestMove = safeMoves[0].move; bestScore = safeMoves[0].score; console.log(`AI choosing safe move. Best score (for white): ${bestScore.toFixed(2)}`); } else if (losingMoves.length > 0) { losingMoves.sort((a, b) => a.score - b.score); bestMove = losingMoves[0].move; bestScore = losingMoves[0].score; console.log("AI forced into losing move."); } else { console.error("Error in AI move selection: No candidates found."); bestMove = possibleAIMoves[Math.floor(Math.random() * possibleAIMoves.length)]; } return bestMove; }

// --- Player Setup (Alternating) ---
function placePlayerPiece(piece, row, col) {
    console.log(`DEBUG: placePlayerPiece called with piece ${piece} at (${row},${col})`);
    if (!selectedHandPiece || boardState[row][col] !== EMPTY) { console.log("DEBUG: placePlayerPiece ignored - no selected piece or square not empty"); return; }
    const correctRows = [boardRows - 2, boardRows - 1];
    if (!correctRows.includes(row)) { showMessage(`Place pieces on rows ${boardRows - 2} or ${boardRows - 1}.`); return; }

    let playerPlacements = getValidPlacementSquares(); // Get current valid squares
    // Forced King Placement Check
    
    // Check if there are any Kings left to place
    const kingInHand = whiteHand.includes('K');
    
    // if no king left and no placement squares left, do nothing.
    if (!kingInHand && playerPlacements.length === 0) {
      console.log("DEBUG: No King to place and no squares to place on.");
      return;
    }
    
    if (whiteHand.length === 1 && whiteHand[0] === 'K' && playerPlacements.length === 1 && !(playerPlacements[0].row === row && playerPlacements[0].col === col)) {
        showMessage(`Must place King on the last available square (${playerPlacements[0].row}, ${playerPlacements[0].col}).`);
        return;
    }

    boardState[row][col] = piece;
    const index = whiteHand.indexOf(piece);
    if (index > -1) { whiteHand.splice(index, 1); console.log(`DEBUG: Removed ${piece} from whiteHand. Remaining:`, whiteHand); }
    else { console.error(`ERROR: Piece ${piece} not found in whiteHand!`); }
    
    
    // Check if it is the right moment to automatically place king
    const kingsInHand = whiteHand.filter(p => p === 'K').length;
    const placedKings = boardState.flat().filter(p => p === 'K').length;
    const availableSquares = getValidPlacementSquares();

    if (kingsInHand > 0 && placedKings === 0 && availableSquares.length === 1) {
        boardState[availableSquares[0].row][availableSquares[0].col] = 'K';
        whiteHand.splice(whiteHand.indexOf('K'), 1); // Remove king from hand
    }
    
    selectedHandPiece = null;


    renderHands(); renderBoard();

    console.log(`DEBUG: After player placement - whiteHand length: ${whiteHand.length}, blackHandPieces length: ${blackHandPieces.length}`);
    // Check if setup is complete OR switch to AI placement turn
    if (whiteHand.length === 0 && blackHandPieces.length === 0) {
        console.log("DEBUG: Setup complete! Transitioning to playing state.");
        gameState = 'playing'; currentPlayer = 'white'; isPlayerTurn = true; updateStatus(); showMessage("Setup complete! Your turn.");
    } else if (blackHandPieces.length > 0) { // If AI still has pieces to place
        // Check if AI has squares before switching
        const aiSquares = getAIAvailablePlacementSquares();
        if (aiSquares.length === 0) { // AI has pieces but no squares
            console.log("DEBUG: AI has pieces but no squares left. Ending setup.");
            gameState = 'playing'; currentPlayer = 'white'; isPlayerTurn = true; updateStatus(); showMessage("AI cannot place remaining pieces. Your turn.");
        } else { // AI has pieces AND squares
            console.log("DEBUG: Switching to AI setup turn.");
            gameState = 'setup-black-turn'; isPlayerTurn = false; updateStatus(); showMessage("AI is placing a piece...");
            setTimeout(placeOneAIPieceCalculated, AI_DELAY);
        }
    } else { // AI is done, but player isn't
        console.log("DEBUG: AI done placing, player turn continues.");
        gameState = 'setup-white-turn'; isPlayerTurn = true; updateStatus();
    }
}

/** Helper to get AI placement squares */
function getAIAvailablePlacementSquares() { const squares = []; for (let r = 0; r < 2; r++) { for (let c = 0; c < boardCols; c++) { if (boardState[r][c] === EMPTY) { squares.push({ row: r, col: c }); } } } console.log(`DEBUG: AI available placement squares: ${squares.length}`); return squares; }
/** Helper to get Player placement squares (used in AI turn and player turn) */
function getPlayerAvailablePlacementSquares() { const squares = []; for (let r = boardRows - 2; r < boardRows; r++) { for (let c = 0; c < boardCols; c++) { if (boardState[r][c] === EMPTY) { squares.push({ row: r, col: c }); } } } console.log(`DEBUG: Player available placement squares: ${squares.length}`); return squares; }


/** Updates the turn indicator display */
function updateStatus() { turnIndicator.classList.remove('white', 'black', 'setup', 'game-over'); turnIndicator.style.borderColor = ''; turnLabel.textContent = ''; switch (gameState) { case 'setup-white-turn': turnIndicator.classList.add('white'); turnIndicator.classList.add('setup'); turnLabel.textContent = "Place Your Piece"; break; case 'setup-black-turn': turnIndicator.classList.add('black'); turnIndicator.classList.add('setup'); turnLabel.textContent = "AI Placing..."; break; case 'playing': turnIndicator.classList.add(currentPlayer); turnLabel.textContent = (currentPlayer === 'white') ? "Your Turn" : "AI's Turn"; break; case 'game-over': turnIndicator.classList.add('game-over'); turnLabel.textContent = "Game Over"; break; } if (turnIndicator.classList.contains('setup')) { turnIndicator.style.borderColor = 'var(--turn-indicator-setup-border)'; } else { turnIndicator.style.borderColor = 'var(--turn-indicator-border)'; } }

function showGameOver(winner) { gameState = 'game-over'; selectedSquare = null; validMoves = []; selectedHandPiece = null; validPlacementSquares = []; boardElement.classList.add('game-over'); const winnerText = (winner === 'white') ? "You win!" : "AI wins!"; if (winner === 'white') { playerScore += 500; aiScore += 0; /* AI gets 0 for losing */ } else { playerScore += 250; aiScore += 250; /* Player gets loss points, AI gets win points */ } showMessage(`Game Over! ${winnerText}`); updateStatus(); renderScore(); renderHands(); aiBuysPieces(); setTimeout(openShop, 1500); }
function showMessage(message) { messageBox.textContent = message; messageBox.style.display = 'block'; clearTimeout(messageBox.timer); messageBox.timer = setTimeout(() => { messageBox.style.display = 'none'; }, 3000); }
function toggleTheme() { if (currentTheme === 'day') { document.body.classList.add('dark-theme'); themeToggleButton.innerHTML = sunIcon; themeToggleButton.title = 'Switch to Day Theme'; currentTheme = 'night'; } else { document.body.classList.remove('dark-theme'); themeToggleButton.innerHTML = moonIcon; themeToggleButton.title = 'Switch to Night Theme'; currentTheme = 'day'; } }
function randomizeCellColors() { for (let r = 0; r < boardRows; r++) { for (let c = 0; c < boardCols; c++) { cellColors[r][c] = Math.random() < 0.2 ? 'dark' : 'light'; } } }

// --- Rendering Functions ---
function renderHands() { whiteHandElement.innerHTML = ''; const isSetup = gameState === 'setup-white-turn'; const isPlaying = gameState === 'playing' || gameState === 'game-over'; whiteHandArea.style.display = isSetup ? 'block' : 'none'; capturedByWhiteArea.style.display = isPlaying ? 'block' : 'none'; capturedByBlackArea.style.display = isPlaying ? 'block' : 'none'; if (isSetup) { console.log("DEBUG: Rendering white hand. Pieces:", whiteHand); whiteHand.forEach((p) => { const hpe = document.createElement('span'); hpe.classList.add('hand-piece'); hpe.textContent = PIECES[p] || p; hpe.dataset.piece = p; if (selectedHandPiece && selectedHandPiece.element === hpe) { hpe.classList.add('selected-for-placement'); } /* console.log(`DEBUG: Attaching click listener to hand piece ${p}`); */ hpe.addEventListener('click', handleHandPieceClick); whiteHandElement.appendChild(hpe); }); } if (isPlaying) renderCapturedPieces(); } // Removed listener log
function renderCapturedPieces() { capturedByWhiteElement.innerHTML = ''; capturedByBlackElement.innerHTML = ''; capturedByWhite.forEach(p => { const s = document.createElement('span'); s.className = 'captured-piece'; s.textContent = PIECES[p] || p; capturedByWhiteElement.appendChild(s); }); capturedByBlack.forEach(p => { const s = document.createElement('span'); s.className = 'captured-piece'; s.textContent = PIECES[p] || p; capturedByBlackElement.appendChild(s); }); }
function renderBoard() { boardElement.innerHTML = ''; boardElement.classList.remove('game-over'); boardElement.style.gridTemplateColumns = `repeat(${boardCols}, 1fr)`; boardElement.style.gridTemplateRows = `repeat(${boardRows}, 1fr)`; boardElement.style.aspectRatio = `${boardCols} / ${boardRows}`; if (gameState === 'setup-white-turn') { validPlacementSquares = getValidPlacementSquares(); } else if (gameState === 'playing' && selectedSquare && currentPlayer === 'white') { validMoves = getValidMoves(selectedSquare.row, selectedSquare.col, boardState, cellColors); } else { validPlacementSquares = []; validMoves = []; } for (let r = 0; r < boardRows; r++) { for (let c = 0; c < boardCols; c++) { const sq = document.createElement('div'); sq.classList.add('square'); sq.classList.add(cellColors[r][c]); sq.dataset.row = r; sq.dataset.col = c; const p = boardState[r][c]; if (p) { const pE = document.createElement('span'); pE.classList.add('piece'); pE.textContent = PIECES[p] || p; sq.appendChild(pE); } sq.classList.remove('selected', 'valid-move', 'valid-placement'); if (gameState === 'playing') { if (selectedSquare && selectedSquare.row === r && selectedSquare.col === c) sq.classList.add('selected'); if (validMoves.some(m => m.to.row === r && m.to.col === c)) sq.classList.add('valid-move'); } else if (gameState === 'setup-white-turn') { if (selectedHandPiece && validPlacementSquares.some(pos => pos.row === r && pos.col === c)) { sq.classList.add('valid-placement'); } } sq.addEventListener('click', handleSquareClick); boardElement.appendChild(sq); } } if (gameState === 'game-over') boardElement.classList.add('game-over'); }
function renderScore() { scoreDisplay.textContent = `Score: ${playerScore}`; }


// --- Shop Functions ---
function openShop() { console.log("DEBUG: Opening shop..."); shopScoreDisplay.textContent = playerScore; shopRowsSlider.value = boardRows; shopColsSlider.value = boardCols; shopRowsOutput.textContent = boardRows; shopColsOutput.textContent = boardCols; populateShopItems(); updatePlayerInventoryDisplay(); gameContainer.style.visibility = 'hidden'; shopModal.style.display = 'flex'; }
function populateShopItems() { shopItemsContainer.innerHTML = ''; for (const pieceType in SHOP_COSTS) { const cost = SHOP_COSTS[pieceType]; const itemDiv = document.createElement('div'); itemDiv.className = 'shop-item'; itemDiv.innerHTML = ` <div class="shop-item-piece">${PIECES[pieceType]}</div> <div class="shop-item-cost">Cost: ${cost}</div> <button class="buy-button" data-piece="${pieceType}" ${playerScore < cost ? 'disabled' : ''}>Buy</button> `; itemDiv.querySelector('.buy-button').addEventListener('click', () => buyPiece(pieceType, cost)); shopItemsContainer.appendChild(itemDiv); } }
function updatePlayerInventoryDisplay() { playerInventoryDisplay.innerHTML = ''; const pieceOrder = ['K', 'Q', 'R', 'B', 'N', 'P']; playerInventory.sort((a, b) => pieceOrder.indexOf(a) - pieceOrder.indexOf(b)); playerInventory.forEach(piece => { const pieceSpan = document.createElement('span'); pieceSpan.textContent = PIECES[piece]; playerInventoryDisplay.appendChild(pieceSpan); }); }
function buyPiece(pieceType, cost) { if (playerScore >= cost) { playerScore -= cost; playerInventory.push(pieceType); console.log(`DEBUG: Bought ${pieceType} for ${cost}. Score: ${playerScore}`); shopScoreDisplay.textContent = playerScore; updatePlayerInventoryDisplay(); populateShopItems(); } else { console.log(`DEBUG: Not enough score to buy ${pieceType}`); showMessage("Not enough score!"); } }
function startGameFromShop() { console.log("DEBUG: Starting next game from shop..."); shopModal.style.display = 'none'; gameContainer.style.visibility = 'visible'; initializeGame(true); }
function aiBuysPieces() { console.log("DEBUG: AI considering purchases. AI Score:", aiScore); if (aiScore >= 100) { const affordablePieces = Object.entries(SHOP_COSTS).filter(([type, cost]) => aiScore >= cost && type !== 'K') /* AI cannot buy kings */.map(([type, _]) => type.toLowerCase()); if (affordablePieces.length > 0) { const randomIndex = Math.floor(Math.random() * affordablePieces.length); const pieceToBuy = affordablePieces[randomIndex]; const cost = SHOP_COSTS[pieceToBuy.toUpperCase()]; aiScore -= cost; aiInventory.push(pieceToBuy); console.log(`DEBUG: AI bought ${pieceToBuy} for ${cost}. AI Score: ${aiScore}`); } else { console.log("DEBUG: AI cannot afford any pieces."); } } else { console.log("DEBUG: AI score too low to buy pieces."); } }


// --- Event Handlers ---
function handleHandPieceClick(event) { console.log(`DEBUG: handleHandPieceClick fired. Target:`, event.target, ` CurrentTarget:`, event.currentTarget); console.log(`DEBUG: State check - gameState: ${gameState}, isPlayerTurn: ${isPlayerTurn}`); if (gameState !== 'setup-white-turn' || !isPlayerTurn) { console.log(`DEBUG: handleHandPieceClick ignored (State: ${gameState}, Turn: ${isPlayerTurn}).`); return; } const target = event.currentTarget; const piece = target.dataset.piece; console.log(`DEBUG: Clicked hand piece: ${piece}`); if (selectedHandPiece && selectedHandPiece.element === target) { console.log("DEBUG: Deselecting hand piece."); selectedHandPiece = null; } else { console.log("DEBUG: Selecting hand piece."); selectedHandPiece = { piece: piece, element: target }; } console.log("DEBUG: selectedHandPiece is now:", selectedHandPiece ? selectedHandPiece.piece : null); renderHands(); renderBoard(); }
function handleSquareClick(event) { console.log(`DEBUG: handleSquareClick fired. gameState: ${gameState}, isPlayerTurn: ${isPlayerTurn}, selectedHandPiece: ${selectedHandPiece ? selectedHandPiece.piece : null}, selectedSquare: ${selectedSquare ? selectedSquare.row + ',' + selectedSquare.col : null}`); if (gameState === 'game-over' || !isPlayerTurn) { if (!isPlayerTurn && gameState === 'playing') showMessage("Wait for AI's turn..."); return; } const target = event.currentTarget; const r = parseInt(target.dataset.row); const c = parseInt(target.dataset.col); if (gameState === 'setup-white-turn') { console.log(`DEBUG: Setup click - selectedHandPiece: ${selectedHandPiece ? selectedHandPiece.piece : 'null'}`); if (!selectedHandPiece) { showMessage("Select a piece first."); return; } const isValid = validPlacementSquares.some(p => p.row === r && p.col === c); if (isValid) { console.log(`DEBUG: Placing player piece ${selectedHandPiece.piece} at (${r},${c})`); placePlayerPiece(selectedHandPiece.piece, r, c); } else { showMessage("Invalid placement square."); } return; } else if (gameState === 'playing') { const clickedP = boardState[r][c]; const isMoveTarget = validMoves.some(m => m.to.row === r && m.to.col === c); if (selectedSquare) { if (selectedSquare.row === r && selectedSquare.col === c) { console.log("DEBUG: Deselecting board piece."); selectedSquare = null; validMoves = []; renderBoard(); } else if (isMoveTarget) { console.log(`DEBUG: Making player move from (${selectedSquare.row},${selectedSquare.col}) to (${r},${c})`); makePlayerMove(selectedSquare.row, selectedSquare.col, r, c); } else { if (isCurrentPlayerPiece(clickedP)) { console.log(`DEBUG: Selecting new board piece ${clickedP} at (${r},${c})`); selectedSquare = { row: r, col: c }; validMoves = getValidMoves(r, c, boardState, cellColors); renderBoard(); } else { console.log("DEBUG: Clicked invalid square/opponent piece, deselecting."); selectedSquare = null; validMoves = []; renderBoard(); } } } else { if (isCurrentPlayerPiece(clickedP)) { console.log(`DEBUG: Selecting board piece ${clickedP} at (${r},${c})`); selectedSquare = { row: r, col: c }; validMoves = getValidMoves(r, c, boardState, cellColors); renderBoard(); } else { console.log("DEBUG: Clicked empty/opponent piece with no selection."); } } return; } }
function handleSquareClick(event) {
    console.log(`DEBUG: handleSquareClick fired. gameState: ${gameState}, isPlayerTurn: ${isPlayerTurn}, selectedHandPiece: ${selectedHandPiece ? selectedHandPiece.piece : null}, selectedSquare: ${selectedSquare ? selectedSquare.row + ',' + selectedSquare.col : null}`);
    if (gameState === 'game-over' || !isPlayerTurn) {
        if (!isPlayerTurn && gameState === 'playing') showMessage("Wait for AI's turn...");
        return;
    }
    const target = event.currentTarget;
    const r = parseInt(target.dataset.row);
    const c = parseInt(target.dataset.col);
    if (gameState === 'setup-white-turn') {
        console.log(`DEBUG: Setup click - selectedHandPiece: ${selectedHandPiece ? selectedHandPiece.piece : 'null'}`);
        if (!selectedHandPiece) { showMessage("Select a piece first."); return; }
        const isValid = validPlacementSquares.some(p => p.row === r && p.col === c);
        if (isValid) { console.log(`DEBUG: Placing player piece ${selectedHandPiece.piece} at (${r},${c})`); placePlayerPiece(selectedHandPiece.piece, r, c); }
        else { showMessage("Invalid placement square."); }
        return;
    } else if (gameState === 'playing') {
        const clickedP = boardState[r][c];
        const isMoveTarget = validMoves.some(m => m.to.row === r && m.to.col === c);
        if (selectedSquare) {
            if (selectedSquare.row === r && selectedSquare.col === c) { console.log("DEBUG: Deselecting board piece."); selectedSquare = null; validMoves = []; renderBoard(); }
            else {
              // King move check
              if (boardState[selectedSquare.row][selectedSquare.col] && boardState[selectedSquare.row][selectedSquare.col].toLowerCase() === 'k') {
                    const opponentAttacks = getSquaresUnderAttack(currentPlayer === 'white' ? 'black' : 'white');
                    const kingValidMoves = getValidMoves(selectedSquare.row, selectedSquare.col, boardState, cellColors).filter(move => !opponentAttacks.some(attack => attack.row === move.to.row && attack.col === move.to.col));
                    if (kingValidMoves.some(m => m.to.row === r && m.to.col === c)) {
                        console.log(`DEBUG: Making player move from (${selectedSquare.row},${selectedSquare.col}) to (${r},${c})`);
                        makePlayerMove(selectedSquare.row, selectedSquare.col, r, c);
                    }
                    else {
                        console.log("DEBUG: Invalid move for king, deselecting.");
                        selectedSquare = null;
                        validMoves = [];
                        renderBoard();
                    }
                    return;
                }
                if (isMoveTarget) {
                    console.log(`DEBUG: Making player move from (${selectedSquare.row},${selectedSquare.col}) to (${r},${c})`);
                    makePlayerMove(selectedSquare.row, selectedSquare.col, r, c);
                }
                else {
                    if (isCurrentPlayerPiece(clickedP)) { console.log(`DEBUG: Selecting new board piece ${clickedP} at (${r},${c})`); selectedSquare = { row: r, col: c }; validMoves = getValidMoves(r, c, boardState, cellColors); renderBoard(); }
                    else { console.log("DEBUG: Clicked invalid square/opponent piece, deselecting."); selectedSquare = null; validMoves = []; renderBoard(); }
                }
            }
        } else {
            if (isCurrentPlayerPiece(clickedP)) {
                console.log(`DEBUG: Selecting board piece ${clickedP} at (${r},${c})`);
                selectedSquare = { row: r, col: c };
                validMoves = getValidMoves(r, c, boardState, cellColors);
                // Remove squares under attack for king
                if (boardState[r][c].toLowerCase() === 'k') {
                    const opponentAttacks = getSquaresUnderAttack(currentPlayer === 'white' ? 'black' : 'white');
                    validMoves = validMoves.filter(move => !opponentAttacks.some(attack => attack.row === move.to.row && attack.col === move.to.col));
                }
                renderBoard();
            } else { console.log("DEBUG: Clicked empty/opponent piece with no selection."); }
        }
        return;
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Set default theme on load

    if (currentTheme === 'night') { document.body.classList.add('dark-theme'); }
    // Slider listeners
    rowsSlider.addEventListener('input', (e) => rowsOutput.textContent = e.target.value);
    colsSlider.addEventListener('input', (e) => colsOutput.textContent = e.target.value);
    depthSlider.addEventListener('input', (e) => depthOutput.textContent = e.target.value);
    shopRowsSlider.addEventListener('input', (e) => shopRowsOutput.textContent = e.target.value);
    shopColsSlider.addEventListener('input', (e) => shopColsOutput.textContent = e.target.value);

    // Modal Play button listener
    playButton.addEventListener('click', () => {
        console.log("DEBUG: Play button clicked.");
        rulesModal.style.display = 'none';
        gameContainer.style.visibility = 'visible';
        initializeGame(false); // Start first game
    });

    // Shop "Start Next Game" button listener
    startNextGameButton.addEventListener('click', startGameFromShop);

    // Other listeners
    themeToggleButton.addEventListener('click', toggleTheme);
    restartButton.addEventListener('click', () => {
        console.log("DEBUG: Restart button clicked!");
        // *** FIX: Changed restart behavior ***
        // Hide game, show rules modal instead of confirming/initializing
        gameContainer.style.visibility = 'hidden';
        shopModal.style.display = 'none'; // Ensure shop is hidden too
        rulesModal.style.display = 'flex';
        console.log("DEBUG: Returned to rules/setup modal.");
    });

    // Set default slider outputs initially
    rowsOutput.textContent = rowsSlider.value;
    colsOutput.textContent = colsSlider.value;
    depthOutput.textContent = depthSlider.value;
    shopRowsOutput.textContent = shopRowsSlider.value;
    shopColsOutput.textContent = shopColsSlider.value;

    // Show rules modal on load
    console.log("DEBUG: Page loaded, showing rules modal.");
});