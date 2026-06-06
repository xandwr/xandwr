# Personal website task runner. `just` lists recipes; `just <name>` runs one.
# Each recipe line is its own command — they run in order and abort on failure.

# List available recipes.
default:
    @just --list

# Start the SvelteKit dev server.
dev:
    bun run dev

# Regenerate the skills index standalone (the build already does this via a vite plugin).
skills:
    bun run build:skills

# Build the static site into .svelte-kit/cloudflare/.
build:
    bun run build

# Type-check the project.
check:
    bun run check

# Full deploy: build (regenerates skills index) -> Cloudflare. Sequential, aborts on failure.
deploy:
    bun run build
    bunx wrangler deploy

# Preview the production build locally.
preview:
    bun run preview
