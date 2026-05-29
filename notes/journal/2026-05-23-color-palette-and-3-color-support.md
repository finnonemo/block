---
tags: dev-log, feature
topics: UI, color-system, pattern-builder
projects: fnm-pattern-builder
url:
aliases: color palette feature
---
# [Dev Log] Brand Color Palette & 3-Color Grid Support

## Key Takeaways

Replace free-form color pickers with a fixed brand palette from Figma design system. Allow users to select up to 3 colors for the checkerboard grid, with individual cells cycling through the selected colors on click.

## Topics

Added a structured brand color palette (9 families × up to 4 shades) sourced directly from the Figma design node. The palette covers Navy, Light Grey, Yellow, White, Green, Blue, Purple, Red, and Orange — each with 100/75/50/25% opacity variants totaling 33 distinct swatches.

The internal data model for the grid shifted from a `boolean[]` (swapped vs. not-swapped from checkerboard default) to a `number[]` storing a color-slot index (0 = A, 1 = B, 2 = C). This makes the color assignment explicit and simplifies rendering, export, and preset logic — no more indirect "isSwapped → isDefaultDark → isColorA" chain.

Interaction model for multi-color painting: clicking a cell cycles it to the next slot index mod the number of selected colors. Dragging locks in that color and paints uniformly. With 2 colors this is identical to the old toggle behavior; with 3 it adds a third cycle step.

The `mapBlocksGrid` function was rewritten to operate on color indices directly instead of boolean swapped-states — upscale (2× subdivision), downscale (2× majority vote), and nearest-neighbor fallback all now work with integer indices, which is simpler and more correct.

## Questions

- Should the 3rd color (C) have a visual indicator on the grid cells themselves, not just in the stats bar, to help users orient themselves?
- What happens to the SVG export when all 3 colors are from the light end of the palette — is there enough contrast for the pattern to read well in Figma?
- Should preset patterns like Cross (X) and Corners ever produce a 3-color output (e.g. background = A, shape = B, accent = C), or is 2-color output from presets intentional?
- Is there value in saving/loading palette selections as named schemes for reuse across sessions?

## Next Steps

- Consider adding a touch/mobile-friendly interaction model since the current drag-to-paint is mouse-only
- Explore letting users reorder A/B/C slots (drag handles) so they can change which color is "first" without removing and re-adding
- Add a preview swatch strip showing the active A/B/C colors prominently near the canvas for quick reference during painting
- Evaluate whether the White swatch needs a visual border treatment in more edge-case themes (dark swatch selected + white grid cell)
