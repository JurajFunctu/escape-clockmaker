import Phaser from 'phaser';
import { ObjectTracker, HiddenObjectDef } from '../systems/ObjectTracker';

interface HiddenObject {
  id: string;
  spriteKey: string;
  x: number;
  y: number;
  size: number;
  found: boolean;
  sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
  message: string;
}

const FONT = '"Patrick Hand", "Comic Sans MS", cursive';

const OBJECT_DEFS: Array<{
  id: string;
  spriteKey: string;
  label: string;
  x: number;
  y: number;
  size: number;
  message: string;
}> = [
  { id: 'carrot', spriteKey: 'obj_carrot', label: 'Mrkva', x: 150, y: 480, size: 85, message: 'Mňam, mrkva! Moja obľúbená!' },
  { id: 'pillow', spriteKey: 'obj_pillow', label: 'Vankúš', x: 550, y: 680, size: 95, message: 'Na tomto sa bude dobre spať!' },
  { id: 'book', spriteKey: 'obj_book', label: 'Knižka', x: 380, y: 350, size: 80, message: 'Rozprávky na dobrú noc!' },
  { id: 'glasses', spriteKey: 'obj_glasses', label: 'Okuliare', x: 620, y: 420, size: 70, message: 'Teraz budem lepšie čítať!' },
  { id: 'lamp', spriteKey: 'obj_lamp', label: 'Lampa', x: 100, y: 750, size: 90, message: 'Svetlo na čítanie!' },
];

export class Level2Scene extends Phaser.Scene {
  private tracker!: ObjectTracker;
  private hiddenObjects: HiddenObject[] = [];
  private rabbitSprite!: Phaser.GameObjects.Image | Phaser.GameObjects.Container;
  private speechBubble!: Phaser.GameObjects.Container;
  private speechText!: Phaser.GameObjects.Text;
  private levelComplete = false;

  constructor() {
    super({ key: 'Level2Scene' });
  }

  create(): void {
    this.levelComplete = false;
    this.hiddenObjects = [];

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.fadeIn(400);

    if (this.textures.exists('bg_level2')) {
      const bg = this.add.image(width / 2, height / 2, 'bg_level2');
      bg.setDisplaySize(width, height);
      bg.setDepth(0);
    } else {
      this.createFallbackBackground(width, height);
    }

    const trackerDefs: HiddenObjectDef[] = OBJECT_DEFS.map((d) => ({
      id: d.id,
      label: d.label,
      iconKey: d.spriteKey,
    }));
    this.tracker = new ObjectTracker(this, trackerDefs);

    OBJECT_DEFS.forEach((def) => {
      const obj = this.createHiddenObject(def);
      this.hiddenObjects.push(obj);
    });

    this.createRabbitCharacter(width, height);

    const itemList = OBJECT_DEFS.map(d => d.label).join(', ');
    this.showSpeech('Pomôž mi nájsť:\n' + itemList + '!');
  }

  private createFallbackBackground(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, 0xd4c4a8).setDepth(0);
    this.add.rectangle(width / 2, height - 100, width, 200, 0x6b4e37).setDepth(0);
    const g = this.add.graphics().setDepth(0);
    g.fillStyle(0x8b6d4f, 0.6);
    g.fillRect(50, 200, 180, 600);
    g.fillRect(500, 200, 180, 600);
    g.fillStyle(0x87ceeb, 0.5);
    g.fillRect(300, 300, 120, 160);
    g.lineStyle(4, 0x5a3e2b, 1);
    g.strokeRect(300, 300, 120, 160);
  }

  private createHiddenObject(def: {
    id: string;
    spriteKey: string;
    x: number;
    y: number;
    size: number;
    message: string;
  }): HiddenObject {
    let sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;

    if (this.textures.exists(def.spriteKey)) {
      const img = this.add.image(def.x, def.y, def.spriteKey);
      img.setDisplaySize(def.size, def.size);
      img.setAlpha(0.85);
      img.setTint(0xeeddcc);
      img.setDepth(10);
      sprite = img;
    } else {
      const colors: Record<string, number> = {
        carrot: 0xe87040,
        pillow: 0x9966cc,
        book: 0x8b4513,
        glasses: 0xc4a040,
        lamp: 0xb8860b,
      };
      const rect = this.add.rectangle(def.x, def.y, def.size, def.size, colors[def.id] ?? 0x888888);
      rect.setAlpha(0.85);
      rect.setDepth(10);
      this.add.text(def.x, def.y, def.id, {
        fontFamily: FONT,
        fontSize: '16px',
        color: '#ffffff',
      }).setOrigin(0.5).setAlpha(0.6).setDepth(11);
      sprite = rect;
    }

    sprite.setInteractive();

    const hiddenObj: HiddenObject = {
      id: def.id,
      spriteKey: def.spriteKey,
      x: def.x,
      y: def.y,
      size: def.size,
      found: false,
      sprite,
      message: def.message,
    };

    sprite.on('pointerdown', () => this.onObjectTapped(hiddenObj));

    return hiddenObj;
  }

  private onObjectTapped(obj: HiddenObject): void {
    if (obj.found || this.levelComplete) return;

    obj.found = true;
    obj.sprite.disableInteractive();

    if ('clearTint' in obj.sprite) {
      (obj.sprite as Phaser.GameObjects.Image).clearTint();
    }
    obj.sprite.setAlpha(1.0);

    const origScaleX = obj.sprite.scaleX;
    const origScaleY = obj.sprite.scaleY;
    this.tweens.add({
      targets: obj.sprite,
      scaleX: origScaleX * 1.3,
      scaleY: origScaleY * 1.3,
      duration: 200,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    this.showFoundStamp(obj.x, obj.y);
    this.tracker.markFound(obj.id);
    this.showSpeech(obj.message);

    if (this.tracker.allFound()) {
      this.onAllFound();
    }
  }

  private showFoundStamp(x: number, y: number): void {
    const stamp = this.add.text(x, y - 50, '⭐ Nájdené!', {
      fontFamily: FONT,
      fontSize: '32px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#5a3e2b',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(150).setScale(0);

    this.tweens.add({
      targets: stamp,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: stamp,
          alpha: 0,
          y: y - 100,
          duration: 600,
          delay: 500,
          onComplete: () => stamp.destroy(),
        });
      },
    });
  }

  private createRabbitCharacter(width: number, _height: number): void {
    const rabbitX = width / 2;
    const rabbitY = 1050;

    if (this.textures.exists('char_rabbit')) {
      const rabbit = this.add.image(rabbitX, rabbitY, 'char_rabbit');
      rabbit.setDisplaySize(220, 220);
      rabbit.setDepth(100);
      this.rabbitSprite = rabbit;
    } else {
      const container = this.add.container(rabbitX, rabbitY);
      container.setDepth(100);
      container.setScale(2.0);
      const body = this.add.ellipse(0, 0, 70, 90, 0xc49a6c);
      container.add(body);
      const earL = this.add.ellipse(-15, -60, 14, 40, 0xd4aa7a);
      const earR = this.add.ellipse(15, -60, 14, 40, 0xd4aa7a);
      container.add(earL);
      container.add(earR);
      const eyeL = this.add.circle(-12, -10, 6, 0x000000);
      const eyeR = this.add.circle(12, -10, 6, 0x000000);
      container.add(eyeL);
      container.add(eyeR);
      const nose = this.add.circle(0, 2, 5, 0xff9999);
      container.add(nose);
      this.rabbitSprite = container;
    }

    this.tweens.add({
      targets: this.rabbitSprite,
      y: rabbitY - 8,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.createSpeechBubble(rabbitX, rabbitY - 150);
  }

  private createSpeechBubble(x: number, y: number): void {
    this.speechBubble = this.add.container(x, y);
    this.speechBubble.setDepth(110);

    const bubbleBg = this.add.graphics();
    this.speechBubble.add(bubbleBg);

    this.speechText = this.add.text(0, 0, '', {
      fontFamily: FONT,
      fontSize: '26px',
      color: '#3a2a1a',
      wordWrap: { width: 380 },
      align: 'center',
      lineSpacing: 6,
    }).setOrigin(0.5);
    this.speechBubble.add(this.speechText);

    (this.speechBubble as Phaser.GameObjects.Container & { bubbleBg: Phaser.GameObjects.Graphics }).bubbleBg = bubbleBg;
  }

  private showSpeech(text: string): void {
    this.speechText.setText(text);

    const padding = 20;
    const textWidth = this.speechText.width;
    const textHeight = this.speechText.height;
    const bubbleWidth = Math.max(textWidth + padding * 2, 200);
    const bubbleHeight = textHeight + padding * 2;

    const bubbleBg = (this.speechBubble as Phaser.GameObjects.Container & { bubbleBg: Phaser.GameObjects.Graphics }).bubbleBg;
    bubbleBg.clear();

    bubbleBg.fillStyle(0xfff8e7, 0.92);
    bubbleBg.fillRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 18);
    bubbleBg.lineStyle(3, 0xc4a06a, 1);
    bubbleBg.strokeRoundedRect(-bubbleWidth / 2, -bubbleHeight / 2, bubbleWidth, bubbleHeight, 18);

    bubbleBg.fillStyle(0xfff8e7, 0.92);
    bubbleBg.fillTriangle(-10, bubbleHeight / 2, 10, bubbleHeight / 2, 0, bubbleHeight / 2 + 16);
    bubbleBg.lineStyle(3, 0xc4a06a, 1);
    bubbleBg.lineBetween(-10, bubbleHeight / 2, 0, bubbleHeight / 2 + 16);
    bubbleBg.lineBetween(10, bubbleHeight / 2, 0, bubbleHeight / 2 + 16);

    this.speechBubble.setAlpha(0);
    this.speechBubble.setScale(0.8);
    this.tweens.add({
      targets: this.speechBubble,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 250,
      ease: 'Back.easeOut',
    });
  }

  private onAllFound(): void {
    this.levelComplete = true;

    this.time.delayedCall(1000, () => {
      this.showSpeech('Ďakujem! Moja útulná knižnica! 📚');
      this.createConfetti();

      this.time.delayedCall(2500, () => {
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.time.delayedCall(600, () => {
          this.tracker.destroy();
          this.scene.start('Level2CompleteScene');
        });
      });
    });
  }

  private createConfetti(): void {
    const width = this.cameras.main.width;
    const colors = [0xff6b6b, 0xfeca57, 0x48dbfb, 0xff9ff3, 0x54a0ff, 0x5f27cd, 0x01a3a4, 0xff6348];

    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(-200, -20);
      const color = Phaser.Math.RND.pick(colors);
      const size = Phaser.Math.Between(6, 14);

      const piece = this.add.rectangle(x, y, size, size * 1.5, color);
      piece.setDepth(300);
      piece.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));

      this.tweens.add({
        targets: piece,
        y: 1400,
        x: x + Phaser.Math.Between(-100, 100),
        rotation: piece.rotation + Phaser.Math.FloatBetween(-3, 3),
        duration: Phaser.Math.Between(1500, 3000),
        delay: Phaser.Math.Between(0, 500),
        ease: 'Quad.easeIn',
        onComplete: () => piece.destroy(),
      });
    }
  }
}
