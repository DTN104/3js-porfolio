import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PerspectiveCamera, Vector3 } from 'three'
import { islands, bridges, islandSpawn, surfaceAt, bridgeY, zones } from './src/content.js'
import { frameForPanel } from './src/camera.js'
import { input, attachInput, freezeInput } from './src/input.js'

// Every quick-travel landing stays on its island and outside the building.
for (const island of islands) {
  const [x, y, z] = islandSpawn(island)
  assert.equal(surfaceAt(x, z).id, island.id)
  assert.equal(y, island.y)
  assert.ok(Math.hypot(x - island.pos[0], z - island.pos[1]) > island.or + 0.55)
}
for (const bridge of bridges) {
  assert.equal(bridgeY(bridge, 0), bridge.fromY)
  assert.equal(bridgeY(bridge, 1), bridge.toY)
  assert.equal(bridgeY(bridge, 1.8 / bridge.len), bridge.fromY)
  assert.equal(bridgeY(bridge, 1 - 1.8 / bridge.len), bridge.toY)
  assert.equal(surfaceAt((bridge.from[0] + bridge.to[0]) / 2, (bridge.from[1] + bridge.to[1]) / 2).id, bridge.id)
  assert.equal(surfaceAt(...bridge.from).id, islands[bridge.a].id)
  assert.equal(surfaceAt(...bridge.to).id, islands[bridge.b].id)
  const glb = readFileSync(new URL(`./public/models/bridges/${bridge.id}.glb`, import.meta.url))
  const json = JSON.parse(glb.toString('utf8', 20, 20 + glb.readUInt32LE(12)))
  const deck = json.accessors[json.meshes[0].primitives[0].attributes.POSITION]
  assert.ok(Math.abs(deck.min[2] + deck.max[2] - bridge.len) < 0.01)
  const view = json.bufferViews[deck.bufferView]
  const offset = 28 + glb.readUInt32LE(12) + (view.byteOffset || 0) + (deck.byteOffset || 0)
  const shoreIsLevel = (z, y) => Array.from({ length: deck.count }, (_, i) => offset + i * (view.byteStride || 12))
    .some(i => Math.abs(Math.abs(glb.readFloatLE(i)) - 1.15) < 0.01 &&
      Math.abs(glb.readFloatLE(i + 8) - z) < 0.22 && Math.abs(glb.readFloatLE(i + 4) - y) < 0.04)
  assert.ok(shoreIsLevel(1.8, 0) && shoreIsLevel(bridge.len - 1.8, bridge.toY - bridge.fromY))
}
const narrowIsland = islands[3]
assert.equal(surfaceAt(narrowIsland.pos[0], narrowIsland.pos[1] + narrowIsland.top[1]).ok, false)

// Each project can be shown as a three-chapter projection in both languages.
assert.ok(zones['du-an'].projects.length > 0)
for (const project of zones['du-an'].projects) {
  assert.ok(project.title && project.summary)
  if (project.projection) {
    assert.equal(project.projection.length, 3)
    for (const chapter of project.projection) assert.ok(chapter.vi && chapter.en)
  }
}

// The focused object projects to the center of the visible scene, not the full screen.
for (const [width, height, right, bottom] of [[1440,900,434,0],[884,771,434,0],[390,844,0,489]]) {
  const frame = frameForPanel(width, height, right, bottom, 3.3, 38)
  const camera = new PerspectiveCamera(38, width / height, 0.1, 1000)
  camera.position.z = frame.distance
  camera.setViewOffset(width, height, frame.offsetX, frame.offsetY, width, height)
  camera.updateMatrixWorld()
  const center = new Vector3().project(camera)
  assert.ok(Math.abs(center.x + right / width) < 1e-6)
  assert.ok(Math.abs(center.y - bottom / height) < 1e-6)
  const left = new Vector3(-3.3 * 1.4, 0, 0).project(camera)
  const rightEdge = new Vector3(3.3 * 1.4, 0, 0).project(camera)
  assert.ok(left.x > -1 && rightEdge.x < 1 - 2 * right / width)
}

// Real input handlers: movement works, and modal freeze prevents interactions/movement.
globalThis.window = new EventTarget()
globalThis.document = new EventTarget()
let interactions = 0
const detach = attachInput({ onInteract: () => interactions++ })
const key = (type, code) => {
  const event = new Event(type, { cancelable: true })
  Object.defineProperty(event, 'code', { value: code })
  window.dispatchEvent(event)
}
freezeInput(false)
key('keydown', 'KeyW')
assert.equal(input.move().y, 1)
key('keydown', 'KeyD')
assert.ok(Math.abs(Math.hypot(input.move().x, input.move().y) - 1) < 1e-10)
freezeInput(true)
key('keydown', 'KeyE')
assert.equal(interactions, 0)
assert.deepEqual(input.move(), { x: 0, y: 0 })
freezeInput(false)
key('keydown', 'KeyE')
assert.equal(interactions, 1)
detach()

// The playable character must keep its skin and three skeletal motion clips.
const avatar = readFileSync(new URL('./public/models/character/DatAnimated.glb', import.meta.url))
assert.equal(avatar.toString('ascii', 0, 4), 'glTF')
const avatarJson = JSON.parse(avatar.toString('utf8', 20, 20 + avatar.readUInt32LE(12)))
assert.ok(avatarJson.skins?.length)
assert.deepEqual(avatarJson.animations.map(a => a.name).sort(), ['Idle', 'Run', 'Walk'])
for (const animation of avatarJson.animations) {
  assert.ok(animation.channels.some(c => c.target.path === 'rotation'))
}
console.log('PASS: island travel, bridge continuity, drawer framing, movement, modal freeze and animated avatar')
