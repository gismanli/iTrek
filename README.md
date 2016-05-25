# iTrek
移动端 触摸 滑动

### Start
``` js
    new iTrek(dom, options)
```

---

> 实例

```js
    new iTrek('#wrap', {
        item: '.item',
        isLoop: true
    });
```
或者
```js
    var ele = document.getElementById('wrap');
    new iTrek(ele, {
        isLoop: true
    });
```

### 配置项
- item: '.item', //item list，如果不设置则默认取wrap下的子元素
- playClass: 'play', //当前屏增加的class名称
- index: 0, //默认在第几屏 默认第一屏
- speed: 800, //滑屏速度 单位: ms 默认400
- triggerDist: 30, //触发滑动的手指移动最小位移 单位: 像素 默认30
- isVertical: true, //垂直滑还是水平滑动 默认竖屏
- useACC: true, //是否启用硬件加速 默认启用
- fullScr: true, //是否是全屏的 默认true 如果是局部滑动,请设为false
- preventMove: false, //是否阻止系统默认的touchmove移动事件, 该参数仅在局部滚动时有效 默认false
- isLoop: false, //是否开启循环滑动 默认false
- timing: 'linear', //过渡效果速度曲线 默认linear 具体参考CSS3属性transition-timing-funciton
- onslide: `Function` //滑动完成后回调

<!-- - wrap: '.wrap', // iTrek容器，如果第一个参数已经给了，则参数无效 -->

### 实例方法
- prev() //上一页
- next() //下一页
- slideTo() //赞不支持