import * as THREE from "three";

// Two meshes for every skin: kind "elf" (pointed friend) and "cookie" (treat).
// Themes tint them with find.color. Shared geometries keep seven AR characters cheap.
export function makeFindModel(find) {
  const group = new THREE.Group();
  const materials = new Map();
  const material = (color, glow = false) => {
    const key = `${color}:${glow}`;
    if (!materials.has(key))
      materials.set(
        key,
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.72,
          emissive: glow ? color : "#000000",
          emissiveIntensity: glow ? 0.55 : 0,
        }),
      );
    return materials.get(key);
  };
  const part = (
    geometry,
    color,
    position,
    scale = [1, 1, 1],
    parent = group,
    glow = false,
  ) => {
    const mesh = new THREE.Mesh(geometry, material(color, glow));
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    parent.add(mesh);
    return mesh;
  };
  const sphere = new THREE.SphereGeometry(1, 20, 14);
  const skin = "#f2cca0";
  if (find.kind === "elf") {
    part(sphere, "#513b29", [-0.19, 0.1, 0], [0.19, 0.1, 0.27]);
    part(sphere, "#513b29", [0.19, 0.1, 0], [0.19, 0.1, 0.27]);
    part(
      new THREE.CylinderGeometry(0.22, 0.35, 0.53, 18),
      find.color,
      [0, 0.42, 0],
    );
    part(
      new THREE.CylinderGeometry(0.32, 0.33, 0.07, 18),
      "#735335",
      [0, 0.28, 0],
    );
    part(new THREE.BoxGeometry(0.12, 0.1, 0.04), "#ebc265", [0, 0.28, 0.33]);
    part(sphere, skin, [0, 0.99, 0], [0.36, 0.35, 0.31]);
    part(sphere, "#b2733e", [0, 1.16, -0.07], [0.365, 0.22, 0.29]);
    [-1, 1].forEach((side) => {
      const ear = part(new THREE.ConeGeometry(0.13, 0.37, 12), skin, [
        side * 0.4,
        1.02,
        0,
      ]);
      ear.rotation.z = -side * 1.05;
      part(sphere, "#172b22", [side * 0.13, 1.03, 0.291], [0.032, 0.05, 0.025]);
      part(
        sphere,
        "#ffffff",
        [side * 0.13 + 0.009, 1.047, 0.312],
        [0.009, 0.012, 0.008],
      );
      part(
        sphere,
        "#e9a08d",
        [side * 0.235, 0.925, 0.24],
        [0.075, 0.034, 0.017],
      );
    });
    part(sphere, "#dda77e", [0, 0.94, 0.318], [0.05, 0.035, 0.04]);
    const smile = part(
      new THREE.TorusGeometry(0.075, 0.011, 6, 16, Math.PI),
      "#894d36",
      [0, 0.89, 0.3],
    );
    smile.rotation.z = Math.PI;
    const hat = part(
      new THREE.ConeGeometry(0.38, 0.73, 22),
      find.color,
      [0, 1.54, -0.02],
    );
    hat.rotation.z = -0.16;
    part(
      new THREE.TorusGeometry(0.33, 0.065, 8, 22),
      find.color,
      [0, 1.22, 0],
    ).rotation.x = Math.PI / 2;
    part(
      sphere,
      "#f8d875",
      [0.06, 1.91, -0.02],
      [0.075, 0.075, 0.075],
      group,
      true,
    );
    const arm = new THREE.Group();
    arm.position.set(0.29, 0.66, 0);
    group.add(arm);
    part(
      new THREE.CapsuleGeometry(0.075, 0.28, 4, 10),
      find.color,
      [0.12, -0.04, 0],
      [1, 1, 1],
      arm,
    ).rotation.z = 0.9;
    part(sphere, skin, [0.27, 0.01, 0], [0.085, 0.095, 0.08], arm);
    group.userData.arm = arm;
    part(
      new THREE.CapsuleGeometry(0.08, 0.27, 4, 10),
      find.color,
      [-0.34, 0.5, 0],
    ).rotation.z = -0.5;
    part(sphere, skin, [-0.4, 0.33, 0], [0.08, 0.09, 0.08]);
    group.scale.setScalar(0.8);
  } else {
    const cookie = new THREE.Group();
    group.add(cookie);
    part(
      new THREE.CylinderGeometry(0.42, 0.44, 0.13, 32),
      "#dc9d50",
      [0, 0.55, 0],
      [1, 1, 1],
      cookie,
    ).rotation.x = Math.PI / 2;
    [
      [-0.18, 0.69],
      [0.18, 0.71],
      [-0.24, 0.45],
      [0.07, 0.51],
      [0.14, 0.28],
      [-0.13, 0.32],
    ].forEach(([x, y]) => {
      part(
        new THREE.DodecahedronGeometry(0.065),
        find.id === 2 ? "#92445c" : "#694631",
        [x, y, 0.08],
        [1, 0.9, 0.45],
        cookie,
      );
    });
    group.userData.cookie = cookie;
  }
  const ring = part(
    new THREE.TorusGeometry(0.59, 0.018, 6, 44),
    "#eed28c",
    [0, 0.02, 0],
    [1, 1, 1],
    group,
    true,
  );
  ring.rotation.x = Math.PI / 2;
  const sparks = new THREE.Group();
  group.add(sparks);
  for (let i = 0; i < 7; i++) {
    const theta = (i * Math.PI * 2) / 7;
    part(
      new THREE.OctahedronGeometry(0.026),
      "#ffe6a5",
      [Math.cos(theta) * 0.64, 0.3 + (i % 3) * 0.3, Math.sin(theta) * 0.64],
      [1, 1, 1],
      sparks,
      true,
    );
  }
  // Center the portrait around its marker, rather than growing toward the lens
  // when a player scans a card mounted vertically.
  const centerY = find.kind === "elf" ? -0.78 : -0.55;
  group.position.y = centerY;
  group.userData.animate = (time, reduced) => {
    if (reduced) return;
    sparks.rotation.y = time * 0.35;
    group.position.y = centerY + Math.sin(time * 2) * 0.025;
    if (group.userData.arm)
      group.userData.arm.rotation.z = Math.sin(time * 3) * 0.3;
    if (group.userData.cookie)
      group.userData.cookie.rotation.y = Math.sin(time) * 0.3;
  };
  return group;
}
