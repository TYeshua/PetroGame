import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { shaderMaterial, ScreenQuad } from '@react-three/drei';
import * as THREE from 'three';
import { useRef } from 'react';
import { useScroll, useTransform } from 'framer-motion';

// --- GLSL SHADER CODE ---
const CascadeShaderMaterial = shaderMaterial(
  // Uniforms
  {
    uTime: 0,
    uProgress: 0,
    uColorStart: new THREE.Color('#2a0000'),
    uColorEnd: new THREE.Color('#ff1a1a'),
    uResolution: new THREE.Vector2(1, 1),
  },
  // Vertex Shader
  /*glsl*/ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader Corrigido
  /*glsl*/ `
    uniform float uTime;
    uniform float uProgress;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    uniform vec2 uResolution;
    varying vec2 vUv;

    // --- FUNÇÕES DE RUÍDO (Simplex Noise 2D) ---
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                          0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                         -0.577350269189626,  // -1.0 + 2.0 * C.x
                          0.024390243902439); // 1.0 / 41.0
      // First corner
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v - i + dot(i, C.xx);

      // Other corners
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;

      // Permutations
      i = mod289(i); // Avoid truncation effects in permutation
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));

      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;

      // Gradients
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;

      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

      // Compute final noise value at P
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    // --- FUNÇÃO PRINCIPAL ---
    void main() {
      vec2 uv = vUv;
      float aspect = uResolution.x / uResolution.y;
      
      float scrollPos = 1.0 - uProgress; 
      
      float noiseWave = snoise(vec2(uv.x * 4.0, uTime * 0.1 + scrollPos)) * 0.15;
      float waveCenter = scrollPos + noiseWave;

      float distToWave = uv.y - waveCenter;
      
      float scanline = smoothstep(0.02, 0.0, abs(distToWave)) * 1.5;
      float trail = smoothstep(0.5, 0.0, distToWave) * step(0.0, distToWave);

      float baseNoise = snoise(vec2(uv.x * 8.0, uv.y * 4.0 - uTime * 0.2));
      baseNoise = smoothstep(0.2, 0.8, baseNoise) * 0.15;

      vec3 finalColor = mix(vec3(0.0), uColorStart, baseNoise);
      finalColor = mix(finalColor, uColorStart * 1.2, trail * 0.6);
      finalColor += uColorEnd * pow(scanline, 3.0);

      float vignette = 1.0 - smoothstep(0.5, 1.5, length(uv - 0.5));
      finalColor *= vignette;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ CascadeShaderMaterial });

function Scene({ scrollProgress }: { scrollProgress: any }) {
  const materialRef = useRef<any>(null);
  const { size } = useThree();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.getElapsedTime();
      materialRef.current.uProgress = scrollProgress.get();
      // uResolution espera um Vector2, então passamos x e y individualmente
      materialRef.current.uResolution.set(size.width, size.height);
    }
  });

  return (
    <ScreenQuad>
      {/* @ts-ignore */}
      <cascadeShaderMaterial ref={materialRef} transparent={false} />
    </ScreenQuad>
  );
}

export function EnergyCascadeBackground() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useTransform(scrollYProgress, v => v);

  return (
    <div className="fixed inset-0 z-[-1] bg-black">
      <Canvas
        gl={{ 
          antialias: false,
          powerPreference: "high-performance"
        }}
        dpr={[1, 1.5]}
      >
        <Scene scrollProgress={smoothProgress} />
      </Canvas>
    </div>
  );
}