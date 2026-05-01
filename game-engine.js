class GameEngine {
  constructor(state) {
    this.state = state;
  }

  findSpotForPiece(board, col) {
    for (let row = this.state.boardRows - 1; row >= 0; row--) {
      if (board[row][col] === null) {
        return row;
      }
    }
    return -1;
  }

  didSomeoneWin(board, row, col, player) {
    let count = 1;
    let winningSpots = [[row, col]];

    for (let c = col - 1; c >= 0 && board[row][c] === player; c--) {
      count++;
      winningSpots.push([row, c]);
    }

    for (
      let c = col + 1;
      c < this.state.boardCols && board[row][c] === player;
      c++
    ) {
      count++;
      winningSpots.push([row, c]);
    }
    if (count >= 4) return winningSpots;

    count = 1;
    winningSpots = [[row, col]];

    for (let r = row - 1; r >= 0 && board[r][col] === player; r--) {
      count++;
      winningSpots.push([r, col]);
    }

    for (
      let r = row + 1;
      r < this.state.boardRows && board[r][col] === player;
      r++
    ) {
      count++;
      winningSpots.push([r, col]);
    }
    if (count >= 4) return winningSpots;

    count = 1;
    winningSpots = [[row, col]];

    for (
      let r = row - 1, c = col - 1;
      r >= 0 && c >= 0 && board[r][c] === player;
      r--, c--
    ) {
      count++;
      winningSpots.push([r, c]);
    }

    for (
      let r = row + 1, c = col + 1;
      r < this.state.boardRows &&
      c < this.state.boardCols &&
      board[r][c] === player;
      r++, c++
    ) {
      count++;
      winningSpots.push([r, c]);
    }
    if (count >= 4) return winningSpots;

    count = 1;
    winningSpots = [[row, col]];

    for (
      let r = row - 1, c = col + 1;
      r >= 0 && c < this.state.boardCols && board[r][c] === player;
      r--, c++
    ) {
      count++;
      winningSpots.push([r, c]);
    }

    for (
      let r = row + 1, c = col - 1;
      r < this.state.boardRows && c >= 0 && board[r][c] === player;
      r++, c--
    ) {
      count++;
      winningSpots.push([r, c]);
    }
    if (count >= 4) return winningSpots;

    return null;
  }

  dropPiece(col) {
    if (this.state.gameStatus !== "playing") return false;

    const row = this.findSpotForPiece(this.state.gameBoard, col);
    if (row === -1) return false;

    this.state.gameBoard[row][col] = this.state.whoseTurn;
    this.state.moveStory.push({ row, col, player: this.state.whoseTurn });

    const winningSpots = this.didSomeoneWin(
      this.state.gameBoard,
      row,
      col,
      this.state.whoseTurn,
    );
    if (winningSpots) {
      this.state.champion = this.state.whoseTurn;
      this.state.gameStatus = "won";
      this.state.winningCombo = winningSpots;
      const scoreKey = this.state.whoseTurn === "player1" ? "red" : "yellow";
      this.state.playerScores[scoreKey]++;
      return true;
    }

    const isDraw = this.state.gameBoard.every((row) =>
      row.every((cell) => cell !== null),
    );
    if (isDraw) {
      this.state.gameStatus = "draw";
      return true;
    }

    this.state.switchTurn();
    return true;
  }

  takeBackMove() {
    if (
      this.state.moveStory.length === 0 ||
      this.state.gameStatus !== "playing"
    )
      return false;

    const lastMove = this.state.moveStory.pop();
    this.state.gameBoard[lastMove.row][lastMove.col] = null;
    this.state.whoseTurn = lastMove.player;
    this.state.champion = null;
    this.state.gameStatus = "playing";
    this.state.winningCombo = [];

    return true;
  }

  startReplayShow() {
    if (this.state.moveStory.length === 0) return false;

    this.originalChampion = this.state.champion;
    this.originalStatus = this.state.gameStatus;
    this.originalWinningCombo = [...this.state.winningCombo];
    this.originalBoard = this.state.gameBoard.map((row) => [...row]);
    this.originalMoveStory = [...this.state.moveStory];

    this.state.gameBoard = this.state.buildFreshBoard(
      this.state.boardRows,
      this.state.boardCols,
    );
    this.state.whoseTurn = "player1";
    this.state.gameStatus = "replaying";
    this.state.champion = null;
    this.state.winningCombo = [];
    this.replayIndex = 0;

    return true;
  }

  showNextReplayMove() {
    if (this.state.gameStatus !== "replaying") return null;

    if (this.replayIndex >= this.state.moveStory.length) {
      this.state.gameStatus = this.originalStatus;
      this.state.champion = this.originalChampion;
      this.state.winningCombo = [...this.originalWinningCombo];
      return null;
    }

    const move = this.state.moveStory[this.replayIndex];
    this.state.gameBoard[move.row][move.col] = move.player;
    this.state.whoseTurn = this.state.getOpponent(move.player);
    this.replayIndex++;

    if (
      this.replayIndex === this.state.moveStory.length &&
      this.originalChampion
    ) {
      this.state.winningCombo = this.didSomeoneWin(
        this.state.gameBoard,
        move.row,
        move.col,
        move.player,
      );
      this.state.champion = this.originalChampion;
    }

    return move;
  }

  getReplayProgress() {
    if (!this.replayIndex) return 0;
    return Math.round((this.replayIndex / this.state.moveStory.length) * 100);
  }

  resetReplay() {
    this.replayIndex = 0;
  }
}
