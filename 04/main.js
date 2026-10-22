
import Phaser from 'phaser';


class ExampleScene extends Phaser.Scene {
  constructor() {
    super('ExampleScene');
  }

  preload() {  
    
    this.load.image('logo', '/phaser3-logo.png'); 
  }

  create() {
    
    const logo = this.add.image(400, 300, 'logo');
    
    
    this.tweens.add({
      targets: logo,
      y: 400,
      duration: 2000,
      ease: 'Power2',
      yoyo: true,
      loop: -1
    });

    
    this.add.text(10, 10, 'Phaser + Vite', { font: '20px Arial', fill: '#00ff00' });
  }
}


const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container', 
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 } }
  },
  scene: ExampleScene
};


new Phaser.Game(config);
