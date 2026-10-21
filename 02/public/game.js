const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    // 這裡可以用來載入圖片或音效，例如：
    // this.load.image('sky', 'assets/sky.png');
}

function create() {
    // 在畫面上建立一個簡單的文字
    this.add.text(400, 300, 'Hello Phaser + Node.js!', {
        fontSize: '32px',
        fill: '#ffffff'
    }).setOrigin(0,5);
}

function update() {
    // 遊戲迴圈更新邏輯
}
