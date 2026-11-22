# 3D Asset Inventory & Technical Optimization Plan
**Project:** Premium Immersive 3D Cafe Commerce Platform  
**Document:** `docs/3d-asset-inventory.md`  
**Date:** November 22, 2026  
**Status:** Audit Complete — Phase 0  

---

## 1. Executive Summary & Asset Scan Scope

A comprehensive scan of the workspace `/Users/apple/Desktop/Manan/Cafex` and user downloads was conducted to identify all candidate 3D assets, assess their geometry, materials, licenses, and determine their web readiness.

### Scan Results:
- **Workspace Directory (`/Users/apple/Desktop/Manan/Cafex`):** No 3D files originally resided in the workspace folder.
- **Downloaded Archives Located:** `/Users/apple/Downloads/coffee_mug_school_project.zip` (603 KB compressed, 621 KB uncompressed) was identified as the relevant cafe 3D model.
- **Other 3D Files in User Space:** Located footwear models (`footwear_fantasia`, `scanned_adidas_sports_shoe`, `moon_shoes`) in `/Users/apple/Downloads` and `/Users/apple/Desktop/Demo-ecom`. Confirmed as unrelated and excluded.

---

## 2. 3D Asset Master Inventory Table

| Asset Name | Format | Original Size | Triangles / Polys | Textures & Materials | Animations | Orientation & Pivot | Intended Usage | Optimization Needed | Commercial License Status | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| **Coffee Mug (School Project)** | glTF 2.0 (`.gltf` + `.bin` + PNGs) | 621.7 KB uncompressed (603 KB zip) | **1,032 triangles** (Mug: 992, Coffee: 40) | 2 Materials (`material` base, `Coffee` PBR). 2 PNG textures (BaseColor 428KB, MetallicRoughness 155KB) | None (Static) | **Offset:** bounds center `[8.07, 26.75, -8.14]`. Needs translation to `(0,0,0)` and scale normalization. | **Hero Section** (Signature 3D branded cup showcase) & **Menu Detail Modal** | Re-center pivot, combine into single binary `.glb`, compress textures to WebP/KTX2, apply Draco geometry compression (~180 KB target). | **CC-BY-4.0** (Author: Ole Gunnar Isager). Commercial use permitted with attribution. | **Audited & Approved for Web Pipeline** |
| **Coffee Beans (Ambient / Particles)** | Procedural Instanced Mesh (Three.js) | ~20 KB (procedural geometry) | ~240 triangles per bean (instanced x 40 = 9,600 tris total in 1 draw call) | 1 Matcap / Physical PBR material with dark roast roughness map | Procedural floating float/drift via vertex shader / RAF | Centered at origin `(0,0,0)` | **Hero Background & Brand Story** (Cinematic floating bean depth effect) | Use GPU instancing (`InstancedMesh`) to render multiple floating beans in a single draw call. | Public Domain / Custom Procedural Code | **Planned for Phase 3** |
| **Pastry / Croissant Model** | *Pending Sourcing* | TBD (Target < 2 MB) | Target < 15,000 triangles | PBR Albedo + Normal + Roughness (1024x1024) | None | Centered | **Signature Desserts / Menu Feature** | Draco compression, WebP texture encoding | Requires CC0 or verified commercial license before integration | **Pending Owner Supply / Selection** |
| **Cafe Environment / Diorama** | *Optional Phase 3/8* | TBD | Target < 45,000 triangles | Baked lighting texture map (2048x2048) | None / Subtle dust particles | Centered | **Cafe Experience / Atmosphere Section** | Baked shadows to avoid costly dynamic realtime shadows | Requires CC0 or verified commercial license | **Deferred (Blueprint Recommends Focus on Hero Cup First)** |

---

## 3. Deep Technical Inspection: `coffee_mug_school_project`

A Python-based binary and JSON inspection of `scene.gltf` and its associated buffers revealed:

```json
{
  "asset": {
    "version": "2.0",
    "generator": "Sketchfab-12.63.0",
    "title": "Coffee Mug (School Project)",
    "author": "Ole Gunnar Isager (https://sketchfab.com/FrenchBaguette)",
    "license": "CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)",
    "source": "https://sketchfab.com/3d-models/coffee-mug-school-project-5f5ccee1514c440887c072fae8e0d699"
  },
  "nodes": 6,
  "meshes": [
    {
      "name": "Mug1_Mug_0",
      "primitives": [{"attributes": ["NORMAL", "POSITION", "TEXCOORD_0"], "triangles": 992}],
      "bounds": {"min": [6.68, 25.29, -9.73], "max": [9.46, 28.21, -6.56]}
    },
    {
      "name": "Mug1_Coffee_0",
      "primitives": [{"attributes": ["NORMAL", "POSITION", "TEXCOORD_0"], "triangles": 40}],
      "bounds": {"min": [6.99, 27.65, -9.03], "max": [9.34, 27.65, -6.67]}
    }
  ],
  "materials": [
    {
      "name": "material",
      "baseColorFactor": [0.948, 0.948, 0.948, 1.0],
      "metallicFactor": 0.0,
      "roughnessFactor": 0.038
    },
    {
      "name": "Coffee",
      "metallicFactor": 0.0,
      "roughnessFactor": 0.178,
      "baseColorTexture": "Coffee_baseColor.png",
      "metallicRoughnessTexture": "Coffee_metallicRoughness.png"
    }
  ]
}
```

### Key Technical Observations & Remediation:
1. **Low Polygon Efficiency:** At only 1,032 triangles total, this model is exceptionally well-suited for high-framerate rendering across all devices, including mid-range Android smartphones and older iPads.
2. **Material Separation:** The ceramic mug body uses a clean white base color with very low roughness (`0.038`), giving it a realistic glossy ceramic finish. The coffee surface uses a dedicated PBR texture showing liquid surface tension and coffee crema reflection.
3. **Offset Coordinates:** In raw FBX/glTF coordinates, the model is situated at $X \approx 8.07, Y \approx 26.75, Z \approx -8.14$. If loaded without compensation, it will render completely outside the camera's default viewport.  
   *Remediation:* During conversion (or in R3F using `@react-three/drei`'s `<Center />`), the geometry must be translated so that its geometric center sits at `(0, 0, 0)` and its scale is normalized to standard real-world dimensions (approx. 0.10 meters height).
4. **Licensing Compliance:** Model is distributed under **CC-BY-4.0**. To comply with legal requirements:
   - Include credits in website footer / brand colophon:  
     *"3D Coffee Mug model by Ole Gunnar Isager (FrenchBaguette) licensed under CC-BY-4.0."*
   - Documented in source code comments and `docs/credits.md`.

---

## 4. Website Section to Asset Mapping

Following the guidance in Section 5 of the master prompt and Section 5.2 of the blueprint:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. HERO SECTION                                                        │
│ - Primary 3D Canvas: Interactive Coffee Cup (Optimized GLB)            │
│ - Ambient Depth: Instanced floating coffee beans (GPU-instanced)       │
│ - Scroll Trigger: Smooth rotation & slight tilt downward as user       │
│   scrolls towards the menu preview.                                    │
│ - Fallback: WebP high-resolution poster with warm studio lighting      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. SIGNATURE SELECTION / MENU                                          │
│ - Primary presentation: High-fidelity editorial photographs            │
│ - Interactive 3D Modal: "Inspect in 3D" button for the signature       │
│   house blend / signature beverage using the 3D model viewer           │
│ - Performance guarantee: Only one WebGL canvas mounted at a time      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. BRAND STORY & CAFE ATMOSPHERE                                       │
│ - Editorial photo grid & narrative text                                │
│ - Subtle 3D bean floating particles in background canvas (paused when  │
│   scrolled past)                                                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 4. FOOTER & COLOPHON                                                   │
│ - Clean typography, business info, opening hours, legal links          │
│ - 3D Attribution notice honoring CC-BY-4.0 license                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. WebGL Performance & Asset Delivery Pipeline

To ensure the site hits Core Web Vitals targets ($LCP \le 2.5\text{s}$, $INP \le 200\text{ms}$, $CLS \le 0.1$):

1. **Pre-processing Pipeline:**
   - Ingest raw `.gltf` + `.bin` + `.png` from `assets-source/`.
   - Center geometry to `(0, 0, 0)`.
   - Repackage into a single binary `.glb` container.
   - Run Draco mesh compression via `@gltf-transform/cli`.
   - Compress 2K/1K textures to WebP and KTX2 Basis Universal formats.
   - Output optimized runtime file to `apps/web/public/models/hero/coffee-cup.glb`.

2. **Runtime Loading Strategy:**
   - **Lazy Mount:** The WebGL `<Canvas>` is mounted only after hydration and after the hero DOM content is rendered.
   - **Static Poster First:** An immediate `<img src="/posters/hero-cup.webp" />` renders during initial load so LCP occurs in < 1.0s. Once WebGL is compiled, the canvas fades in smoothly (0.4s CSS transition).
   - **DPR Clamping:** Restrict device pixel ratio to `[1, 1.5]` to avoid rendering four times the pixels on Retina/OLED mobile screens.
   - **Off-Screen Pause:** An `IntersectionObserver` disconnects the `requestAnimationFrame` loop when the hero section leaves the viewport.
   - **Page Visibility API:** Automatically pauses rendering when the browser tab is hidden or minimized.
   - **Reduced Motion Support:** When `prefers-reduced-motion: reduce` is detected via CSS media query, scroll-triggered rotations and float animations are disabled, presenting a static, beautifully lit angle.
   - **WebGL Error Boundary:** If WebGL fails to initialize or experiences context loss (`webglcontextlost`), the component gracefully retains the static WebP poster without throwing uncaught runtime exceptions.

