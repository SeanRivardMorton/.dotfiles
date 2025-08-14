-- AWS CLI Integration for Neovim
-- Features: 5-minute caching for all list operations, Ctrl-R to refresh cache

-- Cache configuration
local cache = {}
local cache_ttl = 5 * 60 * 1000 -- 5 minutes in milliseconds

-- Cache helper functions
local function get_cache_key(cmd)
  return 'aws_' .. cmd:gsub('%s+', '_'):gsub('[^%w_]', '')
end

local function is_cache_valid(cache_entry)
  if not cache_entry then
    return false
  end
  return (vim.loop.hrtime() / 1000000) - cache_entry.timestamp < cache_ttl
end

local function get_cached_data(cmd)
  local key = get_cache_key(cmd)
  local entry = cache[key]
  if is_cache_valid(entry) then
    return entry.data
  end
  return nil
end

local function set_cache_data(cmd, data)
  local key = get_cache_key(cmd)
  cache[key] = {
    data = data,
    timestamp = vim.loop.hrtime() / 1000000
  }
end

local function clear_cache()
  cache = {}
  vim.notify('AWS cache cleared', vim.log.levels.INFO)
end

-- Helper function to check if AWS CLI is available
local function check_aws_cli()
  local result = vim.fn.system('which aws')
  if vim.v.shell_error ~= 0 then
    vim.notify('AWS CLI not found. Please install AWS CLI first.', vim.log.levels.ERROR)
    return false
  end
  return true
end

-- Helper function to run AWS commands with error handling
local function run_aws_command(cmd, use_cache, show_loading)
  if not check_aws_cli() then
    return nil
  end

  use_cache = use_cache ~= false -- Default to true
  show_loading = show_loading ~= false -- Default to true
  
  -- Check cache first if enabled
  if use_cache then
    local cached_data = get_cached_data(cmd)
    if cached_data then
      vim.notify('Using cached AWS data', vim.log.levels.DEBUG)
      return cached_data
    end
  end

  -- Show loading notification if not using cached data
  if show_loading then
    vim.notify('🔄 Loading AWS data...', vim.log.levels.INFO, {
      title = 'AWS CLI',
      timeout = 1000,
    })
  end

  local full_cmd = 'aws ' .. cmd
  local output = vim.fn.system(full_cmd)
  
  -- Show completion notification
  if show_loading then
    vim.notify('✅ AWS data loaded', vim.log.levels.INFO, {
      title = 'AWS CLI',
      timeout = 2000,
    })
  end
  
  if vim.v.shell_error ~= 0 then
    vim.notify('AWS CLI error: ' .. output, vim.log.levels.ERROR)
    return nil
  end

  -- Cache the result if caching is enabled
  if use_cache then
    set_cache_data(cmd, output)
  end

  return output
end

-- Helper function to parse JSON output from AWS CLI
local function parse_json_output(output)
  if not output or output == '' then
    return nil
  end
  
  local ok, result = pcall(vim.fn.json_decode, output)
  if not ok then
    vim.notify('Failed to parse JSON output', vim.log.levels.ERROR)
    return nil
  end
  
  return result
end

-- Helper function to create a floating window with content
local function create_float_window(title, content, filetype)
  filetype = filetype or 'text'
  
  local lines = type(content) == 'string' and vim.split(content, '\n') or content
  local width = math.max(80, math.floor(vim.o.columns * 0.8))
  local height = math.max(20, math.floor(vim.o.lines * 0.8))
  
  -- Create buffer
  local bufnr = vim.api.nvim_create_buf(false, true)
  vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, lines)
  vim.api.nvim_buf_set_option(bufnr, 'filetype', filetype)
  vim.api.nvim_buf_set_option(bufnr, 'modifiable', false)
  vim.api.nvim_buf_set_option(bufnr, 'readonly', true)
  vim.api.nvim_buf_set_name(bufnr, title)
  
  -- Calculate position
  local row = math.floor((vim.o.lines - height) / 2)
  local col = math.floor((vim.o.columns - width) / 2)
  
  -- Create floating window
  local win_opts = {
    relative = 'editor',
    width = width,
    height = height,
    row = row,
    col = col,
    border = 'rounded',
    title = title,
    title_pos = 'center',
  }
  
  local win_id = vim.api.nvim_open_win(bufnr, true, win_opts)
  
  -- Set up keymaps to close the window
  local function close_window()
    if vim.api.nvim_win_is_valid(win_id) then
      vim.api.nvim_win_close(win_id, true)
    end
  end
  
  local keymap_opts = { buffer = bufnr, noremap = true, silent = true }
  vim.keymap.set('n', 'q', close_window, keymap_opts)
  vim.keymap.set('n', '<Esc>', close_window, keymap_opts)
  vim.keymap.set('n', '<C-c>', close_window, keymap_opts)
  
  return bufnr, win_id
end

-- Helper function to create Telescope picker for AWS resources
local function aws_telescope(cmd, prompt_title, data_key, entry_maker_fn)
  return function()
    -- Check cache first to determine status
    local cached_data = get_cached_data(cmd)
    local cache_status = cached_data and ' (cached)' or ''
    
    -- Show specific loading message for this service
    local service_name = prompt_title:match('(%w+)') or 'AWS'
    if not cached_data then
      vim.notify('🔄 Fetching ' .. prompt_title:lower() .. '...', vim.log.levels.INFO, {
        title = 'AWS ' .. service_name,
        timeout = 1000,
      })
    end
    
    local output = run_aws_command(cmd, true, false) -- Don't show generic loading
    if not output then
      return
    end
    
    if not cached_data then
      vim.notify('✅ ' .. prompt_title .. ' loaded', vim.log.levels.INFO, {
        title = 'AWS ' .. service_name,
        timeout = 2000,
      })
    end
    
    local parsed_data = parse_json_output(output)
    if not parsed_data then
      vim.notify('No data returned from AWS CLI', vim.log.levels.WARN)
      return
    end
    
    -- Extract the actual data array from the nested structure
    local data = data_key and parsed_data[data_key] or parsed_data
    
    if not data or (type(data) == 'table' and #data == 0) then
      vim.notify('No ' .. prompt_title:lower() .. ' found', vim.log.levels.INFO)
      return
    end
    
    -- Default entry maker if none provided
    entry_maker_fn = entry_maker_fn or function(entry)
      local display_text = type(entry) == 'string' and entry or vim.inspect(entry)
      return {
        value = entry,
        display = display_text,
        ordinal = display_text,
      }
    end
    
    require('telescope.pickers').new({}, {
      prompt_title = prompt_title .. cache_status,
      finder = require('telescope.finders').new_table({
        results = data,
        entry_maker = entry_maker_fn,
      }),
      sorter = require('telescope.config').values.generic_sorter({}),
      attach_mappings = function(prompt_bufnr, map)
        local actions = require('telescope.actions')
        local action_state = require('telescope.actions.state')
        
        local function view_selection()
          local selection = action_state.get_selected_entry()
          if selection then
            actions.close(prompt_bufnr)
            -- Create a window with the selection details
            create_float_window(
              prompt_title .. ': ' .. tostring(selection.ordinal),
              vim.inspect(selection.value, { indent = '  ' }),
              'json'
            )
          end
        end
        
        local function refresh_and_reload()
          -- Clear cache for this command and reload
          local key = get_cache_key(cmd)
          cache[key] = nil
          vim.notify('Cache cleared, refreshing...', vim.log.levels.INFO)
          actions.close(prompt_bufnr)
          -- Re-run the same function to reload with fresh data
          vim.defer_fn(function()
            aws_telescope(cmd, prompt_title, data_key, entry_maker_fn)()
          end, 100)
        end
        
        map('i', '<CR>', view_selection)
        map('n', '<CR>', view_selection)
        
        -- Add refresh keybinding
        map('i', '<C-r>', refresh_and_reload)
        map('n', '<C-r>', refresh_and_reload)
        
        return true
      end,
    }):find()
  end
end

-- Module
local M = {}

-- CloudWatch functions
M.cloudwatch_list_log_groups = function()
  local cmd = 'logs describe-log-groups --output json'
  
  -- Show specific loading message
  vim.notify('🔄 Fetching CloudWatch log groups...', vim.log.levels.INFO, {
    title = 'AWS CloudWatch',
    timeout = 1000,
  })
  
  local output = run_aws_command(cmd, true, false) -- Don't show generic loading since we show specific one
  if not output then
    return
  end
  
  vim.notify('✅ CloudWatch log groups loaded', vim.log.levels.INFO, {
    title = 'AWS CloudWatch',
    timeout = 2000,
  })
  
  local parsed_data = parse_json_output(output)
  if not parsed_data or not parsed_data.logGroups then
    vim.notify('No log groups found', vim.log.levels.WARN)
    return
  end
  
  local log_groups = parsed_data.logGroups
  
  require('telescope.pickers').new({}, {
    prompt_title = 'CloudWatch Log Groups',
    finder = require('telescope.finders').new_table({
      results = log_groups,
      entry_maker = function(log_group)
        local stored_bytes = log_group.storedBytes or 0
        local size_display = stored_bytes > 0 and string.format('%.2f MB', stored_bytes / 1024 / 1024) or '0 bytes'
        return {
          value = log_group,
          display = log_group.logGroupName .. ' | ' .. size_display,
          ordinal = log_group.logGroupName,
        }
      end,
    }),
    sorter = require('telescope.config').values.generic_sorter({}),
    attach_mappings = function(prompt_bufnr, map)
      local actions = require('telescope.actions')
      local action_state = require('telescope.actions.state')
      
      local function tail_logs()
        local selection = action_state.get_selected_entry()
        if selection then
          local log_group_name = selection.value.logGroupName
          actions.close(prompt_bufnr)
          
          vim.notify('Starting tail for: ' .. log_group_name, vim.log.levels.INFO)
          
          vim.defer_fn(function()
            vim.cmd('tabnew')
            vim.cmd('terminal aws logs tail "' .. log_group_name .. '" --follow')
            vim.cmd('startinsert')
          end, 100)
        end
      end
      
      local function view_recent_logs()
        local selection = action_state.get_selected_entry()
        if selection then
          local log_group_name = selection.value.logGroupName
          actions.close(prompt_bufnr)
          
          vim.notify('🔄 Fetching recent logs for: ' .. log_group_name, vim.log.levels.INFO, {
            title = 'AWS CloudWatch',
            timeout = false, -- Keep showing until we're done
          })
          
          vim.defer_fn(function()
            -- Get recent logs (last hour)
            local cmd = 'logs tail "' .. log_group_name .. '" --since 1h'
            local recent_output = run_aws_command(cmd, false, false) -- No generic loading
            
            if recent_output and recent_output ~= '' and not recent_output:match('error') then
              vim.notify('✅ Recent logs loaded for: ' .. log_group_name, vim.log.levels.INFO, {
                title = 'AWS CloudWatch',
                timeout = 2000,
              })
              create_float_window(
                'Recent Logs: ' .. log_group_name,
                recent_output,
                'log'
              )
            else
              vim.notify('⚠️ No recent logs found for: ' .. log_group_name, vim.log.levels.WARN, {
                title = 'AWS CloudWatch',
                timeout = 3000,
              })
            end
          end, 100)
        end
      end
      
      -- Primary action: tail logs in terminal
      map('i', '<CR>', tail_logs)
      map('n', '<CR>', tail_logs)
      
      -- Secondary action: view recent logs in floating window
      map('i', '<C-p>', view_recent_logs)
      map('n', '<C-p>', view_recent_logs)
      
      return true
    end,
  }):find()
end

M.cloudwatch_tail_logs = function()
  vim.ui.input({ prompt = 'Log Group Name: ' }, function(log_group)
    if log_group and log_group ~= '' then
      vim.cmd('!aws logs tail "' .. log_group .. '" --follow')
    end
  end)
end

M.cloudwatch_list_alarms = aws_telescope(
  'cloudwatch describe-alarms --output json',
  'CloudWatch Alarms',
  'MetricAlarms',
  function(alarm)
    local state = alarm.StateValue or 'UNKNOWN'
    local color = state == 'OK' and '✓' or state == 'ALARM' and '✗' or '?'
    return {
      value = alarm,
      display = color .. ' ' .. alarm.AlarmName .. ' | ' .. state .. ' | ' .. (alarm.AlarmDescription or ''),
      ordinal = alarm.AlarmName,
    }
  end
)

M.cloudwatch_list_metrics = aws_telescope(
  'cloudwatch list-metrics --output json',
  'CloudWatch Metrics',
  'Metrics',
  function(metric)
    local namespace = metric.Namespace or 'Unknown'
    local metric_name = metric.MetricName or 'Unknown'
    return {
      value = metric,
      display = namespace .. ' | ' .. metric_name,
      ordinal = namespace .. ' ' .. metric_name,
    }
  end
)

-- Secrets Manager functions
M.secrets_list = aws_telescope(
  'secretsmanager list-secrets --output json',
  'Secrets Manager',
  'SecretList',
  function(secret)
    local name = secret.Name or 'Unknown'
    local desc = secret.Description or 'No description'
    return {
      value = secret,
      display = name .. ' | ' .. desc,
      ordinal = name,
    }
  end
)

M.secrets_view_value = function()
  vim.ui.input({ prompt = 'Secret Name: ' }, function(secret_name)
    if secret_name and secret_name ~= '' then
      local output = run_aws_command('secretsmanager get-secret-value --secret-id "' .. secret_name .. '" --output json', false)
      if output then
        local data = parse_json_output(output)
        if data and data.SecretString then
          create_float_window(
            'Secret: ' .. secret_name,
            data.SecretString,
            'json'
          )
        end
      end
    end
  end)
end

-- Lambda functions
M.lambda_list_functions = aws_telescope(
  'lambda list-functions --output json',
  'Lambda Functions',
  'Functions',
  function(func)
    local name = func.FunctionName or 'Unknown'
    local runtime = func.Runtime or 'Unknown'
    local size = func.CodeSize or 0
    return {
      value = func,
      display = name .. ' | ' .. runtime .. ' | ' .. size .. ' bytes',
      ordinal = name,
    }
  end
)

-- DynamoDB functions
M.dynamodb_list_tables = aws_telescope(
  'dynamodb list-tables --output json',
  'DynamoDB Tables',
  'TableNames',
  function(table_name)
    return {
      value = table_name,
      display = table_name,
      ordinal = table_name,
    }
  end
)

-- EC2 functions
M.ec2_list_instances = function()
  local cmd = 'ec2 describe-instances --output json'
  
  -- Show specific loading message
  vim.notify('🔄 Fetching EC2 instances...', vim.log.levels.INFO, {
    title = 'AWS EC2',
    timeout = 1000,
  })
  
  local output = run_aws_command(cmd, true, false) -- Don't show generic loading
  if not output then
    return
  end
  
  vim.notify('✅ EC2 instances loaded', vim.log.levels.INFO, {
    title = 'AWS EC2',
    timeout = 2000,
  })
  
  local parsed_data = parse_json_output(output)
  if not parsed_data or not parsed_data.Reservations then
    vim.notify('No EC2 instances found', vim.log.levels.WARN)
    return
  end
  
  -- Flatten instances from reservations
  local instances = {}
  for _, reservation in ipairs(parsed_data.Reservations) do
    for _, instance in ipairs(reservation.Instances or {}) do
      table.insert(instances, instance)
    end
  end
  
  if #instances == 0 then
    vim.notify('No EC2 instances found', vim.log.levels.INFO)
    return
  end
  
  require('telescope.pickers').new({}, {
    prompt_title = 'EC2 Instances',
    finder = require('telescope.finders').new_table({
      results = instances,
      entry_maker = function(instance)
        local instance_id = instance.InstanceId or 'Unknown'
        local state = instance.State and instance.State.Name or 'Unknown'
        local instance_type = instance.InstanceType or 'Unknown'
        local name = 'Unnamed'
        
        -- Extract Name tag
        if instance.Tags then
          for _, tag in ipairs(instance.Tags) do
            if tag.Key == 'Name' then
              name = tag.Value
              break
            end
          end
        end
        
        local private_ip = instance.PrivateIpAddress or 'N/A'
        local public_ip = instance.PublicIpAddress or 'N/A'
        
        local state_icon = state == 'running' and '✓' or state == 'stopped' and '✗' or '?'
        
        return {
          value = instance,
          display = string.format('%s %s | %s | %s | %s | Private: %s | Public: %s',
            state_icon, instance_id, name, state, instance_type, private_ip, public_ip),
          ordinal = instance_id .. ' ' .. name,
        }
      end,
    }),
    sorter = require('telescope.config').values.generic_sorter({}),
    attach_mappings = function(prompt_bufnr, map)
      local actions = require('telescope.actions')
      local action_state = require('telescope.actions.state')
      
      local function view_details()
        local selection = action_state.get_selected_entry()
        if selection then
          actions.close(prompt_bufnr)
          create_float_window(
            'EC2 Instance: ' .. selection.value.InstanceId,
            vim.inspect(selection.value, { indent = '  ' }),
            'json'
          )
        end
      end
      
      map('i', '<CR>', view_details)
      map('n', '<CR>', view_details)
      
      return true
    end,
  }):find()
end

-- Utility functions
M.clear_cache = clear_cache

return M