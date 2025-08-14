-- AWS CLI keymaps configuration
-- This sets up all AWS CLI keymaps without conflicting with plugins

local function setup_aws_keymaps()
  local aws = require('aws-cli')
  
  -- CloudWatch
  vim.keymap.set('n', '<leader>awcl', aws.cloudwatch_list_log_groups, 
    { desc = '[A]WS Cloud[W]atch [C]loudWatch [L]og groups (Enter=tail, Ctrl-P=recent logs, Ctrl-R=refresh)' })
  vim.keymap.set('n', '<leader>awct', aws.cloudwatch_tail_logs, 
    { desc = '[A]WS Cloud[W]atch [C]loudWatch [T]ail logs' })
  vim.keymap.set('n', '<leader>awca', aws.cloudwatch_list_alarms, 
    { desc = '[A]WS Cloud[W]atch [C]loudWatch [A]larms' })
  vim.keymap.set('n', '<leader>awcm', aws.cloudwatch_list_metrics, 
    { desc = '[A]WS Cloud[W]atch [C]loudWatch [M]etrics' })
  
  -- Secrets Manager
  vim.keymap.set('n', '<leader>awsl', aws.secrets_list, 
    { desc = '[A]WS [S]ecrets [L]ist' })
  vim.keymap.set('n', '<leader>awsv', aws.secrets_view_value, 
    { desc = '[A]WS [S]ecrets [V]iew value' })
  
  -- Lambda
  vim.keymap.set('n', '<leader>awll', aws.lambda_list_functions, 
    { desc = '[A]WS [L]ambda [L]ist functions' })
  
  -- DynamoDB
  vim.keymap.set('n', '<leader>awdt', aws.dynamodb_list_tables, 
    { desc = '[A]WS [D]ynamoDB [T]ables' })
  
  -- EC2
  vim.keymap.set('n', '<leader>awel', aws.ec2_list_instances, 
    { desc = '[A]WS [E]C2 [L]ist instances' })
  
  -- Utility
  vim.keymap.set('n', '<leader>awx', aws.clear_cache, 
    { desc = '[A]WS clear cache (e[X]pire)' })
end

-- Set up keymaps after Telescope is loaded to avoid conflicts
vim.api.nvim_create_autocmd('User', {
  pattern = 'LazyDone',
  callback = setup_aws_keymaps,
  once = true,
})

-- Also set up keymaps immediately if already loaded
if package.loaded['telescope'] then
  setup_aws_keymaps()
end