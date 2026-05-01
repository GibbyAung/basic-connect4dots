class GameUI {
  constructor(state, engine, sounds) {
    this.state = state;
    this.engine = engine;
    this.sounds = sounds;
  }

  createBoard() {
    const gameBoard = document.getElementById("game-board");
    if (!gameBoard) return;

    gameBoard.innerHTML = "";

    for (let r = 0; r < this.state.boardRows; r++) {
      for (let c = 0; c < this.state.boardCols; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = r;
        cell.dataset.col = c;
        gameBoard.appendChild(cell);
      }
    }
  }

  refreshBoard(animateMove = null) {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell) => {
      const row = parseInt(cell.dataset.row);
      const col = parseInt(cell.dataset.col);
      const piece = this.state.gameBoard[row][col];

      cell.classList.remove("red", "yellow", "winning", "dropping");

      if (piece) {
        const colorClass = piece === "player1" ? "red" : "yellow";
        cell.classList.add(colorClass);

        if (animateMove && animateMove.row === row && animateMove.col === col) {
          cell.classList.add("dropping");
          setTimeout(() => {
            cell.classList.remove("dropping");
          }, 500);
        }
      }

      if (this.state.winningCombo.some(([r, c]) => r === row && c === col)) {
        cell.classList.add("winning");
      }
    });
  }

  refreshScreen() {
    const currentPlayerEl = document.getElementById("current-player");
    if (currentPlayerEl) {
      const gameMode = this.state.gameSettings.gameMode;
      const modeText = gameMode === "ai" ? "Player vs AI" : "Player vs Player";
      const playerName = this.state.getCurrentPlayerName();

      currentPlayerEl.innerHTML = `Mode: ${modeText} | Current Player: <span id="player-color">${playerName}</span>`;
    }

    const gameOverScreen = document.getElementById("game-over-section");
    const gameResult = document.getElementById("game-result");
    const nameInputSection = document.getElementById("name-input-section");
    const gameOverButtons = document.getElementById("game-over-buttons");

    if (this.state.gameStatus === "won") {
      gameResult.textContent = `${this.state.getPlayerName(this.state.champion)} Wins!`;
      gameOverScreen.style.display = "block";

      if (this.state.pendingHallOfFameEntry) {
        nameInputSection.style.display = "block";
        gameOverButtons.style.display = "none";
        document.getElementById("winner-name-input").focus();
      } else {
        nameInputSection.style.display = "none";
        gameOverButtons.style.display = "block";
      }
    } else if (this.state.gameStatus === "draw") {
      gameResult.textContent = "It's a Draw!";
      gameOverScreen.style.display = "block";
      nameInputSection.style.display = "none";
      gameOverButtons.style.display = "block";
    } else {
      gameOverScreen.style.display = "none";
    }

    this.updateUndoButton();
    this.updateBrowserTab();
  }

  updateBrowserTab() {
    const playerName = this.state.getCurrentPlayerName();

    if (this.state.gameStatus === "won") {
      const winnerName = this.state.getPlayerName(this.state.champion);
      document.title = `🏆 ${winnerName} Wins! - Connect 4`;
    } else if (this.state.gameStatus === "draw") {
      document.title = "🤝 It's a Draw! - Connect 4";
    } else if (this.state.gameStatus === "replaying") {
      document.title = "▶️ Watching Replay - Connect 4";
    } else {
      document.title = `${playerName}'s Turn - Connect 4`;
    }
  }

  updateUndoButton() {
    const undoButton = document.getElementById("undo-button");
    undoButton.disabled =
      this.state.moveStory.length === 0 || this.state.gameStatus !== "playing";
  }

  applyPlayerColors() {
    const root = document.documentElement;
    root.style.setProperty("--player1-color", this.state.playerColors.player1);
    root.style.setProperty("--player2-color", this.state.playerColors.player2);
  }

  showHallOfFame() {
    const hallOfFameList = document.getElementById("leaderboard-list");

    if (this.state.hallOfFame.length === 0) {
      hallOfFameList.innerHTML = "<p>No champions yet. Be the first!</p>";
      return;
    }

    const championsHTML = this.state.hallOfFame
      .map((champion, index) => {
        let nameDisplay = champion.name;
        if (champion.name === "AI_Opponent") {
          nameDisplay = "🤖 AI Opponent";
        } else {
          nameDisplay = `${champion.name} ${champion.playerNumber === "Player 1" ? "🔴" : "🟡"}`;
        }

        return `
    <div class="leaderboard-entry">
      <span class="rank">#${index + 1}</span>
      <span class="name">${nameDisplay}</span>
      <span class="wins">${champion.wins} win${champion.wins !== 1 ? "s" : ""}</span>
    </div>
  `;
      })
      .join("");

    hallOfFameList.innerHTML = championsHTML;
  }

  showGameHistory() {
    const historyList = document.getElementById("game-history-list");
    if (!historyList) return;

    const history = this.state.getGameHistory();

    if (history.length === 0) {
      historyList.innerHTML = "<p>No games played yet. Start playing!</p>";
      return;
    }

    const gamesPerPage = 5;
    const currentPage = this.state.historyCurrentPage || 1;
    const totalPages = Math.ceil(history.length / gamesPerPage);

    if (currentPage > totalPages && totalPages > 0) {
      this.state.historyCurrentPage = 1;
      return this.showGameHistory(); // Recurse with reset page
    }

    const startIndex = (currentPage - 1) * gamesPerPage;
    const endIndex = startIndex + gamesPerPage;
    const paginatedHistory = history.slice(startIndex, endIndex);

    const historyHTML = paginatedHistory
      .map((game, index) => {
        const date = new Date(game.date);
        const dateStr =
          date.toLocaleDateString() + " " + date.toLocaleTimeString();
        const resultIcon =
          game.status === "won" ? "🏆" : game.status === "draw" ? "🤝" : "⏸️";
        const resultText = game.winnerName ? `${game.winnerName} Won` : "Draw";

        return `
      <div class="history-entry">
        <div class="history-header">
          <span class="history-result">${resultIcon} ${resultText}</span>
          <span class="history-date">${dateStr}</span>
        </div>
        <div class="history-details">
          <span class="history-moves">${game.totalMoves} moves</span>
          <span class="history-mode">${game.gameMode}</span>
        </div>
        <div class="history-actions">
          <button class="replay-btn" onclick="game.replayGameFromHistory('${game.id}')">
            🎬 Replay
          </button>
          <button class="delete-btn" onclick="game.deleteGameFromHistory('${game.id}')">
            🗑️ Delete
          </button>
        </div>
      </div>
    `;
      })
      .join("");

    // Create pagination controls
    const paginationHTML =
      totalPages > 1
        ? this.createPaginationControls(currentPage, totalPages)
        : "";

    historyList.innerHTML = historyHTML + paginationHTML;
  }

  createPaginationControls(currentPage, totalPages) {
    let controls = '<div class="pagination-controls">';

    // Previous button
    controls += `
      <button 
        class="pagination-btn ${currentPage === 1 ? "disabled" : ""}" 
        onclick="game.changeHistoryPage(${currentPage - 1})"
        ${currentPage === 1 ? "disabled" : ""}
      >
        ← Previous
      </button>
    `;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page and ellipsis
    if (startPage > 1) {
      controls += `
        <button class="pagination-btn" onclick="game.changeHistoryPage(1)">1</button>
      `;
      if (startPage > 2) {
        controls += '<span class="pagination-ellipsis">...</span>';
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      controls += `
        <button 
          class="pagination-btn ${i === currentPage ? "active" : ""}" 
          onclick="game.changeHistoryPage(${i})"
        >
          ${i}
        </button>
      `;
    }

    // Last page and ellipsis
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        controls += '<span class="pagination-ellipsis">...</span>';
      }
      controls += `
        <button class="pagination-btn" onclick="game.changeHistoryPage(${totalPages})">${totalPages}</button>
      `;
    }

    // Next button
    controls += `
      <button 
        class="pagination-btn ${currentPage === totalPages ? "disabled" : ""}" 
        onclick="game.changeHistoryPage(${currentPage + 1})"
        ${currentPage === totalPages ? "disabled" : ""}
      >
        Next →
      </button>
    `;

    controls += "</div>";

    // Page info
    controls += `
      <div class="pagination-info">
        Page ${currentPage} of ${totalPages} (${this.state.getGameHistory().length} total games)
      </div>
    `;

    return controls;
  }

  changeHistoryPage(page) {
    this.state.historyCurrentPage = page;
    this.showGameHistory();
  }

  handleCellClick(event) {
    const cell = event.target;
    const col = parseInt(cell.dataset.col);

    if (this.engine.dropPiece(col)) {
      return true;
    }
    return false;
  }

  startReplayShow() {
    if (!this.engine.startReplayShow()) return;

    this.sounds?.setReplayMode(true);
    this.refreshBoard();
    this.refreshScreen();
    this.showReplayProgress();

    this.replayTimer = setInterval(() => {
      const move = this.engine.showNextReplayMove();
      if (!move) {
        clearInterval(this.replayTimer);
        this.replayTimer = null;
        this.sounds?.setReplayMode(false);
        this.refreshScreen();
        this.hideReplayProgress();
        return;
      }

      this.refreshBoard(move);
      this.refreshScreen();
      this.updateReplayProgress();

      setTimeout(() => {
        const cells = document.querySelectorAll(".cell");
        cells.forEach((cell) => {
          if (
            parseInt(cell.dataset.row) === move.row &&
            parseInt(cell.dataset.col) === move.col
          ) {
            cell.classList.add("dropping");
            setTimeout(() => cell.classList.remove("dropping"), 500);
          }
        });
      }, 50);
    }, 1000);
  }

  showReplayProgress() {
    let progressDiv = document.getElementById("replay-progress");
    if (!progressDiv) {
      progressDiv = document.createElement("div");
      progressDiv.id = "replay-progress";
      progressDiv.innerHTML = `
        <div class="replay-header">
          <h3>🎬 Game Replay</h3>
          <button class="stop-replay-btn" onclick="game.gameUI.stopReplay()">⏹️ Stop</button>
        </div>
        <div class="replay-progress-bar">
          <div class="replay-progress-fill"></div>
        </div>
        <div class="replay-info">
          <span class="replay-move-count">Move 0 / 0</span>
        </div>
      `;
      // Try multiple selectors to find the container
      const container =
        document.querySelector(".game-container") ||
        document.querySelector("main") ||
        document.querySelector("body");
      container.appendChild(progressDiv);
    }
    progressDiv.style.display = "block";
  }

  updateReplayProgress() {
    const progressDiv = document.getElementById("replay-progress");
    if (!progressDiv) return;

    const progress = this.engine.getReplayProgress();
    const currentMove = this.engine.replayIndex || 0;
    const totalMoves = this.state.moveStory.length;

    progressDiv.querySelector(".replay-progress-fill").style.width =
      `${progress}%`;
    progressDiv.querySelector(".replay-move-count").textContent =
      `Move ${currentMove} / ${totalMoves}`;
  }

  hideReplayProgress() {
    const progressDiv = document.getElementById("replay-progress");
    if (progressDiv) {
      progressDiv.style.display = "none";
    }
  }

  stopReplay() {
    if (this.replayTimer) {
      clearInterval(this.replayTimer);
      this.replayTimer = null;
    }

    // Restore the game board to its final state
    if (this.engine.originalBoard) {
      this.state.gameBoard = this.engine.originalBoard.map((row) => [...row]);
    }

    // Restore move story to full length
    if (this.engine.originalMoveStory) {
      this.state.moveStory = [...this.engine.originalMoveStory];
    }

    // Set game to playable state
    this.state.gameStatus = "playing";
    this.state.champion = null;
    this.state.winningCombo = [];

    // Set current turn based on last move
    if (this.state.moveStory.length > 0) {
      const lastMove = this.state.moveStory[this.state.moveStory.length - 1];
      this.state.whoseTurn = this.state.getOpponent(lastMove.player);
    } else {
      this.state.whoseTurn = "player1";
    }

    // Clear replay state
    this.engine.replayIndex = 0;
    this.engine.originalBoard = null;
    this.engine.originalMoveStory = null;
    this.engine.originalStatus = null;
    this.engine.originalChampion = null;
    this.engine.originalWinningCombo = null;

    this.sounds?.setReplayMode(false);
    this.hideReplayProgress();
    this.refreshBoard();
    this.refreshScreen();
  }

  showAIThinking() {
    const currentPlayerEl = document.getElementById("current-player");
    if (currentPlayerEl) {
      currentPlayerEl.innerHTML = `<span class="ai-thinking">🤔 AI is thinking...</span>`;
    }
  }

  hideAIThinking() {
    const currentPlayerEl = document.getElementById("current-player");
    if (currentPlayerEl) {
      const gameMode = this.state.gameSettings.gameMode;
      const modeText = gameMode === "ai" ? "Player vs AI" : "Player vs Player";
      const playerName = this.state.getCurrentPlayerName();

      currentPlayerEl.innerHTML = `Mode: ${modeText} | Current Player: <span id="player-color">${playerName}</span>`;
    }
  }
}
