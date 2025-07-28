return {
  'kristijanhusak/vim-dadbod-ui',
  dependencies = {
    { 'tpope/vim-dadbod',                     lazy = true },
    { 'kristijanhusak/vim-dadbod-completion', ft = { 'sql', 'mysql', 'plsql' }, lazy = true }, -- Optional
  },
  cmd = {
    'DBUI',
    'DBUIToggle',
    'DBUIAddConnection',
    'DBUIFindBuffer',
  },
  keys = {
    { '<leader>db', '<cmd>DBUIToggle<CR>',        desc = 'Toggle DB UI' },
    { '<leader>df', '<cmd>DBUIFindBuffer<CR>',    desc = 'Find DB Buffer' },
    { '<leader>dr', '<cmd>DBUIRenameBuffer<CR>',  desc = 'Rename DB Buffer' },
    { '<leader>dl', '<cmd>DBUILastQueryInfo<CR>', desc = 'Show Last Query Info' },
    { '<leader>da', '<cmd>DBUIAddConnection<CR>', desc = 'Add DB Connection' },
  },
  init = function()
    -- Your DBUI configuration
    vim.g.db_ui_use_nerd_fonts = 1

    -- Additional configuration options
    vim.g.db_ui_show_help = 0
    vim.g.db_ui_win_position = 'left'
    vim.g.db_ui_use_nvim_notify = 1

    -- Auto execute sql files
    vim.g.db_ui_auto_execute_table_helpers = 1
  end,
}
