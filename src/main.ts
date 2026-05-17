import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { TitleScene } from './scenes/TitleScene';
import { Level1Scene } from './scenes/Level1Scene';
import { LevelCompleteScene } from './scenes/LevelCompleteScene';
import { Level2Scene } from './scenes/Level2Scene';
import { Level2CompleteScene } from './scenes/Level2CompleteScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  parent: 'game-container',
  backgroundColor: '#2a1f1a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, TitleScene, Level1Scene, LevelCompleteScene, Level2Scene, Level2CompleteScene],
  input: {
    activePointers: 1,
    touch: {
      capture: true,
    },
  },
};

new Phaser.Game(config);
