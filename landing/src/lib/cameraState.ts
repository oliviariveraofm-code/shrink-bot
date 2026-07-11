// Shared, mutable — updated once per frame by CameraRig, read by any
// set-piece that wants to skip its own per-frame work when it's far
// outside the camera's current world position (cheap CPU-side culling;
// three.js already frustum-culls the GPU side, this saves the JS work).
export const cameraState = { worldY: 0 };
