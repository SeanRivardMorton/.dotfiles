-- Jira CLI Integration for Neovim
-- Keybindings:
--   <leader>jl - List issues
--   <leader>jv - View issue (prompts for key)
--   <leader>jc - Create issue (interactive)
--   <leader>ja - Assign issue (prompts for key)
--   <leader>jm - Move/transition issue (prompts for key)
--   <leader>jo - Open issue in browser (prompts for key)
--   <leader>jC - Add comment to issue (prompts for key)
--   <leader>js - List sprints
--   <leader>jp - List projects
--   <leader>jM - Show current user info
--   <leader>j/ - Search with JQL query
--   <leader>jn - List my assigned issues
--   <leader>jr - List recently updated issues
--   <leader>jx - Clear Jira cache
--   <leader>jf - Find/search specific issue by key

-- Cache configuration
local cache = {}
local cache_ttl = 5 * 60 * 1000 -- 5 minutes in milliseconds

-- Cache helper functions
local function get_cache_key(cmd)
  return 'jira_' .. cmd:gsub('%s+', '_'):gsub('[^%w_]', '')
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
  vim.notify('Jira cache cleared', vim.log.levels.INFO)
end

-- Helper function to parse Jira issue list output
local function parse_jira_issues(output)
  local issues = {}
  local lines = vim.split(output, '\n')
  
  -- Skip header line and empty lines
  for i, line in ipairs(lines) do
    if i > 1 and line:match('%S') then  -- Skip first header line
      -- Split by tabs and extract key from second column
      local parts = vim.split(line, '\t')
      if #parts >= 2 then
        local key = vim.trim(parts[2])  -- Key is in second column
        if key and key:match('^%u+%-%d+$') then  -- Matches PROJ-123 pattern
          -- Create a cleaner display format
          local type_col = vim.trim(parts[1] or '')
          local summary = vim.trim(parts[3] or '')
          local status = vim.trim(parts[4] or '')
          local display = string.format('%s | %s | %s | %s', key, type_col, status, summary)
          
          -- Create comprehensive search string
          local ordinal = key .. ' ' .. summary .. ' ' .. type_col .. ' ' .. status
          
          table.insert(issues, {
            value = line,
            display = display,
            ordinal = ordinal,
            key = key,
          })
          
          -- Debug: Print first few entries
          if #issues <= 3 then
            vim.notify('Issue ' .. #issues .. ': key=' .. key .. ', ordinal=' .. ordinal, vim.log.levels.DEBUG)
          end
        end
      end
    end
  end
  
  return issues
end

-- Helper function to show Jira issues in Telescope
local function jira_telescope(cmd, prompt_title)
  return function()
    -- Check cache first
    local cached_data = get_cached_data(cmd)
    local issues
    
    if cached_data then
      issues = cached_data
      vim.notify('Using cached Jira data', vim.log.levels.DEBUG)
      prompt_title = prompt_title .. ' (cached)'
    else
      local output = vim.fn.system('jira ' .. cmd)
      issues = parse_jira_issues(output)
      -- Cache the parsed issues
      set_cache_data(cmd, issues)
      vim.notify('Fetched fresh Jira data', vim.log.levels.DEBUG)
    end
    
    require('telescope.pickers').new({}, {
      prompt_title = prompt_title,
      finder = require('telescope.finders').new_table({
        results = issues,
        entry_maker = function(entry)
          -- Debug the entry structure
          vim.notify('Entry maker: key=' .. entry.key .. ', ordinal=' .. entry.ordinal, vim.log.levels.DEBUG)
          return {
            value = entry.key,
            display = entry.display,
            ordinal = entry.ordinal,
          }
        end,
      }),
      sorter = require('telescope.config').values.generic_sorter({}),
      attach_mappings = function(prompt_bufnr, map)
        local actions = require('telescope.actions')
        local action_state = require('telescope.actions.state')
        
        -- Function to open issue in popup
        local function open_issue()
          local selection = action_state.get_selected_entry()
          if selection then
            vim.notify('Selected issue: ' .. selection.value, vim.log.levels.INFO)
            
            -- Close telescope first
            actions.close(prompt_bufnr)
            
            -- Add a small delay to ensure Telescope is fully closed
            vim.defer_fn(function()
              -- View the selected issue in a plenary window
              local output = vim.fn.system('jira issue view ' .. selection.value)
              vim.notify('Command output length: ' .. #output, vim.log.levels.DEBUG)
              
              -- Check if command was successful
              if vim.v.shell_error == 0 and output and output ~= '' then
                -- Create floating window with issue content directly here (scope issue fix)
                vim.notify('Telescope: Attempting to create window for: ' .. selection.value, vim.log.levels.INFO)
                
                local lines = vim.split(output, '\n')
                local width = math.max(60, math.floor(vim.o.columns * 0.8))
                local height = math.max(20, math.floor(vim.o.lines * 0.8))
                
                -- Create buffer
                local bufnr = vim.api.nvim_create_buf(false, true)
                vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, lines)
                vim.api.nvim_buf_set_option(bufnr, 'filetype', 'markdown')
                vim.api.nvim_buf_set_option(bufnr, 'modifiable', false)
                vim.api.nvim_buf_set_option(bufnr, 'readonly', true)
                vim.api.nvim_buf_set_name(bufnr, 'Jira Issue: ' .. selection.value)
                
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
                }
                
                local win_id = vim.api.nvim_open_win(bufnr, true, win_opts)
                
                -- Set up keymaps
                local function close_window()
                  if vim.api.nvim_win_is_valid(win_id) then
                    vim.api.nvim_win_close(win_id, true)
                  end
                end
                
                -- Set up multiple quit keymaps
                local keymap_opts = {
                  callback = close_window,
                  noremap = true,
                  silent = true,
                }
                
                vim.api.nvim_buf_set_keymap(bufnr, 'n', 'q', '', keymap_opts)
                vim.api.nvim_buf_set_keymap(bufnr, 'n', '<Esc>', '', keymap_opts)
                vim.api.nvim_buf_set_keymap(bufnr, 'n', 'ZZ', '', keymap_opts)
                vim.api.nvim_buf_set_keymap(bufnr, 'n', 'ZQ', '', keymap_opts)
                vim.api.nvim_buf_set_keymap(bufnr, 'n', '<C-c>', '', keymap_opts)
                
                vim.notify('Telescope: Successfully opened issue window for: ' .. selection.value, vim.log.levels.INFO)
              else
                vim.notify('Failed to fetch issue: ' .. selection.value, vim.log.levels.ERROR)
              end
            end, 200)
          else
            vim.notify('No selection found', vim.log.levels.WARN)
          end
        end
        
        -- Map Enter key in both normal and insert mode
        map('i', '<CR>', open_issue)
        map('n', '<CR>', open_issue)
        -- Add custom mappings
        map('i', '<C-o>', function()
          local selection = require('telescope.actions.state').get_selected_entry()
          if selection then
            vim.fn.system('jira open ' .. selection.value)
          end
        end)
        map('i', '<C-a>', function()
          local selection = require('telescope.actions.state').get_selected_entry()
          if selection then
            actions.close(prompt_bufnr)
            vim.cmd('!jira issue assign ' .. selection.value)
          end
        end)
        map('i', '<C-m>', function()
          local selection = require('telescope.actions.state').get_selected_entry()
          if selection then
            actions.close(prompt_bufnr)
            vim.cmd('!jira issue move ' .. selection.value)
          end
        end)
        return true
      end,
    }):find()
  end
end

-- Helper function to run Jira commands with output in a new buffer
local function jira_cmd_buffer(cmd, title)
  return function()
    local output = vim.fn.system('jira ' .. cmd)
    vim.cmd('new')
    vim.bo.buftype = 'nofile'
    vim.bo.bufhidden = 'wipe'
    vim.bo.swapfile = false
    vim.bo.filetype = 'markdown'
    vim.api.nvim_buf_set_lines(0, 0, -1, false, vim.split(output, '\n'))
    vim.api.nvim_buf_set_name(0, title or 'Jira Output')
    vim.cmd('normal! gg')
  end
end

-- Helper function for interactive commands
local function jira_interactive(cmd)
  return function()
    vim.cmd('!jira ' .. cmd)
  end
end

-- Helper function to create JIRA issue with popup form
local function jira_create_issue_popup()
  return function()
    local popup = require('plenary.popup')
    
    -- Form data
    local form_data = {
      summary = '',
      description = '',
      issue_type = 'Task',
      project = '',
      assignee = '',
    }
    
    local form_lines = {
      '=== Create JIRA Issue ===',
      '',
      'Summary: ' .. form_data.summary,
      'Description: ' .. form_data.description,
      'Type: ' .. form_data.issue_type,
      'Project: ' .. form_data.project,
      'Assignee: ' .. form_data.assignee,
      '',
      'Instructions:',
      '- Use Tab/Shift-Tab to navigate fields',
      '- Press Enter on a field to edit it',
      '- Press Ctrl-S to submit',
      '- Press q or Esc to cancel',
      '',
    }
    
    local width = 80
    local height = 20
    
    local bufnr, win_id = popup.create(form_lines, {
      title = 'Create JIRA Issue',
      line = math.floor((vim.o.lines - height) / 2),
      col = math.floor((vim.o.columns - width) / 2),
      minwidth = width,
      minheight = height,
      borderchars = { '─', '│', '─', '│', '╭', '╮', '╯', '╰' },
      highlight = 'Normal',
      borderhighlight = 'FloatBorder',
    })
    
    -- Make buffer modifiable for form interaction
    vim.api.nvim_buf_set_option(bufnr, 'modifiable', true)
    vim.api.nvim_buf_set_option(bufnr, 'buftype', 'nofile')
    
    local current_field = 1
    local field_lines = { 3, 4, 5, 6, 7 } -- Line numbers for each field
    local field_names = { 'summary', 'description', 'issue_type', 'project', 'assignee' }
    
    -- Function to update display
    local function update_display()
      local updated_lines = {
        '=== Create JIRA Issue ===',
        '',
        'Summary: ' .. form_data.summary,
        'Description: ' .. form_data.description,
        'Type: ' .. form_data.issue_type,
        'Project: ' .. form_data.project,
        'Assignee: ' .. form_data.assignee,
        '',
        'Instructions:',
        '- Use Tab/Shift-Tab to navigate fields',
        '- Press Enter on a field to edit it',
        '- Press Ctrl-S to submit',
        '- Press q or Esc to cancel',
        '',
      }
      
      -- Highlight current field
      if current_field <= #field_lines then
        local line_idx = field_lines[current_field]
        updated_lines[line_idx] = '> ' .. updated_lines[line_idx]:sub(3) .. ' <'
      end
      
      vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, updated_lines)
    end
    
    -- Function to edit current field
    local function edit_field()
      if current_field > #field_names then return end
      
      local field_name = field_names[current_field]
      local current_value = form_data[field_name]
      
      vim.ui.input({ 
        prompt = field_name:gsub("^%l", string.upper) .. ': ',
        default = current_value 
      }, function(input)
        if input then
          form_data[field_name] = input
          update_display()
          vim.api.nvim_set_current_win(win_id) -- Return focus to popup
        end
      end)
    end
    
    -- Function to submit form
    local function submit_form()
      if form_data.summary == '' or form_data.project == '' then
        vim.notify('Summary and Project are required fields', vim.log.levels.ERROR)
        return
      end
      
      -- Close popup
      if vim.api.nvim_win_is_valid(win_id) then
        vim.api.nvim_win_close(win_id, true)
      end
      
      -- Build jira create command
      local cmd = string.format(
        'jira issue create --project="%s" --summary="%s" --type="%s"',
        form_data.project,
        form_data.summary,
        form_data.issue_type
      )
      
      if form_data.description ~= '' then
        cmd = cmd .. string.format(' --body="%s"', form_data.description)
      end
      
      if form_data.assignee ~= '' then
        cmd = cmd .. string.format(' --assignee="%s"', form_data.assignee)
      end
      
      vim.notify('Creating JIRA issue...', vim.log.levels.INFO)
      vim.cmd('!' .. cmd)
    end
    
    -- Function to close popup
    local function close_popup()
      if vim.api.nvim_win_is_valid(win_id) then
        vim.api.nvim_win_close(win_id, true)
      end
    end
    
    -- Set up keymaps
    local keymap_opts = { noremap = true, silent = true }
    
    -- Navigation
    vim.api.nvim_buf_set_keymap(bufnr, 'n', '<Tab>', '', {
      callback = function()
        current_field = current_field < #field_names and current_field + 1 or 1
        update_display()
      end,
      noremap = true,
      silent = true,
    })
    
    vim.api.nvim_buf_set_keymap(bufnr, 'n', '<S-Tab>', '', {
      callback = function()
        current_field = current_field > 1 and current_field - 1 or #field_names
        update_display()
      end,
      noremap = true,
      silent = true,
    })
    
    -- Edit field
    vim.api.nvim_buf_set_keymap(bufnr, 'n', '<CR>', '', {
      callback = edit_field,
      noremap = true,
      silent = true,
    })
    
    -- Submit
    vim.api.nvim_buf_set_keymap(bufnr, 'n', '<C-s>', '', {
      callback = submit_form,
      noremap = true,
      silent = true,
    })
    
    -- Close keymaps
    vim.api.nvim_buf_set_keymap(bufnr, 'n', 'q', '', {
      callback = close_popup,
      noremap = true,
      silent = true,
    })
    vim.api.nvim_buf_set_keymap(bufnr, 'n', '<Esc>', '', {
      callback = close_popup,
      noremap = true,
      silent = true,
    })
    
    -- Initial display update
    update_display()
    
    vim.notify('Use Tab/Shift-Tab to navigate, Enter to edit, Ctrl-S to submit', vim.log.levels.INFO)
  end
end

-- Helper function to create a simple floating window with JIRA issue content
local function create_simple_float_window(key, content)
  vim.notify('create_simple_float_window called for: ' .. key, vim.log.levels.INFO)
  
  -- Check if vim.split exists
  if not vim.split then
    error('vim.split is nil')
  end
  
  local lines = vim.split(content, '\n')
  vim.notify('Split content into ' .. #lines .. ' lines', vim.log.levels.INFO)
  
  -- Check vim.o exists
  if not vim.o then
    error('vim.o is nil')
  end
  
  -- Calculate window dimensions
  local width = math.max(60, math.floor(vim.o.columns * 0.8))
  local height = math.max(20, math.floor(vim.o.lines * 0.8))
  vim.notify('Window dimensions: ' .. width .. 'x' .. height, vim.log.levels.INFO)
  
  -- Check vim.api exists
  if not vim.api then
    error('vim.api is nil')
  end
  
  if not vim.api.nvim_create_buf then
    error('vim.api.nvim_create_buf is nil')
  end
  
  -- Create buffer
  vim.notify('Creating buffer...', vim.log.levels.INFO)
  local bufnr = vim.api.nvim_create_buf(false, true)
  if not bufnr then
    error('Failed to create buffer')
  end
  vim.notify('Created buffer: ' .. bufnr, vim.log.levels.INFO)
  
  vim.api.nvim_buf_set_lines(bufnr, 0, -1, false, lines)
  vim.notify('Set buffer lines', vim.log.levels.INFO)
  
  -- Set buffer options with error checking
  if not vim.api.nvim_buf_set_option then
    error('vim.api.nvim_buf_set_option is nil')
  end
  
  vim.api.nvim_buf_set_option(bufnr, 'filetype', 'markdown')
  vim.api.nvim_buf_set_option(bufnr, 'modifiable', false)
  vim.api.nvim_buf_set_option(bufnr, 'readonly', true)
  vim.api.nvim_buf_set_name(bufnr, 'Jira Issue: ' .. key)
  vim.notify('Set buffer options', vim.log.levels.INFO)
  
  -- Calculate position
  local row = math.floor((vim.o.lines - height) / 2)
  local col = math.floor((vim.o.columns - width) / 2)
  vim.notify('Calculated position: row=' .. row .. ', col=' .. col, vim.log.levels.DEBUG)
  
  -- Create floating window (remove title features for compatibility)
  local win_opts = {
    relative = 'editor',
    width = width,
    height = height,
    row = row,
    col = col,
    border = 'rounded',
  }
  
  if not vim.api.nvim_open_win then
    error('vim.api.nvim_open_win is nil')
  end
  
  vim.notify('Opening floating window...', vim.log.levels.DEBUG)
  local win_id = vim.api.nvim_open_win(bufnr, true, win_opts)
  if not win_id then
    error('Failed to create floating window')
  end
  vim.notify('Created floating window: ' .. win_id, vim.log.levels.DEBUG)
  
  -- Set up keymaps
  local function close_window()
    if vim.api.nvim_win_is_valid and vim.api.nvim_win_is_valid(win_id) then
      vim.api.nvim_win_close(win_id, true)
    end
  end
  
  if not vim.api.nvim_buf_set_keymap then
    error('vim.api.nvim_buf_set_keymap is nil')
  end
  
  -- Set up multiple quit keymaps  
  local keymap_opts = {
    callback = close_window,
    noremap = true,
    silent = true,
  }
  
  vim.api.nvim_buf_set_keymap(bufnr, 'n', 'q', '', keymap_opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', '<Esc>', '', keymap_opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', 'ZZ', '', keymap_opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', 'ZQ', '', keymap_opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', '<C-c>', '', keymap_opts)
  vim.notify('Set up keymaps', vim.log.levels.DEBUG)
  
  vim.notify('Successfully created floating window for: ' .. key, vim.log.levels.INFO)
  return bufnr, win_id
end

-- Helper function to create a window with JIRA issue content
local function create_issue_window(key, content)
  -- Validate inputs
  if not key or key == '' then
    error('Invalid key provided to create_issue_window')
  end
  if not content or content == '' then
    error('Invalid content provided to create_issue_window')
  end
  
  -- Try simple floating window first (more reliable)
  vim.notify('Calling create_simple_float_window for: ' .. key, vim.log.levels.DEBUG)
  local bufnr, win_id = create_simple_float_window(key, content)
  if bufnr and win_id then
    vim.notify('Opened issue in floating window: ' .. key, vim.log.levels.INFO)
    return bufnr, win_id
  end
  
  -- Fallback to trying plenary popup
  vim.notify('Simple window failed, trying plenary popup: ' .. tostring(bufnr), vim.log.levels.WARN)
  
  local popup_ok, popup = pcall(require, 'plenary.popup')
  if not popup_ok then
    error('Both simple window and plenary.popup failed. plenary.popup error: ' .. tostring(popup))
  end
  
  if not popup or not popup.create then
    error('plenary.popup.create function not available. popup type: ' .. type(popup))
  end
  
  local lines = vim.split(content, '\n')
  local width = math.max(60, math.floor(vim.o.columns * 0.8))
  local height = math.max(20, math.floor(vim.o.lines * 0.8))
  
  local popup_opts = {
    title = 'Jira Issue: ' .. key,
    line = math.max(1, math.floor((vim.o.lines - height) / 2)),
    col = math.max(1, math.floor((vim.o.columns - width) / 2)),
    minwidth = width,
    minheight = height,
    borderchars = { '─', '│', '─', '│', '╭', '╮', '╯', '╰' },
    highlight = 'Normal',
    borderhighlight = 'FloatBorder',
  }
  
  local plenary_success, plenary_bufnr, plenary_win_id = pcall(popup.create, lines, popup_opts)
  if not plenary_success then
    error('Both window approaches failed. Plenary error: ' .. tostring(plenary_bufnr))
  end
  
  if not plenary_bufnr or not plenary_win_id then
    error('Plenary popup creation returned invalid values: bufnr=' .. tostring(plenary_bufnr) .. ', win_id=' .. tostring(plenary_win_id))
  end
  
  -- Set buffer options
  vim.api.nvim_buf_set_option(plenary_bufnr, 'filetype', 'markdown')
  vim.api.nvim_buf_set_option(plenary_bufnr, 'modifiable', false) 
  vim.api.nvim_buf_set_option(plenary_bufnr, 'readonly', true)
  
  -- Set up keymaps
  local function close_window()
    if vim.api.nvim_win_is_valid(plenary_win_id) then
      vim.api.nvim_win_close(plenary_win_id, true)
    end
  end
  
  vim.api.nvim_buf_set_keymap(plenary_bufnr, 'n', 'q', '', {
    callback = close_window,
    noremap = true,
    silent = true,
  })
  vim.api.nvim_buf_set_keymap(plenary_bufnr, 'n', '<Esc>', '', {
    callback = close_window,
    noremap = true,
    silent = true,
  })
  
  vim.notify('Opened issue in plenary popup: ' .. key, vim.log.levels.INFO)
  return plenary_bufnr, plenary_win_id
end

-- Helper function to search for a specific JIRA issue key
local function jira_find_issue()
  return function()
    vim.ui.input({ prompt = 'JIRA Issue Key (e.g. TO-128): ' }, function(key)
      if key and key ~= '' then
        -- Validate issue key format (PROJECT-NUMBER)
        if not key:match('^%u+%-%d+$') then
          vim.notify('Invalid issue key format. Expected: PROJECT-123', vim.log.levels.WARN)
          return
        end
        
        -- First try to get the issue directly
        local output = vim.fn.system('jira issue view ' .. key)
        local exit_code = vim.v.shell_error
        
        if exit_code == 0 and output and output ~= '' then
          -- Issue found, display it in a window
          create_issue_window(key, output)
          vim.notify('Found and opened issue: ' .. key, vim.log.levels.INFO)
        else
          -- Issue not found, search for similar keys
          vim.notify('Issue ' .. key .. ' not found. Searching for similar issues...', vim.log.levels.WARN)
          
          -- Extract project prefix and search for issues in that project
          local project = key:match('^(%u+)%-')
          if project then
            local search_cmd = 'issue list --jql "project=' .. project .. ' AND key ~ ' .. key .. '"'
            jira_telescope(search_cmd, 'Search Results for: ' .. key)()
          else
            vim.notify('Could not extract project from key: ' .. key, vim.log.levels.ERROR)
          end
        end
      end
    end)
  end
end

return {
  'nvim-lua/plenary.nvim',
  name = 'jira-keybindings',
  lazy = false,
  dependencies = { 'nvim-telescope/telescope.nvim' },
  keys = {
    -- Issue management
    {
      '<leader>jl',
      jira_telescope('issue list', 'Jira Issues'),
      desc = '[J]ira [L]ist issues (Telescope)',
    },
    {
      '<leader>jv',
      function()
        vim.ui.input({ prompt = 'Issue key: ' }, function(key)
          if key and key ~= '' then
            local output = vim.fn.system('jira issue view ' .. key)
            if vim.v.shell_error == 0 and output and output ~= '' then
              create_issue_window(key, output)
            else
              vim.notify('Failed to fetch issue: ' .. key, vim.log.levels.ERROR)
            end
          end
        end)
      end,
      desc = '[J]ira [V]iew issue',
    },
    {
      '<leader>jc',
      jira_create_issue_popup(),
      desc = '[J]ira [C]reate issue (popup form)',
    },
    {
      '<leader>ja',
      function()
        vim.ui.input({ prompt = 'Issue key: ' }, function(key)
          if key and key ~= '' then
            vim.cmd('!jira issue assign ' .. key)
          end
        end)
      end,
      desc = '[J]ira [A]ssign issue',
    },
    {
      '<leader>jm',
      function()
        vim.ui.input({ prompt = 'Issue key: ' }, function(key)
          if key and key ~= '' then
            vim.cmd('!jira issue move ' .. key)
          end
        end)
      end,
      desc = '[J]ira [M]ove/transition issue',
    },
    {
      '<leader>jo',
      function()
        vim.ui.input({ prompt = 'Issue key: ' }, function(key)
          if key and key ~= '' then
            vim.fn.system('jira open ' .. key)
          end
        end)
      end,
      desc = '[J]ira [O]pen in browser',
    },
    -- Comments
    {
      '<leader>jC',
      function()
        vim.ui.input({ prompt = 'Issue key: ' }, function(key)
          if key and key ~= '' then
            vim.cmd('!jira issue comment add ' .. key)
          end
        end)
      end,
      desc = '[J]ira add [C]omment',
    },
    -- Sprint management
    {
      '<leader>js',
      jira_cmd_buffer('sprint list', 'Jira Sprints'),
      desc = '[J]ira [S]print list',
    },
    -- Project info
    {
      '<leader>jp',
      jira_cmd_buffer('project list', 'Jira Projects'),
      desc = '[J]ira [P]roject list',
    },
    -- User info
    {
      '<leader>jM',
      jira_cmd_buffer('me', 'Jira User Info'),
      desc = '[J]ira [M]e (user info)',
    },
    -- Quick actions
    {
      '<leader>j/',
      function()
        vim.ui.input({ prompt = 'JQL Query: ' }, function(query)
          if query and query ~= '' then
            jira_telescope('issue list --jql "' .. query .. '"', 'JQL Search: ' .. query)()
          end
        end)
      end,
      desc = '[J]ira search with JQL (Telescope)',
    },
    -- My issues
    {
      '<leader>jn',
      jira_telescope('issue list -a $(jira me)', 'My Assigned Issues'),
      desc = '[J]ira my assig[N]ed issues (Telescope)',
    },
    -- Recent issues
    {
      '<leader>jr',
      jira_telescope('issue list --order-by updated --reverse', 'Recent Issues'),
      desc = '[J]ira [R]ecent issues (Telescope)',
    },
    -- Cache management
    {
      '<leader>jx',
      clear_cache,
      desc = '[J]ira clear cache (e[X]pire)',
    },
    -- Find specific issue
    {
      '<leader>jf',
      jira_find_issue(),
      desc = '[J]ira [F]ind issue by key',
    },
  },
}