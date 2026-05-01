class Connect4Game {
  constructor() {
    this.gameState = new GameState();
    this.gameEngine = new GameEngine(this.gameState);
    this.gameSounds = new SoundEffects();
    this.gameUI = new GameUI(this.gameState, this.gameEngine, this.gameSounds);
    this.smartAI = new Connect4AI(this.gameState);
    this.partyParticles = new VictoryParticles();

    this.setupEventListeners();
  }

  // Setup all button and UI event listeners
  setupEventListeners() {
    document.getElementById("restart-button").addEventListener("click", () => {
      this.gameSounds.playClickSound();
      this.gameState.resetTheScoreboard();
      this.startNewGame();
    });

    document.getElementById("rematch-button").addEventListener("click", () => {
      this.gameSounds.playClickSound();
      this.startNewGame();
    });

    document.getElementById("undo-button").addEventListener("click", () => {
      this.gameSounds.playClickSound();
      this.undoLastMove();
    });

    document.getElementById("replay-button").addEventListener("click", () => {
      this.gameSounds.playClickSound();
      this.watchReplay();
    });

    document.getElementById("new-game-button").addEventListener("click", () => {
      this.gameSounds.playClickSound();
      if (confirm("Start a new game? Current game progress will be lost.")) {
        this.startNewGame();
      }
    });

    document
      .getElementById("clear-leaderboard")
      .addEventListener("click", () => {
        this.gameSounds.playClickSound();
        if (confirm("Clear the Hall of Fame?")) {
          this.gameState.wipeTheHallOfFame();
          this.gameUI.showHallOfFame();
          this.gameUI.showGameHistory();
        }
      });

    document
      .getElementById("save-name-button")
      .addEventListener("click", () => {
        this.gameSounds.playClickSound();
        const nameInput = document.getElementById("winner-name-input");
        const playerName = nameInput.value.trim();
        this.gameState.saveHallOfFameEntry(playerName);
        nameInput.value = "";
        this.gameUI.showHallOfFame();
        this.gameUI.showGameHistory();
        this.gameUI.refreshScreen();
      });

    document
      .getElementById("skip-name-button")
      .addEventListener("click", () => {
        this.gameSounds.playClickSound();
        this.gameState.saveHallOfFameEntry("Anonymous");
        this.gameUI.showHallOfFame();
        this.gameUI.showGameHistory();
        this.gameUI.refreshScreen();
      });

    document
      .getElementById("winner-name-input")
      .addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.gameSounds.playClickSound();
          const playerName = e.target.value.trim();
          this.gameState.saveHallOfFameEntry(playerName);
          e.target.value = "";
          this.gameUI.showHallOfFame();
          this.gameUI.showGameHistory();
          this.gameUI.refreshScreen();
        }
      });

    const clearHistoryBtn = document.getElementById("clear-history");
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener("click", () => {
        this.gameSounds.playClickSound();
        this.clearGameHistory();
      });
    }
  }

  setupCellListeners() {
    const gameBoard = document.getElementById("game-board");
    if (!gameBoard) return;

    gameBoard.addEventListener("click", (event) => {
      const cell = event.target.closest(".cell");
      if (!cell) return;

      this.handleCellClick({ target: cell });
    });

    gameBoard.addEventListener("mouseover", (event) => {
      const cell = event.target.closest(".cell");
      if (!cell) return;

      const col = parseInt(cell.dataset.col);
      if (
        this.gameState.gameStatus === "playing" &&
        this.gameEngine.findSpotForPiece(this.gameState.gameBoard, col) !== -1
      ) {
        this.gameSounds?.playHoverSound();
      }
    });
  }

  handleCellClick(event) {
    if (this.gameUI.handleCellClick(event)) {
      const lastMove =
        this.gameState.moveStory[this.gameState.moveStory.length - 1];

      this.gameSounds.playDropSound();
      this.gameUI.refreshBoard(lastMove);
      this.gameUI.refreshScreen();

      setTimeout(() => {
        this.checkGameEnd();
        this.letAIPick();
      }, 500);
    }
  }

  // Handle AI turn in AI mode
  letAIPick() {
    if (
      this.gameState.gameStatus !== "playing" ||
      this.gameState.whoseTurn !== "player2" ||
      this.gameState.gameSettings.gameMode !== "ai"
    )
      return;

    this.gameUI.showAIThinking();

    const aiCol = this.smartAI.getBestMove(this.gameState.gameBoard);
    if (aiCol !== -1) {
      setTimeout(() => {
        if (this.gameEngine.dropPiece(aiCol)) {
          this.gameUI.hideAIThinking();

          const lastMove =
            this.gameState.moveStory[this.gameState.moveStory.length - 1];

          this.gameSounds.playDropSound();
          this.gameUI.refreshBoard(lastMove);
          this.gameUI.refreshScreen();

          setTimeout(() => {
            this.checkGameEnd();
            this.letAIPick();
          }, 500);
        }
      }, 800);
    } else {
      this.gameUI.hideAIThinking();
    }
  }

  undoLastMove() {
    if (this.gameEngine.takeBackMove()) {
      if (
        this.gameState.gameSettings.gameMode === "ai" &&
        this.gameState.whoseTurn === "player2"
      ) {
        this.gameEngine.takeBackMove();
      }

      this.gameSounds.playUndoSound();
      this.gameUI.refreshBoard();
      this.gameUI.refreshScreen();
    }
  }

  watchReplay() {
    if (this.gameState.moveStory.length === 0) {
      alert("No moves to replay!");
      return;
    }

    if (this.gameEngine.startReplayShow()) {
      this.gameUI.startReplayShow();
    }
  }

  startNewGame() {
    if (this.gameUI.replayTimer) {
      this.gameUI.stopReplay();
    }

    this.partyParticles.stopParty();
    this.gameSounds.playResetSound();
    this.gameState.startFreshGame();
    this.gameUI.createBoard();
    this.gameUI.refreshBoard();
    this.gameUI.refreshScreen();
  }

  changeHistoryPage(page) {
    this.gameUI.changeHistoryPage(page);
  }

  checkGameEnd() {
    if (this.gameState.gameStatus === "won") {
      if (this.gameState.gameSettings.gameMode === "ai") {
        if (this.gameState.champion === "player1") {
          this.gameState.addToHallOfFame(
            this.gameState.getPlayerName(this.gameState.champion),
          );
        } else {
          this.gameState.saveHallOfFameEntry("AI_Opponent");
        }
      } else {
        this.gameState.addToHallOfFame(
          this.gameState.getPlayerName(this.gameState.champion),
        );
      }

      this.gameState.saveGameToHistory();
      this.gameState.saveMyProgress();
      this.partyParticles.startParty(
        this.gameState.champion,
        this.gameState.playerColors,
      );
      this.gameSounds.playWinSong();
      this.gameUI.showHallOfFame();
      this.gameUI.showGameHistory();
      this.gameUI.refreshScreen();
    } else if (this.gameState.gameStatus === "draw") {
      this.gameState.saveGameToHistory();
      this.gameState.saveMyProgress();
      this.gameSounds.playDrawSound();
      this.gameUI.showGameHistory();
    }
  }

  startGame() {
    // Update game mode from localStorage
    const currentGameMode = localStorage.getItem("gameMode") || "pvp";
    this.gameState.updateGameMode(currentGameMode);

    this.gameSounds.turnSoundsOn(this.gameState.gameSettings.soundEnabled);
    this.gameUI.createBoard();
    this.setupCellListeners();
    this.gameUI.applyPlayerColors();
    this.gameUI.refreshBoard();
    this.gameUI.refreshScreen();
    this.gameUI.showHallOfFame();
    this.gameUI.showGameHistory();
  }

  replayGameFromHistory(gameId) {
    if (this.gameState.loadGameFromHistory(gameId)) {
      this.gameState.gameStatus = "replaying";
      this.gameUI.refreshBoard();
      this.gameUI.refreshScreen();

      setTimeout(() => {
        this.gameUI.startReplayShow();
      }, 100);
    }
  }

  deleteGameFromHistory(gameId) {
    if (confirm("Delete this game from history?")) {
      this.gameState.deleteGameFromHistory(gameId);
      this.gameUI.showGameHistory();
      this.gameUI.showHallOfFame();
    }
  }

  clearGameHistory() {
    if (confirm("Clear all game history? This cannot be undone.")) {
      this.gameState.clearGameHistory();
      this.gameUI.showGameHistory();
      this.gameUI.showHallOfFame();
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.game = new Connect4Game();
  window.game.startGame();
});
