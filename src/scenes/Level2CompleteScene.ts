import Phaser from 'phaser';

const FONT = '"Patrick Hand", "Comic Sans MS", cursive';

export class Level2CompleteScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Level2CompleteScene' });
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.add.rectangle(width / 2, height / 2, width, height, 0xfff8e7);

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.3);

    this.createStars(width, height);

    const title = this.add.text(width / 2, height / 2 - 200, 'Level 2 Complete!', {
      fontFamily: FONT,
      fontSize: '52px',
      color: '#ffd700',
      fontStyle: 'bold',
      stroke: '#5a3e2b',
      strokeThickness: 4,
    }).setOrigin(0.5);

    title.setScale(0);
    this.tweens.add({
      targets: title,
      scaleX: 1,
      scaleY: 1,
      duration: 600,
      ease: 'Back.easeOut',
    });

    const subtitle = this.add.text(width / 2, height / 2 - 120, 'Zajačik má útulnú knižnicu!', {
      fontFamily: FONT,
      fontSize: '28px',
      color: '#ffffff',
      stroke: '#333333',
      strokeThickness: 2,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: subtitle,
      alpha: 1,
      duration: 800,
      delay: 400,
    });

    const replayBtnY = height / 2 + 80;
    const replayBtn = this.add.graphics();
    replayBtn.fillStyle(0x4caf50, 1);
    replayBtn.fillRoundedRect(width / 2 - 140, replayBtnY - 30, 280, 60, 16);

    this.add.text(width / 2, replayBtnY, 'Hrať znova', {
      fontFamily: FONT,
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const replayZone = this.add.zone(width / 2, replayBtnY, 280, 60).setInteractive();
    replayZone.on('pointerdown', () => {
      this.scene.start('TitleScene');
    });

    const nextBtnY = height / 2 + 180;
    const nextBtn = this.add.graphics();
    nextBtn.fillStyle(0x888888, 1);
    nextBtn.fillRoundedRect(width / 2 - 160, nextBtnY - 30, 320, 60, 16);

    this.add.text(width / 2, nextBtnY, 'Ďalší level → Pripravujeme...', {
      fontFamily: FONT,
      fontSize: '20px',
      color: '#cccccc',
    }).setOrigin(0.5);
  }

  private createStars(width: number, height: number): void {
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(30, width - 30);
      const y = Phaser.Math.Between(30, height - 30);
      const star = this.add.text(x, y, '✦', {
        fontSize: `${Phaser.Math.Between(16, 36)}px`,
        color: '#ffd700',
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: star,
        alpha: { from: 0, to: Phaser.Math.FloatBetween(0.3, 1.0) },
        duration: Phaser.Math.Between(800, 2000),
        delay: Phaser.Math.Between(0, 1500),
        yoyo: true,
        repeat: -1,
      });
    }
  }
}
