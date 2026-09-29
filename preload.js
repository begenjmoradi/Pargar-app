const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('pargarShell', { isElectron: true, platform: process.platform });
