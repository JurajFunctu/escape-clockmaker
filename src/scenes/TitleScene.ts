import Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Warm cream background
    this.add.rectangle(width / 2, height / 2, width, height, 0xf5e6cc);

    // Decorative soft circles in background
    for (let i = 0; i < 12; i++) {
      const cx = Phaser.Math.Between(50, width - 50);
      const cy = Phaser.Math.Between(100, height - 200);
      const radius = Phaser.Math.Between(30, 80);
      const circle = this.add.circle(cx, cy, radius, 0xf0d9b5, 0.4);
      this.tweens.add({
        targets: circle,
        alpha: { from: 0.2, to: 0.5 },
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1,
      });
    }

    // Game title
    const title = this.add.text(width / 2, height / 2 - 250, 'Cozy Critters', {
      fontFamily: '"Patrick Hand", "Comic Sans MS", cursive',
      fontSize: '64px',
      color: '#5a3e2b',
      fontStyle: 'bold',
      stroke: '#f5e6cc',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Gentle float animation on title
    this.tweens.add({
      targets: title,
      y: title.y - 10,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Subtitle
    this.add.text(width / 2, height / 2 - 160, 'Nájdi stratené veci!', {
      fontFamily: '"Patrick Hand", "Comic Sans MS", cursive',
      fontSize: '28px',
      color: '#8b6d4f',
    }).setOrigin(0.5);

    // Mouse character peeking from bottom-right corner
    if (this.textures.exists('char_mouse')) {
      const mouse = this.add.image(width - 80, height - 80, 'char_mouse');
      mouse.setDisplaySize(140, 140);
      // Gentle bounce
      this.tweens.add({
        targets: mouse,
        y: mouse.y - 8,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    } else {
      // Fallback mouse: simple drawn circle with ears
      const mouseG = this.add.graphics();
      mouseG.fillStyle(0xaaaaaa, 1);
      mouseG.fillCircle(width - 80, height - 80, 40);
      // Ears
      mouseG.fillCircle(width - 110, height - 115, 18);
      mouseG.fillCircle(width - 50, height - 115, 18);
      // Eyes
      mouseG.fillStyle(0x000000, 1);
      mouseG.fillCircle(width - 92, height - 85, 5);
      mouseG.fillCircle(width - 68, height - 85, 5);
      // Nose
      mouseG.fillStyle(0xff9999, 1);
      mouseG.fillCircle(width - 80, height - 72, 6);
    }

    // Play button
    const btnY = height / 2 + 50;
    const btnWidth = 260;
    const btnHeight = 70;

    const btnGraphics = this.add.graphics();
    btnGraphics.fillStyle(0x4caf50, 1);
    btnGraphics.fillRoundedRect(width / 2 - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 20);
    // Slight border
    btnGraphics.lineStyle(3, 0x388e3c, 1);
    btnGraphics.strokeRoundedRect(width / 2 - btnWidth / 2, btnY - btnHeight / 2, btnWidth, btnHeight, 20);

    const btnText = this.add.text(width / 2, btnY, 'HRAŤ', {
      fontFamily: '"Patrick Hand", "Comic Sans MS", cursive',
      fontSize: '36px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Interactive zone for the button
    const btnZone = this.add.zone(width / 2, btnY, btnWidth, btnHeight).setInteractive();

    btnZone.on('pointerdown', () => {
      // Brief press feedback
      this.tweens.add({
        targets: [btnGraphics, btnText],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 80,
        yoyo: true,
        onComplete: () => {
          this.cameras.main.fadeOut(400, 0, 0, 0);
          this.time.delayedCall(400, () => {
            this.scene.start('Level1Scene');
          });
        },
      });
    });
  }
}
