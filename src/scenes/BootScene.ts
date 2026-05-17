import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Warm cream background
    this.add.rectangle(width / 2, height / 2, width, height, 0xf5e6cc);

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 80, 'Načítavam...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      color: '#5a3e2b',
    }).setOrigin(0.5);

    // Progress bar background (rounded)
    const barWidth = 400;
    const barHeight = 40;
    const barX = width / 2 - barWidth / 2;
    const barY = height / 2;

    const barBg = this.add.graphics();
    barBg.fillStyle(0xd4b896, 1);
    barBg.fillRoundedRect(barX, barY, barWidth, barHeight, 20);

    // Progress bar fill
    const barFill = this.add.graphics();

    this.load.on('progress', (value: number) => {
      barFill.clear();
      barFill.fillStyle(0x7cb342, 1);
      barFill.fillRoundedRect(barX + 4, barY + 4, (barWidth - 8) * value, barHeight - 8, 16);
    });

    this.load.on('complete', () => {
      barFill.destroy();
      barBg.destroy();
      loadingText.destroy();
    });

    // Load all game assets
    this.load.image('bg_level1', 'assets/bg_level1.png');
    this.load.image('bg_level1_complete', 'assets/bg_level1_complete.png');
    this.load.image('char_mouse', 'assets/char_mouse.png');
    this.load.image('obj_cheese', 'assets/obj_cheese.png');
    this.load.image('obj_candle', 'assets/obj_candle.png');
    this.load.image('obj_cup', 'assets/obj_cup.png');
    this.load.image('obj_blanket', 'assets/obj_blanket.png');
    this.load.image('obj_key', 'assets/obj_key.png');
    this.load.image('ui_found', 'assets/ui_found.png');

    // Level 2 assets
    this.load.image('bg_level2', 'assets/bg_level2.png');
    this.load.image('char_rabbit', 'assets/char_rabbit.png');
    this.load.image('obj_carrot', 'assets/obj_carrot.png');
    this.load.image('obj_pillow', 'assets/obj_pillow.png');
    this.load.image('obj_book', 'assets/obj_book.png');
    this.load.image('obj_glasses', 'assets/obj_glasses.png');
    this.load.image('obj_lamp', 'assets/obj_lamp.png');
  }

  create(): void {
    this.scene.start('TitleScene');
  }
}
