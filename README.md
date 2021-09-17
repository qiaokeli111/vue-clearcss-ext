# vue-clearcss

这是一个用来找出vue sfc类型文件中多余无用css代码的工具，完美解析scss和less，sass仅支持嵌套写法。
随着项目的不断迭代文件里会残留着大量多余且无用css，不像js和html，人为处理起来会非常麻烦且不可靠，所以就出现了这个库，
网上有几个评价不错的css处理工具如uncss等都不能直接在vue里面使用，所以我利用了[vue]的编译工具和[postcss]来完成这个功能

[Vue]: https://cn.vuejs.org/v2/guide/
[PostCSS]: https://github.com/postcss/postcss

## 安装前请Install

```js
npm install -g vue-clearcss
```

之后在vue文件中如果有无效的css则会出现如下警告
![avatar](https://z3.ax1x.com/2021/09/17/4MhJSS.png)