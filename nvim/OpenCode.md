# OpenCode.md

## Build, Lint, and Test Commands
- **Plugin Management**:
  - View plugins: `:Lazy`
  - Install plugins: `:Lazy install`
  - Update plugins: `:Lazy sync`
- **Code Formatting**:
  - Format Lua files: `<leader>f` (space + f)
  - Lua uses `stylua`, configured for 160 column width and 2 spaces indent.
  - For other files, `conform.nvim` uses prettier for formatting.
- **Testing**:
  - Run Neotest commands for project-specific tests (configured with Jest and Vitest adapters).
  - Examples: `:Neotest run` (all tests), focus on a specific test file or function with the UI.

## Code Style Guidelines
- **General Philosophy**:
  - Single entry: `init.lua` (~1400 lines) with modular plugin configs in `lua/custom/plugins/`.
  - Plugins are lazy-loaded for performance.
- **Formatting**:
  - Lua code adheres to `stylua` rules; others use Prettier.
- **Imports**:
  - Each plugin has its own file in `lua/custom/plugins/` and is managed individually.
  - Disabling a plugin involves renaming its `.lua` file to `.txt` in the same folder.
- **Naming Conventions**:
  - Use descriptive, snake_case or PascalCase where Lua best practices apply.
  - Leader key `<space>` for all custom mappings.
- **Error Handling**:
  - Critical plugins and setup steps validate health via `:checkhealth`.
- **Plugins & Events**:
  - Lazy-load plugins (e.g., using events like `VeryLazy`, `InsertEnter`, etc.).
  - Manage plugin versions with `lazy-lock.json`.
- **LSP Settings**:
  - Mason.nvim for LSP installations, servers auto-install on file open.