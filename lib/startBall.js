importClass(java.util.concurrent.LinkedBlockingQueue)
importClass(java.util.concurrent.ThreadPoolExecutor)
importClass(java.util.concurrent.TimeUnit)

// let { commonFunctions } = require('./CommonFunction.js')
let { runningQueueDispatcher } = require('./lib/RunningQueueDispatcher.js')
// let _config = require('./config.js').config
const CONFIG_STORAGE_NAME = 'ant_start_score'
let configStorage = storages.create(CONFIG_STORAGE_NAME);

requestScreenCapture(false)

const WIDTH = device.width
const HEIGHT = device.height

const widthRate = WIDTH / 1080
const heightRate = HEIGHT / 2160

let default_config = {
  ballColor: '#ff4e86ff',
  reco: [200, 100, 750, 1900],
  threshold: 4,
  // 目标分数
  targetScore: getTargetScoreDef(),
  // 运行超时时间 毫秒
  timeout: 240000
}

function getTargetScoreDef() {
  let scoreTarget = configStorage.get("starsBallTargetScore");
  if (!scoreTarget) {
    scoreTarget = 210;
  }
  console.log("目标分数", scoreTarget);
  return scoreTarget;
}

let config = {}
Object.keys(default_config).forEach(key => {
  let val = default_config[key]
  if (typeof val === 'string') {
    config[key] = val
  } else if (Object.prototype.toString.call(val) === '[object Array]') {
    let newArrayConfig = [
      parseInt(val[0] * widthRate),
      parseInt(val[1] * heightRate),
      parseInt(val[2] * widthRate),
      parseInt(val[3] * heightRate)
    ]
    config[key] = newArrayConfig
  } else {
    config[key] = val
  }
})
console.verbose('转换后的配置：' + JSON.stringify(config))

function Player() {
  this.floatyWindow = null
  this.floatyLock = null
  this.floatyInitCondition = null

  this.threadPool = null

  this.initPool = function () {
    this.threadPool = new ThreadPoolExecutor(4, 8, 60, TimeUnit.SECONDS, new LinkedBlockingQueue(1024))
  }

  this.initLock = function () {
    this.floatyLock = threads.lock()
    this.floatyInitCondition = this.floatyLock.newCondition()
  }

  this.listenStop = function () {
    let _this = this
    threads.start(function () {
      sleep(1000)
      toastLog('即将开始可按音量上键关闭', true)
      events.observeKey()
      events.onceKeyDown('volume_up', function (event) {
        runningQueueDispatcher.removeRunningTask()
        log('准备关闭线程')
        _this.destoryPool()
        engines.myEngine().forceStop()
        exit()
      })
    })
  }

  this.initFloaty = function () {
    let _this = this
    this.threadPool.execute(function () {
      sleep(500)
      _this.floatyLock.lock()
      _this.floatyWindow = floaty.rawWindow(
        <frame gravity="left">
          <text id="content" textSize="15dp" textColor="#00ff00" />
        </frame>
      )
      _this.floatyWindow.setTouchable(false)
      _this.floatyWindow.setPosition(device.width / 2, config.reco[1])
      _this.floatyWindow.content.text('准备寻找球球的位置')
      _this.floatyInitCondition.signalAll()
      _this.floatyLock.unlock()
    })
  }

  this.getScore = function () {
    let score_id = 'game-score-text'
    let scoreContainer = idMatches(score_id).exists() ? idMatches(score_id).findOne(1000) : null
    if (scoreContainer) {
      let scoreVal = parseInt(scoreContainer.text())
      if (isFinite((scoreVal))) {
        return scoreVal
      }
    }
    return 0
  }

  this.setFloatyColor = function (colorStr) {
    if (colorStr && colorStr.match(/^#[\dabcdef]{6}$/)) {
      this.floatyLock.lock()
      if (this.floatyWindow === null) {
        this.floatyInitCondition.await()
      }
      let _this = this
      ui.run(function () {
        _this.floatyWindow.content.setTextColor(android.graphics.Color.parseColor(colorStr))
      })
      this.floatyLock.unlock()
    }
    console.error('颜色配置无效:' + colorStr)
  }

  this.setFloatyInfo = function (point, text) {
    this.floatyLock.lock()
    if (this.floatyWindow === null) {
      this.floatyInitCondition.await()
    }
    let _this = this
    ui.run(function () {
      _this.floatyWindow.content.text(text)
      _this.floatyWindow.setPosition(point.x, point.y)
    })
    this.floatyLock.unlock()
  }


  this.showFloatyCountdown = function (point, content, count) {
    let showContent = '[' + count + ']' + content
    while (count-- > 0) {
      this.setFloatyInfo(point, showContent)
      showContent = '[' + count + ']' + content
      sleep(1000)
    }
  }

  this.playing = function (stopScore) {
    stopScore = stopScore || 230
    let currentScore = 0
    let clickCount = 0
    let start = new Date().getTime()
    while ((currentScore = this.getScore()) < stopScore) {
      this.floatyLock.lock()
      if (this.floatyWindow === null) {
        this.floatyInitCondition.await()
      }
      this.floatyLock.unlock()
      sleep(30)
      let img = captureScreen()
      let point = images.findColor(img, config.ballColor, {
        region: config.reco,
        threshold: config.threshold
      })
      content = '蓝球球:' + currentScore
      if (!point) {
        point = images.findColor(img, '#ffff4c4c', {
          region: config.reco,
          threshold: config.threshold
        })
        content = '红球球:' + currentScore
      }
      content = "";
      if (point) {
        click(point.x + 10, point.y + 20)
        clickCount++
        this.setFloatyInfo(point, content)
      }

      while (textContains('再来一局').exists()) {
        currentScore = currentScore < stopScore ? 0 : currentScore
        let restart = textContains('再来一局').findOne(1000)
        if (restart) {
          let bounds = restart.bounds()
          click(bounds.centerX(), bounds.centerY())
        }
      }
    }
    toastLog('最终分数:' + currentScore + ' 点击了：' + clickCount + '次 总耗时：' + (new Date().getTime() - start) + 'ms')
    let point = {
      x: parseInt(device.width / 3),
      y: parseInt(device.height / 3),
    }
    this.setFloatyColor('#ff0000')
    this.showFloatyCountdown(point, '运行结束, 最终得分：' + currentScore, 3)
    this.setFloatyInfo({
      x: parseInt(device.width / 2),
      y: point.y
    }, '再见')
    sleep(2000)
  }

  this.setTimeoutExit = function () {
    setTimeout(function () {
      runningQueueDispatcher.removeRunningTask()
      exit()
    }, 240000)
  }


  this.startPlaying = function (targetScore) {
    this.initPool()
    this.initLock()
    this.listenStop()
    this.initFloaty()
    this.setTimeoutExit()
    this.playing(targetScore || config.targetScore)
    this.destoryPool()
    runningQueueDispatcher.removeRunningTask()
    exit()
  }

  this.destoryPool = function () {
    this.threadPool.shutdownNow()
    this.threadPool = null
    this.floatyWindow = null
  }
}


// if (!commonFunctions.checkAccessibilityService(true)) {
//   try {
//     auto.waitFor()
//   } catch (e) {
//     warnInfo('auto.waitFor()不可用')
//     auto()
//   }
// }
auto()
runningQueueDispatcher.addRunningTask()
// console.show()
let player = new Player()
player.startPlaying()
runningQueueDispatcher.removeRunningTask()

