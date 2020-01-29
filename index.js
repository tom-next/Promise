// 实现 promiseAs
class PromiseA {
    constructor(func) {
        this.succArg = undefined
        this.failArg = undefined
        this.successCallBacks = []
        this.failCallBacks = []
        this.STATUS = {
            PENDING: 1,
            RESOLVE: 2,
            REJECT: 3,
        }
        this._status = this.STATUS.PENDING
        this._execFun(func)
    }

    static all(array) {
        let result = []
        let len = array.length
        return new this((resolve, reject) => {
            for (let i = 0; i < array.length; i++) {
                let promise = array[i]
                promise.then((data) => {
                    len--
                    result[i] = data
                    if (len === 0) {
                        resolve(result)
                    }
                }, (err) => {
                    reject(err)
                })
            }
        })
    }

    static race(array) {
        return new this((resolve, reject) => {
            for (let i = 0; i < array.length; i++) {
                let promise = array[i]
                promise.then((data) => {
                    resolve(data)
                    return
                }, (err) => {
                    reject(err)
                })
            }
        })
    }

    _isFunction(f) {
        return Object.prototype.toString.call(f) === '[object Function]'
    }

    _execFun(fun) {
        let that = this
        if (this._isFunction(fun)) {
            fun(function () {
                // 这里将异步的结果保存在 successArg 中
                that.succArg = Array.prototype.slice.apply(arguments)
                that._status = that.STATUS.RESOLVE;
                // 将参数传下去
                that.resolve.apply(that, arguments)
            }, function () {
                // 失败的结果保存在 failArg 中
                that.failArg = Array.prototype.slice.apply(arguments)
                that._status = that.STATUS.REJECT

                that.reject.apply(that, arguments)
            })
        } else {
            this.resolve(fun)
        }
    }

    resolve() {
        // arg里面包括了异步返回的结果
        let arg = arguments
        let callback = this.successCallBacks.shift();
        if (this._status === this.STATUS.RESOLVE && callback) {
            // 执行回调函数 callback, 并且将执行结果给回调函数
            callback.apply(callback, arg)
        }
    }


    reject() {
        let arg = arguments
        let callback = this.failCallBacks.shift()
        if (this._status === this.STATUS.REJECT && callback) {
            callback.apply(callback, arg)
        }
    }

    then(success, fail) {
        this.done(success)
        this.fail(fail)
        return this
    }

    done(fun) {
        if (this._isFunction(fun)) {
            if (this._status === this.STATUS.RESOLVE) {
                // 结果
                fun.apply(fun, this.succArg)
            } else {
                this.successCallBacks.push(fun)
            }
        }
        return this
    }

    fail(fun) {
        if (this._isFunction(fun)) {
            if (this._status === this.STATUS.REJECT) {
                fun.apply(fun, this.failArg) 
            } else {
                this.failCallBacks.push(fun) 
            }
        }
        return this 
    }
}

const testPromise = () => {
    return new PromiseA((resolve, reject) => {
        setTimeout(() => {
            let a = 10
            resolve(a)
        }, 2000)
    }).then((value) => {
        console.log("测试 promise", value)
    })
}

const testPromiseAll = () => {
    let p1 = new PromiseA((resolve, reject) => {
        setTimeout(() => {
            let a = 10
            resolve(a)
        }, 2000)
    })

    let p2 = new PromiseA((resolve, reject) => {
        setTimeout(() => {
            let a = 3
            resolve(a)
        }, 3000)
    })
    return PromiseA.all([p1, p2]).then((value) => {
        console.log('promiseAll', value)
    })
}

const testPromoiseRace = () => {
    let p1 = new PromiseA((resolve, reject) => {
        setTimeout(() => {
            let a = 10
            resolve(a)
        }, 2000)
    })

    let p2 = new PromiseA((resolve, reject) => {
        setTimeout(() => {
            let a = 3
            resolve(a)
        }, 1000)
    })
    return PromiseA.race([p1, p2]).then((value) => {
        console.log('promiseRace', value)
    })
}

const main = () => {
    testPromise()
    testPromiseAll()
    testPromoiseRace()
}

main()

