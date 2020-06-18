// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    function $(id){
        return document.getElementById(id);
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type])

    }
    const {DB} = require('../universal/database');

    let app = require('electron').remote.app;

    let path = app.getPath('userData');
    let db = new DB(path)

    const ipc = require('electron').ipcRenderer;

    let currentVersion = db.get("currentVersion");

    ipc.on('refresh',()=>{
        // 从 数据库中读取配置文件
        if (db.has('configObject')) {
            console.log("the input value from to db")
            configObject = db.get('configObject');
            imageFilePathText.value = configObject.imageFilePath;
            textFilePathText.value = configObject.textFilePath;
            modelFilePathText.value = configObject.modelFilePath;
            exportModelFilePathText.value = configObject.exportModelFilePath;
            pchText.value = configObject.pch;
        }
    })










    /**
     * 创建上传元素
     * @param id 元素id
     * @param isDir 是否时文件夹
     */
    function createFileElement (id,isDir) {
        let fileEl = document.getElementById(id)
        if (!fileEl) {
            const fileField = document.createElement('input')
            fileField.id = id
            fileField.type = 'file'
            fileField.name = id
            fileField.accept = 'application/crd'
            fileField.style = 'display: none;'
            if (isDir){
                fileField.accept = 'application/crd'
                fileField.setAttribute('webkitdirectory',true)
                fileField.setAttribute('directory',true)
            }
            fileEl = fileField
        }
        return fileEl
    }



    //imageFilePath  // webkitdirectory directory
    //textFilePath
    //modelFilePath
    //exportModelFilePath // webkitdirectory directory

    let imageFilePathBtn = $('imageFilePathBtn');
    let textFilePathBtn = $('textFilePathBtn');
    let modelFilePathBtn = $('modelFilePathBtn');
    let exportModelFilePathBtn = $('exportModelFilePathBtn');
    let autoupdateBtn = $('autoupdate');
    autoupdateBtn.addEventListener("click",function (e) {
        ipc.send('check-for-update', 'event-update');
    })

    $('appVersion').innerText = currentVersion.version

    /**
     * 处理文件路径
     * @param filepath
     * @returns {*}
     */
    function getFilePath(filepath){
        console.log(filepath);
        let filepathArray = filepath.split('\\');
        let filepathArrayElement = filepathArray[filepathArray.length-1];
        console.log(filepathArrayElement);
        if (filepathArrayElement.indexOf(".")){
            let slice = filepathArray.slice(0,filepathArray.length-1);
            console.log(slice)
            return slice.join('\\')
        } else {
            return filepath;
        }

    }

    function handlerFile(event){
        let eleId = event.currentTarget.id;
        let fileEle = null;
        if (eleId.startsWith('imageFilePath')){
            fileEle = createFileElement('imageFilePath',true)
        }else if(eleId.startsWith('exportModelFilePath')){
            fileEle = createFileElement('exportModelFilePath',true)
        }else if(eleId.startsWith('modelFilePath')){
            fileEle = createFileElement('modelFilePath',false)
        }else if(eleId.startsWith('textFilePath')){
            fileEle = createFileElement('textFilePath',false)
        }
        fileEle.click()
        document.body.append(fileEle)
        fileEle.onabort = function () { alert() }
        fileEle.onchange = function (event) {
            let configObjectChange = {
                imageFilePath:null,
                exportModelFilePath:null,
                modelFilePath:null,
                textFilePath:null,
                pch:null
            };
            // 已经有配置存在了，只修改变更的地址
            if (db.has('configObject')){
               configObjectChange = db.get('configObject')
            }
            // 获取值
            let filePath = event.currentTarget.files[0].path;
            if (eleId.startsWith('imageFilePath')){
                filePath = getFilePath(filePath);
                configObjectChange.imageFilePath = filePath
                $('imageFilePathText').value = filePath;
            }else if(eleId.startsWith('exportModelFilePath')){
                filePath = getFilePath(filePath);
                configObjectChange.exportModelFilePath = filePath
                $('exportModelFilePathText').value = filePath;
            }else if(eleId.startsWith('modelFilePath')){
                configObjectChange.modelFilePath = filePath
                $('modelFilePathText').value = filePath;
            }else if(eleId.startsWith('textFilePath')){
                configObjectChange.textFilePath = filePath
                $('textFilePathText').value = filePath;
            }
            // 把变动过的设置进去
            db.set('configObject',configObjectChange);
        }

    }

    imageFilePathBtn.addEventListener('click',handlerFile)
    textFilePathBtn.addEventListener('click',handlerFile)
    modelFilePathBtn.addEventListener('click',handlerFile)
    exportModelFilePathBtn.addEventListener('click',handlerFile)

    const imageFilePath = document.getElementById('imageFilePath');
    const textFilePath = document.getElementById('textFilePath');
    const modelFilePath = document.getElementById('modelFilePath');
    const exportModelFilePath = document.getElementById('exportModelFilePath');

    const imageFilePathText = document.getElementById('imageFilePathText');
    const textFilePathText = document.getElementById('textFilePathText');
    const modelFilePathText = document.getElementById('modelFilePathText');
    const exportModelFilePathText = document.getElementById('exportModelFilePathText');
    const pchText = document.getElementById('pchText');

    imageFilePathText.addEventListener("change",function (event) {
        let configObjectChange = {
            imageFilePath:null,
            exportModelFilePath:null,
            modelFilePath:null,
            textFilePath:null,
            pch:null
        };
        // 已经有配置存在了，只修改变更的地址
        if (db.has('configObject')){
            configObjectChange = db.get('configObject')
        }
        let value = event.currentTarget.value;
        configObjectChange.imageFilePath = value;
        db.set('configObject',configObjectChange);
    })

    textFilePathText.addEventListener("change",function (event) {
        let configObjectChange = {
            imageFilePath:null,
            exportModelFilePath:null,
            modelFilePath:null,
            textFilePath:null,
            pch:null
        };
        // 已经有配置存在了，只修改变更的地址
        if (db.has('configObject')){
            configObjectChange = db.get('configObject')
        }
        let value = event.currentTarget.value;
        configObjectChange.textFilePath = value;
        db.set('configObject',configObjectChange);
    })

    modelFilePathText.addEventListener("change",function (event) {
        let configObjectChange = {
            imageFilePath:null,
            exportModelFilePath:null,
            modelFilePath:null,
            textFilePath:null,
            pch:null
        };
        // 已经有配置存在了，只修改变更的地址
        if (db.has('configObject')){
            configObjectChange = db.get('configObject')
        }
        let value = event.currentTarget.value;
        configObjectChange.modelFilePath = value;
        db.set('configObject',configObjectChange);
    })

    exportModelFilePathText.addEventListener("change",function (event) {
        let configObjectChange = {
            imageFilePath:null,
            exportModelFilePath:null,
            modelFilePath:null,
            textFilePath:null,
            pch:null
        };
        // 已经有配置存在了，只修改变更的地址
        if (db.has('configObject')){
            configObjectChange = db.get('configObject')
        }
        let value = event.currentTarget.value;
        configObjectChange.exportModelFilePath = value;
        db.set('configObject',configObjectChange);
    })

    pchText.addEventListener("change",function (event) {
        let configObjectChange = {
            imageFilePath:null,
            exportModelFilePath:null,
            modelFilePath:null,
            textFilePath:null,
            pch:null
        };
        // 已经有配置存在了，只修改变更的地址
        if (db.has('configObject')){
            configObjectChange = db.get('configObject')
        }
        let value = event.currentTarget.value;
        configObjectChange.pch = value;
        db.set('configObject',configObjectChange);
    })

    let configObject = null;

    // 从 数据库中读取配置文件
    if (db.has('configObject')) {
        console.log("the input value from to db")
        configObject = db.get('configObject');
        imageFilePathText.value = configObject.imageFilePath;
        textFilePathText.value = configObject.textFilePath;
        modelFilePathText.value = configObject.modelFilePath;
        exportModelFilePathText.value = configObject.exportModelFilePath;
        pchText.value = configObject.pch;
    }

    const start = document.getElementById('start');
    const pause = document.getElementById('pause');
    const end = document.getElementById('end');
    const updateKey = document.getElementById('updateKey');

    start.addEventListener("click", connectMain)
    end.addEventListener("click", stop)

    function stop() {
        ipc.send('stop', "stop")
    }

    function connectMain() {
        if (!db.has('configObject')) {
            configObject = {
                imageFilePath: getFilePath(imageFilePath.files[0].path),
                textFilePath: textFilePath.files[0].path,
                modelFilePath: modelFilePath.files[0].path,
                exportModelFilePath: getFilePath(exportModelFilePath.files[0].path),
                pch:pchText.value
            }
            db.set('configObject', configObject)
        }
        configObject = db.get("configObject");
        console.log(configObject)
        let configObjectString = JSON.stringify(configObject);
        console.log('index.html', configObjectString);
        ipc.send('start', configObjectString)
    }
})
