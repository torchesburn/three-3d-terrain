import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.112.1/build/three.module.js';
import {GUI} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/libs/dat.gui.module.js';
import {controls} from './src/controls.js';
import {game} from './src/game.js';
import {sky} from './src/sky.js';
import {terrain} from './src/terrain.js';


let _APP = null;

//----------------------------------------------------------------------------
/**
 * ProceduralTerrain_Demo
 * 
 */
class ProceduralTerrain_Demo extends game.Game {
  //--------------------------------
  constructor(options = {}) {
    console.log('[ProceduralTerrain_Demo][constructor]', options);
    super(options);
  }

  //--------------------------------
  _OnInitialize() {
    this._CreateGUI();

    this._userCamera = new THREE.Object3D();
    this._userCamera.position.set(475, 75, 900);

    //-------------------------
    this._entities['_terrain'] = new terrain.TerrainChunkManager({
      camera: this._userCamera,
      scene: this._graphics.Scene,
      gui: this._gui,
      guiParams: this._guiParams,
      terrainOptions: (this.options || {}).terrainOptions,
    });

    //-------------------------
    this._entities['_sky'] = new sky.TerrainSky({
      camera: this._graphics.Camera,
      scene: this._graphics.Scene,
      gui: this._gui,
      guiParams: this._guiParams,
      skyOptions: (this.options || {}).skyOptions,
      waterOptions: (this.options || {}).waterOptions,
    });

    //-------------------------
    this._entities['_controls'] = new controls.FPSControls({
      scene: this._graphics.Scene,
      camera: this._userCamera
    });

    //-------------------------
    this._graphics.Camera.position.copy(this._userCamera.position);

    this._LoadBackground();
    //-------------------------
  }

  //--------------------------------
  _CreateGUI() {
    this._guiParams = { general: {} };
    this._gui = new GUI();

    const generalRollup = this._gui.addFolder('General');
    this._gui.close();
  }

  //--------------------------------
  _LoadBackground() {
    this._graphics.Scene.background = new THREE.Color(0x000000);
  }

  //--------------------------------
  _OnStep(_) {
    this._graphics._camera.position.copy(this._userCamera.position);
    this._graphics._camera.quaternion.copy(this._userCamera.quaternion);
  }
  //--------------------------------
}
//----------------------------------------------------------------------------

function _Main() {
  _APP = new ProceduralTerrain_Demo({
    graphics: {
      antialias: false
    },
    skyOptions: {
      inclination: 0.45
    },
    waterOptions: {
      width: 100,
      height: 100
    },
    terrainOptions: {
      wireframe: true
    }
  });
}
//----------------------------------------------------------------------------

_Main();
