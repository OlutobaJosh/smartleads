'use client';

import { useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import * as THREE from 'three';

/* ─── Three.js Canvas ────────────────────────────────────────── */
const WovenCanvas = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const W = container.clientWidth || window.innerWidth;
    const H = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, W / H, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const mouse = new THREE.Vector2(0, 0);
    const clock = new THREE.Clock();

    // Reduce count on mobile for performance
    const isMobile = W < 768;
    const particleCount = isMobile ? 10_000 : 22_000;

    const positions      = new Float32Array(particleCount * 3);
    const origPositions  = new Float32Array(particleCount * 3);
    const colors         = new Float32Array(particleCount * 3);
    const velocities     = new Float32Array(particleCount * 3);

    const geometry  = new THREE.BufferGeometry();
    const torusKnot = new THREE.TorusKnotGeometry(1.5, 0.5, 200, 32);
    const srcPos    = torusKnot.attributes.position;

    for (let i = 0; i < particleCount; i++) {
      const vi = i % srcPos.count;
      const x  = srcPos.getX(vi) + (Math.random() - 0.5) * 0.08;
      const y  = srcPos.getY(vi) + (Math.random() - 0.5) * 0.08;
      const z  = srcPos.getZ(vi) + (Math.random() - 0.5) * 0.08;

      positions[i * 3]     = origPositions[i * 3]     = x;
      positions[i * 3 + 1] = origPositions[i * 3 + 1] = y;
      positions[i * 3 + 2] = origPositions[i * 3 + 2] = z;

      // Violet → indigo → periwinkle palette
      const color = new THREE.Color();
      color.setHSL(
        0.68 + Math.random() * 0.14,   // hue: 245°–295° (violet–indigo)
        0.80 + Math.random() * 0.15,   // high saturation
        0.50 + Math.random() * 0.28    // varied brightness
      );
      colors[i * 3]     = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

    const material = new THREE.PointsMaterial({
      size: 0.022,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const onMouseMove = (e: MouseEvent) => {
      mouse.x =  (e.clientX / window.innerWidth)  * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    let rafId: number;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      const mx = mouse.x * 3;
      const my = mouse.y * 3;

      for (let i = 0; i < particleCount; i++) {
        const ix = i * 3, iy = ix + 1, iz = ix + 2;

        const dx = positions[ix] - mx;
        const dy = positions[iy] - my;
        const dz = positions[iz];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;

        if (dist < 1.5) {
          const f = (1.5 - dist) * 0.007;
          velocities[ix] += (dx / dist) * f;
          velocities[iy] += (dy / dist) * f;
          velocities[iz] += (dz / dist) * f;
        }

        // Spring back to origin
        velocities[ix] += (origPositions[ix] - positions[ix]) * 0.0012;
        velocities[iy] += (origPositions[iy] - positions[iy]) * 0.0012;
        velocities[iz] += (origPositions[iz] - positions[iz]) * 0.0012;

        // Damping
        velocities[ix] *= 0.94;
        velocities[iy] *= 0.94;
        velocities[iz] *= 0.94;

        positions[ix] += velocities[ix];
        positions[iy] += velocities[iy];
        positions[iz] += velocities[iz];
      }

      geometry.attributes.position.needsUpdate = true;
      points.rotation.y = t * 0.055;
      points.rotation.x = Math.sin(t * 0.018) * 0.12;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nW = container.clientWidth;
      const nH = container.clientHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      torusKnot.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 z-0" />;
};

/* ─── Hero Section ───────────────────────────────────────────── */
interface WovenHeroSectionProps {
  onScrollToForm: () => void;
}

export function WovenHeroSection({ onScrollToForm }: WovenHeroSectionProps) {
  const textControls   = useAnimation();
  const buttonControls = useAnimation();

  useEffect(() => {
    // Load Playfair Display exactly as the reference component does
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&display=swap';
    link.rel  = 'stylesheet';
    document.head.appendChild(link);

    textControls.start(i => ({
      opacity: 1,
      y: 0,
      transition: {
        delay:    i * 0.038 + 1.0,
        duration: 1.1,
        ease:     [0.2, 0.65, 0.3, 0.9],
      },
    }));

    buttonControls.start({
      opacity: 1,
      transition: { delay: 2.4, duration: 0.9 },
    });

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, [textControls, buttonControls]);

  const line1 = 'Every inquiry';
  const line2 = 'scored in seconds.';

  // Offset custom index so line2 starts after line1 for staggered delay
  const line1CharCount = line1.replace(/ /g, '').length;

  return (
    <section className="relative flex min-h-[calc(100vh-57px)] w-full flex-col items-center justify-center overflow-hidden bg-[#06060e]">
      <WovenCanvas />

      {/* Soft radial glow behind text */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 50% 52%, rgba(139,92,246,0.13) 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-4 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="font-mono text-xs text-accent/80">
            AI-powered lead qualification
          </span>
        </motion.div>

        {/* Headline – letter-by-letter animation from WovenLightHero */}
        <h1
          className="mb-0 text-5xl font-bold leading-tight sm:text-7xl md:text-8xl"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {/* Line 1 — white */}
          <span className="mb-1 block">
            {line1.split(' ').map((word, wi) => (
              <span key={wi} className="mr-[0.25em] inline-block last:mr-0">
                {word.split('').map((char, ci) => (
                  <motion.span
                    key={`l1-${wi}-${ci}`}
                    custom={wi * 7 + ci}
                    initial={{ opacity: 0, y: 55 }}
                    animate={textControls}
                    className="inline-block text-white"
                    style={{ textShadow: '0 0 40px rgba(139,92,246,0.35)' }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
          </span>

          {/* Line 2 — violet gradient */}
          <span className="block">
            {line2.split(' ').map((word, wi) => (
              <span key={wi} className="mr-[0.25em] inline-block last:mr-0">
                {word.split('').map((char, ci) => {
                  const globalIdx = line1CharCount + wi * 7 + ci + 6;
                  return (
                    <motion.span
                      key={`l2-${wi}-${ci}`}
                      custom={globalIdx}
                      initial={{ opacity: 0, y: 55 }}
                      animate={textControls}
                      className="inline-block"
                      style={{
                        background:
                          'linear-gradient(135deg, #a78bfa 0%, #818cf8 50%, #c4b5fd 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {char}
                    </motion.span>
                  );
                })}
              </span>
            ))}
          </span>
        </h1>

        {/* Subtitle */}
        <motion.p
          custom={line1CharCount + line2.replace(/ /g, '').length + 12}
          initial={{ opacity: 0, y: 28 }}
          animate={textControls}
          className="mx-auto mt-6 max-w-md text-base leading-relaxed text-white/45"
          style={{ fontFamily: 'var(--font-geist-sans, Inter, sans-serif)' }}
        >
          SmartLeads reads inbound project inquiries, scores them against
          intent, budget, and urgency — then fires the right reply
          automatically. No manual triage needed.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={buttonControls}
          className="mt-10"
        >
          <button
            type="button"
            onClick={onScrollToForm}
            className="rounded-full border border-white/15 bg-white/7 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-accent/40 hover:bg-white/12"
            style={{ fontFamily: 'var(--font-geist-sans, Inter, sans-serif)' }}
          >
            See it live ↓
          </button>
        </motion.div>
      </div>
    </section>
  );
}
