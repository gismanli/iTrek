# iTrek
移动端 触摸 滑动

```js
    new iTrek(ele, {
        isDebug: true
    });
```

### 配置项
- wrap: '.wrap', // iTrek容器
- item: '.item', // item list
- playClass: 'play', // 当前页class标识
- index: 0, // 默认第几屏
- speed: 400, // 滑屏速度 单位: ms
- triggerDist: 30, // 触发滑动的手指移动最小位移 单位: 像素
- isVertical: true, // 垂直滑还是水平滑动
- useACC: true, // 是否启用硬件加速 默认启用
- fullScr: true, // 是否是全屏的 默认是. 如果是局部滑动,请设为false