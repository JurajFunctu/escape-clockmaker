import Phaser from 'phaser';

export interface HiddenObjectDef {
  id: string;
  label: string;
  iconKey: string;
}

export class ObjectTracker {
  private scene: Phaser.Scene;
  private objects: HiddenObjectDef[];
  private foundSet: Set<string> = new Set();
  private container: Phaser.GameObjects.Container;
  private iconSprites: Map<string, Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle> = new Map();
  private checkmarks: Map<string, Phaser.GameObjects.Text> = new Map();

  private static readonly BAR_HEIGHT = 120;
  private static readonly ICON_SIZE = 50;

  constructor(scene: Phaser.Scene, objects: HiddenObjectDef[]) {
    this.scene = scene;
    this.objects = objects;
    this.container = scene.add.container(0, 0);
    this.container.setDepth(200);
    this.render();
  }

  private render(): void {
    const width = 720;

    // Semi-transparent dark bar at top
    const barBg = this.scene.add.rectangle(
      width / 2, ObjectTracker.BAR_HEIGHT / 2,
      width, ObjectTracker.BAR_HEIGHT,
      0x000000, 0.7
    );
    this.container.add(barBg);

    // "Find these items:" label
    const label = this.scene.add.text(width / 2, 16, 'Nájdi tieto veci:', {
      fontFamily: '"Patrick Hand", "Comic Sans MS", cursive',
      fontSize: '28px',
      color: '#fff8e7',
    }).setOrigin(0.5, 0);
    this.container.add(label);

    // Icons row
    const iconCount = this.objects.length;
    const spacing = 80;
    const totalWidth = (iconCount - 1) * spacing;
    const startX = width / 2 - totalWidth / 2;
    const iconY = 75;

    this.objects.forEach((obj, index) => {
      const x = startX + index * spacing;

      if (this.scene.textures.exists(obj.iconKey)) {
        const icon = this.scene.add.image(x, iconY, obj.iconKey);
        icon.setDisplaySize(ObjectTracker.ICON_SIZE, ObjectTracker.ICON_SIZE);
        icon.setTint(0x555555);
        this.container.add(icon);
        this.iconSprites.set(obj.id, icon);
      } else {
        // Fallback: colored circle placeholder
        const circle = this.scene.add.rectangle(x, iconY, ObjectTracker.ICON_SIZE, ObjectTracker.ICON_SIZE, 0x555555);
        circle.setStrokeStyle(2, 0x888888);
        this.container.add(circle);
        this.iconSprites.set(obj.id, circle);

        // Small label below
        const iconLabel = this.scene.add.text(x, iconY + 30, obj.label, {
          fontFamily: '"Patrick Hand", "Comic Sans MS", cursive',
          fontSize: '10px',
          color: '#aaaaaa',
        }).setOrigin(0.5, 0);
        this.container.add(iconLabel);
      }

      // Checkmark (hidden initially)
      const check = this.scene.add.text(x + 18, iconY - 18, '✓', {
        fontFamily: '"Patrick Hand", "Comic Sans MS", cursive',
        fontSize: '24px',
        color: '#4caf50',
        fontStyle: 'bold',
      }).setOrigin(0.5).setAlpha(0);
      this.container.add(check);
      this.checkmarks.set(obj.id, check);
    });
  }

  markFound(objectId: string): number {
    if (this.foundSet.has(objectId)) return this.foundSet.size;
    this.foundSet.add(objectId);

    // Update icon: clear tint, full color
    const icon = this.iconSprites.get(objectId);
    if (icon) {
      if ('clearTint' in icon) {
        (icon as Phaser.GameObjects.Image).clearTint();
      } else {
        (icon as Phaser.GameObjects.Rectangle).setFillStyle(0x4caf50);
      }
    }

    // Show checkmark with bounce
    const check = this.checkmarks.get(objectId);
    if (check) {
      check.setAlpha(1);
      this.scene.tweens.add({
        targets: check,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 200,
        yoyo: true,
      });
    }

    return this.foundSet.size;
  }

  allFound(): boolean {
    return this.foundSet.size >= this.objects.length;
  }

  getFoundCount(): number {
    return this.foundSet.size;
  }

  destroy(): void {
    this.container.destroy(true);
    this.iconSprites.clear();
    this.checkmarks.clear();
    this.foundSet.clear();
  }
}
