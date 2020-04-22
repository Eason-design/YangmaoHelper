"ui";

let goldGame = require("./src/godenGard.js");
let antForestGame = require("./src/antForest.js");
let dingdongGame = require("./src/dingdong.js");
let taoLifeGame = require("./src/taoLife.js");
// let weakScreen = require("./src/AutoUnLockScreen.js");
// const CONFIG_STORAGE_NAME = 'starsBallTargetScore'
let configStorage = storages.create('starsBallTargetScore');

let deviceWidth = device.width;
let deviceHeight = device.height;

//判断无障碍服务有没有开启
let installService = false;
//是否连续执行 买菜签到
let isOpenDingdong = false;
//是否连续执行 淘金币
let isOpenTaobaoGold = false;
let isOpenTaolife = true;//是否执行陶人生
let isOpenTmFarm = true;//是否执行天猫农场
//蚂蚁森林
let isOpenAntForest = false;
let isOpenAntFarmElse = true;//是否连带执行蚂蚁庄园
//支付宝积分
let isNeedGoAlipayScore = true;
//当前执行的脚本线程
let currentExeTask = null;
//当前屏幕截图权限
let currentCaptureScreenPermission = false;
//悬浮窗权限
let popPermission = false;
//蚂蚁森林 巡航模式
let isOpenCruiseMode = false;
//淘人生 是否执行
// let isOPenTaoLifeOnly = false;
//是否执行星星球
let isOpenAntFarmStartBall = true;
//默认的数量
let defaultBarScore = configStorage.get("starsBallTargetScore", 210);
// 是否开启早7点定时自动偷能量
let isOpenTimerForestTask = configStorage.get("isOpenTimerForestTask", false);;
//是否每5小时循环一次
let isOpen5HourTask = configStorage.get("isOpen5HourTask", false);;;
//上次设置的密码
let savePassowrd = configStorage.get("savePhonePassword");

ui.layout(
    <vertical>
        <text marginLeft="15dp" marginTop="10sp" textColor="#D65253">下面的无障碍、截图、悬浮窗权限必须给，否则无法正常运行</text>
        <text marginLeft="15dp" marginTop="10sp" textColor="#D65253">本项目代码开源，请放心使用！！！需要源码加群联系作者</text>
        <text marginLeft="15dp" marginTop="10sp" textColor="#2b8754">联系作者：QQ群 567679111</text>
        <horizontal w="auto" h="auto" marginLeft="15dp">
            <text marginLeft="30sp">无障碍</text>
            <Switch w="auto" h="auto" id="autoService" checked="{{auto.service != null}}"></Switch>
            <text marginLeft="30sp">截图</text>
            <Switch w="auto" h="auto" id="captureScreenService" checked="{{currentCaptureScreenPermission}}"></Switch>
            <text marginLeft="30sp">悬浮窗</text>
            <Switch w="auto" h="auto" id="popService" checked="{{popPermission}}"></Switch>
        </horizontal>
        <ScrollView>
            <vertical margin={"15dp"}>
                
                <vertical>
                    <text textSize="18sp" textStyle="bold">功能1：淘宝-金币庄园</text>
                    {/* <horizontal marginLeft="30sp">
                        <CheckBox id="cbTaolife" checked={isOpenTaolife} />
                        <text>淘金币庄园是否 执行淘人生</text>
                    </horizontal>
                    <horizontal marginLeft="30sp">
                        <CheckBox id="cbTmFarm" checked={isOpenTmFarm} />
                        <text>淘金币庄园是否 执行天猫农场</text>
                    </horizontal> */}
                    <button id={"exeGoldManor"} marginLeft="15dp" marginRight="15dp">单独执行 金币庄园</button>
                </vertical>

                <vertical>
                    <text textSize="18sp" textStyle="bold">功能2：支付宝-蚂蚁森林-蚂蚁庄园</text>
                    <horizontal w="auto" h="auto" marginLeft="30dp">
                        <CheckBox id="sAliScore" w="auto" h="auto" checked={isNeedGoAlipayScore}></CheckBox>
                        <text marginLeft="15dp" marginRight="15dp">是否领取支付宝积分</text>
                    </horizontal>
                    <horizontal marginLeft="30dp">
                        <CheckBox id="cbAntFarm" checked={isOpenAntFarmElse} />
                        <text marginLeft="15dp">在蚂蚁森林完毕后 是否执行蚂蚁庄园</text>
                    </horizontal>
                    <horizontal marginLeft="30dp">
                        <CheckBox id="cbAntFarmStartsBall" checked={isOpenAntFarmStartBall} />
                        <text marginLeft="15dp">蚂蚁庄园 玩星星球 目标分数</text>
                        <input id="ballScore" text={defaultBarScore} />
                        <button id="ballSetOk" text="确定" />
                    </horizontal>
                    <text marginLeft="30dp" marginRight="15dp">备注：蚂蚁庄园的星星球，如果需要单独刷分，设置好分数，确定，打开悬浮穿。去到星星球游戏界面，然后打开悬浮点击第二个！</text>
                    <horizontal marginLeft="30sp">
                        <CheckBox id="cbAntCruise" checked={isOpenCruiseMode} />
                        <text marginLeft="15dp" marginRight="15dp" h="60dp">蚂蚁森林巡航模式 解释：半个小时内无脑循环在蚂蚁森林。关闭方法：音量键上键，或者悬浮窗的X</text>
                    </horizontal>
                    <button id={"exeAntForest"} marginLeft="15dp" marginRight="15dp">单独执行 蚂蚁森林</button>
                </vertical>

                <vertical>
                    <text textSize="18sp" textStyle="bold">功能3：王者荣耀薅羊毛</text>
                    <text marginLeft="15dp" marginRight="15dp">使用方法：需要下载的APP有：掌上道聚城、心悦俱乐部、应用宝、QQ浏览器、王者人生、腾讯新闻、腾讯视频、王者营地、腾讯游戏管家</text>
                    <text marginLeft="15dp" marginRight="15dp">这里只介绍方法 自己领吧</text>
                </vertical>

                <vertical>
                    <text textSize="18sp" textStyle="bold">功能4：王者荣耀自动刷金币</text>
                    <text marginLeft="15dp" marginRight="15dp">使用方法：只给无障碍和悬浮窗，打开悬浮窗放一边，进入游戏，关闭所有广告，打开悬浮窗，点击第三个提示开启成功！注意：某些手机例如华为有一个截图弹窗，点击确定。特别解释：在开始前，自己手动先去冒险关卡选择合适的阵容和地图，要求能全自动通关的，自己过一次</text>
                    <button id={"goWangzhe"} marginLeft="15dp" marginRight="15dp">打开王者荣耀</button>
                </vertical>

                <vertical>
                    <text textSize="18sp" textStyle="bold">功能5：定时执行蚂蚁森林</text>
                    <text marginLeft="15dp" marginRight="15dp">说明：每天早上7点整进行开始(因为CPU休眠，可能纯在误差)，7点执行30分钟循环后结束</text>
                    <text marginLeft="15dp" marginRight="15dp">特别强调：按音量上键会关闭所有脚本，如果不想误关，建议关闭此功能，方法打开本APP，按下返回键，右上角3个点点击设置，对应关闭即可 </text>
                    <horizontal marginLeft="30dp">
                        <text marginLeft="15dp">当前手机密码</text>
                        <input id="phonePassword" text={savePassowrd} inputType="numberPassword" />
                        <button id="phonePasswordConfirm" text="保存" />
                    </horizontal>
                    <horizontal marginLeft="30dp">
                        <CheckBox id="openTimerForestTask" checked={isOpenTimerForestTask} />
                        <text marginLeft="15dp" h="45dp">是否每日早7点定时偷能量，注意需要APP保活，对应开启方法自行百度</text>
                    </horizontal>
                    {/* <horizontal marginLeft="30dp">
                        <CheckBox id="open5HourTask" checked={isOpen5HourTask} />
                        <text marginLeft="15dp">是否启用5小时循环定时唤醒</text>
                    </horizontal> */}
                    <button id={"startTimerAntTask"} marginLeft="15dp" marginRight="15dp">保存配置并运行</button>
                </vertical>
                <button marginBottom="30dp" id={"doMutilTask"} text={"全部执行"} textColor="#FFFFFF" bg="#01a9f3" marginLeft="30dp" marginRight="30dp" />
            </vertical>
        </ScrollView>
    </vertical>


);

ui.autoService.on("check", function (checked) {
    // 用户勾选无障碍服务的选项时，跳转到页面让用户去开启
    if (checked && auto.service == null) {
        app.startActivity({
            action: "android.settings.ACCESSIBILITY_SETTINGS"
        });
    }
    if (!checked && auto.service != null) {
        auto.service.disableSelf();
    }
    installService = checked;
});

ui.captureScreenService.on("check", function () {
    if (!currentCaptureScreenPermission) {
        let screenPermissionTask = threads.start(function () {
            // engines.execScriptFile("./src/antForest.js");
            let screenPermission = false;
            try {
                screenPermission = requestScreenCapture();
            } catch (error) {
                screenPermission = true;
            }
            currentCaptureScreenPermission = screenPermission;
            if (!screenPermission) {
                toast("请给截图权限");
                stopTask();
            }
        });
    }
});

function oncrete() {
    console.log("生命周期onCreate");
    installService = auto.service != null;
    try {
        screenPermission = requestScreenCapture();
    } catch (error) {
        screenPermission = true;
    }
    let engins = engines.all();
    if (engins != null) {
        engins.forEach(engin => {
            let soureces = engin.getSource();
            if (soureces.toString().endsWith("pop_animi.js")) {
                popPermission = true;
            }
        });
    }
    //重新设置UI
    ui.popService.checked = true;

}

ui.exeAntForest.click(() => {
    currentExeTask = threads.start(function () {
        // engines.execScriptFile("./src/antForest.js");
        let screenPermission = false;
        try {
            screenPermission = requestScreenCapture();
        } catch (error) {
            screenPermission = true;
        }
        if (!screenPermission) {
            toast("请给截图权限");
            stopTask();
        } else {
            antForestGame(isOpenAntFarmElse, isNeedGoAlipayScore, isOpenCruiseMode, isOpenAntFarmStartBall);
        }
    });
});

ui.exeGoldManor.click(() => {
    // engines.execScriptFile("./src/godenGard.js");
    currentExeTask = threads.start(function () {
        goldGame(isOpenTaolife, isOpenTmFarm);
    });
});
// ui.goTaobao.click(() => {
//     launch("com.taobao.taobao");
// });

ui.goWangzhe.click(() => {
    launch("com.tencent.tmgp.sgame");
});


// ui.cbTaolife.on("check", function (checked) {
//     isOpenTaolife = checked;
//     console.log("isOpenTaolife=" + isOpenTaolife);
// });

// ui.cbTmFarm.on("check", function (checked) {
//     isOpenTmFarm = checked;
//     console.log("isOpenTmFarm=" + isOpenTmFarm);
// });

ui.sAliScore.on("check", function (checked) {
    isNeedGoAlipayScore = checked;
    console.log("isNeedGoAlipayScore=" + isNeedGoAlipayScore);
});

ui.cbAntFarm.on("check", function (checked) {
    isOpenAntFarmElse = checked;
    console.log("isOpenAntFarmElse=" + isOpenAntFarmElse);
});


ui.cbAntFarmStartsBall.on("check", function (checked) {
    isOpenAntFarmStartBall = checked;
    console.log("isOpenAntFarmStartBall=" + isOpenAntFarmStartBall);
});
ui.openTimerForestTask.on("check", function (checked) {
    isOpenTimerForestTask = checked;
    configStorage.put("isOpenTimerForestTask", checked);
    console.log("isOpenTimerForestTask=" + isOpenTimerForestTask);
});
// ui.open5HourTask.on("check", function (checked) {
//     isOpen5HourTask = checked;
//     configStorage.put("isOpen5HourTask", checked);
//     console.log("isOpen5HourTask=" + isOpen5HourTask);
// });

ui.cbAntCruise.on("check", function (checked) {
    isOpenCruiseMode = checked;
    isOpenAntFarmElse = false;
    ui.cbAntFarm.checked = false;
    console.log("isOpenCruiseMode=" + isOpenCruiseMode);
});


ui.ballSetOk.click(function () {
    //通过getText()获取输入的内容
    let score = ui.ballScore.getText();
    console.log("设置分数", score);
    configStorage.put("starsBallTargetScore", parseInt(score));
    toast("设置成功");
});

ui.phonePasswordConfirm.click(function () {
    //通过getText()获取输入的内容
    let passowrd = ui.phonePassword.getText();
    if (passowrd != undefined) {
        console.log("保存的密码", passowrd);
        configStorage.put("savePhonePassword", String(passowrd));
        toastLog("设置成功");
    } else {
        toastLog("密码不能为空");
    }
});

ui.startTimerAntTask.click(function () {
    //开启定时7点功能
    if (isOpenTimerForestTask) {
        setInterval(function () {
            let dateT = new Date();
            let h = dateT.getHours();
            let m = dateT.getMinutes();
            if (h == 7 && m >= 0 && m < 10) {
                let starting = configStorage.get("antForestCanDo", false);
                if (!starting) {
                    engines.execScriptFile("./src/AutoUnLockScreen.js");
                }
            }
            console.log("当前检测时间", h + ":" + m);
        }, 1 * 60 * 1000);
    }

    // if (isOpen5HourTask) {
    //     setInterval(function () {
    //         let dateT = new Date();
    //         let h = dateT.getHours();
    //         let m = dateT.getMinutes();
    //         if (h == 7 && m >= 30 && m < 40) {
    //             let starting = configStorage.get("antForestCanDo", false);
    //             if (!starting) {
    //                 engines.execScriptFile("./src/AutoUnLockScreen.js");
    //             }
    //         }
    //         console.log("当前检测时间循环5的", h + ":" + m);
    //     }, 1 * 60 * 1000);
    // }
    toastLog("定时任务已开启动");
});


ui.popService.on("check", function (checked) {
    if (!checked) {
        let engins = engines.all();
        if (engins != null) {
            engins.forEach(engin => {
                let soureces = engin.getSource();
                if (soureces.toString().endsWith("pop_animi.js")) {
                    engin.forceStop();
                }
            });
        }
    } else {
        engines.execScriptFile("./pop_animi.js");
    }
    popPermission = checked;
    console.log("popPermission=" + popPermission);
});

ui.doMutilTask.click(() => {
    if (installService && currentCaptureScreenPermission && popPermission) {
        if (currentExeTask != null) {
            currentExeTask.interrupt();
        }
        console.log("全部执行");
        currentExeTask = threads.start(function () {
            if (isOpenDingdong) {
                toastLog("开始执行叮咚签到");
                dingdongGame();
            }
            if (isOpenTaobaoGold) {
                toastLog("开始执行淘庄园");
                goldGame(isOpenTaolife, isOpenTmFarm);
            }
            if (isOpenAntForest) {
                toastLog("开始执行蚂蚁森林");
                antForestGame(isOpenAntFarmElse, isNeedGoAlipayScore);
            }
        });
    } else {
        toastLog("请给全部权限");
        console.log("installService=" + installService, "currentCaptureScreenPermission=" + currentCaptureScreenPermission, "popPermission=" + popPermission)
    }
});

function stopTask() {
    if (currentExeTask == null) {
        toastLog("没有进行中的脚本");
    } else {
        if (currentExeTask.isAlive()) {
            threads.shutDownAll();
            toastLog("停止脚本！");
        } else {
            toastLog("没有进行中的脚本");
        }
    }
}
