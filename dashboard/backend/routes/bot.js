const express = require('express');
const router = express.Router();
const { isStaff, isAdmin } = require('../auth');
const { exec, spawn } = require('child_process');
const path = require('path');
const botManager = require('../discordManager');
const fs = require('fs');

// Store the bot process reference and PID file
let botProcess = null;
const PID_FILE = path.join(__dirname, '..', '..', '..', 'bot', 'bot.pid');

// Helper to check if process is running by PID
function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

// Get bot status
router.get('/status', isStaff, async (req, res) => {
  try {
    const isWindows = process.platform === 'win32';
    
    // Function to check if bot is running via system processes
    const checkSystemProcesses = () => {
      return new Promise((resolve) => {
        let command;
        
        if (isWindows) {
          // Simpler PowerShell command - just check if node process has bot\index.js in command line
          command = `powershell -Command "$processes = Get-WmiObject Win32_Process -Filter \\"name = 'node.exe'\\"; foreach ($p in $processes) { if ($p.CommandLine -like '*bot*index.js*') { Write-Output $p.ProcessId; break } }"`;
        } else {
          command = `pgrep -f "node.*bot.*index.js"`;
        }
        
        console.log('[Status Check] Executing command:', command);
        exec(command, (error, stdout, stderr) => {
          const isRunning = stdout && stdout.trim().length > 0;
          console.log('[Status Check] Command output:', stdout);
          console.log('[Status Check] Is running:', isRunning);
          if (error) console.log('[Status Check] Command error:', error.message);
          resolve(isRunning);
        });
      });
    };

    // Check if our spawned process is running
    if (botProcess && !botProcess.killed) {
      console.log('[Status Check] Using spawned process reference');
      return res.json({ 
        status: 'online',
        uptime: 0,
        user: botManager.client && botManager.client.isReady() ? {
          username: botManager.client.user.username,
          id: botManager.client.user.id
        } : null
      });
    }

    // Check PID file
    if (fs.existsSync(PID_FILE)) {
      const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
      console.log('[Status Check] Found PID file with PID:', pid);
      if (isProcessRunning(pid)) {
        console.log('[Status Check] PID is running');
        return res.json({ 
          status: 'online',
          uptime: 0,
          user: botManager.client && botManager.client.isReady() ? {
            username: botManager.client.user.username,
            id: botManager.client.user.id
          } : null
        });
      } else {
        console.log('[Status Check] PID not running, cleaning up file');
        fs.unlinkSync(PID_FILE);
      }
    }

    // Fallback: check system processes
    console.log('[Status Check] Checking system processes');
    const isRunning = await checkSystemProcesses();
    
    res.json({ 
      status: isRunning ? 'online' : 'offline',
      uptime: 0,
      user: botManager.client && botManager.client.isReady() ? {
        username: botManager.client.user.username,
        id: botManager.client.user.id
      } : null
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start bot
router.post('/start', isAdmin, async (req, res) => {
  const botDir = path.join(__dirname, '..', '..', '..', 'bot');
  const indexPath = path.join(botDir, 'index.js');
  const isWindows = process.platform === 'win32';
  
  console.log('=== START BOT REQUEST ===');
  console.log('Bot directory:', botDir);
  console.log('Index path:', indexPath);
  console.log('Bot dir exists:', fs.existsSync(botDir));
  console.log('Index exists:', fs.existsSync(indexPath));
  
  // Check if bot directory and index.js exists
  if (!fs.existsSync(botDir)) {
    console.error('Bot directory not found:', botDir);
    return res.status(500).json({ error: 'Bot directory not found: ' + botDir });
  }
  
  if (!fs.existsSync(indexPath)) {
    console.error('Bot index.js not found:', indexPath);
    return res.status(500).json({ error: 'Bot index.js not found: ' + indexPath });
  }

  // Check if bot is already running via system processes
  const checkRunning = () => {
    return new Promise((resolve) => {
      let command;
      
      if (isWindows) {
        command = `powershell -Command "$processes = Get-WmiObject Win32_Process -Filter \\"name = 'node.exe'\\"; foreach ($p in $processes) { if ($p.CommandLine -like '*bot*index.js*') { Write-Output $p.ProcessId; break } }"`;
      } else {
        command = `pgrep -f "node.*bot.*index.js"`;
      }
      
      console.log('[Start Check] Executing command:', command);
      exec(command, (error, stdout, stderr) => {
        const running = stdout && stdout.trim().length > 0;
        console.log('[Start Check] Output:', stdout);
        console.log('[Start Check] Already running:', running);
        resolve(running);
      });
    });
  };

  // Check if bot is already running
  if (botProcess && !botProcess.killed) {
    return res.status(400).json({ error: 'Bot is already running (managed by dashboard)' });
  }

  // Check PID file
  if (fs.existsSync(PID_FILE)) {
    const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
    if (isProcessRunning(pid)) {
      return res.status(400).json({ error: 'Bot is already running (PID: ' + pid + ')' });
    } else {
      fs.unlinkSync(PID_FILE);
    }
  }

  // Check system processes
  const alreadyRunning = await checkRunning();
  if (alreadyRunning) {
    return res.status(400).json({ error: 'Bot is already running (started externally)' });
  }

  try {
    // Spawn bot process (works on both Windows and Linux)
    botProcess = spawn('node', ['index.js'], {
      cwd: botDir,
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    // Write PID to file
    fs.writeFileSync(PID_FILE, botProcess.pid.toString());

    botProcess.on('error', (error) => {
      console.error('Bot process error:', error);
      botProcess = null;
      if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
    });

    botProcess.on('exit', (code) => {
      console.log('Bot process exited with code:', code);
      botProcess = null;
      if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
    });

    console.log('Bot process started with PID:', botProcess.pid);
    
    res.json({ 
      message: 'Bot started successfully',
      success: true,
      pid: botProcess.pid
    });
  } catch (error) {
    console.error('Failed to start bot:', error);
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
    res.status(500).json({ error: error.message });
  }
});

// Stop bot
router.post('/stop', isAdmin, async (req, res) => {
  console.log('=== STOP BOT REQUEST ===');
  console.log('Spawned process exists:', !!botProcess);
  console.log('Spawned process killed:', botProcess ? botProcess.killed : 'N/A');
  console.log('Spawned process PID:', botProcess ? botProcess.pid : 'N/A');
  
  try {
    const isWindows = process.platform === 'win32';
    let pidsToKill = [];
    
    // Collect PIDs to kill
    if (botProcess && !botProcess.killed) {
      console.log('Adding spawned process PID to kill list:', botProcess.pid);
      pidsToKill.push(botProcess.pid);
      botProcess.kill('SIGTERM'); // Try to kill gracefully first
      botProcess = null;
    }

    // Check PID file
    if (fs.existsSync(PID_FILE)) {
      const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
      console.log('Found PID file with PID:', pid);
      console.log('Is PID running?', isProcessRunning(pid));
      if (isProcessRunning(pid) && !pidsToKill.includes(pid)) {
        console.log('Adding PID from file to kill list:', pid);
        pidsToKill.push(pid);
      }
      fs.unlinkSync(PID_FILE);
      console.log('PID file deleted');
    }

    // Also find any bot processes running that we don't know about
    const findBotProcesses = () => {
      return new Promise((resolve) => {
        let command;
        
        if (isWindows) {
          command = `powershell -Command "$processes = Get-WmiObject Win32_Process -Filter \\"name = 'node.exe'\\"; foreach ($p in $processes) { if ($p.CommandLine -like '*bot*index.js*') { Write-Output $p.ProcessId } }"`;
        } else {
          command = `pgrep -f "node.*bot.*index.js"`;
        }
        
        console.log('Searching for bot processes with command:', command);
        exec(command, (error, stdout, stderr) => {
          console.log('Search output:', stdout);
          console.log('Search error:', error?.message);
          if (stdout && stdout.trim().length > 0) {
            const pids = stdout.trim().split('\n').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
            console.log('Found PIDs from system search:', pids);
            resolve(pids);
          } else {
            resolve([]);
          }
        });
      });
    };

    const foundPids = await findBotProcesses();
    foundPids.forEach(pid => {
      if (!pidsToKill.includes(pid)) {
        console.log('Adding discovered PID to kill list:', pid);
        pidsToKill.push(pid);
      }
    });

    // Kill all collected PIDs at once
    if (pidsToKill.length > 0) {
      console.log('Final kill list:', pidsToKill);
      
      if (isWindows) {
        // Kill each PID individually for better error handling
        for (const pid of pidsToKill) {
          console.log(`Executing: taskkill /PID ${pid} /F /T`);
          exec(`taskkill /PID ${pid} /F /T`, (error, stdout, stderr) => {
            if (error && !error.message.includes('not found') && !error.message.includes('No running instance')) {
              console.error(`Taskkill error for PID ${pid}:`, error.message);
            } else {
              console.log(`Successfully killed PID ${pid}`);
            }
          });
        }
      } else {
        pidsToKill.forEach(pid => {
          console.log(`Killing PID ${pid} with SIGKILL`);
          try {
            process.kill(pid, 'SIGKILL'); // Use SIGKILL for immediate termination
            console.log(`Successfully killed PID ${pid}`);
          } catch (e) {
            console.error(`Error killing PID ${pid}:`, e.message);
          }
        });
      }
      
      // Wait a bit to ensure processes are killed
      setTimeout(() => {
        console.log('Stop operation completed');
      }, 1000);
    } else {
      console.log('No bot processes found to kill');
    }
    
    res.json({ 
      message: 'Bot stop command sent',
      success: true,
      killedPids: pidsToKill
    });
  } catch (error) {
    console.error('Stop bot exception:', error);
    res.status(500).json({ error: error.message });
  }
});

// Restart bot
router.post('/restart', isAdmin, (req, res) => {
  console.log('=== RESTART BOT REQUEST ===');
  const botDir = path.join(__dirname, '..', '..', '..', 'bot');
  
  try {
    // Stop existing process
    if (botProcess && !botProcess.killed) {
      console.log('Killing existing bot process:', botProcess.pid);
      process.kill(botProcess.pid, 'SIGTERM');
      botProcess = null;
    }

    // Check and kill PID from file
    if (fs.existsSync(PID_FILE)) {
      const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
      if (isProcessRunning(pid)) {
        console.log('Killing process from PID file:', pid);
        process.kill(pid, 'SIGTERM');
      }
      fs.unlinkSync(PID_FILE);
    }

    // Kill any running bot processes
    const isWindows = process.platform === 'win32';
    const stopCommand = isWindows 
      ? `Get-Process node | Where-Object { $_.Path -like '*\\bot\\*' } | Stop-Process -Force`
      : `pkill -9 -f "node.*bot.*index.js"`;
    
    exec(stopCommand, { shell: isWindows ? 'powershell.exe' : '/bin/bash' }, (error) => {
      if (error && !error.message.includes('No matching processes')) {
        console.error('Error stopping bot:', error);
      }
    });
    
    // Wait before restarting
    setTimeout(() => {
      console.log('Starting bot process...');
      
      botProcess = spawn('node', ['index.js'], {
        cwd: botDir,
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      // Write PID to file
      fs.writeFileSync(PID_FILE, botProcess.pid.toString());

      botProcess.on('error', (error) => {
        console.error('Bot process error:', error);
        botProcess = null;
        if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
      });

      botProcess.on('exit', (code) => {
        console.log('Bot process exited with code:', code);
        botProcess = null;
        if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
      });

      console.log('Bot process restarted with PID:', botProcess.pid);
    }, 2000);
    
    res.json({ 
      message: 'Bot is restarting',
      success: true
    });
  } catch (error) {
    console.error('Restart bot error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
