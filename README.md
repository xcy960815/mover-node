## 安装方法： npm install --save mover-node

## 使用方法：

```js
Vue.use(moverNode)
new Vue({
    el: '#app',
    template: `<div id="app">
                        <div class="top" style="height:100px;background:red;"></div>
                        <mover-node topNodeClass="top" bottomNodeClass="bottom">上下节点</mover-node>
                        <div class="bottom" style="height:100px;background:pink;"></div>
                        <div style="display:flex;">
                            <div class="left" style="height:100px;width:200px;background:red;"></div>
                            <mover-node leftNodeClass="left" rightNodeClass="right">左右节点</mover-node>
                            <div class="right" style="height:100px;width:200px;background:pink;"></div>
                        </div>
                        <mover-node style="height:200px;width:200px;background:green;">单独节点</mover-node>
                    </div>`,
})
```

## 注意事项：

1. 参数一共四个：topNodeClass、bottomNodeClass、leftNodeClass、rightNodeClass 分别对应上面节点的 className、下面节点的 className、左面节点的 className、右面节点的 className。
2. 参数两两配对使用，若是一个节点上面四个参数都有，上下节点的 className 优先级高于左右节点 className]
