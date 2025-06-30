const { contextBridge, ipcRenderer } = require('electron/renderer')

const WINDOW_API = {
  greet: (message) => ipcRenderer.send("greet", message)
}

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
}, 
'electron', 
{
  doThing: () => ipcRenderer.send('do-a-thing')
},
'api', WINDOW_API)