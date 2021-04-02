import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import {GUI} from 'https://cdn.jsdelivr.net/npm/three@0.112.1/examples/jsm/libs/dat.gui.module.js';
import {controls} from './src/controls.js';
import {game} from './src/game.js';
import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';

let _APP = null;

const _VS = `
uniform float pointMultiplier;

attribute float size;
attribute float angle;
attribute vec4 colour;

varying vec4 vColour;
varying vec2 vAngle;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * pointMultiplier / gl_Position.w;

  vAngle = vec2(cos(angle), sin(angle));
  vColour = colour;
}`;

const _FS = `

uniform sampler2D diffuseTexture;

varying vec4 vColour;
varying vec2 vAngle;

void main() {
  vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
  gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
}`;

//-------------------------------------------------------------------
/**
 * LinearSpline
 * 
 */
class LinearSpline {
  constructor(lerp) {
    this._points = [];
    this._lerp = lerp;
  }

  AddPoint(t, d) {
    this._points.push([t, d]);
  }

  Get(t) {
    let p1 = 0;

    for (let i = 0; i < this._points.length; i++) {
      if (this._points[i][0] >= t) {
        break;
      }
      p1 = i;
    }

    const p2 = Math.min(this._points.length - 1, p1 + 1);

    if (p1 == p2) {
      return this._points[p1][1];
    }

    return this._lerp(
        (t - this._points[p1][0]) / (
            this._points[p2][0] - this._points[p1][0]),
        this._points[p1][1], this._points[p2][1]);
  }
}

//-------------------------------------------------------------------
/**
 * ParticleSystem
 * 
 */
class ParticleSystem {
  //--------------------------------
  constructor(params) {
    //----------------------
    console.log('[ParticleSystem][constructor]', params)
    //----------------------
    const uniforms = {
        diffuseTexture: {
            value: new THREE.TextureLoader().load('./resources/fire.png')
        },
        pointMultiplier: {
            value: window.innerHeight / (2.0 * Math.tan(0.5 * 60.0 * Math.PI / 180.0))
        }
    };

    //----------------------
    this._material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: _VS,
        fragmentShader: _FS,
        blending: THREE.AdditiveBlending,
        depthTest: true,
        depthWrite: false,
        transparent: true,
        vertexColors: true
    });

    //----------------------
    this._camera = params.camera;
    this._particles = [];

    this._geometry = new THREE.BufferGeometry();
    this._geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
    this._geometry.setAttribute('size', new THREE.Float32BufferAttribute([], 1));
    this._geometry.setAttribute('colour', new THREE.Float32BufferAttribute([], 4));
    this._geometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1));

    this._points = new THREE.Points(this._geometry, this._material);

    params.scene.add(this._points);

    //----------------------
    this._alphaSpline = new LinearSpline((t, a, b) => {
      return a + t * (b - a);
    });
    this._alphaSpline.AddPoint(0.0, 0.0);
    this._alphaSpline.AddPoint(0.1, 1.0);
    this._alphaSpline.AddPoint(0.6, 1.0);
    this._alphaSpline.AddPoint(1.0, 0.0);

    //----------------------
    this._colourSpline = new LinearSpline((t, a, b) => {
      const c = a.clone();
      return c.lerp(b, t);
    });
    this._colourSpline.AddPoint(0.0, new THREE.Color(0xFFFF80));
    this._colourSpline.AddPoint(1.0, new THREE.Color(0xFF8080));

    //----------------------
    this._sizeSpline = new LinearSpline((t, a, b) => {
      return a + t * (b - a);
    });
    this._sizeSpline.AddPoint(0.0, 1.0);
    this._sizeSpline.AddPoint(0.5, 5.0);
    this._sizeSpline.AddPoint(1.0, 1.0);

    document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
  
    this._UpdateGeometry();
    //----------------------
  }

  //--------------------------------
  _onKeyUp(event) {
    switch(event.keyCode) {
      case 32: // SPACE
        this._AddParticles();
        break;
    }
  }

  //--------------------------------
  _AddParticles(timeInSeconds) {
    console.log('[ParticleSystem][_AddParticles]')
    if (!this.gdfsghk) {
      this.gdfsghk = 0.0;
    }
    this.gdfsghk += timeInSeconds;
    const n = Math.floor(this.gdfsghk * 75.0);
    this.gdfsghk -= n / 75.0;

    for (let i = 0; i < n; i++) {
      const life = (Math.random() * 0.75 + 0.25) * 10.0;
      this._particles.push({
          position: new THREE.Vector3(
              (Math.random() * 2 - 1) * 1.0,
              (Math.random() * 2 - 1) * 1.0,
              (Math.random() * 2 - 1) * 1.0),
          size: (Math.random() * 0.5 + 0.5) * 4.0,
          colour: new THREE.Color(),
          alpha: 1.0,
          life: life,
          maxLife: life,
          rotation: Math.random() * 2.0 * Math.PI,
          velocity: new THREE.Vector3(0, -15, 0),
      });
    }
  }

  //--------------------------------
  _UpdateGeometry() {
    console.log('[ParticleSystem][_UpdateGeometry]')
    const positions = [];
    const sizes = [];
    const colours = [];
    const angles = [];

    for (let p of this._particles) {
      positions.push(p.position.x, p.position.y, p.position.z);
      colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
      sizes.push(p.currentSize);
      angles.push(p.rotation);
    }

    console.log('[ParticleSystem][_UpdateGeometry] positions:', positions)
    this._geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this._geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    this._geometry.setAttribute('colour', new THREE.Float32BufferAttribute(colours, 4));
    this._geometry.setAttribute('angle', new THREE.Float32BufferAttribute(angles, 1));
  
    this._geometry.attributes.position.needsUpdate = true;
    this._geometry.attributes.size.needsUpdate = true;
    this._geometry.attributes.colour.needsUpdate = true;
    this._geometry.attributes.angle.needsUpdate = true;
  }

  //--------------------------------
  _UpdateParticles(timeInSeconds) {
    console.log('[ParticleSystem][_UpdateParticles]')
    for (let p of this._particles) {
      p.life -= timeInSeconds;
    }

    this._particles = this._particles.filter(p => {
      return p.life > 0.0;
    });

    for (let p of this._particles) {
      const t = 1.0 - p.life / p.maxLife;

      p.rotation += timeInSeconds * 0.5;
      p.alpha = this._alphaSpline.Get(t);
      p.currentSize = p.size * this._sizeSpline.Get(t);
      p.colour.copy(this._colourSpline.Get(t));

      p.position.add(p.velocity.clone().multiplyScalar(timeInSeconds));

      const drag = p.velocity.clone();
      drag.multiplyScalar(timeInSeconds * 0.1);
      drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x));
      drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y));
      drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z));
      p.velocity.sub(drag);
    }

    this._particles.sort((a, b) => {
      const d1 = this._camera.position.distanceTo(a.position);
      const d2 = this._camera.position.distanceTo(b.position);

      if (d1 > d2) {
        return -1;
      }

      if (d1 < d2) {
        return 1;
      }

      return 0;
    });
  }

  //--------------------------------
  Update(timeInSeconds, timeInMS) {
    const timeInSecondsRaw = timeInMS * 0.001;
    console.log('[ParticleSystem][Update] timeInSeconds:', timeInSeconds, '| timeInSecondsRaw:', timeInSecondsRaw)
    this._AddParticles(timeInSecondsRaw);
    this._UpdateParticles(timeInSecondsRaw);
    this._UpdateGeometry();
  }
  //--------------------------------
}

//-------------------------------------------------------------------
/**
 * ParticleSystemDemo
 * 
 */
class ParticleSystemDemo extends game.Game {
  //--------------------------------
  constructor(options = {}) {
    console.log('[ParticleSystemDemo][constructor]', options);
    super(options);
  }

  //--------------------------------
  _OnInitialize() {
    //-------------------------
    this._CreateGUI();

    //-------------------------
    // this._userCamera = new THREE.Object3D();
    // this._userCamera.position.set(15, 10, 0);
    // this._graphics.Camera.position.copy(this._userCamera.position);

    //-------------------------
    this._entities['_particles'] = new ParticleSystem({
      scene: this._graphics.Scene,
      camera: this._graphics.Camera,
    });
    //-------------------------
    // this._entities['_controls'] = new controls.FPSControls({
    //   scene: this._graphics.Scene,
    //   camera: this._userCamera
    // });
    //-------------------------

    this._LoadBackground();
    this._LoadModel();
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
  _LoadModel() {
    const loader = new GLTFLoader();
    loader.load('./resources/rocket/Rocket_Ship_01.gltf', (gltf) => {
      gltf.scene.traverse(c => {
        c.castShadow = true;
      });
      this._graphics.Scene.add(gltf.scene);
    });
  }

  //--------------------------------
  _LoadBackground() {
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        './resources/posx.jpg',
        './resources/negx.jpg',
        './resources/posy.jpg',
        './resources/negy.jpg',
        './resources/posz.jpg',
        './resources/negz.jpg',
    ]);
    this._graphics.Scene.background = texture;
  }

  //--------------------------------
  _OnStep(timeInMS) {
    // this._graphics._camera.position.copy(this._userCamera.position);
    // this._graphics._camera.quaternion.copy(this._userCamera.quaternion);
  }
  //--------------------------------
}
//----------------------------------------------------------------------------

function _Main() {
  _APP = new ParticleSystemDemo({
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
