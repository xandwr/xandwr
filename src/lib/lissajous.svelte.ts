// Shared state linking the homepage easter egg to the layout's title-bar
// animation. The README's "schizo ramblings" section (in +page.svelte) and the
// Lissajous title-bar color sweep (in +layout.svelte) live in different
// components, so the toggle has to travel through a module-level rune both can
// import.
//
// Meta-easter-egg: the animated header colors only come alive once the visitor
// unlocks the ramblings. Collapsed → plain Windows 98 blue.
export const lissajous = $state({ active: false });
