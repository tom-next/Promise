let events = require('events')
const log = console.log.bind(console)

// 这里先要实现一遍 发布/订阅模式
// TomEvent 继承了 node 中 events.EventEmitter 因此可以使用 发布/订阅模式
class TomEvent extends events.EventEmitter{
    constructor() {
        super()
    }
    // then 是将回调函数存起来，利用发布/订阅机制
    then(fulfilledHandler, errorHandler, progressHandler) {
        if(Object.prototype.toString.call(fulfilledHandler) === '[object Function]') {
            // 函数
            this.once('success', fulfilledHandler)
        }
        if(Object.prototype.toString.call(errorHandler) === '[object Function]') {
            // 函数
            this.once('error', errorHandler)
        }
        if(Object.prototype.toString.call(progressHandler) === '[object Function]') {
            // 函数
            this.once('progress', progressHandler)
        }
        return this
    }
}

// 触发执行上面回调函数的地方
// promise内部有三种状态: 未完成态、完成态和失败态。
class TomPromise {
    constructor(func) {
        // 接收一个参数
        this.tomEvents = new TomEvent()
        this.state = 'unfulfilled'
        this.finished = false
        this.resolve = this.resolve.bind(this)
        this.reject = this.reject.bind(this)
        this.progress = this.progress.bind(this)
        if(Object.prototype.toString.call(func) === '[object Function]') {
            // 函数
            func(this.resolve, this.reject)
        }else {
            // 这里应该做错误处理
        }
    }

    then(fulfilledHandler, errorHandler, progressHandler) {
        return this.tomEvents.then(fulfilledHandler, errorHandler, progressHandler)
    }

    resolve(obj) {
        this.state = 'fulfilled'
        this.tomEvents.emit('success', obj)
    }

    reject(obj) {
        // 这里应该做一个判断,只要有 reject, 当前的状态为 failed, 其他也立即停止
        if(this.finished) {
            // 这里应该返回另外的一个逻辑来调用 catch
            return;
        }
        this.finished = true
        this.state = 'failed'
        this.tomEvents.emit('error', obj)
    }

    progress(obj) {
        this.tomEvents.emit('progress', obj)
    }

    static all(arr) {
        // 默认接受 promise 数组
        let len = arr.length
        let result = []
        // 这里还是创建一个 promise 来记录当前循环的状态
        let t = new this((resolve, reject) => {
            for (let i = 0 ;i < arr.length; i++) {
                let promise = arr[i]
                promise.then((data) => {
                    len--
                    result[i] = data
                    if(len === 0) {
                        resolve(result)
                    }
                }, (err) => {
                    reject(err)
                })
            }
        })
        return t.then((data) => {
            console.log("都成功了", data)
        }, (err) => {
            console.log("没有成功", err)
        })
    }

}

const testPromise = () => {
    let promise1 = new TomPromise(function(resolve, reject) {
        setTimeout(function() {
            resolve('foo');
        }, 300)
    })
    promise1.then(function(value) {
        console.log("3333",value)
    })
}

const testPromiseAll = () => {
    let promise1 = new TomPromise(function(resolve, reject) {
        setTimeout(() => {
            resolve('promise1')
        }, 0)
    })

    let promise2 = new TomPromise(function(resolve, reject) {
        setTimeout(() => {
            resolve('promise2')
        }, 300)
    })

    let promise3 = new TomPromise(function(resolve, reject) {
        setTimeout(() => {
            resolve('promise3')
        }, 100)
    })

    TomPromise.all([promise1, promise2, promise3]).then((values) => {
        console.log("成功的结果是",values)
    }, (err) => {
        console.log("错误了", err)
    })
}

const __main = () => {
    testPromise()
    testPromiseAll()
}

__main()