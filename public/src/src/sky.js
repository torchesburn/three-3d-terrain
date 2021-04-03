import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.112.1/build/three.module.js';

import {Sky} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/objects/Sky.js';
import {Water} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/objects/Water.js';


export const sky = (function() {

  //------------------------------------------
  /**
   * TerrainSky
   * 
   */
  class TerrainSky {
    constructor(params) {
      this._params = params;
      this.skyOptions = params.skyOptions || {};
      this.waterOptions = params.waterOptions || {};

      this.waterOptions.width = this.waterOptions.width || 1000;
      this.waterOptions.height = this.waterOptions.height || 1000;
      this.waterOptions.widthSegments = this.waterOptions.widthSegments || 100;
      this.waterOptions.heightSegments = this.waterOptions.heightSegments || 100;

      this._Init(params);
    }

    //-----------------------------
    _Init(params) {
      const { width, height, widthSegments, heightSegments } = this.waterOptions;
      const waterGeometry = new THREE.PlaneBufferGeometry(width, height, widthSegments, heightSegments);

      //----------------------------------------------
      this._water = new Water(
        waterGeometry,
        {
          textureWidth: 2048,
          textureHeight: 2048,
          waterNormals: new THREE.TextureLoader().load('resources/waternormals.jpg', function(texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          }),
          alpha: this.skyOptions.alpha || 0.5,
          sunDirection: new THREE.Vector3(1, 0, 0),
          sunColor: this.skyOptions.sunColor || 0xffffff,
          waterColor: this.waterOptions.waterColor || 0x001e0f,
          distortionScale: this.skyOptions.distortionScale || 0.0,
          fog: undefined
        }
      );
      this._water.rotation.x = - Math.PI / 2;
      this._water.position.y = 4;

      this._sky = new Sky();
      this._sky.scale.setScalar(10000);

      this._group = new THREE.Group();
      this._group.add(this._water);
      this._group.add(this._sky);

      params.scene.add(this._group);

      //----------------------------------------------
      params.guiParams.water = {
        alpha: this.skyOptions.alpha || 0.5,
        distortionScale: this.skyOptions.distortionScale || 0.0,
      };
      //----------------------------------------------
      params.guiParams.sky = {
        turbidity: this.skyOptions.turbidity || 10.0,
        rayleigh: this.skyOptions.rayleigh || 2,
        mieCoefficient: this.skyOptions.mieCoefficient || 0.005,
        mieDirectionalG: this.skyOptions.mieDirectionalG || 0.8,
        luminance: this.skyOptions.luminance || 1,
      };

      //----------------------------------------------
      params.guiParams.sun = {
        inclination: this.skyOptions.inclination || 0.31,
        azimuth: this.skyOptions.azimuth || 0.25,
      };

      //----------------------------------------------
      const onShaderChange = () => {
        for (let k in params.guiParams.water) {
          this._water.material.uniforms[k].value = params.guiParams.water[k];
        }
        for (let k in params.guiParams.sky) {
          this._sky.material.uniforms[k].value = params.guiParams.sky[k];
        }
        for (let k in params.guiParams.general) {
          this._sky.material.uniforms[k].value = params.guiParams.general[k];
        }
      };

      const onSunChange = () => {
        var theta = Math.PI * (params.guiParams.sun.inclination - 0.5);
        var phi = 2 * Math.PI * (params.guiParams.sun.azimuth - 0.5);

        const sunPosition = new THREE.Vector3();
        sunPosition.x = Math.cos(phi);
        sunPosition.y = Math.sin(phi) * Math.sin(theta);
        sunPosition.z = Math.sin(phi) * Math.cos(theta);

        this._sky.material.uniforms['sunPosition'].value.copy(sunPosition);
        this._water.material.uniforms['sunDirection'].value.copy(sunPosition.normalize());
      };

      const skyRollup = params.gui.addFolder('Sky');
      skyRollup.add(params.guiParams.sky, "turbidity", 0.1, 30.0).onChange(onShaderChange);
      skyRollup.add(params.guiParams.sky, "rayleigh", 0.1, 4.0).onChange(onShaderChange);
      skyRollup.add(params.guiParams.sky, "mieCoefficient", 0.0001, 0.1).onChange(onShaderChange);
      skyRollup.add(params.guiParams.sky, "mieDirectionalG", 0.0, 1.0).onChange(onShaderChange);
      skyRollup.add(params.guiParams.sky, "luminance", 0.0, 2.0).onChange(onShaderChange);

      const sunRollup = params.gui.addFolder('Sun');
      sunRollup.add(params.guiParams.sun, "inclination", 0.0, 1.0).onChange(onSunChange);
      sunRollup.add(params.guiParams.sun, "azimuth", 0.0, 1.0).onChange(onSunChange);

      const waterRollup = params.gui.addFolder('Water');
      waterRollup.add(params.guiParams.water, "alpha", 0.1, 1.0).onChange(onShaderChange);
      waterRollup.add(params.guiParams.water, "distortionScale", 0.0, 5.0).onChange(onShaderChange);


      onShaderChange();
      onSunChange();
    }

    //-----------------------------
    Update(timeInSeconds) {
      this._water.material.uniforms['time'].value += timeInSeconds;

      this._group.position.x = this._params.camera.position.x;
      this._group.position.z = this._params.camera.position.z;
    }
    //-----------------------------
  }


  return {
    TerrainSky: TerrainSky
  }
})();
