# Spark's Journal

* **The Holographic Card Lift:** Found that adding `hover:border-[#00F0FF]/40` (translucent cyan) combined with `hover:-translate-y-1` (lift) and `active:scale-[0.99]` (press) creates a satisfying "data pad" interaction for `ObservationCard`. It feels tactile without being distracting. The subtle image zoom (`scale-105`) adds depth.

* **The Radar Pulse:** Swapped the generic spinner for a custom CSS "Radar Sweep" (`conic-gradient` + `animate-spin`). It significantly boosts the "Phenom" vibe. Found that `opacity-40` for the sweep and `opacity-20` for crosshairs keeps it subtle enough for repeated use. The pulsing blip (`animate-pulse`) anchors the chaotic rotation nicely.
