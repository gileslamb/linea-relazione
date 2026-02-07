# Phase 1.7: Organic Forms & Musical Variables

## Summary

Phase 1.7 transforms rigid mechanical lines into flowing organic curves and replaces technical behavior parameters with intuitive musical force controls.

## Key Changes

### 1. Curved Ribbons (LineAgents.tsx)
- Replaced cylinder geometry with `QuadraticBezierLine` from drei
- Curves bend based on velocity direction and perpendicular offset
- Dynamic ribbon length based on speed (faster = longer trails)
- Oscillating curve intensity for organic, dancing feel
- Subtle color variation based on agent age

### 2. Enhanced Pointillism (Pointillism.tsx)
- Much larger points (size 8, was 3)
- Higher opacity (0.9, was 0.6)
- Added accent points for sparkle effect (smaller dots trailing each agent)
- Perspective-correct size attenuation

### 3. Musical Force Sliders (DebugView.tsx)
Replaced technical "Cohesion/Alignment/Separation" with expressive controls:

| Force | Range | Effect |
|-------|-------|--------|
| **Harmony** | dissonance ← → consonance | Controls attraction/repulsion balance |
| **Flow** | staccato ← → legato | Smoothness of motion |
| **Density** | sparse ← → dense | How tightly agents cluster |
| **Space Depth** | flat ← → deep | 3D perception range |
| **Rhythm** | drone ← → pulse | Shape formation tendency |
| **Timbre** | dark ← → bright | Visual sharpness and glow |

### 4. Musical Forces Type System (forces/types.ts)
New `MusicalForces` interface with normalized 0-1 values for all controls.

### 5. Force Interpreter (forces/forceInterpreter.ts)
Maps musical concepts to concrete behavior parameters:
- Harmony → cohesion/separation balance
- Flow → alignment strength and max force
- Density → max speed and separation radius
- Space Depth → perception radius
- Rhythm → shape formation type and strength
- Timbre → visual parameters (line width, glow, point size)

### 6. Shape Formation Behaviors (behaviors.ts)
New `shapeAttraction` function with multiple shape types:
- `circle` - Rotating ellipse
- `figure8` - Lemniscate pattern
- `sphere` - Surface attraction
- `spiral` - 3D helix

Includes `rhythmicPulse` for synchronized breathing motion.

### 7. Increased Bloom (constants.ts)
- Bloom intensity: 2.5 (was 1.5)
- Luminance threshold: 0.1 (was 0.2)
- More elements glow for effervescent quality

## Test Combinations

### Harmonic Legato (graceful dance)
```
Harmony: 0.9
Flow: 0.9
Density: 0.6
```
→ Smooth, attracted, flowing dance

### Dissonant Staccato (chaotic pulse)
```
Harmony: 0.1
Flow: 0.2
Rhythm: 0.8
```
→ Jerky, repelling, rhythmic pulses

### Spatial Drone (deep ambient)
```
Space Depth: 0.9
Flow: 0.8
Rhythm: 0.1
```
→ Deep 3D field, smooth continuous flow

### Bright Formation (sharp geometric)
```
Timbre: 0.9
Rhythm: 0.7
Harmony: 0.6
```
→ Sharp, bright, shape-forming

## Architecture Notes

The musical forces system creates a clean separation:
1. **User Layer**: Musical concepts (harmony, flow, etc.)
2. **Interpreter Layer**: Translation logic (`forceInterpreter.ts`)
3. **Agent Layer**: Technical behavior params

This allows the UI to speak in artistic terms while the simulation runs on precise physics.

## Files Modified

- `src/forces/types.ts` - New MusicalForces interface
- `src/forces/forceInterpreter.ts` - Musical → behavior translation
- `src/scene/LineAgents.tsx` - Curved ribbon rendering
- `src/scene/Pointillism.tsx` - Enhanced bright dots
- `src/scene/Scene.tsx` - Musical forces integration
- `src/ui/DebugView.tsx` - Musical slider controls
- `src/agents/behaviors.ts` - Shape attraction behaviors
- `src/agents/LineAgent.ts` - Shape/rhythm methods
- `src/agents/agentSystem.ts` - Musical force support
- `src/utils/constants.ts` - Increased bloom settings
