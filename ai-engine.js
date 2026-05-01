class Connect4AI {
  constructor(state) {
    this.gameState = state;
  }

  scoreBoard(board, player) {
    const opponent = this.gameState.getOpponent(player);
    let score = 0;

    const centerCol = Math.floor(this.gameState.boardCols / 2);
    for (let row = 0; row < this.gameState.boardRows; row++) {
      if (board[row][centerCol] === player) score += 3;
      if (board[row][centerCol] === opponent) score -= 3;
    }

    for (let row = 0; row < this.gameState.boardRows; row++) {
      for (let col = 0; col < this.gameState.boardCols; col++) {
        if (col <= this.gameState.boardCols - 4) {
          const window = [
            board[row][col],
            board[row][col + 1],
            board[row][col + 2],
            board[row][col + 3],
          ];
          score += this.scoreWindow(window, player);
        }
        if (row <= this.gameState.boardRows - 4) {
          const window = [
            board[row][col],
            board[row + 1][col],
            board[row + 2][col],
            board[row + 3][col],
          ];
          score += this.scoreWindow(window, player);
        }
        if (
          row <= this.gameState.boardRows - 4 &&
          col <= this.gameState.boardCols - 4
        ) {
          const window = [
            board[row][col],
            board[row + 1][col + 1],
            board[row + 2][col + 2],
            board[row + 3][col + 3],
          ];
          score += this.scoreWindow(window, player);
        }
        if (row >= 3 && col <= this.gameState.boardCols - 4) {
          const window = [
            board[row][col],
            board[row - 1][col + 1],
            board[row - 2][col + 2],
            board[row - 3][col + 3],
          ];
          score += this.scoreWindow(window, player);
        }
      }
    }

    return score;
  }

  scoreWindow(window, player) {
    const opponent = this.gameState.getOpponent(player);
    let score = 0;

    const playerCount = window.filter((cell) => cell === player).length;
    const opponentCount = window.filter((cell) => cell === opponent).length;
    const emptyCount = window.filter((cell) => cell === null).length;

    if (playerCount === 4) score += 100000;
    else if (playerCount === 3 && emptyCount === 1) score += 100;
    else if (playerCount === 2 && emptyCount === 2) score += 10;

    if (opponentCount === 3 && emptyCount === 1) score -= 1000;
    else if (opponentCount === 2 && emptyCount === 2) score -= 10;

    return score;
  }

  // Minimax algorithm with alpha-beta pruning
  thinkAhead(
    board,
    depth,
    alpha,
    beta,
    maximizingPlayer,
    player,
    lastRow = -1,
    lastCol = -1,
  ) {
    const opponent = this.gameState.getOpponent(player);

    if (lastRow !== -1 && lastCol !== -1) {
      const lastPlayer = board[lastRow][lastCol];
      const winCells = this.checkForWin(board, lastRow, lastCol, lastPlayer);
      if (winCells) {
        return lastPlayer === player ? 100000 + depth : -100000 - depth;
      }
    }

    const isDraw = board.every((row) => row.every((cell) => cell !== null));
    if (isDraw || depth === 0) {
      return this.scoreBoard(board, player);
    }

    if (maximizingPlayer) {
      let bestScore = -Infinity;
      for (let col = 0; col < this.gameState.boardCols; col++) {
        const row = this.findSpotForPiece(board, col);
        if (row !== -1) {
          board[row][col] = player;
          const score = this.thinkAhead(
            board,
            depth - 1,
            alpha,
            beta,
            false,
            player,
            row,
            col,
          );
          board[row][col] = null;
          bestScore = Math.max(bestScore, score);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) break;
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let col = 0; col < this.gameState.boardCols; col++) {
        const row = this.findSpotForPiece(board, col);
        if (row !== -1) {
          board[row][col] = opponent;
          const score = this.thinkAhead(
            board,
            depth - 1,
            alpha,
            beta,
            true,
            player,
            row,
            col,
          );
          board[row][col] = null;
          bestScore = Math.min(bestScore, score);
          beta = Math.min(beta, score);
          if (beta <= alpha) break;
        }
      }
      return bestScore;
    }
  }

  getBestMove(board) {
    const difficulty = this.gameState.gameSettings.difficulty || "medium";
    const depth = difficulty === "easy" ? 2 : difficulty === "medium" ? 4 : 6;

    if (this.gameState.moveStory.length === 0) {
      const centerCol = Math.floor(this.gameState.boardCols / 2);
      return centerCol;
    }

    let bestCol = -1;
    let bestScore = -Infinity;

    for (let col = 0; col < this.gameState.boardCols; col++) {
      const row = this.findSpotForPiece(board, col);
      if (row !== -1) {
        board[row][col] = "player2";
        const score = this.thinkAhead(
          board,
          depth,
          -Infinity,
          Infinity,
          false,
          "player2",
          row,
          col,
        );
        board[row][col] = null;

        if (score > bestScore) {
          bestScore = score;
          bestCol = col;
        }
      }
    }

    return bestCol;
  }

  findSpotForPiece(board, col) {
    for (let row = this.gameState.boardRows - 1; row >= 0; row--) {
      if (board[row][col] === null) {
        return row;
      }
    }
    return -1;
  }

  checkForWin(board, row, col, player) {
    let count = 1;
    let cells = [[row, col]];

    for (let c = col - 1; c >= 0 && board[row][c] === player; c--) {
      count++;
      cells.push([row, c]);
    }
    for (
      let c = col + 1;
      c < this.gameState.boardCols && board[row][c] === player;
      c++
    ) {
      count++;
      cells.push([row, c]);
    }
    if (count >= 4) return cells;

    count = 1;
    cells = [[row, col]];
    for (let r = row - 1; r >= 0 && board[r][col] === player; r--) {
      count++;
      cells.push([r, col]);
    }
    for (
      let r = row + 1;
      r < this.gameState.boardRows && board[r][col] === player;
      r++
    ) {
      count++;
      cells.push([r, col]);
    }
    if (count >= 4) return cells;

    count = 1;
    cells = [[row, col]];
    for (
      let r = row - 1, c = col - 1;
      r >= 0 && c >= 0 && board[r][c] === player;
      r--, c--
    ) {
      count++;
      cells.push([r, c]);
    }
    for (
      let r = row + 1, c = col + 1;
      r < this.gameState.boardRows &&
      c < this.gameState.boardCols &&
      board[r][c] === player;
      r++, c++
    ) {
      count++;
      cells.push([r, c]);
    }
    if (count >= 4) return cells;

    // Check diagonal (top-right to bottom-left)
    count = 1;
    cells = [[row, col]];
    for (
      let r = row - 1, c = col + 1;
      r >= 0 && c < this.gameState.boardCols && board[r][c] === player;
      r--, c++
    ) {
      count++;
      cells.push([r, c]);
    }
    for (
      let r = row + 1, c = col - 1;
      r < this.gameState.boardRows && c >= 0 && board[r][c] === player;
      r++, c--
    ) {
      count++;
      cells.push([r, c]);
    }
    if (count >= 4) return cells;

    return null;
  }
}
