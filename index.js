const phantom = require('phantom')
const request = require('request')
const MOBILEUA = require('./mobileUA.js')
const CONFIG = {
  /* 目标地址 */
  // targetUr: 'http://www.cnblogs.com/hlere',
  targetUr: 'https://h5.ele.me/aliday/landing?type=qudao35',
  /* 总的UV统计 */
  totalUv: 10,
  /* 页面停留时间 */
  timeTicker: [10],
  /* 每秒并发数 */
  perRequest: 3
}

/* 以刷uv数 */
let countUv = 0;

/* 获取一个页面停留时间 */
function getUserStayTime () {
  let len = CONFIG.timeTicker.length
  let times = CONFIG.timeTicker
  let random = times[Math.floor(Math.random() * len)]
  return random
}

/* 获取一个代理ip */
function getIpPort () {
  return '115.193.103.30:9000'
}

function getProxyList() {
    var apiURL = 'http://dev.kuaidaili.com/api/getproxy/?orderid=932342904226365&num=1&b_pcchrome=1&b_pcie=1&b_pcff=1&b_android=1&b_iphone=1&b_ipad=1&protocol=1&method=2&an_an=1&an_ha=1&dedup=1&sep=3';

    return new Promise((resolve, reject) => {
      request(apiURL, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          let bd = body.toString().trim()
          console.log(bd) // 打印google首页
          resolve(bd);
        } else {
          return reject(error);
        }
      })
    })
}

getProxyList()

/* 获取一个移动端的ua */
function getMobildUA () {
  let len = MOBILEUA.length
  let random = Math.floor(Math.random() * len)
  let UA = MOBILEUA[random]
  logger.info(UA)
  return UA
}


/* 产生一个页面 */
function ceratesingleUserView (ipPort) {

  (async function() {
    //  `--proxy=${ipPort}`,
    const instance = await phantom.create([`--proxy=${ipPort}`, '--load-images=no', '--web-security=false']);
    const page = await instance.createPage();
    await page.on('onResourceRequested', function(requestData) {
      // if (requestData.url.indexOf('/collect/log') > -1) {
      //   logger.info(`${requestData.url}\n`);
      // }
      logger.info(`${requestData.url}\n`);
    });

    // page.setting('userAgent', getMobildUA()).then(function(value){
    //   console.log(value)
    //     page.property('viewportSize', {width: 414, height: 736}).then(async () => {

    //     });
    // });

    /* 正式发起请求 */
    const status = await page.open(CONFIG.targetUr);
    const content = await page.property('content');

    let time =  getUserStayTime()
    setTimeout(async () => {
      countUv++
      await instance.exit();
      logger.info(`----   ${ipPort}   停留时间   ${time}   s`)
    }, time * 1000)
    /* 正式发起请求end */
  })();
}

/* 配置路径打印 */
const log4js = require('log4js');
log4js.configure({
  appenders: { cheese: { type: 'file', filename: `./log/cheese-${Date.now()}.log` } },
  categories: { default: { appenders: ['cheese'], level: 'info' } }
});

const logger = log4js.getLogger('ipUv');

ceratesingleUserView(getIpPort())




