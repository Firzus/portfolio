// Music and sound effects synthesized with the Web Audio API, so no audio file
// (and no licence) is involved: a low room hum for the real world, a slow
// chord for the virtual one, and short cues for the headset and the controls.

export function createAudio() {
  let ctx = null;
  let master, roomBus, worldBus;
  let enabled = false;

  function init() {
    if (ctx) return;
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    roomBus = ctx.createGain();
    worldBus = ctx.createGain();
    roomBus.gain.value = 1;
    worldBus.gain.value = 0;
    roomBus.connect(master);
    worldBus.connect(master);

    // Room: filtered brown noise, like a computer fan and the city outside.
    const noise = ctx.createBufferSource();
    noise.buffer = brownNoise(ctx, 4);
    noise.loop = true;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 380;
    const roomGain = ctx.createGain();
    roomGain.gain.value = 0.22;
    noise.connect(lowpass).connect(roomGain).connect(roomBus);
    noise.start();

    // World: a slow minor chord of detuned saws through a soft filter.
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.6;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 420;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    const padGain = ctx.createGain();
    padGain.gain.value = 0.05;
    filter.connect(padGain).connect(worldBus);
    for (const freq of [110, 130.81, 164.81, 220, 246.94]) {
      for (const detune of [-7, 7]) {
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.value = freq;
        osc.detune.value = detune;
        osc.connect(filter);
        osc.start();
      }
    }
  }

  function ramp(param, value, seconds) {
    const now = ctx.currentTime;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(value, now + seconds);
  }

  function blip(freq, duration = 0.12, gain = 0.08, type = "sine") {
    if (!enabled || !ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.connect(g).connect(master);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  function sweep(from, to, duration, gain = 0.25) {
    if (!enabled || !ctx) return;
    const src = ctx.createBufferSource();
    src.buffer = brownNoise(ctx, duration);
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 1.2;
    band.frequency.setValueAtTime(from, ctx.currentTime);
    band.frequency.exponentialRampToValueAtTime(to, ctx.currentTime + duration);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + duration * 0.6);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    src.connect(band).connect(g).connect(master);
    src.start();
  }

  return {
    get enabled() {
      return enabled;
    },
    /** Must run inside a user gesture: browsers only start audio after one. */
    setEnabled(on) {
      enabled = on;
      if (on) {
        init();
        ctx.resume();
        ramp(master.gain, 0.9, 0.8);
      } else if (ctx) {
        ramp(master.gain, 0, 0.3);
      }
    },
    world(on) {
      if (!ctx) return;
      ramp(worldBus.gain, on ? 1 : 0, on ? 2.5 : 1.2);
      ramp(roomBus.gain, on ? 0.15 : 1, 1.5);
    },
    headsetOn() {
      sweep(200, 2400, 1.6);
      setTimeout(() => blip(880, 0.5, 0.06, "triangle"), 1700);
      setTimeout(() => blip(1320, 0.7, 0.05, "triangle"), 1850);
    },
    headsetOff() {
      sweep(2400, 180, 1.2, 0.2);
    },
    tick() {
      blip(1600, 0.05, 0.03);
    },
    open() {
      blip(660, 0.18, 0.05, "triangle");
    },
  };
}

function brownNoise(ctx, seconds) {
  const length = Math.ceil(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}
