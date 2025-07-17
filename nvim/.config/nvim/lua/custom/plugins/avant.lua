return {
  'yetone/avante.nvim',
  event = 'VeryLazy',
  lazy = false,
  version = false, -- Set this to "*" to always pull the latest release version, or set it to false to update to the latest code changes.
  opts = {
    -- add any opts here
    -- for example
    provider = 'gemini', -- Set your default provider here (claude, openai, gemini, bedrock)
    -- cursor_applying_provider = 'openai',
    -- behaviour = {
    --   enable_cursor_planning_mode = true,
    -- },
    providers = {
      claude = {
        endpoint = 'https://api.anthropic.com',
        model = 'claude-3-7-sonnet-20250219', -- your desired model (or use claude-1, etc.)
        -- timeout = 30000, -- Timeout in milliseconds
        -- temperature = 0.75,
        -- max_tokens = 8192,
        -- disable_tools = false, -- disable tools!
        extra_request_body = {
          timeout = 30000, -- Timeout in milliseconds, increase this for reasoning models
          temperature = 0.75,
          max_completion_tokens = 8192,
        },
      },
      -- openai = {
      --   endpoint = 'https://api.openai.com/v1',
      --   model = 'gpt-4o', -- your desired model (or use gpt-4o, etc.)
      --   -- extra_request_body = {
      --   timeout = 30000, -- Timeout in milliseconds, increase this for reasoning models
      --   temperature = 1,
      --   max_completion_tokens = 8192,
      --   -- temperature = 0, -- adjust if needed
      --   -- },
      -- },
      -- gemini = {
      --   endpoint = 'https://generativelanguage.googleapis.com',
      --   model = 'gemini-2.5-pro-preview-06-05', -- your desired model (e.g., gemini-1.5-pro, gemini-1.5-flash)
      --   timeout = 30000, -- Timeout in milliseconds
      --   -- temperature = 0.7,
      --   -- max_tokens = 8192,
      -- },
      -- bedrock = {
      --   model = 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
      --   aws_profile = 'bedrock',
      --   aws_region = 'us-east-1',
      -- },
    },
    web_search_engine = {
      provider = 'tavily',
      proxy = 'nil',
    },
  },
  -- if you want to build from source then do `make BUILD_FROM_SOURCE=true`
  build = 'make',
  -- build = "powershell -ExecutionPolicy Bypass -File Build.ps1 -BuildFromSource false" -- for windows
  dependencies = {
    'stevearc/dressing.nvim',
    'nvim-lua/plenary.nvim',
    'MunifTanjim/nui.nvim',
    --- The below dependencies are optional,
    'echasnovski/mini.pick', -- for file_selector provider mini.pick
    'nvim-telescope/telescope.nvim', -- for file_selector provider telescope
    'hrsh7th/nvim-cmp', -- autocompletion for avante commands and mentions
    'ibhagwan/fzf-lua', -- for file_selector provider fzf
    'nvim-tree/nvim-web-devicons', -- or echasnovski/mini.icons
    'zbirenbaum/copilot.lua', -- for providers='copilot'
    {
      -- support for image pasting
      'HakonHarnes/img-clip.nvim',
      event = 'VeryLazy',
      opts = {
        -- recommended settings
        default = {
          embed_image_as_base64 = false,
          prompt_for_file_name = false,
          drag_and_drop = {
            insert_mode = true,
          },
          -- required for Windows users
          use_absolute_path = true,
        },
      },
    },
    {
      -- Make sure to set this up properly if you have lazy=true
      'MeanderingProgrammer/render-markdown.nvim',
      opts = {
        file_types = { 'markdown', 'Avante' },
      },
      ft = { 'markdown', 'Avante' },
    },
  },
}
