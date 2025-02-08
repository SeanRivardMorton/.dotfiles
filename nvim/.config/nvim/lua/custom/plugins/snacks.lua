return {
  'folke/snacks.nvim',
  ---@type snacks.Config
  opts = {
    lazygit = {
      -- your lazygit configuration comes here
      -- or leave it empty to use the default settings
      -- refer to the configuration section below
      styles = {
        border = 'rounded',
      },
    },
    win = {},
    terminal = {},
    gitbrowse = {},
    notifier = {},
  },
  keys = {
    {
      '<leader>lg',
      function()
        Snacks.lazygit()
      end,
      desc = 'Lazygit',
    },
    {
      '<leader>`',
      function()
        Snacks.terminal.toggle('here', opts)
        -- Snacks.terminal.open(cmd, opts)
        -- Snacks.win()
      end,
    },
    {
      '<leader>gb',
      function()
        Snacks.gitbrowse()
      end,
      desc = 'Gitbrowse',
    },
  },
}
