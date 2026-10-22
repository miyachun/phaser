import Phaser from 'phaser';
import { YouTubePlayables } from './YouTubePlayables';

const PAIRS = ['🌈', '🚀', '🐱', '🍋', '🐸', '⚽', '🌟', '🍉'];

export class MemoryMatch extends Phaser.Scene {
  constructor() {
    super('MemoryMatch');
  }

  create() {
    this.score = 0;
    this.moves = 0;
    this.matched = 0;
    this.seconds = 60;
    this.cards = [];
    this.openCards = [];
    this.locked = true;
    this.gameOver = false;

    this.cameras.main.setBackgroundColor('#101a30');

    this.add.text(20, 22, 'MEMORY MATCH', {
      fontSize: '25px',
      fontStyle: 'bold',
      color: '#ffffff'
    });

    this.scoreText = this.add.text(20, 65, '得分 0', {
      fontSize: '18px',
      color: '#fde68a'
    });

    this.movesText = this.add.text(170, 65, '步數 0', {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.timeText = this.add.text(320, 65, '時間 60', {
      fontSize: '18px',
      color: '#ffffff'
    });

    this.board = this.add.container(0, 0);
    this.overlay = this.add.container(0, 0).setDepth(10);

    this.layoutCards();
    this.showIntro();

    // 告知 Playables 第一個畫面已顯示。
    YouTubePlayables.firstFrameReady();

    // 音訊依 YouTube 播放環境設定。
    this.syncAudio();
  }

  syncAudio() {
    this.sound.setMute(!YouTubePlayables.isAudioEnabled());

    YouTubePlayables.setAudioChangeCallback((enabled) => {
      this.sound.setMute(!enabled);
    });
  }

  layoutCards() {
    const width = this.scale.width;
    const height = this.scale.height;
    const cols = 4;
    const gap = 10;
    const boardWidth = Math.min(width - 32, 440);
    const cardWidth = (boardWidth - gap * 3) / cols;
    const cardHeight = Math.min(cardWidth * 1.12, 105);
    const totalHeight = cardHeight * 4 + gap * 3;
    const startX = (width - boardWidth) / 2 + cardWidth / 2;
    const startY = Math.max(160, (height - totalHeight) / 2 + 20)
      + cardHeight / 2;

    const deck = Phaser.Utils.Array.Shuffle([...PAIRS, ...PAIRS]);

    deck.forEach((emoji, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = startX + col * (cardWidth + gap);
      const y = startY + row * (cardHeight + gap);

      const back = this.add.rectangle(
        x, y, cardWidth, cardHeight, 0x294b7a
      ).setStrokeStyle(2, 0x6688bb).setInteractive();

      const face = this.add.text(x, y, emoji, {
        fontSize: `${Math.min(cardWidth * 0.48, 38)}px`
      }).setOrigin(0.5).setVisible(false);

      const card = {
        emoji,
        back,
        face,
        matched: false,
        revealed: false
      };

      back.on('pointerdown', () => this.flipCard(card));

      this.board.add([back, face]);
      this.cards.push(card);
    });
  }

  showIntro() {
    this.showPanel(
      '翻牌配對',
      '找出 8 組相同圖案！\n60 秒內完成挑戰',
      '開始遊戲',
      () => this.startGame()
    );
  }

  showPanel(title, subtitle, buttonLabel, callback) {
    this.overlay.removeAll(true);

    const w = this.scale.width;
    const h = this.scale.height;

    const shade = this.add.rectangle(
      w / 2, h / 2, w, h, 0x08111f, 0.88
    );

    const heading = this.add.text(w / 2, h * 0.37, title, {
      fontSize: '34px',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    const detail = this.add.text(w / 2, h * 0.46, subtitle, {
      fontSize: '19px',
      color: '#cbd5e1',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);

    const button = this.add.text(
      w / 2, h * 0.60, buttonLabel,
      {
        fontSize: '23px',
        color: '#ffffff',
        backgroundColor: '#2563eb',
        padding: { x: 28, y: 16 }
      }
    ).setOrigin(0.5).setInteractive();

    button.on('pointerdown', callback);

    this.overlay.add([shade, heading, detail, button]);
  }

  startGame() {
    this.overlay.removeAll(true);
    this.locked = false;
    this.gameOver = false;

    // 告知平台遊戲已可供玩家操作。
    YouTubePlayables.gameReady();

    this.clock = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.locked || this.gameOver) return;

        this.seconds--;
        this.timeText.setText(`時間 ${this.seconds}`);

        if (this.seconds <= 0) {
          this.finishGame(false);
        }
      }
    });
  }

  flipCard(card) {
    if (
      this.locked ||
      this.gameOver ||
      card.revealed ||
      card.matched
    ) return;

    card.revealed = true;
    card.back.setFillStyle(0xf8fafc);
    card.back.setStrokeStyle(2, 0xfacc15);
    card.face.setVisible(true);
    this.openCards.push(card);

    if (this.openCards.length !== 2) return;

    this.moves++;
    this.movesText.setText(`步數 ${this.moves}`);
    this.locked = true;

    const [a, b] = this.openCards;

    if (a.emoji === b.emoji) {
      a.matched = true;
      b.matched = true;
      this.matched++;
      this.score += 100;
      this.scoreText.setText(`得分 ${this.score}`);

      a.back.setFillStyle(0x166534);
      b.back.setFillStyle(0x166534);

      this.openCards = [];
      this.locked = false;

      if (this.matched === PAIRS.length) {
        this.finishGame(true);
      }
    } else {
      this.time.delayedCall(700, () => {
        for (const item of this.openCards) {
          item.revealed = false;
          item.back.setFillStyle(0x294b7a);
          item.back.setStrokeStyle(2, 0x6688bb);
          item.face.setVisible(false);
        }

        this.openCards = [];
        this.locked = false;
      });
    }
  }

  finishGame(won) {
    if (this.gameOver) return;

    this.gameOver = true;
    this.locked = true;
    this.clock?.remove();

    const bonus = won ? this.seconds * 10 : 0;
    this.score += bonus;
    this.scoreText.setText(`得分 ${this.score}`);

    const best = Math.max(
      this.score,
      Number(this.registry.get('bestScore') || 0)
    );
    this.registry.set('bestScore', best);

    // 回報遊戲分數。
    YouTubePlayables.sendScore(this.score);

    // 儲存本次最佳分數到 Playables 玩家存檔。
    void YouTubePlayables.saveData({ bestScore: best });

    this.showPanel(
      won ? '恭喜過關！' : '時間到！',
      `得分：${this.score}\n翻牌次數：${this.moves}`,
      '再玩一次',
      () => this.scene.restart()
    );
  }
}