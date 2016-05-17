/**
 * @file iTrek.js
 * @author gismanli
**/

(function(global) {

    'use strict'

    function noop() {
    }

    function inArray(o, arr) {
        return arr.indexOf(o) > -1;
    }

    function isObject(o) {
        return Object.prototype.toString.call(o) === '[object Object]';
    }

    function _A(a) {
        return Array.prototype.slice.apply(a, Array.prototype.slice.call(arguments, 1));
    }

    function $(o, p) {
        return (p || document).querySelector(o);
    }

    function addClass(o,cls) {
        if (o.classList) {
            o.classList.add(cls);
        }else {
            o.className += ' ' + cls;
        }
    }

    function removeClass(o,cls) {
        if (o.classList) {
            o.classList.remove(cls);
        }else {
            o.className = o.className.replace(new RegExp('\\s*\\b' + cls + '\\b', 'g'),'');
        }
    }

    var iTrek = function () {
        var args = _A(arguments, 0, 3);
        if (!args.length) {
            throw new Error('参数错误!');
        }

        var opts = args.slice(-1)[0];
        // console.log(args)
        opts.dom = args[0];

        if (!opts.dom) {
            throw new Error('容器不能为空!');
        }

        this._opts = {
            wrap: '.wrap',
            item: '.item',
            playClass: 'play',
            index: 0,
            noslide: [],
            noslideBack: false, //当noslide生效的时候 是否允许往回滑动  默认不允许, 如果有需要可以开启
            speed: 400, //滑屏速度 单位: ms
            triggerDist: 30,//触发滑动的手指移动最小位移 单位: 像素
            isVertical: true,//垂直滑还是水平滑动
            useACC: true, //是否启用硬件加速 默认启用
            fullScr: true, //是否是全屏的 默认是. 如果是局部滑动,请设为false
            preventMove: false, //是否阻止系统默认的touchmove移动事件,  默认不阻止, 该参数仅在局部滚动时有效,如果是局部滚动 如果为true 那么在这个区域滑动的时候 将不会滚动页面.  如果是全屏情况 则会阻止
            lastLocate: true, //后退后定位到上次浏览的位置 默认开启
            onslide: function (index) {} //滑动回调 参数是本对象
        }

        for (var i in opts) {
            this._opts[i] = opts[i];
        }

        opts = null, args = null;

        this._setting();

        this.fire('initialize');

        this._renderWrapper();
        this._bindEvent();

        this.fire('initialized');
    }

    iTrek.EVENTS = [
        'initialize',
        'initialized',
        'renderComplete',
        'slide',
        'slideStart',
        'slideEnd',
        'slideChange',
        'slideChanged',
        'slideRestore',
        'reset',
        'destroy'
    ];

    iTrek.prototype._bindEvent = function () {
        var me = this;
        var opts = me._opts;

        var handleElm = opts.fullScr ? $('body') : me.wrap;

        handleElm.addEventListener('touchstart', function (e) {
            me._touchstart(e);
        }, false);

        handleElm.addEventListener('touchmove', function (e) {
            me._touchmove(e)
            //修复手Q中局部使用时的一个bug
            if (!opts.fullScr) {
                e.stopPropagation();
                e.preventDefault();
            }
        }, false);

        handleElm.addEventListener('touchend', function (e) {
            me._touchend(e)
        }, false);

        handleElm.addEventListener('touchcancel',function (e) {
            me._touchend(e);
        }, false);
    }

    iTrek.prototype._touchstart = function (e) {
        var me = this;
        var opts = me._opts;

        if (e.touches.length !== 1) return;

        me.lockSlide = false;
        me._touchStartX = e.touches[0].pageX;
        me._touchStartY = e.touches[0].pageY;

        me.touchInitPos = opts.isVertical ? e.touches[0].pageY : e.touches[0].pageX;
        me.trek1 = me.touchInitPos;

        me.startPos = 0;
        me.startPosPrev = -me.scrollDist;
        me.startPosNext = me.scrollDist;

        //手指滑动的时候禁用掉动画
        var tmp = '-webkit-transition-duration:0;' 
            + '-moz-transition-duration:0;'
            + '-ms-transition-duration:0;'
            + '-o-transition-duration:0;'
            + 'transition-duration:0;'

        if (me._next) {
            me._next.style.cssText += tmp;
        }
        me._current.style.cssText += tmp;
        if (me._prev) {
            me._prev.style.cssText += tmp;
        }
    }

    iTrek.prototype._touchmove = function(e) {
        var parent = e.target;

        do {
            parent = parent.parentNode;
        } while (parent != this.wrap);

        if (!parent && e.target != this.wrap ) {
            return;
        }

        var me = this;
        var opts = me._opts;

        if (e.touches.length !== 1 || me.lockSlide) return

        var gx = Math.abs(e.touches[0].pageX - me._touchStartX);
        var gy = Math.abs(e.touches[0].pageY - me._touchStartY);

        //水平滑动
        if (gx > gy && opts.isVertical) {
            me.lockSlide = true;
            return;
        }
        //垂直滑动
        else if (gx < gy && !opts.isVertical) {
            me.lockSlide = true;
            return;
        }

        var current = opts.isVertical ? e.touches[0].pageY : e.touches[0].pageX;

        //记录当次移动的偏移量
        me.trek2 = current - me.trek1

        me.totalDist = me.startPos + current - me.touchInitPos;

        me._current.style.cssText += me._getTransform(me.totalDist + 'px');
        me.startPos = me.totalDist;
        
        //处理上一张和下一张
        
        //露出下一张
        if (me.totalDist < 0) {
            if (me._next) {
                me.totalDist2 = me.startPosNext + current - me.touchInitPos;
                me._next.style.cssText += me._getTransform(me.totalDist2 + 'px');
                me.startPosNext = me.totalDist2;
            }
        }
        //露出上一张
        else {
            if (me._prev) {
                me.totalDist2 = me.startPosPrev + current - me.touchInitPos;
                me._prev.style.cssText += me._getTransform(me.totalDist2 + 'px');
                me.startPosPrev = me.totalDist2;
            }
        }

        me.touchInitPos = current;

    };

    iTrek.prototype._touchend = function(first_argument) {
        var me = this;
        var opts = me._opts;

        if (me.trek2 < -opts.triggerDist) {
            me.next();
        }
        else if(me.trek2 > opts.triggerDist){
            me.prev();
        }
        else{
            me._itemReset();
        }
        me.trek2 = 0;
    };

    iTrek.prototype._itemReset = function() {
        var me = this;
        var opts = me._opts;

        me._current.style.cssText += me.getDurationCss(0)
        if (me._prev) {
            me._prev.style.cssText += me.getDurationCss('-' + me.scrollDist + 'px');
        }
        if (me._next) {
           me._next.style.cssText += me.getDurationCss(+me.scrollDist + 'px');
        }

        me.trek2 = 0;
    };

    iTrek.prototype._renderWrapper = function () {
        var me = this;
        var opts = me._opts;

        me.wrap = typeof opts.dom  === 'string' ? $(opts.dom) : opts.dom

        if (!me.wrap) {
            throw new Error('容器空!');
            return;
        }

        me.index = opts.index

        me._tpl = me.wrap.cloneNode(true);
        me._tpl = opts.item
            ? me._tpl.querySelectorAll(opts.item)
            : me._tpl.children;

        for (var i = 0; i < me._tpl.length; i++) {
            me._tpl[i].style.cssText += 'display:block;'
                + 'position:absolute;'
                + 'left:0;'
                + 'top:0;'
                + 'width:100%;'
                + 'height:100%';
        };

        me.length = me._tpl.length; //总页数数据
        me.touchInitPos = 0; //手指初始位置
        me.startPos = 0; //移动开始的位置
        me.totalDist = 0; //移动的总距离
        me.trek1 = 0; //每次移动的正负
        me.trek2 = 0; //每次移动的正负

        // 全屏滑动
        if (opts.fullScr) {
            var s = document.createElement('style');
            s.innerHTML = 'html,body{width:100%; height:100%; overflow:hidden}';
            document.head.appendChild(s);
            s = null;
        }

        me.wrap.style.cssText += 'display:block; position:relative;'
            + (opts.fullScr ? 'width:100%; height:100%' : '');

        // 阈值
        me.displayWidth = me.wrap.clientWidth; //滑动区域最大宽度
        me.displayHeight = me.wrap.clientHeight; //滑动区域最大高度
        
        //滚动的区域尺寸 
        me.scrollDist = opts.isVertical
            ? me.displayHeight
            : me.displayWidth;

        me._setHTML();

        if (/iPhone|iPod|iPad/.test(navigator.userAgent)) {
            me._delayTime = 50;
        }
    };


    iTrek.prototype._setHTML = function(index) {
        var me = this;

        if (index && index > 0) {
            me.index = +index;
        }

        me.wrap.innerHTML = '';

        var initDom = document.createDocumentFragment();

        // 前一页
        if (me.index > 0) {
            me._prev = me._tpl[me.index - 1].cloneNode(true);
            me._prev.style.cssText += me._getTransform('-' + me.scrollDist + 'px');
            initDom.appendChild(me._prev)
        }
        else {
            me._prev = null;
        }

        // 当前页
        me._current = me._tpl[me.index].cloneNode(true);
        me._current.style.cssText += me._getTransform(0);
        initDom.appendChild(me._current);

        // 后一页
        if (me.index < me.length - 1) {
            me._next = me._tpl[me.index + 1].cloneNode(true);
            me._next.style.cssText += me._getTransform('+' + me.scrollDist + 'px');
            initDom.appendChild(me._next)
        }
        else {
            me._next = null;
        }

        me.wrap.appendChild(initDom);
    };

    iTrek.prototype.getDurationCss = function (param, speed) {
        return ('-webkit-transition-duration:' + (speed || this._opts.speed) + 'ms;'
            + this._getTransform(param)
            + 'transition-duration:' + (speed || this._opts.speed) + 'ms;'
            + this._getTransform(param));
    }

    /*
        获取transform的CSS
     */
    iTrek.prototype._getTransform = function(dist) {
        var tmp = this._opts.useACC;
        var pos = this._opts.isVertical ? '0, ' + dist : dist + ', 0';
        return '-webkit-transform:' + (tmp ? 'translate3d(' + pos + ', 0);' : 'translate(' + pos + ');')
            + '-moz-transform:' + (tmp ? 'translate3d(' + pos + ', 0);' : 'translate(' + pos + ');')
            + '-ms-transform:' + (tmp ? 'translate3d(' + pos + ', 0);' : 'translate(' + pos + ');')
            + '-o-transform:' + (tmp ? 'translate3d(' + pos + ', 0);' : 'translate(' + pos + ');')
            + 'transform:' + (tmp ? 'translate3d(' + pos + ', 0);' : 'translate(' + pos + ');');
    };

    /**
     * 基本设置
     */
    iTrek.prototype._setting = function() {
        var me = this;

        var opts = this._opts;

        // events
        me.events = {};
        iTrek.EVENTS.forEach(function (eventName) {
            var fn = opts['on' + eventName.toLowerCase()];
            typeof fn === 'function' && me.on(eventName, fn, 1);
        });

        /*
            console.log
         */
        me.log = opts.isDebug ? function () {
            global.console.log.apply(global.console, arguments);
        } : noop;

    };

    /** 
     * 滑动到上一页
     * @example
        s1.next();
     */
    iTrek.prototype.prev = function () {
        var me = this;
        var opts = me._opts;

        if (!me._current || !me._prev) {
            me._itemReset();
            return;
        }

        if (me.index > 0 ) {
            me.index--;
        }
        else {
            me._itemReset();
            return false;
        }

        if (me._next) {
            me.wrap.removeChild(me._next);
        }

        me._next = me._current;
        me._current = me._prev;
        me._prev = null;

        me._next.style.cssText += me.getDurationCss(+me.scrollDist + 'px');
        me._current.style.cssText += me.getDurationCss(0);

        setTimeout(function () {
            if ($('.' + opts.playClass, me.wrap)) {
                removeClass($('.' + opts.playClass, me.wrap), opts.playClass)
            }

            addClass(me._current, opts.playClass)

            try {
                opts.onslide.call(me,me.index);
            }
            catch (e) {
                console.info(e)
            }

            var prevIndex = me.index - 1;
            if (prevIndex < 0) {
                prevIndex =  me.length - 1;
                return false;
            }

            me._prev = me._tpl[prevIndex].cloneNode(true);
            me._prev.style.cssText += me.getDurationCss(+me.scrollDist + 'px', 0);
            me.wrap.insertBefore(me._prev, me._current);

        }, me._delayTime)
    },

    /** 
     * 滑动到下一页
     * @example
        s1.next();
     */
    iTrek.prototype.next = function () {
        var me = this;
        var opts = me._opts;

        if (!me._current || !me._next) {
            me._itemReset();
            return ;
        }

        if (me.index < me.length - 1) {
            me.index++;
        }
        else {
            me._itemReset();
            return false;
        }

        if (me._prev) {
            me.wrap.removeChild(me._prev);
        }

        me._prev = me._current;
        me._current = me._next;
        me._next = null;

        me._prev.style.cssText += me.getDurationCss('-' + me.scrollDist + 'px');
        me._current.style.cssText += me.getDurationCss(0);

        setTimeout(function () {
            if ($('.' + opts.playClass, me.wrap)) {
                removeClass($('.' + opts.playClass, me.wrap), opts.playClass)
            }

            addClass(me._current, opts.playClass)

            try {
                opts.onslide.call(me,me.index);
            }
            catch (e) {
                console.info(e)
            }

            var nextIndex = me.index + 1;
            if (nextIndex >= me.length) {
                return false;
            }

            me._next = me._tpl[nextIndex].cloneNode(true);
            me._next.style.cssText += me.getDurationCss(+me.scrollDist + 'px', 0);
            me.wrap.appendChild(me._next);

        }, me._delayTime)
    },

    /**
     * 事件
     */
    iTrek.prototype.on = function(eventName, func, force) {
        if (inArray(eventName, iTrek.EVENTS) && typeof func === 'function') {
            !(eventName in this.events) && (this.events[eventName] = []);
            if (!force) {
                this.events[eventName].push(func);
            } else {
                this.events[eventName].unshift(func);
            }
        }
        return this;
    };

    /**
        触发
     */
    iTrek.prototype.fire = function (eventNames) {
        var args = _A(arguments, 1);
        eventNames.split(/\x20+/).forEach(function (eventName) {
            this.log('[EVENT FIRE]:', eventName, args);
            if (eventName in this.events) {
                var funcs = this.events[eventName];
                for (var i = 0; i < funcs.length; i++) {
                    typeof funcs[i] === 'function'
                    && funcs[i].apply
                    && funcs[i].apply(this, args);
                }
            }
        }.bind(this));
    }

    /* CMD */
    if (typeof require === 'function' && module && typeof module === 'object' && exports && typeof exports === 'object') {
        module.exports = iTrek;
    }
    /* AMD */
    else if (typeof define === 'function' && define['amd']) {
        define(function () {
            return iTrek;
        });
    }
    /* Window */
    else {
        global['iTrek'] = global['iTrek'] || iTrek;
    }

})(window || this);