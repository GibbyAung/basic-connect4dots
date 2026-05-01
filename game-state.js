class GameState {
  constructor() {
    this.boardRows = 6;
    this.boardCols = 7;
    this.gameBoard = this.buildFreshBoard(this.boardRows, this.boardCols);
    this.whoseTurn = "player1";
    this.gameStatus = "playing";
    this.champion = null;
    this.moveStory = [];
    this.winningCombo = [];
    this.currentGameId = this.generateGameId();
    this.historyCurrentPage = 1;

    const savedStuff = this.loadMySavedStuff();
    this.playerScores = savedStuff.scores;
    this.gameSettings = savedStuff.settings;
    this.hallOfFame = savedStuff.leaderboard;
    this.playerColors = savedStuff.colors;
    this.gameHistory = savedStuff.gameHistory || [];
  }

  buildFreshBoard(rows, cols) {
    return Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(null));
  }

  loadMySavedStuff() {
    const savedScores = localStorage.getItem("connect4Scores");
    const savedSettings = localStorage.getItem("connect4Settings");
    const savedChampions = localStorage.getItem("connect4Leaderboard");
    const savedColors = localStorage.getItem("connect4Colors");
    const savedSounds = localStorage.getItem("soundEnabled");
    const savedHistory = localStorage.getItem("connect4GameHistory");

    let leaderboard = savedChampions ? JSON.parse(savedChampions) : [];

    leaderboard = leaderboard.map((entry) => {
      if (!entry.uniqueKey) {
        return {
          ...entry,
          playerNumber: "Unknown",
          uniqueKey: entry.name,
        };
      }
      if (entry.uniqueKey.includes(":")) {
        return {
          ...entry,
          uniqueKey: entry.name,
        };
      }
      return entry;
    });

    let scores = { player1: 0, player2: 0 };
    if (savedScores) {
      const parsedScores = JSON.parse(savedScores);

      if (parsedScores.red !== undefined || parsedScores.yellow !== undefined) {
        scores = {
          player1: parsedScores.red || 0,
          player2: parsedScores.yellow || 0,
        };
      } else {
        scores = parsedScores;
      }
    }

    return {
      scores: scores,
      settings: savedSettings
        ? {
            ...JSON.parse(savedSettings),
            gameMode:
              localStorage.getItem("gameMode") ||
              JSON.parse(savedSettings).gameMode ||
              "pvp",
          }
        : {
            gameMode: localStorage.getItem("gameMode") || "pvp",
            theme: localStorage.getItem("theme") || "dark",
            difficulty: localStorage.getItem("difficulty") || "medium",
            soundEnabled: savedSounds !== "false",
          },
      leaderboard: leaderboard,
      colors: savedColors
        ? JSON.parse(savedColors)
        : {
            player1: "#e94560",
            player2: "#f4d03f",
          },
      gameHistory: savedHistory ? JSON.parse(savedHistory) : [],
    };
  }

  saveMyProgress() {
    localStorage.setItem("connect4Scores", JSON.stringify(this.playerScores));
    localStorage.setItem("connect4Settings", JSON.stringify(this.gameSettings));
    localStorage.setItem(
      "connect4Leaderboard",
      JSON.stringify(this.hallOfFame),
    );
    localStorage.setItem("connect4Colors", JSON.stringify(this.playerColors));
    localStorage.setItem(
      "connect4GameHistory",
      JSON.stringify(this.gameHistory),
    );
  }

  // Store winner info for Hall of Fame entry
  addToHallOfFame(winner) {
    this.pendingHallOfFameEntry = {
      winner: winner,
      playerId: this.champion === "player1" ? "Player 1" : "Player 2",
    };
  }

  saveHallOfFameEntry(playerName) {
    if (playerName === "AI_Opponent") {
      const name = "AI_Opponent";
      const uniqueKey = name;

      const playerNumber = "Player 1";

      const existingChampion = this.hallOfFame.find(
        (entry) => entry.uniqueKey === uniqueKey,
      );

      if (existingChampion) {
        existingChampion.wins += 1;
        existingChampion.lastWin = new Date().toISOString();
      } else {
        this.hallOfFame.push({
          name: name,
          playerNumber: playerNumber,
          uniqueKey: uniqueKey,
          wins: 1,
          lastWin: new Date().toISOString(),
        });
      }

      this.hallOfFame.sort((a, b) => b.wins - a.wins);

      if (
        this.gameHistory.length > 0 &&
        this.gameHistory[0].id === this.currentGameId
      ) {
        this.gameHistory[0].winnerName = name;
      }

      this.saveMyProgress();
      return;
    }

    if (!this.pendingHallOfFameEntry) return;

    const name = playerName.trim() || "Anonymous";
    const uniqueKey = `${name}_${this.pendingHallOfFameEntry.playerId}`;

    const existingChampion = this.hallOfFame.find(
      (entry) => entry.uniqueKey === uniqueKey,
    );

    if (existingChampion) {
      existingChampion.wins += 1;
      existingChampion.lastWin = new Date().toISOString();
      existingChampion.playerNumber = this.pendingHallOfFameEntry.playerId;
    } else {
      this.hallOfFame.push({
        name: name,
        playerNumber: this.pendingHallOfFameEntry.playerId,
        uniqueKey: uniqueKey,
        wins: 1,
        lastWin: new Date().toISOString(),
      });
    }

    this.hallOfFame.sort((a, b) => b.wins - a.wins);
    this.pendingHallOfFameEntry = null;

    if (
      this.gameHistory.length > 0 &&
      this.gameHistory[0].id === this.currentGameId
    ) {
      this.gameHistory[0].winnerName = name;
    }

    this.saveMyProgress();
  }

  startFreshGame() {
    this.gameBoard = this.buildFreshBoard(this.boardRows, this.boardCols);
    this.whoseTurn = "player1";
    this.gameStatus = "playing";
    this.champion = null;
    this.moveStory = [];
    this.winningCombo = [];
    this.currentGameId = this.generateGameId();
  }
  history;
  getCurrentPlayerColor() {
    return this.whoseTurn === "player1"
      ? this.playerColors.player1
      : this.playerColors.player2;
  }

  getCurrentPlayerName() {
    return this.whoseTurn === "player1" ? "Player 1" : "Player 2";
  }

  getPlayerColor(player) {
    return player === "player1"
      ? this.playerColors.player1
      : this.playerColors.player2;
  }

  getPlayerName(player) {
    return player === "player1" ? "Player 1" : "Player 2";
  }

  getRealPlayerName(player) {
    if (this.gameSettings.gameMode === "ai" && player === "player2") {
      return "AI_Opponent";
    }

    const playerNumber = this.getPlayerName(player);

    const hallOfFameEntry = this.hallOfFame
      .filter(
        (entry) =>
          entry.playerNumber === playerNumber && entry.name !== "AI_Opponent",
      )
      .sort((a, b) => new Date(b.lastWin) - new Date(a.lastWin))[0];

    return hallOfFameEntry ? hallOfFameEntry.name : playerNumber;
  }

  switchTurn() {
    this.whoseTurn = this.whoseTurn === "player1" ? "player2" : "player1";
  }

  updateGameMode(mode) {
    this.gameSettings.gameMode = mode;
    localStorage.setItem("gameMode", mode);
    this.saveMyProgress();
  }

  getOpponent(player) {
    return player === "player1" ? "player2" : "player1";
  }

  resetTheScoreboard() {
    this.playerScores = { player1: 0, player2: 0 };
    this.saveMyProgress();
  }

  wipeTheHallOfFame() {
    this.hallOfFame = [];
    this.saveMyProgress();
  }

  generateGameId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  saveGameToHistory() {
    if (this.moveStory.length === 0) return;

    const gameRecord = {
      id: this.currentGameId,
      date: new Date().toISOString(),
      status: this.gameStatus,
      winner: this.champion,
      winnerName: this.champion ? this.getRealPlayerName(this.champion) : null,
      moves: [...this.moveStory],
      totalMoves: this.moveStory.length,
      // duration: this.calculateGameDuration(),
      playerColors: { ...this.playerColors },
      gameMode: this.gameSettings.gameMode || "pvp",
      difficulty: this.gameSettings.difficulty || "medium",
    };

    this.gameHistory.unshift(gameRecord);

    if (this.gameHistory.length > 50) {
      this.gameHistory = this.gameHistory.slice(0, 50);
    }

    this.saveMyProgress();
  }

  // calculateGameDuration() {
  //   return `${Math.ceil((this.moveStory.length * 30) / 60)} min`;
  // }

  loadGameFromHistory(gameId) {
    const game = this.gameHistory.find((g) => g.id === gameId);
    if (!game) return false;

    this.gameBoard = this.buildFreshBoard(this.boardRows, this.boardCols);
    this.whoseTurn = "player1";
    this.gameStatus = "replaying";
    this.champion = game.winner;
    this.winningCombo = [];
    this.moveStory = [...game.moves];
    this.currentGameId = game.id;
    this.playerColors = { ...game.playerColors };

    return true;
  }

  getGameHistory() {
    return [...this.gameHistory].sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
  }

  clearGameHistory() {
    this.gameHistory = [];
    this.saveMyProgress();
  }

  deleteGameFromHistory(gameId) {
    this.gameHistory = this.gameHistory.filter((g) => g.id !== gameId);
    this.saveMyProgress();
  }
}
