import Phaser from 'phaser';
import { YouTubePlayables } from './YouTubePlayables';


const PAIRS = [
  't',
  'b',
  'y',
  'u',
  'o',
  'e',
  'p',
  'g'];

export class MemoryMatch extends Phaser.Scene {
  constructor() {
    super('MemoryMatch');
  }
  preload() {
    this.load.image('card-back', 'assets/cards/yt.png');
  
    this.load.image('t', 'assets/cards/t.png');
    this.load.image('b', 'assets/cards/b.png');
    this.load.image('y', 'assets/cards/y.png');
    this.load.image('u', 'assets/cards/u.png');
    this.load.image('o', 'assets/cards/o.png');
    this.load.image('e', 'assets/cards/e.png');
    this.load.image('p', 'assets/cards/p.png');
    this.load.image('g', 'assets/cards/g.png');
  };

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
      fontSize: '50px',
      fontStyle: 'bold',
      color: '#ffffff',
      
      
    });

    this.scoreText = this.add.text(20, 100, '得分 0', {
      fontSize: '30px',
      color: '#fde68a',
      
    });

    this.movesText = this.add.text(170, 100, '步數 0', {
      fontSize: '30px',
      color: '#ffffff',
     
    });

    this.timeText = this.add.text(320, 100, '時間 60', {
      fontSize: '30px',
      color: '#ffffff'
    });

    this.board = this.add.container(0, 0);
    this.overlay = this.add.container(0, 0).setDepth(10);

    this.layoutCards();
    this.showIntro();

    
    YouTubePlayables.firstFrameReady();
    
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
    const gap = 15;
  
    const boardWidth = Math.min(width - 32, 700);
    const cardWidth = (boardWidth - gap * 3) / cols;
    const cardHeight = Math.min(cardWidth * 1.12, 505);
  
    const totalHeight = cardHeight * 4 + gap * 3;
    const startX = (width - boardWidth) / 2 + cardWidth / 2;
    const startY = Math.max(
      160,
      (height - totalHeight) / 2 + 20
    ) + cardHeight / 2;
  
    const deck = Phaser.Utils.Array.Shuffle([
      ...PAIRS,
      ...PAIRS
    ]);
  
    deck.forEach((imageKey, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
  
      const x = startX + col * (cardWidth + gap);
      const y = startY + row * (cardHeight + gap);
  
      
      const back = this.add.image(
        x, y, 'card-back'
      )
        .setDisplaySize(cardWidth, cardHeight)
        .setInteractive({ useHandCursor: true });
  
      
      const face = this.add.image(
        x, y, imageKey
      )
        .setDisplaySize(
          cardWidth * 1,
          cardHeight * 1
        )
        .setVisible(false);
  
      const card = {
        emoji: imageKey,
        imageKey,
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
      fontSize: '50px',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    const detail = this.add.text(w / 2, h * 0.46, subtitle, {
      fontSize: '30px',
      color: '#cbd5e1',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);

    const button = this.add.text(
      w / 2, h * 0.60, buttonLabel,
      {
        fontSize: '53px',
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
  
    
    card.back.setVisible(false);
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

      a.back.setVisible(false);
      b.back.setVisible(false);
      
      a.face.setVisible(true);
      b.face.setVisible(true);
      
      a.face.setAlpha(0.55);
      b.face.setAlpha(0.55);

      this.openCards = [];
      this.locked = false;

      if (this.matched === PAIRS.length) {
        this.finishGame(true);
      }
    } else {
    

        this.time.delayedCall(700, () => {
          for (const item of this.openCards) {
            item.revealed = false;
        
            item.face.setVisible(false);
            item.back.setVisible(true);
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

    
    YouTubePlayables.sendScore(this.score);

    
    void YouTubePlayables.saveData({ bestScore: best });

    this.showPanel(
      won ? '恭喜過關！' : '時間到！',
      `得分：${this.score}\n翻牌次數：${this.moves}`,
      '再玩一次',
      () => this.scene.restart()
    );
  }
}