// Procedural V10 engine loop (no audio files). Instead of oscillators it builds a loop of real-looking
// combustion events: 10 cylinders (72° apart, 5 firings per crank revolution), each with its own strength and
// timing error, a noisy "crack" + a low body thump, pushed through a pair of exhaust-pipe resonances.
export function makeEngineLayer(sr, rpmRef, tone) {
  const revT = 60 / rpmRef, revs = Math.max(4, Math.round(0.8 / revT) & ~1);       // even number of revs -> whole 4-stroke cycles loop cleanly
  const N = Math.round(revs * revT * sr), out = new Float32Array(N);
  let seed = 1337 + Math.round(rpmRef); const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const cylAmp = Array.from({ length: 10 }, () => 0.82 + rnd() * 0.36), cylJit = Array.from({ length: 10 }, () => (rnd() - 0.5) * 0.018);
  const per = revT / 5;                                                             // seconds between firings
  const tauCrack = tone.crack, tauBody = tone.body, fBody = tone.fBody;
  for (let p = 0; p < revs * 5; p++) {
    const c = p % 10, t0 = (p * per + cylJit[c] * per) * sr, amp = cylAmp[c] * (0.9 + rnd() * 0.2);
    const len = Math.min(N, Math.round(sr * (tauBody * 6)));
    for (let k = 0; k < len; k++) {
      const t = k / sr, i = (Math.round(t0) + k + N) % N;
      const crack = (rnd() * 2 - 1) * Math.exp(-t / tauCrack) * tone.aCrack;
      const body = Math.sin(2 * Math.PI * fBody * t) * Math.exp(-t / tauBody) * tone.aBody;
      const thump = Math.sin(2 * Math.PI * fBody * 0.5 * t + 0.6) * Math.exp(-t / (tauBody * 1.8)) * tone.aBody * 0.5;
      out[i] += (crack + body + thump) * amp;
    }
  }
  // exhaust resonances (circular combs, run a few passes so the tail wraps around the loop)
  const comb = (x, d, g) => { const y = new Float32Array(N); for (let pass = 0; pass < 3; pass++) for (let n = 0; n < N; n++) y[n] = x[n] + g * y[(n - d + N) % N]; return y; };
  const c1 = comb(out, Math.round(sr * tone.pipe1), 0.55), c2 = comb(out, Math.round(sr * tone.pipe2), 0.4);
  for (let n = 0; n < N; n++) out[n] = out[n] * 0.5 + c1[n] * 0.7 + c2[n] * 0.5;
  // tone shaping: two one-pole low-passes (wrapped), remove DC
  const a = 1 - Math.exp(-2 * Math.PI * tone.cut / sr);
  for (let pass = 0; pass < 2; pass++) { let y = out[N - 1]; for (let w = 0; w < 2; w++) for (let n = 0; n < N; n++) { y += a * (out[n] - y); if (w) out[n] = y; } }
  let mean = 0; for (let n = 0; n < N; n++) mean += out[n]; mean /= N;
  let rms = 0; for (let n = 0; n < N; n++) { out[n] -= mean; rms += out[n] * out[n]; } rms = Math.sqrt(rms / N) || 1;
  for (let n = 0; n < N; n++) out[n] = Math.tanh((out[n] / rms) * tone.drive) * 0.9;     // normalise loudness + gentle saturation
  return out;
}
export const ENGINE_LAYERS = [
  { ref: 2400, tone: { crack: 0.0016, aCrack: 0.8, body: 0.013, aBody: 1.0, fBody: 95, pipe1: 0.0021, pipe2: 0.0054, cut: 2600, drive: 1.5 } },    // burbling low end
  { ref: 5200, tone: { crack: 0.0012, aCrack: 1.2, body: 0.008, aBody: 0.55, fBody: 140, pipe1: 0.0016, pipe2: 0.0042, cut: 5200, drive: 1.2 } },     // mid
  { ref: 8200, tone: { crack: 0.0010, aCrack: 2.2, body: 0.005, aBody: 0.22, fBody: 210, pipe1: 0.0012, pipe2: 0.0031, cut: 9500, drive: 0.8 } },    // screaming top end
];
