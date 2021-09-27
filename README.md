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
![avatar](https://s3.bmp.ovh/imgs/2021/09/bfae04de325f707a.gif)

存在js中的class名和作用于子组件的class会被认为是无效的，可以用使用忽略注释
package.json 中使用
```js
{
    "ignoreCss": [
        "page",
        {
        "reg": "page",
        "attr": "g"
        }
    ],
}
```
在css文件中 ignoreConfig（如例子中只要class链中包含了ff都会通过） 是作用于整个vue，ignorecss是作用于单个calss（注意事放在class里面，而且由于编译器的限制嵌套的class必须每个都写），建议使用ignoreConfig，
```js
/* ignoreConfig ['ff'] */
.qw{
    color: #000;
}
.re{
    /* ignorecss */
    color: #000;
}
```