import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.112.1/build/three.module.js';
import {WEBGL} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/WebGL.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/controls/OrbitControls.js';
import {graphics} from './graphics.js';


export const game = (function() {
  return {
    //--------------------------------
    /**
     * Game
     * 
     */
    //--------------------------------
    Game: class {
      constructor(options = {}) {
        console.log('[Game][constructor]', options);
        this.options = options;
        this._Initialize();
      }

      //--------------------------------
      _Initialize() {
        this._graphics = new graphics.Graphics(this.options);

        if (!this._graphics.Initialize()) {
          this._DisplayError('WebGL2 is not available.');
          return;
        }

        this._controls = this._CreateControls(); // FISH
        
        this._previousRAF = null;
        this._minFrameTime = 1.0 / 10.0;
        this._entities = {};

        this._OnInitialize();
        this._RAF();
      }

      //--------------------------------
      _CreateControls() {
        const controls = new OrbitControls(
            this._graphics._camera, this._graphics._threejs.domElement);
        controls.target.set(0, 0, 0);
        controls.update();
        return controls;
      }

      //--------------------------------
      _DisplayError(errorText) {
        const error = document.getElementById('error');
        error.innerText = errorText;
      }

      //--------------------------------
      _RAF() {
        requestAnimationFrame((t) => {
          if (this._previousRAF === null) {
            this._previousRAF = t;
          }
          this._Render(t - this._previousRAF);
          this._previousRAF = t;
        });
      }

      //--------------------------------
      _StepEntities(timeInSeconds) {
        for (let k in this._entities) {
          if (this._entities[k].Update) {
            this._entities[k].Update(timeInSeconds);
          }
        }
      }

      //--------------------------------
      _Render(timeInMS) {
        const timeInSeconds = Math.min(timeInMS * 0.001, this._minFrameTime);

        this._OnStep(timeInSeconds);
        this._StepEntities(timeInSeconds);
        this._graphics.Render(timeInSeconds);

        this._RAF();
      }
      //--------------------------------
    }
  };
})();
