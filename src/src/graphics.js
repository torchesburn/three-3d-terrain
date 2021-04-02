import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.112.1/build/three.module.js';
import Stats from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/libs/stats.module.js';
import {WEBGL} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/WebGL.js';
import {EffectComposer} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/postprocessing/RenderPass.js';
import {GlitchPass } from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/postprocessing/GlitchPass.js';
import {UnrealBloomPass} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/postprocessing/UnrealBloomPass.js';


export const graphics = (function() {

  //------------------------------------------------------------------
  function _GetImageData(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;

    const context = canvas.getContext( '2d' );
    context.drawImage(image, 0, 0);

    return context.getImageData(0, 0, image.width, image.height);
  }

  function _GetPixel(imagedata, x, y) {
    const position = (x + imagedata.width * y) * 4;
    const data = imagedata.data;
    return {
        r: data[position],
        g: data[position + 1],
        b: data[position + 2],
        a: data[position + 3]
    };
  }
  //------------------------------------------------------------------

  class _Graphics {
    constructor({
      targetElementId = 'target',
      graphics = {
        antialias: true,
        fov: 60,
        aspect: 1920 / 1080,
        near: 1,
        far: 25000.0,
        showStats: false
      }
    } = {}) {
      this.targetElementId = targetElementId;
      this.options = graphics;
      // this.antialias = graphics.antialias;
      // this.fov = graphics.fov;
      // this.aspect = graphics.aspect;
      // this.near = graphics.near;
      // this.far = graphics.far;
      // this.showStats = graphics.showStats;
    }

    //--------------------------------
    Initialize() {
      if (!WEBGL.isWebGL2Available()) {
        return false;
      }

      this._threejs = new THREE.WebGLRenderer({
          antialias: this.options.antialias,
      });
      this._threejs.shadowMap.enabled = true; // SPACE
      this._threejs.shadowMap.type = THREE.PCFSoftShadowMap; // SPACE

      this._threejs.setPixelRatio(window.devicePixelRatio);
      this._threejs.setSize(window.innerWidth, window.innerHeight);

      const target = document.getElementById(this.targetElementId);
      target.appendChild(this._threejs.domElement);

      if (this.options.showStats) {
        this._stats = new Stats();
        target.appendChild(this._stats.dom);
      }

      window.addEventListener('resize', () => {
        this._OnWindowResize();
      }, false);

      const fov = this.options.fov; // 60;
      const aspect = this.options.aspect; // 1920 / 1080;
      const near = this.options.near; // 1;
      const far = this.options.far; // 25000.0;
      this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
      this._camera.position.set(75, 20, 0);

      this._scene = new THREE.Scene();
      this._scene.background = new THREE.Color(0xaaaaaa);

      this._CreateLights();

      const composer = new EffectComposer(this._threejs); // Space
      this._composer = composer; // Space
      this._composer.addPass(new RenderPass(this._scene, this._camera)); // Space

      return true;
    }

    //--------------------------------
    _CreateLights() {
      let light = new THREE.DirectionalLight(0x808080, 1, 100);        
      light.castShadow = true;
      // light.shadowCameraVisible = true;
      // light.shadow.bias = -0.01;
      // light.shadow.mapSize.width = 2048;
      // light.shadow.mapSize.height = 2048;
      // light.shadow.camera.near = 1.0;
      // light.shadow.camera.far = 500;
      // light.shadow.camera.left = 200;
      // light.shadow.camera.right = -200;
      // light.shadow.camera.top = 200;
      // light.shadow.camera.bottom = -200;      
      light.position.set(-100, 100, -100);
      light.target.position.set(0, 0, 0);
      light.castShadow = false;
      this._scene.add(light);

      light = new THREE.DirectionalLight(0x404040, 1.5, 100);
      light.position.set(100, 100, -100);
      light.target.position.set(0, 0, 0);
      light.castShadow = false;
      this._scene.add(light);
    }

    //--------------------------------
    AddPostFX(passClass, params) {
      const pass = new passClass();
      for (const k in params) {
        pass[k] = params[k];
      }
      this._composer.addPass(pass);
      return pass;
    }

    //--------------------------------
    _OnWindowResize() {
      this._camera.aspect = window.innerWidth / window.innerHeight;
      this._camera.updateProjectionMatrix();
      this._threejs.setSize(window.innerWidth, window.innerHeight);
      this._composer.setSize(window.innerWidth, window.innerHeight); // Space

    }
    //--------------------------------

    get Scene() {
      return this._scene;
    }

    get Camera() {
      return this._camera;
    }

    //--------------------------------
    Render(timeInSeconds) {
      // this._composer.render();
      this._threejs.render(this._scene, this._camera);
      if (this._stats) {
        this._stats.update();
      }
    }
    //--------------------------------
  }

  return {
    Graphics: _Graphics,
    GetPixel: _GetPixel,
    GetImageData: _GetImageData,
    PostFX: {
      UnrealBloomPass: UnrealBloomPass,
      GlitchPass: GlitchPass,
    },
  };
})();
