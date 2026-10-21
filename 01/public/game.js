// 1. 遊戲基礎設定
const config = {
    type: Phaser.AUTO, // 自動選擇 WebGL 或 Canvas 渲染
    width: 800,
    height: 600,
    physics: {
        default: 'arcade', // 啟用內建的 Arcade 物理引擎
        arcade: {
            gravity: { y: 200 } // 設定垂直重力
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// 實例化遊戲物件
const game = new Phaser.Game(config);

// 2. 預載資源 (圖片、音效等)
function preload() {
    // 這裡我們直接線上加載 Phaser 官方提供的測試圖片
    this.load.setBaseURL('https://labs.phaser.io');
    this.load.image('sky', 'assets/skies/space3.png');
    this.load.image('logo', 'assets/sprites/phaser3-logo.png');
    this.load.image('red', 'assets/particles/red.png');
}

// 3. 建立遊戲世界與物件
function create() {
    // 新增背景背景圖 (置中擺放)
    this.add.image(400, 300, 'sky');

    // 建立粒子發射器
    const particles = this.add.particles(0, 0, 'red', {
        speed: 100,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD'
    });

    // 建立一個有物理特性的標誌 (Logo)
    const logo = this.physics.add.image(400, 100, 'logo');

    // 設定速度與碰撞彈跳
    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true); // 讓 Logo 撞到遊戲邊界會彈回來

    // 讓粒子跟隨 Logo 移動
    particles.startFollow(logo);
}

// 4. 遊戲狀態更新 (每幀執行，此範例暫不需寫入邏輯)
function update() {
    // 常用於監聽鍵盤控制或處理碰撞邏輯
}
