class Connect4Tutorial {
  constructor() {
    this.board = [];
    this.currentStep = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.playInterval = null;
    this.speed = 1000;

    this.demoMoves = [
      {
        col: 0,
        player: "player1",
        message: "Red starts in the first column.",
        instruction: {
          title: "Choose Your Column",
          text: "Click on a column to drop your disc.",
        },
      },
      {
        col: 1,
        player: "player2",
        message: "Yellow blocks the next column.",
        instruction: {
          title: "Take Turns",
          text: "Players alternate turns; Red always goes first.",
        },
      },
      {
        col: 0,
        player: "player1",
        message: "Red stacks on top of their first piece!",
        instruction: {
          title: "Think Ahead",
          text: "Stacking vertically is the fastest way to win.",
        },
      },
      {
        col: 1,
        player: "player2",
        message: "Yellow continues their own strategy.",
        instruction: {
          title: "Watch the Board",
          text: "Keep an eye on where your opponent is stacking.",
        },
      },
      {
        col: 0,
        player: "player1",
        message: "Red is one move away from winning!",
        instruction: {
          title: "Connect 4 to Win",
          text: "You need 4 in a row—vertical, horizontal, or diagonal.",
        },
      },
      {
        col: 1,
        player: "player2",
        message: "Yellow plays, but it's too late to block Column 1!",
        instruction: {
          title: "Block Your Opponent",
          text: "Always look for your opponent's 3-in-a-row.",
        },
      },
      {
        col: 0,
        player: "player1",
        message: "Red completes the line! CONNECT 4!",
        instruction: {
          title: "Victory!",
          text: "Red wins with 4 vertical discs! Well done!",
        },
      },
    ];

    this.staticInstructions = [
      {
        title: "Choose Your Column",
        text: "Click on any column to drop your colored disc. The disc will fall to the lowest available position.",
      },
      {
        title: "Take Turns",
        text: "Players alternate turns, with Red (Player 1) going first, then Yellow (Player 2).",
      },
      {
        title: "Block Your Opponent",
        text: "Watch your opponent's moves and try to block them from getting 4 in a row.",
      },
      {
        title: "Connect 4 to Win",
        text: "Connect 4 of your discs horizontally, vertically, or diagonally to win!",
      },
      {
        title: "Think Ahead",
        text: "Plan your moves in advance and set up multiple winning opportunities.",
      },
    ];

    this.init();
  }

  init() {
    this.setupBoard();
    this.setupEventListeners();
    this.updateUI();
    this.updateSteps();
  }

  setupBoard() {
    const boardElement = document.getElementById("tutorial-board");
    if (!boardElement) return;

    this.board = Array(6)
      .fill(null)
      .map(() => Array(7).fill(null));

    boardElement.innerHTML = "";
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.row = row;
        cell.dataset.col = col;
        boardElement.appendChild(cell);
      }
    }
  }

  setupEventListeners() {
    const playBtn = document.getElementById("tutorial-play");
    const pauseBtn = document.getElementById("tutorial-pause");
    const resetBtn = document.getElementById("tutorial-reset");
    const speedSelect = document.getElementById("tutorial-speed");

    if (playBtn) {
      playBtn.addEventListener("click", () => this.play());
    }

    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => this.pause());
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.reset());
    }

    if (speedSelect) {
      speedSelect.addEventListener("change", (e) => {
        this.speed = parseInt(e.target.value);
        if (this.isPlaying && !this.isPaused) {
          this.pause();
          this.play();
        }
      });
    }
  }

  play() {
    if (this.currentStep >= this.demoMoves.length) {
      this.reset();
      return;
    }

    this.isPlaying = true;
    this.isPaused = false;

    document.getElementById("tutorial-play").disabled = true;
    document.getElementById("tutorial-pause").disabled = false;

    this.playInterval = setInterval(() => {
      if (this.currentStep < this.demoMoves.length) {
        this.playNextMove();
      } else {
        // Add a small delay so the user sees the final piece land
        setTimeout(() => this.complete(), 500);
      }
    }, this.speed);
  }

  pause() {
    this.isPaused = true;
    clearInterval(this.playInterval);

    document.getElementById("tutorial-play").disabled = false;
    document.getElementById("tutorial-pause").disabled = true;
  }

  reset() {
    this.pause();
    this.currentStep = 0;
    this.board = Array(6)
      .fill(null)
      .map(() => Array(7).fill(null));
    this.refreshBoard();
    this.updateUI();
    this.updateSteps();
  }

  playNextMove() {
    // 1. Guard clause: Stop if we've already finished all moves
    if (this.currentStep >= this.demoMoves.length) return;

    // 2. Execute the current move data
    const move = this.demoMoves[this.currentStep];
    this.makeMove(move.col, move.player);
    this.updateMessage(move.message);

    // 3. Increment BEFORE updating UI/Steps
    this.currentStep++;

    // 4. Update the visual indicators
    this.updateSteps();
    this.updateUI();
  }

  makeMove(col, player) {
    // Find the lowest empty row in the column
    for (let row = 5; row >= 0; row--) {
      if (!this.board[row][col]) {
        this.board[row][col] = player;
        this.animateMove(row, col, player);
        break;
      }
    }
  }

  animateMove(row, col, player) {
    const cells = document.querySelectorAll("#tutorial-board .cell");
    const cellIndex = row * 7 + col;
    const cell = cells[cellIndex];

    if (cell) {
      // Add dropping animation
      cell.classList.add("dropping");
      cell.classList.add(player === "player1" ? "red" : "yellow");

      setTimeout(() => {
        cell.classList.remove("dropping");
      }, 400);
    }
  }

  refreshBoard() {
    const cells = document.querySelectorAll("#tutorial-board .cell");
    cells.forEach((cell, index) => {
      const row = Math.floor(index / 7);
      const col = index % 7;
      const piece = this.board[row][col];

      cell.classList.remove("red", "yellow", "dropping", "winning");

      if (piece) {
        cell.classList.add(piece === "player1" ? "red" : "yellow");
      }
    });
  }

  updateUI() {
    const totalSteps = this.demoMoves.length;
    const progress = (this.currentStep / totalSteps) * 100;
    const progressFill = document.getElementById("tutorial-progress-fill");
    const stepInfo = document.getElementById("tutorial-step-info");

    if (progressFill) {
      progressFill.style.width = `${progress}%`;
    }

    if (stepInfo) {
      stepInfo.textContent = `Step ${this.currentStep}/${totalSteps}`;
    }
  }

  updateSteps() {
    const titleEl = document.getElementById("instruction-title");
    const textEl = document.getElementById("instruction-text");
    const stepEl = document.getElementById("instruction-step");

    // Always use demoMoves length for consistency
    const totalSteps = this.demoMoves.length;

    if (this.isPlaying && this.currentStep > 0) {
      const move = this.demoMoves[this.currentStep - 1];
      if (move.instruction) {
        if (titleEl) titleEl.textContent = move.instruction.title;
        if (textEl) textEl.textContent = move.instruction.text;
        if (stepEl)
          stepEl.textContent = `Step ${this.currentStep}/${totalSteps}`;
      }
    } else {
      // Static/Initial state
      const instruction = this.staticInstructions[0]; // Default to first static tip
      if (titleEl) titleEl.textContent = instruction.title;
      if (textEl) textEl.textContent = instruction.text;
      if (stepEl) stepEl.textContent = `Step ${this.currentStep}/${totalSteps}`;
    }
  }

  updateMessage(message) {
    const messageEl = document.getElementById("tutorial-message");
    if (messageEl) {
      messageEl.textContent = message;
    }
  }

  complete() {
    this.pause();
    this.updateMessage(
      "🎉 Tutorial Complete! Now you know how to play Connect 4!",
    );

    // Highlight winning combination if there's a win
    this.highlightWin();
  }

  highlightWin() {
    // Check for winning combinations and highlight them
    const cells = document.querySelectorAll("#tutorial-board .cell");

    // Check horizontal wins
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col <= 3; col++) {
        if (
          this.board[row][col] &&
          this.board[row][col] === this.board[row][col + 1] &&
          this.board[row][col] === this.board[row][col + 2] &&
          this.board[row][col] === this.board[row][col + 3]
        ) {
          for (let i = 0; i < 4; i++) {
            const cellIndex = row * 7 + (col + i);
            cells[cellIndex].classList.add("winning");
          }
          return;
        }
      }
    }

    // Check vertical wins
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= 2; row++) {
        if (
          this.board[row][col] &&
          this.board[row][col] === this.board[row + 1][col] &&
          this.board[row][col] === this.board[row + 2][col] &&
          this.board[row][col] === this.board[row + 3][col]
        ) {
          for (let i = 0; i < 4; i++) {
            const cellIndex = (row + i) * 7 + col;
            cells[cellIndex].classList.add("winning");
          }
          return;
        }
      }
    }

    // Check diagonal wins (top-left to bottom-right)
    for (let row = 0; row <= 2; row++) {
      for (let col = 0; col <= 3; col++) {
        if (
          this.board[row][col] &&
          this.board[row][col] === this.board[row + 1][col + 1] &&
          this.board[row][col] === this.board[row + 2][col + 2] &&
          this.board[row][col] === this.board[row + 3][col + 3]
        ) {
          for (let i = 0; i < 4; i++) {
            const cellIndex = (row + i) * 7 + (col + i);
            cells[cellIndex].classList.add("winning");
          }
          return;
        }
      }
    }

    // Check diagonal wins (bottom-left to top-right)
    for (let row = 3; row < 6; row++) {
      for (let col = 0; col <= 3; col++) {
        if (
          this.board[row][col] &&
          this.board[row][col] === this.board[row - 1][col + 1] &&
          this.board[row][col] === this.board[row - 2][col + 2] &&
          this.board[row][col] === this.board[row - 3][col + 3]
        ) {
          for (let i = 0; i < 4; i++) {
            const cellIndex = (row - i) * 7 + (col + i);
            cells[cellIndex].classList.add("winning");
          }
          return;
        }
      }
    }
  }
}

// Initialize tutorial when page loads
document.addEventListener("DOMContentLoaded", () => {
  new Connect4Tutorial();
});
