"use strict";

window.LRUMap = (function () {
    const NOP = function () {
        //return void 0;
    };
    const UnitSized = function () {
        return 1;
    };

    const ProblemResolver = Promise.resolve;
    //const ProblemResolver = function (cache) {return Promise.resolve();};

    function LRUMap(opts) {
        let _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
        if (opts == null) {
            opts = {};
        }
        this._maxSize = (_ref = opts.maxSize) != null ? _ref : Infinity;
        this._maxAge = (_ref1 = opts.maxAge) != null ? _ref1 : Infinity;
        this._calcSize = (_ref2 = opts.calcSize) != null ? _ref2 : UnitSized;
        this._user_onEvict = (_ref3 = opts.onEvict) != null ? _ref3 : NOP;
        this._user_onStale = (_ref4 = opts.onStale) != null ? _ref4 : NOP;
        this._onAdd = (_ref5 = opts.onAdd) != null ? _ref5 : NOP;
        this._onRemove = (_ref5 = opts.onRemove) != null ? _ref5 : NOP;
        this._accessUpdatesTimestamp = (_ref6 = opts.accessUpdatesTimestamp) != null ? _ref6 : false;
        this._warmer = (_ref7 = opts.warmer) != null ? _ref7 : ProblemResolver;
        if (!(typeof this._maxSize === 'number' && this._maxSize >= 0)) {
            throw new Error('maxSize must be a non-negative number');
        }
        if (typeof this._calcSize !== 'function') {
            throw new TypeError('calcSize must be a function');
        }
        if (typeof this._user_onEvict !== 'function') {
            throw new TypeError('onEvict must be a function');
        }
        if (typeof this._user_onStale !== 'function') {
            throw new TypeError('onStale must be a function');
        }
        if (typeof this._onRemove !== 'function') {
            throw new TypeError('onRemove must be a function');
        }
        if (typeof this._warmer !== 'function') {
            throw new TypeError('warmer must be a function');
        }
        this._onEvict = (function (_this) {
            return function (key, value) {
                _this._onRemove(key, value);
                return _this._user_onEvict(key, value);
            };
        })(this);
        this._onStale = (function (_this) {
            return function (key, value) {
                _this._onRemove(key, value);
                return _this._user_onStale(key, value);
            };
        })(this);
        this._atomicInflights = new Map;
        this._map = new Map;
        this._total = 0;

        this[Symbol.iterator] = function () {
            return this.entries();
        };
        //this[Symbol.iterator] = this.entries; //?

        if (LRUMap.__testing__ === true) {
            this.testMap = this._map;
            this.testInflights = this._atomicInflights;
            this.getTestMap = (function (_this) {
                return function () {
                    return _this._map;
                };
            })(this);
            this.testSetTotal = (function (_this) {
                return function (x) {
                    return _this._total = x;
                };
            })(this);
            this.testSetMaxAge = (function (_this) {
                return function (x) {
                    return _this._maxAge = x;
                };
            })(this);
        }
    }

    LRUMap.prototype.maxAge = function (age) {
        if (age != null) {
            if (!(typeof age === 'number' && age > 0)) {
                throw new Error('age must be a positive number of seconds');
            }
            this._maxAge = age;
            this.reapStale();
        }
        return this._maxAge;
    };

    LRUMap.prototype.accessUpdatesTimestamp = function (doesIt) {
        if (doesIt != null) {
            if (typeof doesIt !== 'boolean') {
                throw new TypeError('accessUpdatesTimestamp accepts a boolean');
            }
            this._accessUpdatesTimestamp = doesIt;
        }
        return this._accessUpdatesTimestamp;
    };

    LRUMap.prototype.maxSize = function (size) {
        let entries, oldest;
        if (size != null) {
            if (!(typeof size === 'number' && size > 0)) {
                throw new Error('size must be a positive number');
            }
            this._maxSize = size;
            this.reapStale();
            entries = this._map.entries();
            while (this._total > this._maxSize) {
                oldest = entries.next().value;
                if (oldest == null) {
                    break;
                }
                this._map["delete"](oldest[0]);
                this._total -= oldest[1].size;
                this._onEvict(oldest[0], oldest[1].value);
            }
        }
        return this._maxSize;
    };

    LRUMap.prototype.warm = function () {
        if (this._warmed == null) {
            this._warmed = Promise.resolve(this._warmer(this));
        }
        return this._warmed;
    };

    LRUMap.prototype.currentSize = function () {
        return this._total;
    };

    LRUMap.prototype.fits = function (value) {
        return this._calcSize(value) <= this._maxSize;
    };

    LRUMap.prototype.wouldCauseEviction = function (value) {
        return (this._calcSize(value) + this._total > this._maxSize) && (this._total > 0);
    };

    LRUMap.prototype.onEvict = function (fn) {
        if (typeof fn !== 'function') {
            throw new TypeError('argument to onEvict must be a function');
        }
        return this._onEvict = fn;
    };

    LRUMap.prototype.onStale = function (fn) {
        if (typeof fn !== 'function') {
            throw new TypeError('argument to onStale must be a function');
        }
        return this._onStale = fn;
    };

    LRUMap.prototype.onRemove = function (fn) {
        if (typeof fn !== 'function') {
            throw new TypeError('argument to onRemove must be a function');
        }
        return this._onRemove = fn;
    };

    LRUMap.prototype.reapStale = function () {

        const maxAge = this._maxAge;
        if (maxAge === Infinity)
            return null;

        let cur, diff, entries, _results;
        entries = this._map.entries();
        cur = entries.next().value;
        _results = [];
        var deleter;
        while (cur != null) {
            diff = (+(new Date) - cur[1].timestamp) / 1000;
            if (diff > maxAge) {

                if (!deleter) deleter = this._map["delete"];
                deleter(cur[0]);

                this._total -= cur[1].size;
                this._onStale(cur[0], cur[1].value);
            } else {
                if (this._accessUpdatesTimestamp)
                    break;
            }
            _results.push(cur = entries.next().value);
        }
        return _results;
    };

    LRUMap.prototype.set = function (key, value) {
        let entries, oldest, priorTotal, size, timestamp;
        this.reapStale();
        size = this._calcSize(value);
        timestamp = +(new Date);
        priorTotal = this._total;
        if (isNaN(size) || size < 0 || typeof size !== 'number') {
            throw new Error('calcSize() must return a positive number');
        }

        if (this._map.has(key))
            priorTotal -= this.sizeOf(key);

        if (size > this._maxSize)
            throw new Error("cannot store an object of that size (maxSize = " + this._maxSize + "; value size = " + size + ")");

        entries = this._map.entries();
        var deleter;
        while (priorTotal + size > this._maxSize) {
            oldest = entries.next().value;
            if (oldest == null)
                break;

            if (!deleter) deleter = this._map["delete"];
            deleter(oldest[0]);
            priorTotal -= oldest[1].size;
            this._onEvict(oldest[0], oldest[1].value);
        }
        this._map.set(key, {
            size: size,
            value: value,
            timestamp: timestamp
        });
        this._total = priorTotal + size;
        this._onAdd(key, value);
        return this;
    };

    LRUMap.prototype.setIfNull = function (key, newValue, opts) {
        let inflight;
        if (opts == null) {
            opts = {};
        }
        if (typeof opts !== 'object') {
            throw new TypeError('opts must be an object');
        }
        if (opts.timeout == null) {
            opts.timeout = 10000;
        }
        if (opts.invokeNewValueFunction == null) {
            opts.invokeNewValueFunction = true;
        }
        if (opts.onCacheHit == null) {
            opts.onCacheHit = NOP;
        }
        if (opts.onCacheMiss == null) {
            opts.onCacheMiss = NOP;
        }
        if (!(typeof opts.timeout === 'number' && opts.timeout >= 1)) {
            throw new TypeError('opts.timeout must be a positive number (possibly Infinity)');
        }
        if (typeof opts.invokeNewValueFunction !== 'boolean') {
            throw new TypeError('opts.invokeNewValueFunction must be boolean');
        }
        if (typeof opts.onCacheHit !== 'function') {
            throw new TypeError('opts.onCacheHit must be a function');
        }
        if (typeof opts.onCacheMiss !== 'function') {
            throw new TypeError('opts.onCacheMiss must be a function');
        }
        const ahas = _atomicInflights.get(key);
        if (ahas) {
            opts.onCacheHit(key);
            return ahas;
        }
        const has = map.get(key);
        if (has) {
            opts.onCacheHit(key);
            return has;
        }

        this.reapStale();

        /*if (this._map.has(key)) {
            //setTimeout(function () {
                opts.onCacheHit(key);
            //});
            return Promise.resolve(this.get(key));
        } else */{
            //setTimeout(function () {
                opts.onCacheMiss(key);
            //});
            if (opts.invokeNewValueFunction && typeof newValue === 'function') {
                newValue = newValue();
            }
            inflight = Promise.resolve(newValue).timeout(opts.timeout).tap((function (_this) {
                return function (value) {
                    _this._atomicInflights["delete"](key);
                    _this.reapStale();
                    return _this.set(key, value);
                };
            })(this))["catch"]((function (_this) {
                return function (e) {
                    _this._atomicInflights["delete"](key);
                    return Promise.reject(e);
                };
            })(this));
            this._atomicInflights.set(key, inflight);
            return inflight;
        }
    };

    LRUMap.prototype["delete"] = function (key) {
        if (this._map.has(key)) {
            this._total -= this.sizeOf(key);
            this._map["delete"](key);
            this.reapStale();
            return true;
        } else {
            this.reapStale();
            return false;
        }
    };

    LRUMap.prototype.clear = function () {
        this._map.clear();
        this._total = 0;
    };

    LRUMap.prototype.get = function (key) {
        let entry;
        entry = this._map.get(key);
        if (entry == null) {
            return null;
        }
        this._map["delete"](key);
        if (this._accessUpdatesTimestamp) {
            entry.timestamp = +(new Date);
        }
        this._map.set(key, entry);
        return entry.value;
    };

    LRUMap.prototype.has = function (key) {
        this.reapStale();
        return this._map.has(key);
    };

    LRUMap.prototype.peek = function (key) {
        let entry;
        this.reapStale();
        entry = this._map.get(key);
        return entry != null ? entry.value : void 0;
    };

    LRUMap.prototype.sizeOf = function (key) {
        let entry;
        entry = this._map.get(key);
        return entry != null ? entry.size : void 0;
    };

    LRUMap.prototype.ageOf = function (key) {
        let entry;
        entry = this._map.get(key);
        if (entry != null) {
            return Math.round((+(new Date) - entry.timestamp) / 1000);
        }
    };

    LRUMap.prototype.isStale = function (key) {
        let entry;
        entry = this._map.get(key);
        if (entry != null) {
            return this.ageOf(key) > this._maxAge;
        }
    };

    LRUMap.prototype.keys = function () {
        this.reapStale();
        return this._map.keys();
    };

    LRUMap.prototype.values = function () {
        let iter;
        this.reapStale();
        iter = this._map.values();
        return {
            next: (function (_this) {
                return function () {
                    let ev;
                    ev = iter.next().value;
                    if (ev != null) {
                        if (_this._accessUpdatesTimestamp) {
                            ev.timestamp = +(new Date);
                        }
                        return {
                            value: ev.value,
                            done: false
                        };
                    }
                    return {
                        done: true
                    };
                };
            })(this)
        };
    };

    LRUMap.prototype.entries = function () {
        let iter;
        this.reapStale();
        iter = this._map.entries();
        return {
            next: (function (_this) {
                return function () {
                    let entry;
                    entry = iter.next().value;
                    if (entry != null) {
                        if (_this._accessUpdatesTimestamp) {
                            entry[1].timestamp = +(new Date);
                        }
                        return {
                            done: false,
                            value: [entry[0], entry[1].value]
                        };
                    } else {
                        return {
                            done: true
                        };
                    }
                };
            })(this)
        };
    };

    LRUMap.prototype.forEach = function (callback, thisArg) {
        this.reapStale();
        this._map.forEach((function (_this) {
            return function (value, key, map) {
                if (_this._accessUpdatesTimestamp) {
                    value.timestamp = +(new Date);
                }
                return callback.call(thisArg, value.value, key, _this);
            };
        })(this));
    };

    return LRUMap;

})();

