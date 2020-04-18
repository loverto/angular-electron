// 导入大漠插件版本
const path = require("path");

const dm = require('dm.dll')
const sleep = require('./sleep');
const fs = require('fs')
const readline = require('readline');

const dmExt = require('./dm.dll.ext')
const coreldraw = require('./coreldraw')
const common = require('./common')

const log4js = require('log4js');
log4js.configure({
    appenders: {
        out: { type: 'stdout' },
        stb13: { type: 'file', filename: 'stb-13.log' } },
    categories: { default: { appenders: ['out','stb13'], level: 'debug' } }
});

const logger = log4js.getLogger('stb');

const {DB} = require('../universal/database')

// 获取大漠插件的版本
console.log(dm.dll.ver())

let db = null;

const windowTitle = "CorelDRAW X6 (64 位)";
let devWidth = 1440
let devHeight = 900
let screenSize = dm.getScreenSize();
console.log(screenSize)
let winW = screenSize.width/devWidth;
let winH = screenSize.height/devHeight;

// dpi 界面坐标
let dpiUIPosition = [1021,629]

let dpiSwitchCoordinate = [871,529]

let dpiSwitchFlagCoordinate =  [869,548]
let dpiSwitchFlagColor =  "000000"
let dpiSwitchFlagSim =  0.8

// 需要修改的dpi的值
let dpiValue = 96

let fileSuff = ".cdr";

let modelFilePath = ""
let textFilePath = ""
let imageFilePath = ""
let exportModelFilePath = ""
let pch = ""

// 手提包 13面的旋转90度的 10个
let modelSpin = ["443,318","470,319","497,319","442,357","470,356","497,357","442,393","470,394","497,393","530,314","530,340","530,369","530,395"]

// 导出需要选择的坐标点
let exportCoordinate = ["408,272","583,435"]

// 手提包 13面的正常的坐标 4个
let modelNormal = ["530,314","530,340","530,369","530,395"]

// 旋转坐标点
let spinCoordinate = [366,96]

// 箭头坐标
let arrowCoordinate = [12,136]


// 导入图片坐标
let importImagePositionCoordinate = ["149,481","223,498","273,496","323,495","372,495","170,498"]


// 左上角点击坐标
let leftClickCoordinate = importImagePositionCoordinate[0].split(",")

// 空白位置坐标
let clickWhite = [207,328]


// 模板坐标坐标
let modelCoordinate = importImagePositionCoordinate


// 宽和高位置
let widthAndHeightPosition = ["180,88","180,108"]
// 宽高参数
let widthHeightParam = ["389,247","357,255","347,245","325,229.5"]
// 参考行坐标
let refRowCoordinate =["396,495","526,498","667,503","800,498"]
// 批量复制左上右下坐标
let batchCopyCoordinate = ["120,453", "407,519"]

// 替换坐标
// 替换文本查找坐标, 替换文本替换坐标, 全部替换坐标,替换完成，替换关闭
let replaceCoordinate = common.ratioConversion(["614,396","610,426","907,455","748,484","966,363"],winW,winH)
// 替换需要查找的文本
let findText = "编号位置";
// 批次号增量标记
let pchIncreateFlag = -1


let refYValueOne = 103 * (winH)
let refYValueTwo = 76 * (winH)
let refYValueThree = 133 * (winH)
let refYValueFour = 64 * (winH)

let diffOne = 0;
let diffTwo = 0;

/*
* 按行读取文件内容
* 返回：字符串数组
* 参数：fReadName:文件名路径
*      callback:回调函数
* */
function readFileToArr(fReadName,callback){
    const fRead = fs.createReadStream(fReadName);
    const objReadline = readline.createInterface({
        input: fRead
    });
    const arr = new Array();
    objReadline.on('line',function (line) {
        arr.push(line);
        //console.log('line:'+ line);
    });
    objReadline.on('close',function () {
        // console.log(arr);
        callback(arr);
    });
}


/**
 * 主方法
 */
function main(configObject) {
    logger.debug("stb 13 is starting up ")
    if (!configObject){
        let storePath = process.env.storePath;
        db = new DB(storePath);
        logger.debug("from db config")
        configObject  = db.get("configObject");
        logger.debug("config value " + JSON.stringify(configObject))
    }


    initConfig(configObject);
    // 如果没有找到窗口，则退出
    if (!coreldraw.findCorelDrawAndFullScreen(windowTitle)){
        logger.debug("corel draw window is not find")
        return;
    };

    //activeInput(windowTitle,"US")
    // return;
    logger.debug("corel draw eas")
    coreldraw.eas();
    logger.debug("corel draw start open model")
    coreldraw.openUModel(modelFilePath)
    sleep.msleep(1000)
    logger.debug("corel draw mouse is move arrow")
    // 设置为可移动
    coreldraw.moveAndClick(arrowCoordinate)
    if (fs.existsSync(textFilePath)){
        logger.debug("file is exists")
        //let readFileSync = fs.readFileSync(textFilePath);
        // 按行读取数据
        readFileToArr(textFilePath,function (data) {
            logger.debug("data length"+data.length)

            // 遍历按行读取的数据
            for (let i =0; i<data.length; i++){
                // 判断当前是第几张图
                let number = i%13;
                // 够14张则保存图片
                if (i>0 && number==0){
                    let jpgSuffix = ".jpg";
                    // 获取序列号
                    let result = common.getSequenceNumber(pch,pchIncreateFlag);
                    pch = result.pch;
                    pchIncreateFlag = result.pchIncreateFlag
                    let input = "US"
                    // activeInput(windowTitle,input);

                    // 替换编号
                    coreldraw.findAndReplaceText(replaceCoordinate,findText,pch);

                    let exportFileName = exportModelFilePath + path.sep + pch + jpgSuffix;

                    // activeInput(windowTitle,input);

                    // 导出指定格式的数据
                    coreldraw.exportFormate(exportCoordinate,exportFileName);

                    // 休眠80秒
                    sleep.msleep(80000)
                    dm.moveTo(dpiSwitchFlagCoordinate[0],dpiSwitchFlagCoordinate[1]);
                    sleep.msleep(500)
                    dm.leftClick();
                    sleep.msleep(500)
                    // 休眠80秒
                    sleep.msleep(30000)

                    // 判断是否开启转换状态

                    let color = dm.getColor(dpiSwitchFlagCoordinate[0],dpiSwitchFlagCoordinate[1]);

                    console.log(color);
                    // 不匹配的情况下怎么做
                    if((dmExt.cmpColor(dpiSwitchFlagCoordinate[0],dpiSwitchFlagCoordinate[1],dpiSwitchFlagColor,dpiSwitchFlagSim)==1)){
                        dm.moveTo(dpiSwitchCoordinate[0],dpiSwitchCoordinate[1]);
                        sleep.msleep(500)
                        dm.leftClick();
                        sleep.msleep(500)
                    }

                    // 设置dpi的值
                    common.adjustInterfaceValueNotCtrlAndA(dpiUIPosition,dpiValue);
                    dm.moveTo(dpiSwitchCoordinate[0],dpiSwitchCoordinate[1]);
                    sleep.msleep(500)
                    dm.leftClick();
                    sleep.msleep(500)
                    sleep.msleep(30000);
                    coreldraw.enter();
                    sleep.msleep(200);

                    let exportPathAbsout = exportModelFilePath + path.sep + pch + fileSuff;
                    coreldraw.saveAsPath(exportPathAbsout);
                    sleep.msleep(2000)
                    coreldraw.closeModel();
                    sleep.msleep(1000)
                    coreldraw.eas();
                    // 保存当前的序列号
                    if(db.has("configObject")){
                        configObject.pch = pch;
                        db.set("configObject",configObject)
                    }
                    if (i<data.length-1){
                        sleep.msleep(500)
                        coreldraw.openUModel(modelFilePath);
                        sleep.msleep(200)
                        // 可移动坐标
                        coreldraw.moveAndClick(arrowCoordinate)
                    }
                }


                let picfilename = data[i];
                let picPath = common.getFilePathByFileName(imageFilePath,picfilename);
                // 图片路径和模板路径都存在
                if (fs.existsSync(picPath) && fs.existsSync(modelFilePath)){
                    handler(picPath,null,false,modelCoordinate,picfilename,number)
                }
                sleep.msleep(500)
                coreldraw.moveAndClick(clickWhite)
                sleep.msleep(500)


            }

            // 最后执行完当前所有的图片后，编号自动更新一位，避免下次重命名
            // 获取序列号
            let result = common.getSequenceNumber(pch,pchIncreateFlag);
            pch = result.pch;
            pchIncreateFlag = result.pchIncreateFlag

            // 保存当前的序列号
            if(db.has("configObject")){
                configObject.pch = pch;
                db.set("configObject",configObject)
            }



        })
    }
}


function activeInput(windowTitle,input) {
    const hwnd = dm.findWindow("", windowTitle);
    if (dmExt.checkInputMethod(hwnd, input) == 0) {
        dmExt.activeInputMethod(hwnd, input)
    }
}


/**
 * 核心处理业务方法
 * @param coreldrawHandlerFilePath 文件路径
 * @param model 模型
 * @param flag 标志位
 * @param coordinateArray 坐标点数组
 * @param filename 文件名称
 * @param number 当前张数
 */
function handler(coreldrawHandlerFilePath,model,flag,coordinateArray,filename,number) {

    sleep.msleep(500)
    coreldraw.importUModel(coreldrawHandlerFilePath);
    sleep.msleep(500)
    dm.moveTo(leftClickCoordinate[0],leftClickCoordinate[1])
    sleep.msleep(200)
    dm.leftClick();
    sleep.msleep(1000)

    // 解锁
    coreldraw.ctrlAndU()

    // 点击空白坐标
    sleep.msleep(500)
    coreldraw.moveAndClick(clickWhite)
    sleep.msleep(500)

    // 删除不相关的图
    let moveCoordinate = [];
    // 13 寸
    let keepPic = 3;
    moveCoordinate = coreldraw.deleteOtherObject(coordinateArray, keepPic);

    let endCoordinate = null;
    if (number < 9){
        // 移动到旋转坐标
        let spinNumber = 90;
        console.log("开始旋转对象")
        common.adjustObjectInInterfaceValue(moveCoordinate,spinCoordinate,spinNumber);
        console.log("旋转对象结束")
        let spinCoordinateElement = modelSpin[number];
        endCoordinate = spinCoordinateElement.split(",");
    }else {
        let modelNormalElement = modelSpin[number];
        endCoordinate = modelNormalElement.split(",");
    }
    common.selectAreaByPointArray(moveCoordinate,endCoordinate);

}

/**
 * 初始化配置文件
 * @param configObject 配置对象
 */
function initConfig(configObject) {
    modelFilePath = configObject.modelFilePath;
    imageFilePath = configObject.imageFilePath;
    exportModelFilePath = configObject.exportModelFilePath;
    textFilePath = configObject.textFilePath;
    pch = configObject.pch;
}

exports.main = main


main();
