/**
 * The SVG filters of the liquid effects, rendered once per document; elements point at them with
 * `filter: url(#…)`. The goo filter blurs, then thresholds alpha hard, so two nearby shapes merge
 * into one drop. The ripple displaces a picture by a noise whose strength fluid.ts animates.
 */
export function FluidDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <defs>
        <filter id="fluid-goo" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10"
          />
        </filter>
        <filter id="fluid-ripple" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            data-slot="ripple-noise"
            type="fractalNoise"
            baseFrequency="0.012 0.02"
            numOctaves="2"
            seed="4"
            result="noise"
          />
          <feDisplacementMap
            data-slot="ripple-map"
            in="SourceGraphic"
            in2="noise"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
