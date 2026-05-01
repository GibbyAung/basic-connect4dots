class VictoryParticles {
  constructor() {
    this.partyCanvas = document.getElementById("victory-canvas");
    this.artist = this.partyCanvas.getContext("2d");
    this.confetti = [];
    this.partyTime = false;
    this.fitCanvasToScreen();
    window.addEventListener("resize", () => this.fitCanvasToScreen());
  }

  fitCanvasToScreen() {
    this.partyCanvas.width = window.innerWidth;
    this.partyCanvas.height = window.innerHeight;
  }

  makeConfettiPiece(color) {
    return {
      x: Math.random() * this.partyCanvas.width,
      y: -10,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      size: Math.random() * 8 + 4,
      color: color,
      spin: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 0.2,
      fadeOut: 1,
      fadeSpeed: Math.random() * 0.01 + 0.005,
    };
  }

  startParty(winner, playerColors) {
    this.partyTime = true;
    this.confetti = [];
    const winnerColor =
      winner === "player1" ? playerColors.player1 : playerColors.player2;

    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        if (this.partyTime) {
          this.confetti.push(this.makeConfettiPiece(winnerColor));
        }
      }, i * 20);
    }

    this.animateParty();
  }

  animateParty() {
    if (!this.partyTime && this.confetti.length === 0) return;

    this.artist.clearRect(
      0,
      0,
      this.partyCanvas.width,
      this.partyCanvas.height,
    );

    this.confetti = this.confetti.filter((piece) => {
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.spin += piece.spinSpeed;
      piece.fadeOut -= piece.fadeSpeed;

      if (piece.fadeOut <= 0 || piece.y > this.partyCanvas.height) {
        return false;
      }

      this.artist.save();
      this.artist.translate(piece.x, piece.y);
      this.artist.rotate(piece.spin);
      this.artist.globalAlpha = piece.fadeOut;
      this.artist.fillStyle = piece.color;
      this.artist.fillRect(
        -piece.size / 2,
        -piece.size / 2,
        piece.size,
        piece.size,
      );
      this.artist.restore();

      return true;
    });

    requestAnimationFrame(() => this.animateParty());
  }

  stopParty() {
    this.partyTime = false;
  }
}
