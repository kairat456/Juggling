import * as THREE from 'three';
import { PlayerPhysics, CharacterDef } from '../types/game';

export class CharacterModel3D {
  public root: THREE.Group;
  public pelvis: THREE.Group;
  public torso: THREE.Group;
  public headGroup: THREE.Group;
  public hairGroup: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public leftLeg: THREE.Group;
  public rightLeg: THREE.Group;
  public leftShin: THREE.Group;
  public rightShin: THREE.Group;
  public shadowDisc: THREE.Mesh;
  public indicatorMesh: THREE.Mesh;

  // Materials
  private skinMat: THREE.MeshStandardMaterial;
  private jerseyMat: THREE.MeshStandardMaterial;
  private shortsMat: THREE.MeshStandardMaterial;
  private shoesMat: THREE.MeshStandardMaterial;
  private hairMat: THREE.MeshStandardMaterial;
  private shadowMat: THREE.MeshBasicMaterial;
  private indicatorMat: THREE.MeshBasicMaterial;

  private currentAction: string = 'IDLE';

  constructor(char: CharacterDef) {
    this.root = new THREE.Group();

    // 1. Shared Materials
    this.skinMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(char.skinColor),
      roughness: 0.65,
      metalness: 0.05,
    });
    this.jerseyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(char.jerseyColor),
      roughness: 0.75,
      metalness: 0.1,
    });
    this.shortsMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(char.shortsColor),
      roughness: 0.8,
      metalness: 0.05,
    });
    this.shoesMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(char.shoesColor),
      roughness: 0.4,
      metalness: 0.2,
    });
    this.hairMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(char.hairColor),
      roughness: 0.9,
      metalness: 0.05,
    });

    // 2. Pelvis & Shorts
    this.pelvis = new THREE.Group();
    this.pelvis.position.y = 42;
    this.root.add(this.pelvis);

    const shortsGeo = new THREE.BoxGeometry(22, 16, 14);
    const shortsMesh = new THREE.Mesh(shortsGeo, this.shortsMat);
    shortsMesh.castShadow = true;
    shortsMesh.receiveShadow = true;
    this.pelvis.add(shortsMesh);

    // 3. Torso & Jersey
    this.torso = new THREE.Group();
    this.torso.position.y = 8;
    this.pelvis.add(this.torso);

    const torsoGeo = new THREE.BoxGeometry(20, 26, 13);
    const torsoMesh = new THREE.Mesh(torsoGeo, this.jerseyMat);
    torsoMesh.position.y = 13;
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    this.torso.add(torsoMesh);

    // Center vertical stripe on jersey
    const stripeGeo = new THREE.BoxGeometry(6, 26.2, 13.2);
    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7,
      metalness: 0.05,
    });
    const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
    stripeMesh.position.y = 13;
    this.torso.add(stripeMesh);

    // 4. Head & Face
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 31;
    this.torso.add(this.headGroup);

    // Neck
    const neckGeo = new THREE.CylinderGeometry(3.5, 4, 6, 12);
    const neckMesh = new THREE.Mesh(neckGeo, this.skinMat);
    neckMesh.position.y = 0;
    this.headGroup.add(neckMesh);

    // Head sphere
    const headGeo = new THREE.SphereGeometry(10.5, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, this.skinMat);
    headMesh.position.y = 10;
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Eyes
    const eyeGeo = new THREE.SphereGeometry(1.4, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x18181b });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-3.2, 10.5, 9.5);
    this.headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(3.2, 10.5, 9.5);
    this.headGroup.add(rightEye);

    // 5. Hair Styles
    this.hairGroup = new THREE.Group();
    this.headGroup.add(this.hairGroup);
    this.buildHair(char.hairStyle);

    // 6. Arms & Shoulders
    // Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(-13, 23, 0);
    this.torso.add(this.leftArm);

    const armGeo = new THREE.CylinderGeometry(3, 2.5, 16, 10);
    const leftArmMesh = new THREE.Mesh(armGeo, this.skinMat);
    leftArmMesh.position.y = -8;
    leftArmMesh.castShadow = true;
    this.leftArm.add(leftArmMesh);

    const handGeo = new THREE.SphereGeometry(2.8, 10, 10);
    const leftHand = new THREE.Mesh(handGeo, this.skinMat);
    leftHand.position.y = -17;
    this.leftArm.add(leftHand);

    // Right Arm (Dominant striking arm)
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(13, 23, 0);
    this.torso.add(this.rightArm);

    const rightArmMesh = new THREE.Mesh(armGeo, this.skinMat);
    rightArmMesh.position.y = -8;
    rightArmMesh.castShadow = true;
    this.rightArm.add(rightArmMesh);

    const rightHand = new THREE.Mesh(handGeo, this.skinMat);
    rightHand.position.y = -17;
    this.rightArm.add(rightHand);

    // 7. Legs & Shoes
    const thighGeo = new THREE.CylinderGeometry(4.2, 3.6, 17, 10);
    const shinGeo = new THREE.CylinderGeometry(3.6, 3.2, 17, 10);
    const shoeGeo = new THREE.BoxGeometry(8, 6.5, 16);
    const soleGeo = new THREE.BoxGeometry(8.4, 2, 16.4);
    const soleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });

    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(-6, -8, 0);
    this.pelvis.add(this.leftLeg);

    const leftThigh = new THREE.Mesh(thighGeo, this.skinMat);
    leftThigh.position.y = -8.5;
    leftThigh.castShadow = true;
    this.leftLeg.add(leftThigh);

    this.leftShin = new THREE.Group();
    this.leftShin.position.y = -17;
    this.leftLeg.add(this.leftShin);

    const leftShinMesh = new THREE.Mesh(shinGeo, this.skinMat);
    leftShinMesh.position.y = -8.5;
    leftShinMesh.castShadow = true;
    this.leftShin.add(leftShinMesh);

    const leftShoe = new THREE.Mesh(shoeGeo, this.shoesMat);
    leftShoe.position.set(0, -18, 2.5);
    leftShoe.castShadow = true;
    this.leftShin.add(leftShoe);

    const leftSole = new THREE.Mesh(soleGeo, soleMat);
    leftSole.position.set(0, -21.2, 2.5);
    this.leftShin.add(leftSole);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(6, -8, 0);
    this.pelvis.add(this.rightLeg);

    const rightThigh = new THREE.Mesh(thighGeo, this.skinMat);
    rightThigh.position.y = -8.5;
    rightThigh.castShadow = true;
    this.rightLeg.add(rightThigh);

    this.rightShin = new THREE.Group();
    this.rightShin.position.y = -17;
    this.rightLeg.add(this.rightShin);

    const rightShinMesh = new THREE.Mesh(shinGeo, this.skinMat);
    rightShinMesh.position.y = -8.5;
    rightShinMesh.castShadow = true;
    this.rightShin.add(rightShinMesh);

    const rightShoe = new THREE.Mesh(shoeGeo, this.shoesMat);
    rightShoe.position.set(0, -18, 2.5);
    rightShoe.castShadow = true;
    this.rightShin.add(rightShoe);

    const rightSole = new THREE.Mesh(soleGeo, soleMat);
    rightSole.position.set(0, -21.2, 2.5);
    this.rightShin.add(rightSole);

    // 8. Ground Contact Shadow Disc
    const shadowGeo = new THREE.CircleGeometry(22, 20);
    this.shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    this.shadowDisc = new THREE.Mesh(shadowGeo, this.shadowMat);
    this.shadowDisc.rotation.x = -Math.PI / 2;
    this.shadowDisc.position.y = 0.5;
    this.root.add(this.shadowDisc);

    // 9. Floating 3D Overhead Indicator Arrow
    const indGeo = new THREE.ConeGeometry(5, 10, 4);
    this.indicatorMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: false,
    });
    this.indicatorMesh = new THREE.Mesh(indGeo, this.indicatorMat);
    this.indicatorMesh.rotation.x = Math.PI; // pointing down
    this.indicatorMesh.position.y = 88;
    this.root.add(this.indicatorMesh);
  }

  private buildHair(style: CharacterDef['hairStyle']) {
    // Clear existing
    while (this.hairGroup.children.length > 0) {
      this.hairGroup.remove(this.hairGroup.children[0]);
    }

    if (style === 'spiky') {
      // Cluster of 7 sharp spikes
      for (let i = 0; i < 7; i++) {
        const coneGeo = new THREE.ConeGeometry(3.5, 10, 5);
        const spike = new THREE.Mesh(coneGeo, this.hairMat);
        const angle = (i * Math.PI * 2) / 7;
        spike.position.set(Math.cos(angle) * 5, 18, Math.sin(angle) * 4);
        spike.rotation.set(Math.sin(angle) * 0.4, 0, -Math.cos(angle) * 0.4);
        this.hairGroup.add(spike);
      }
      const centerSpike = new THREE.Mesh(new THREE.ConeGeometry(4, 12, 5), this.hairMat);
      centerSpike.position.set(0, 20, 0);
      this.hairGroup.add(centerSpike);
    } else if (style === 'ponytail') {
      const capGeo = new THREE.SphereGeometry(11, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
      const cap = new THREE.Mesh(capGeo, this.hairMat);
      cap.position.y = 11;
      this.hairGroup.add(cap);

      const tailGeo = new THREE.CylinderGeometry(2.5, 1, 18, 8);
      const tail = new THREE.Mesh(tailGeo, this.hairMat);
      tail.position.set(0, 14, -13);
      tail.rotation.x = -0.7;
      this.hairGroup.add(tail);
    } else if (style === 'afro' || style === 'curly') {
      const afroGeo = new THREE.DodecahedronGeometry(13.5, 1);
      const afro = new THREE.Mesh(afroGeo, this.hairMat);
      afro.position.set(0, 13, -1);
      this.hairGroup.add(afro);
    } else {
      // Short / neat hair cap
      const shortGeo = new THREE.SphereGeometry(11.2, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.6);
      const hairCap = new THREE.Mesh(shortGeo, this.hairMat);
      hairCap.position.y = 10.5;
      this.hairGroup.add(hairCap);
    }
  }

  public updateAppearance(char: CharacterDef) {
    this.skinMat.color.set(char.skinColor);
    this.jerseyMat.color.set(char.jerseyColor);
    this.shortsMat.color.set(char.shortsColor);
    this.shoesMat.color.set(char.shoesColor);
    this.hairMat.color.set(char.hairColor);
    this.buildHair(char.hairStyle);
  }

  public update(
    player: PlayerPhysics,
    time: number,
    isActive: boolean,
    isSecondActive: boolean = false,
    groundY: number = 560
  ) {
    // 1. Position mapping (X, Y inverted for 3D world where 0 is ground)
    const worldY = groundY - player.y; // 0 when on ground, positive when jumping
    this.root.position.x = player.x;
    this.pelvis.position.y = 42 + worldY;

    // Contact shadow sits exactly on the ground plane
    this.shadowDisc.position.x = 0;
    this.shadowDisc.position.y = 0.5;
    const heightFactor = Math.max(0.1, 1 - worldY / 260);
    this.shadowDisc.scale.set(heightFactor, heightFactor, 1);
    this.shadowMat.opacity = 0.35 * heightFactor;

    // 2. Facing orientation (smooth turn towards net)
    const targetRotY = player.facing === 1 ? Math.PI / 2 : -Math.PI / 2;
    this.root.rotation.y = targetRotY;

    // 3. Overhead Indicator
    if (isActive || isSecondActive) {
      this.indicatorMesh.visible = true;
      this.indicatorMat.color.set(isActive ? 0x38bdf8 : 0xf59e0b);
      this.indicatorMesh.position.y = this.pelvis.position.y + 44 + Math.sin(time * 6) * 3;
      this.indicatorMesh.rotation.y = time * 3;
    } else {
      this.indicatorMesh.visible = false;
    }

    // 4. Animate Articulated Body based on Action State
    const action = player.actionState;
    this.currentAction = action;

    // Reset default body angles
    this.root.rotation.z = 0;
    this.root.rotation.x = 0;
    this.torso.rotation.x = 0;
    this.torso.rotation.y = 0;
    this.torso.position.z = 0;

    if (action === 'BICYCLE') {
      // Full 3D upside down rotation in air!
      const flipAngle = Math.PI * 0.95;
      this.root.rotation.x = -flipAngle;
      this.leftLeg.rotation.x = -1.6;
      this.rightLeg.rotation.x = 1.2;
      this.leftArm.rotation.x = -1.8;
      this.rightArm.rotation.x = -1.8;
      this.headGroup.rotation.x = -0.5;
    } else if (action === 'SPIKE') {
      // Volleyball Spike jump & arm whip
      this.torso.rotation.x = -0.3;
      this.rightArm.rotation.x = -2.8; // raised high overhead
      this.rightArm.rotation.z = -0.3;
      this.leftArm.rotation.x = -1.0;
      this.leftLeg.rotation.x = 0.4;
      this.rightLeg.rotation.x = -0.6;
      this.leftShin.rotation.x = 0.6;
      this.rightShin.rotation.x = 0.8;
    } else if (action === 'HEADER') {
      // Lunging forward with forehead
      this.torso.rotation.x = 0.4;
      this.headGroup.rotation.x = 0.3;
      this.leftArm.rotation.x = -0.8;
      this.rightArm.rotation.x = -0.8;
      this.leftLeg.rotation.x = -0.3;
      this.rightLeg.rotation.x = 0.4;
    } else if (action === 'CHEST') {
      // Puffed chest cushion
      this.torso.position.z = 3;
      this.torso.rotation.x = -0.35;
      this.headGroup.rotation.x = -0.2;
      this.leftArm.rotation.z = 0.9;
      this.rightArm.rotation.z = -0.9;
      this.leftArm.rotation.x = 0.2;
      this.rightArm.rotation.x = 0.2;
    } else if (action === 'KICK') {
      // Powerful forward foot strike
      this.torso.rotation.x = -0.35;
      this.rightLeg.rotation.x = 1.5; // kick leg forward
      this.rightShin.rotation.x = 0.2;
      this.leftLeg.rotation.x = -0.5;
      this.leftArm.rotation.x = 0.8;
      this.rightArm.rotation.x = -1.2;
    } else if (!player.isGrounded) {
      // Standard in-air pose
      this.leftLeg.rotation.x = 0.5;
      this.rightLeg.rotation.x = -0.4;
      this.leftShin.rotation.x = 0.6;
      this.rightShin.rotation.x = 0.4;
      this.leftArm.rotation.x = -1.2;
      this.rightArm.rotation.x = -1.2;
    } else if (action === 'RUN') {
      // Athletic run stride
      const runCycle = Math.sin(time * 12);
      this.leftLeg.rotation.x = runCycle * 0.85;
      this.rightLeg.rotation.x = -runCycle * 0.85;
      this.leftShin.rotation.x = Math.max(0, -runCycle * 0.7);
      this.rightShin.rotation.x = Math.max(0, runCycle * 0.7);
      this.leftArm.rotation.x = -runCycle * 0.9;
      this.rightArm.rotation.x = runCycle * 0.9;
      this.torso.rotation.x = 0.15;
    } else {
      // IDLE breathing
      const breath = Math.sin(time * 3);
      this.torso.position.y = 8 + breath * 0.5;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftShin.rotation.x = 0;
      this.rightShin.rotation.x = 0;
      this.leftArm.rotation.x = breath * 0.1;
      this.rightArm.rotation.x = -breath * 0.1;
      this.leftArm.rotation.z = 0.2;
      this.rightArm.rotation.z = -0.2;
      this.headGroup.rotation.x = 0;
    }
  }

  public dispose() {
    this.skinMat.dispose();
    this.jerseyMat.dispose();
    this.shortsMat.dispose();
    this.shoesMat.dispose();
    this.hairMat.dispose();
    this.shadowMat.dispose();
    this.indicatorMat.dispose();
  }
}
