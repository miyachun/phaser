import Phaser from 'phaser';

class MyGame extends Phaser.Scene {
    constructor() {
        super('boot');
    }

    preload() {
        
        this.load.image('logo', '/phaser3-logo.png'); 
    }

    create() {
        const logo = this.add.image(400, 300, 'logo');
        
        
        this.tweens.add({
            targets: logo,
            y: 450,
            duration: 2000,
            ease: 'Power2',
            yoyo: true,
            loop: -1
        });
    }
}


const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    scene: MyGame
};

const game = new Phaser.Game(config);
