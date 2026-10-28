import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import fs from 'fs';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read('orig.glb');
const cp = doc.getRoot().listMaterials().find(m=>m.getName().startsWith('EXT_Carpaint'));
const t = cp.getBaseColorTexture(); if(t) fs.writeFileSync('tex/carpaint_base.png', t.getImage());
