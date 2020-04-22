// Modules to control application life and create native browser window
const {app,dialog , BrowserWindow,Menu,shell,ipcMain,globalShortcut} = require('electron')
const path = require('path')
const fs = require('fs-extra')
const common = require('./common')

const log = require('electron-log');

const autoUpdater = require('electron-updater').autoUpdater
// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// 通过main进程发送事件给renderer进程，提示更新信息
function sendUpdateMessage(text) {
  mainWindow.webContents.send('message', text)
}

ipcMain.on('check-for-update', function(event, arg) {
  //设置检查更新的 url，并且初始化自动更新。这个 url 一旦设置就无法更改。


  autoUpdater.on('error', function(error){});

  //当开始检查更新的时候触发
  autoUpdater.on('checking-for-update', function() {});

  //当发现一个可用更新的时候触发，更新包下载会自动开始
  autoUpdater.on('update-available', function(info) {});

  //当没有可用更新的时候触发
  autoUpdater.on('update-not-available', function(info) {});

  // 更新下载进度事件
  autoUpdater.on('download-progress', function(progressObj) {})
  /**
   *  event Event
   *  releaseNotes String - 新版本更新公告
   *  releaseName String - 新的版本号
   *  releaseDate Date - 新版本发布的日期
   *  updateURL String - 更新地址
   * */
  autoUpdater.on('update-downloaded',  function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {});

  //执行自动更新检查
  autoUpdater.checkForUpdates();
});

let currentVersion = autoUpdater.currentVersion;



// 检测更新，在你想要检查更新的时候执行，renderer事件触发后的操作自行编写
function updateHandle(){
  //minimize
  ipcMain.on('hide-window', () => {
    mainWindow.minimize();
  });
  //maximize
  ipcMain.on('show-window', () => {
    mainWindow.maximize();
  });
  //unmaximize
  ipcMain.on('orignal-window', () => {
    mainWindow.unmaximize();
  });
  //打开默认浏览器
  ipcMain.on('open-office-website', function(event, arg){
    shell.openExternal(arg)
  })

  ipcMain.on('check-for-update', function(event, arg) {
    let message={
      appName:'CRD 手提包 13面排版系统',
      error:'检查更新出错, 请联系开发人员',
      errorTips:'检查更新出错, 请联系开发人员',
      checking:'正在检查更新……',
      updateAva:'检测到新版本，正在下载……',
      updateNotAva:'现在使用的就是最新版本，不用更新',
      downloaded: '最新版本已下载，将在重启程序后更新'
    };


    autoUpdater.on('error', function(error){
      return dialog.showMessageBox(mainWindow, {
        type: 'info',
        buttons: ['OK'],
        title: message.appName,
        message: message.errorTips,
        detail: '\r' + message.error
      });

      sendUpdateMessage(message.error)
    });

    //当开始检查更新的时候触发
    autoUpdater.on('checking-for-update', function() {
      sendUpdateMessage(message.checking)
      return dialog.showMessageBox(mainWindow, {
        type: 'info',
        buttons: ['OK'],
        title: message.appName,
        message: message.checking
      });
    });

    //当发现一个可用更新的时候触发，更新包下载会自动开始
    autoUpdater.on('update-available', function(info) {
      sendUpdateMessage(message.updateAva)
      var downloadConfirmation = dialog.showMessageBox(mainWindow, {
        type: 'info',
        buttons: ['OK'],
        title: message.appName,
        message: message.updateAva
      });
      if (downloadConfirmation === 0) {
        return;
      }
    });

    //当没有可用更新的时候触发
    autoUpdater.on('update-not-available', function(info) {
      return dialog.showMessageBox(mainWindow, {
        type: 'info',
        buttons: ['OK'],
        title: message.appName,
        message: message.updateNotAva
      });
      sendUpdateMessage(message.updateNotAva)
    });

    // 更新下载进度事件
    autoUpdater.on('download-progress', function(progressObj) {
      mainWindow.webContents.send('downloadProgress', progressObj)
    })
    /**
     *  event Event
     *  releaseNotes String - 新版本更新公告
     *  releaseName String - 新的版本号
     *  releaseDate Date - 新版本发布的日期
     *  updateURL String - 更新地址
     * */
    autoUpdater.on('update-downloaded',  function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
      var index = dialog.showMessageBox(mainWindow, {
        type: 'info',
        buttons: ['现在重启', '稍后重启'],
        title: message.appName,
        message: message.downloaded,
        //detail: releaseName + "\n\n" + releaseNotes
      });
      log.info(index);
      if (index === 1) return;
      //在下载完成后，重启当前的应用并且安装更新
      autoUpdater.quitAndInstall();
      //通过main进程发送事件给renderer进程，提示更新信息
      //mainWindow.webContents.send('isUpdateNow')
    });

    //执行自动更新检查
    autoUpdater.checkForUpdates();
  });
}


const child_process_1 = require("child_process");

const storePath = app.getPath('userData')
// 如果数据目录不存在，则重新创建
if (!fs.pathExistsSync(storePath)) {
    fs.mkdirpSync(storePath)
}

const {DB} = require('../universal/database')

let db = new DB(storePath);

db.set("currentVersion",currentVersion)


let mainWindow =null;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
    frame:false,
    webPreferences: {
      preload: path.join(__dirname, '../renderer/preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('src/renderer/index.html')

  updateHandle();
  // Open the DevTools.
  //mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
//app.whenReady().then(createWindow)

let execChildProcess = null;


let configObject = null;


app.on('ready', function() {
  // autoUpdater.checkForUpdatesAndNotify();

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu) // 设置菜单部分
  createWindow()

  // 注册一个 'F10' 的全局快捷键
  const ret = globalShortcut.register('F10', () => {
    if (!isStart){
      mainWindow.minimize();
      //crd3m.main(configObject);
      log.info(__dirname)
      execChildProcess = child_process_1.fork(__dirname+"/exec.js",{env: {storePath:storePath}})

      execChildProcess.on('message',function (m) {
        dialog.showMessageBox(mainWindow, {
          type: 'info',
          buttons: ['OK'],
          title: "13面手提包CRD",
          message: "执行完毕,本次共执行 "+m.totalSize+" 条"
        });
      })
      // 启动后设置为已经启动状态
      isStart = true;
    }
    // process.exit(22)
    // log.info('F10 is pressed')
  })

  // 注册一个 'F11' 的全局快捷键
  const ret1 = globalShortcut.register('F11', () => {
    //child.send({'shutdown': true})
    log.info('F11 is pressed')
    //app.quit();
    if (isStart){
      mainWindow.restore();
      isStart = false;
      if (db.has('crd')){
        let crd = db.get('crd');

        // 判断到处目录中已经有文件才加一，否则不加一
        //if (configObject.exportModelFilePath)

        // configObject = db.get('configObject');
        // let re = common.getSequenceNumber(crd.pch,crd.pchIncreateFlag);
        // crd.pch = re.pch;
        // crd.pchIncreateFlag = re.pchIncreateFlag;
        // db.set('crd',crd)
        // configObject.pch = re.pch;
        // db.set('configObject',configObject);
        mainWindow.webContents.send('refresh','refresh');
      }
      execChildProcess.kill()
    }
    // process.exit(22)
  })

  if (!ret) {
    log.info('F10 registration failed')
  }
  if (!ret1) {
    log.info('F11 registration failed')
  }

  // 检查快捷键是否注册成功
  log.info(globalShortcut.isRegistered('F10'))
  log.info(globalShortcut.isRegistered('F11'))

})

app.on('will-quit', () => {
  // 注销快捷键
  globalShortcut.unregister('F10')
  globalShortcut.unregister('F11')

  // 注销所有快捷键
  globalShortcut.unregisterAll()
})


app.on('browser-window-created', function () {
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})


app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})



/**
 * 注册键盘快捷键
 * 其中：label: '切换开发者工具',这个可以在发布时注释掉
 */
let template = [
  {
    label: '编辑',
    submenu: [{
      label: '复制',
      accelerator: 'CmdOrCtrl+C',
      role: 'copy'
    }, {
      label: '粘贴',
      accelerator: 'CmdOrCtrl+V',
      role: 'paste'
    }, {
      label: '刷新',
      accelerator: 'CmdOrCtrl+R',
      click: function (item, focusedWindow) {
        if (focusedWindow) {
          // on reload, start fresh and close any old
          // open secondary windows
          if (focusedWindow.id === 1) {
            BrowserWindow.getAllWindows().forEach(function (win) {
              if (win.id > 1) {
                win.close()
              }
            })
          }
          focusedWindow.reload()
        }
      }
    }]
  },
  {
    label: '窗口',
    role: 'window',
    submenu: [{
      label: '最小化',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    }, {
      label: '关闭',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    }, {
      label: '切换开发者工具',
      accelerator: (function () {
        if (process.platform === 'darwin') {
          return 'Alt+Command+I'
        } else {
          return 'Ctrl+Shift+I'
        }
      })(),
      click: function (item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.toggleDevTools()
        }
      }
    },{
      type: 'separator'
    }]
  },
  {
    label: '帮助',
    role: 'help',
    submenu: [{
      label: '意见反馈 )',
      click: function () {
        shell.openExternal('https://forum.iptchain.net')
      }
    }]
  }
]


// 针对Windows端的一些配置
if (process.platform === 'win32') {
  const helpMenu = template[template.length - 1].submenu
}



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.





let isStart = false;


//findCorelDrawAndFullScreen()

ipcMain.on('start', (sys, msg) => {
  log.info(msg) //接收窗口传来的消息
  if (!isStart){

//D:\app\software\测试文件\做图用版\选图\AL-001.jpg
    //child = childProcess.fork('src/main/crd3m.js',[],{ env: { dbPath: dbPath } });
    mainWindow.minimize();
    // configObject = JSON.parse(msg);
    //crd3m.main(configObject);
    execChildProcess = child_process_1.fork(__dirname+"/exec.js",{env: {storePath:storePath}})

    execChildProcess.on('message',function (m) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        buttons: ['OK'],
        title: "13面手提包CRD",
        message: "执行完毕,本次共执行 "+m.totalSize+" 条"
      });
    })
    // 启动后设置为已经启动状态
    isStart = true;
  }

})

ipcMain.on('stop', (sys, msg) => {
  // if (isStart){
  //   isStart = false;
  //   execChildProcess.kill()
  // }
  app.quit();
})


