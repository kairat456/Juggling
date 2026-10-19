import * as THREE from 'three';
import {
  BallPhysics,
  PlayerPhysics,
  CharacterDef,
  BallDef,
  LocationDef,
} from '../types/game';
import { CharacterModel3D } from './character3d';
import { COURT_WIDTH, COURT_HEIGHT, GROUND_Y, NET_X, NET_TOP_Y } from './physics';

export class GameScene3D {
  public scene: THREE.Scene;
  public camera: THREE.OrthographicCamera;
  public renderer: THREE.WebGLRenderer;

  public characterModels: CharacterModel3D[] = [];
  public ballMesh: THREE.Mesh;
  public ballShadow: THREE.Mesh;
  public netGroup: THREE.Group;

  private ballMat: THREE.MeshStandardMaterial;
  private ballGlowMesh?: THREE.Mesh;

  private directionalLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private groundShadowPlane: THREE.Mesh;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();

    // 1. Camera: Orthographic with slight pitch down for dramatic 3D volume
    this.camera = new THREE.OrthographicCamera(0, COURT_WIDTH, 560, -120, 0.1, 2000);
    this.camera.position.set(0, 35, 750);
    this.camera.lookAt(COURT_WIDTH / 2, 220, 0);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(COURT_WIDTH, COURT_HEIGHT, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 3. Lighting Rig
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.85);
    this.scene.add(this.hemiLight);

    this.directionalLight = new THREE.DirectionalLight(0xfff8eb, 1.4);
    this.directionalLight.position.set(COURT_WIDTH / 2, 600, 450);
    this.directionalLight.castShadow = true;
    this.directionalLight.shadow.mapSize.width = 1024;
    this.directionalLight.shadow.mapSize.height = 1024;
    this.directionalLight.shadow.camera.near = 10;
    this.directionalLight.shadow.camera.far = 1500;
    this.directionalLight.shadow.camera.left = -COURT_WIDTH / 2;
    this.directionalLight.shadow.camera.right = COURT_WIDTH / 2;
    this.directionalLight.shadow.camera.top = 400;
    this.directionalLight.shadow.camera.bottom = -400;
    this.directionalLight.shadow.bias = -0.0005;
    this.scene.add(this.directionalLight);

    // Subtle Rim Light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.5);
    rimLight.position.set(COURT_WIDTH / 2, 300, -350);
    this.scene.add(rimLight);

    // 4. Ground Shadow Receiver Plane
    const groundGeo = new THREE.PlaneGeometry(COURT_WIDTH * 1.2, 400);
    const groundShadowMat = new THREE.ShadowMaterial({ opacity: 0.28 });
    this.groundShadowPlane = new THREE.Mesh(groundGeo, groundShadowMat);
    this.groundShadowPlane.rotation.x = -Math.PI / 2;
    this.groundShadowPlane.position.set(COURT_WIDTH / 2, 0, 0);
    this.groundShadowPlane.receiveShadow = true;
    this.scene.add(this.groundShadowPlane);

    // 5. 3D Ball
    const ballGeo = new THREE.SphereGeometry(17, 24, 24);
    this.ballMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
      metalness: 0.1,
    });
    this.ballMesh = new THREE.Mesh(ballGeo, this.ballMat);
    this.ballMesh.castShadow = true;
    this.scene.add(this.ballMesh);

    // Ball contact shadow disc
    const ballShadowGeo = new THREE.CircleGeometry(16, 16);
    const ballShadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    this.ballShadow = new THREE.Mesh(ballShadowGeo, ballShadowMat);
    this.ballShadow.rotation.x = -Math.PI / 2;
    this.ballShadow.position.y = 0.5;
    this.scene.add(this.ballShadow);

    // 6. 3D Net
    this.netGroup = new THREE.Group();
    this.build3DNet();
    this.scene.add(this.netGroup);
  }

  private build3DNet() {
    const netH = GROUND_Y - NET_TOP_Y; // 240
    const poleRadius = 2.5;

    // Center sleek thin pole
    const poleGeo = new THREE.CylinderGeometry(poleRadius, poleRadius, netH, 16);
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.8,
      roughness: 0.2,
    });
    const poleMesh = new THREE.Mesh(poleGeo, poleMat);
    poleMesh.position.set(NET_X, netH / 2, 0);
    poleMesh.castShadow = true;
    this.netGroup.add(poleMesh);

    // Slim top white cord
    const topCordGeo = new THREE.BoxGeometry(6, 4, 32);
    const topCordMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
    });
    const topCordMesh = new THREE.Mesh(topCordGeo, topCordMat);
    topCordMesh.position.set(NET_X, netH - 2, 0);
    this.netGroup.add(topCordMesh);

    // Thin flexible antenna rod (red and white)
    const antennaGeo = new THREE.CylinderGeometry(1.2, 1.2, 38, 8);
    const antennaMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.4,
    });
    const antennaMesh = new THREE.Mesh(antennaGeo, antennaMat);
    antennaMesh.position.set(NET_X, netH + 19, 0);
    this.netGroup.add(antennaMesh);
  }

  public initCharacters(characters: CharacterDef[], playerList: PlayerPhysics[]) {
    // Clean old models
    for (const m of this.characterModels) {
      this.scene.remove(m.root);
      m.dispose();
    }
    this.characterModels = [];

    const charsMap = characters.reduce<Record<string, CharacterDef>>((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {});

    // Create 4 3D models with depth spacing
    for (let i = 0; i < playerList.length; i++) {
      const p = playerList[i];
      const charDef = charsMap[p.characterId] || characters[0];
      const model = new CharacterModel3D(charDef);

      // Z-depth placement for stereoscopic depth
      // Player 0 is in foreground (z = 18), Player 1 in background (z = -18)
      const zDepth = p.playerIndex === 0 ? 18 : -18;
      model.root.position.z = zDepth;

      this.scene.add(model.root);
      this.characterModels.push(model);
    }
  }

  public updateCharactersAppearance(characters: CharacterDef[], playerList: PlayerPhysics[]) {
    const charsMap = characters.reduce<Record<string, CharacterDef>>((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {});

    for (let i = 0; i < playerList.length; i++) {
      if (this.characterModels[i]) {
        const charDef = charsMap[playerList[i].characterId] || characters[0];
        this.characterModels[i].updateAppearance(charDef);
      }
    }
  }

  public updateBallAppearance(ballDef: BallDef) {
    this.ballMat.color.set(ballDef.primaryColor);
    this.ballMat.roughness = ballDef.pattern === 'gold' ? 0.2 : 0.4;
    this.ballMat.metalness = ballDef.pattern === 'gold' ? 0.85 : 0.1;
  }

  public render(
    ball: BallPhysics,
    players: PlayerPhysics[],
    activePlayerIndex: 0 | 1,
    time: number,
    isLocalPvp: boolean = false
  ) {
    // 1. Update 3D Players
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const model = this.characterModels[i];
      if (!model) continue;

      const isActive = p.team === 'LEFT' && p.playerIndex === activePlayerIndex;
      const isSecondActive = isLocalPvp && p.team === 'RIGHT' && p.playerIndex === 0;
      model.update(p, time, isActive, isSecondActive, GROUND_Y);
    }

    // 2. Update 3D Ball
    const ballWorldY = Math.max(0, GROUND_Y - ball.y);
    this.ballMesh.position.set(ball.x, ballWorldY, 0);

    // Ball 3D rotation
    this.ballMesh.rotation.z = -ball.rotation;
    this.ballMesh.rotation.y = time * 2;

    // Ball ground shadow
    this.ballShadow.position.x = ball.x;
    const shadowDistFactor = Math.max(0.1, 1 - ballWorldY / 300);
    this.ballShadow.scale.set(shadowDistFactor, shadowDistFactor, 1);
    (this.ballShadow.material as THREE.MeshBasicMaterial).opacity = 0.4 * shadowDistFactor;

    // 3. Render Three.js WebGL Scene
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    for (const m of this.characterModels) {
      this.scene.remove(m.root);
      m.dispose();
    }
    this.renderer.dispose();
  }
}
