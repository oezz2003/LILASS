
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

export function ProductViewer({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <primitive object={scene} />
      <OrbitControls />
    </Canvas>
  );
}
