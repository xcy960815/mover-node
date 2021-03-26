<template>
  <div class="mover-node" ref="mover-node" @mousedown="handleDragNode">
    <div v-if="notSlot" class="default-mover-node"></div>
    <slot v-else></slot>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({
  name: 'MoverNode',
})
export default class MoverNode extends Vue {
  static install(vue: typeof Vue): void {}
  // 延时器id
  timer: number = 0
  // 父节点
  parantElement!: HTMLElement
  // 父节点的position
  parantElementPosition: string = ''
  // 复制的上下节点
  cloneNodeTopBottomElement!: HTMLElement
  // 复制的左右节点
  cloneNodeLeftRightElement!: HTMLElement
  // onmousemove function
  onmousemoveFunction!: Function
  // onmouseup function
  onmouseupFunction!: Function

  // 左侧节点的className
  @Prop({
    default: () => '',
    type: String,
  })
  leftNodeClass!: string
  // 右侧节点的className
  @Prop({
    default: () => '',
    type: String,
  })
  rightNodeClass!: string
  // 上侧节点的className
  @Prop({
    default: () => '',
    type: String,
  })
  topNodeClass!: string
  // 下侧节点的className
  @Prop({
    default: () => '',
    type: String,
  })
  bottomNodeClass!: string
  // 运动所需时间
  @Prop({
    default: () => 3,
    type: Number,
  })
  time!: number
  // 是否开启复制节点
  @Prop({
    default: () => false,
    type: Boolean,
  })
  cloneNode!: boolean

  get allProps() {
    return {
      leftNodeClass: this.leftNodeClass,
      rightNodeClass: this.rightNodeClass,
      topNodeClass: this.topNodeClass,
      bottomNodeClass: this.bottomNodeClass,
    }
  }

  // 防抖函数
  private debounceFunction(fn: Function, delay: number): Function {
    let timer: number = 0
    const _this = this // 取debounce执行作用域的this
    return function () {
      const args = arguments
      if (timer) {
        window.clearTimeout(timer)
      }
      timer = window.setTimeout(function () {
        fn.apply(_this, args) // 用apply指向调用debounce的对象，相当于_this.fn(args);
      }, delay)
    }
  }
  private handleDragNode(event): void {
    // 取消事件默认行为 防止页面拖动层的文字被选中
    event = event || window.event
    if (event.stopProgation) {
      event.stopPropagation()
    } else {
      event.cancelBubble = true
    }
    if (event.preventDefault) {
      event.preventDefault()
    } else {
      event.returnValue = false
    }
    const eventTargetElement: HTMLElement = event.target!
    if (this.topNodeClass && this.bottomNodeClass) {
      this.handleTopBottomNode(event, eventTargetElement)
      return
    } else if (this.leftNodeClass && this.rightNodeClass) {
      // this.handleLeftAndRightNode(event, eventTargetElement)
      return
    } else {
      // this.handleSelfNode(event, eventTargetElement)
      return
    }
  }
  /**
   * 处理上下节点
   * @param event MouseEvent
   * @param eventTargetElement 运动节点 HTMLElement
   */
  handleTopBottomNode(event: MouseEvent, eventTargetElement: HTMLElement): false {
    // 移动节点的父节点
    this.parantElement = eventTargetElement.parentElement! as HTMLElement
    // 移动节点的父节点的 position
    this.parantElementPosition = this.parantElement.style.position || 'static'
    // 复制节点的offSetTop
    let cloneNodeTopBottomElementOffSetTop: number
    if (this.cloneNode) {
      this.parantElement.style.position = 'relative'
      // 初始化的时候就进行 节点复制 避免多次无用复制
      this.cloneNodeTopBottomElement = eventTargetElement.cloneNode(true)! as HTMLElement
      this.cloneNodeTopBottomElement.style.position = 'absolute'
      this.cloneNodeTopBottomElement.style.opacity = '0.5'
      this.cloneNodeTopBottomElement.style.width = eventTargetElement.offsetWidth + 'px'
      this.cloneNodeTopBottomElement.style.height = eventTargetElement.offsetHeight + 'px'
      this.cloneNodeTopBottomElement.style.top = eventTargetElement.offsetTop + 'px'
      this.cloneNodeTopBottomElement.style.left = eventTargetElement.offsetLeft + 'px'
      cloneNodeTopBottomElementOffSetTop = eventTargetElement.offsetTop
      this.parantElement.appendChild(this.cloneNodeTopBottomElement)
    }
    // 开始位置
    const startPositionY = event.clientY
    // 上节点
    const topNode = document.querySelector(`.${this.topNodeClass}`)! as HTMLElement
    const topNodeOriginalHeight: number = topNode.getBoundingClientRect().height

    // 下节点
    const bottomNode = document.querySelector(`.${this.bottomNodeClass}`)! as HTMLElement
    const bottomNodeOriginalOffsetHeight: number = bottomNode.offsetHeight
    // 防抖函数
    const debounceFunction = this.debounceFunction(this.handleTopBottomMousemove, this.time)
    //  document.onmousemove
    // 鼠标移动的时候
    this.onmousemoveFunction = document.onmousemove = (e) => {
      // 结束点的y轴
      const endPositionY = e.clientY
      // 鼠标运动距离
      const moveDistance = endPositionY - startPositionY
      debounceFunction(
        moveDistance,
        topNode,
        topNodeOriginalHeight,
        bottomNode,
        bottomNodeOriginalOffsetHeight,
        eventTargetElement,
        this.cloneNodeTopBottomElement,
        cloneNodeTopBottomElementOffSetTop
      )
    }
    // 当鼠标抬起的时候
    document.onmouseup = async (e) => {
      const endPositionY = e.clientY
      // 鼠标运动轨迹
      const moveDistance = endPositionY - startPositionY
      if (this.cloneNode)
        // 当使用了cloneNode属性的时候 鼠标抬起的时候 修改上下节点的高度
        await this.handleTopBottomMouseUp(
          moveDistance,
          topNode,
          topNodeOriginalHeight,
          bottomNode,
          bottomNodeOriginalOffsetHeight
        )
      document.onmousemove = null
      document.onmouseup = null
    }
    return false
  }
  private handleTopBottomMouseUp(
    moveDistance,
    topNode,
    topNodeOriginalHeight,
    bottomNode,
    bottomNodeOriginalOffsetHeight
  ): void {
    // 开始修改上下节点的height
    topNode.style.height = topNodeOriginalHeight + moveDistance + 'px'
    topNode.style.minHeight = topNodeOriginalHeight + moveDistance + 'px'
    topNode.style.maxHeight = topNodeOriginalHeight + moveDistance + 'px'
    // 下节点
    bottomNode.style.height = bottomNodeOriginalOffsetHeight - moveDistance + 'px'
    bottomNode.style.minHeight = bottomNodeOriginalOffsetHeight - moveDistance + 'px'
    bottomNode.style.maxHeight = bottomNodeOriginalOffsetHeight - moveDistance + 'px'

    // 拖拽完成 将父节点的position 恢复原样
    this.parantElement.style.position = this.parantElementPosition
    // 移除拖拽过程中的创建子节点
    this.parantElement.removeChild(this.cloneNodeTopBottomElement)
  }
  /**
   * 处理左右节点
   * @param event MouseEvent
   * @param eventTargetElement 运动节点 HTMLElement
   */
  // private handleLeftAndRightNode(event: MouseEvent, eventTargetElement: HTMLElement): false {
  //   // 开始距离
  //   const startPositionX = event.clientX
  //   // 上节点
  //   const leftNode = document.querySelector(`.${this.leftNodeClass}`)! as HTMLElement
  //   // 做节点宽度
  //   const leftNodeOriginalWidth: number = leftNode.getBoundingClientRect().width
  //   // 右节点
  //   const rightNode = document.querySelector(`.${this.rightNodeClass}`)! as HTMLElement
  //   // 右节点宽度
  //   const rightNodeOriginalOffsetWidth: number = rightNode.offsetWidth
  //   // 防抖函数
  //   const debounceFunction = this.debounceFunction(this.handleLeftAndRightMousemove, this.time)
  //   document.onmousemove = (e) => {
  //     debounceFunction(
  //       e,
  //       startPositionX,
  //       leftNode,
  //       leftNodeOriginalWidth,
  //       rightNode,
  //       rightNodeOriginalOffsetWidth,
  //       eventTargetElement
  //     )
  //   }

  //   document.onmouseup = () => {
  //     document.onmousemove = null
  //     document.onmouseup = null
  //   }
  //   return false
  // }
  /**
   * 处理单独节点
   * @param event MouseEvent
   * @param eventTargetElement 运动节点 HTMLElement
   */
  // private handleSelfNode(event: MouseEvent, eventTargetElement: HTMLElement): false {
  //   const startPositionX = event.clientX
  //   const startPositionY = event.clientY
  //   const slefNodeLeft = eventTargetElement.clientLeft
  //   const slefNodeTop = eventTargetElement.clientTop

  //   const debounceFunction = this.debounceFunction(this.handleSelfMousemove, this.time)
  //   document.onmousemove = (e) => {
  //     debounceFunction(
  //       e,
  //       startPositionX,
  //       slefNodeLeft,
  //       startPositionY,
  //       slefNodeTop,
  //       eventTargetElement
  //     )
  //   }

  //   document.onmouseup = () => {
  //     document.onmousemove = null
  //     document.onmouseup = null
  //   }
  //   return false
  // }
  /**
   * @param e MouseEvent
   * @param startPositionX 开始的x轴坐标
   * @param leftNode 拖动区域的左侧节点
   * @param leftNodeOriginalWidth 拖动区域的左侧节点的开始宽度
   * @param rightNode 拖动区域的右侧节点
   * @param rightNodeOriginalWidth 拖动区域的右侧节点的开始宽度
   */
  // private handleLeftAndRightMousemove(
  //   e: MouseEvent,
  //   startPositionX: number,
  //   leftNode: HTMLElement,
  //   leftNodeOriginalWidth: number,
  //   rightNode: HTMLElement,
  //   rightNodeOriginalOffsetWidth: number,
  //   eventTargetElement: HTMLElement
  // ) {
  //   const endPositionX = e.clientX
  //   // 鼠标运动轨迹
  //   const moveDistance = endPositionX - startPositionX

  //   if (leftNode && rightNode.offsetWidth) {
  //     leftNode.style.overflow = 'hidden'
  //     leftNode.style.width = leftNodeOriginalWidth + moveDistance + 'px'
  //     leftNode.style.minWidth = leftNodeOriginalWidth + moveDistance + 'px'
  //     leftNode.style.maxWidth = leftNodeOriginalWidth + moveDistance + 'px'
  //   }
  //   if (rightNode && leftNode.offsetWidth) {
  //     rightNode.style.overflow = 'hidden'
  //     rightNode.style.width = rightNodeOriginalOffsetWidth - moveDistance + 'px'
  //     rightNode.style.minWidth = rightNodeOriginalOffsetWidth - moveDistance + 'px'
  //     rightNode.style.maxWidth = rightNodeOriginalOffsetWidth - moveDistance + 'px'
  //   }
  // }

  /**
   * @param e MouseEvent
   * @param topNode 拖动区域的上侧节点
   * @param topNodeOriginalHeight 拖动区域的上侧节点的开始高度
   * @param bottomNode 拖动区域的下侧节点
   * @param bottomNodeOriginalHeight 拖动区域的下侧节点的开始高度
   */
  private handleTopBottomMousemove(
    moveDistance: number,
    topNode: HTMLElement,
    topNodeOriginalHeight: number,
    bottomNode: HTMLElement,
    bottomNodeOriginalOffsetHeight: number,
    eventTargetElement: HTMLElement,
    cloneNodeTopBottomElement: HTMLElement,
    cloneNodeTopBottomElementOffSetTop: number
  ) {
    const topNodeTop = topNode.getBoundingClientRect().top as number

    // 如果开启了cloneNode属性 将移动节点复制一份用鼠标拖拽
    if (this.cloneNode) {
      // 如果启用了 cloneNode 属性
      // 做碰撞判断
      const cloneTargetElementTop = cloneNodeTopBottomElement.getBoundingClientRect().top as number
      if (topNodeTop < cloneTargetElementTop) {
        // 控制复制节点的top属性
        this.cloneNodeTopBottomElement.style.top =
          cloneNodeTopBottomElementOffSetTop + moveDistance + 'px'
      } else {
        console.log('超出临界点')
        topNode.style.height = topNodeOriginalHeight + moveDistance + 'px'
        topNode.style.minHeight = topNodeOriginalHeight + moveDistance + 'px'
        topNode.style.maxHeight = topNodeOriginalHeight + moveDistance + 'px'
        // 下节点
        bottomNode.style.height = bottomNodeOriginalOffsetHeight - moveDistance + 'px'
        bottomNode.style.minHeight = bottomNodeOriginalOffsetHeight - moveDistance + 'px'
        bottomNode.style.maxHeight = bottomNodeOriginalOffsetHeight - moveDistance + 'px'
        // 拖拽完成 将父节点的position 恢复原样
        this.parantElement.style.position = this.parantElementPosition
        // 移除拖拽过程中的创建子节点
        this.parantElement.removeChild(this.cloneNodeTopBottomElement)
        // this.handleTopBottomMouseUp(
        //   moveDistance,
        //   topNode,
        //   topNodeOriginalHeight,
        //   bottomNode,
        //   bottomNodeOriginalOffsetHeight
        // )
        document.onmousemove = null
        document.onmouseup = null
      }
    } else {
      const targetElementTop = eventTargetElement.getBoundingClientRect().top as number
      topNode.style.height = topNodeOriginalHeight + moveDistance + 'px'
      topNode.style.minHeight = topNodeOriginalHeight + moveDistance + 'px'
      topNode.style.maxHeight = topNodeOriginalHeight + moveDistance + 'px'
      if (topNodeTop < targetElementTop - 3) {
        bottomNode.style.height = bottomNodeOriginalOffsetHeight - moveDistance + 'px'
        bottomNode.style.minHeight = bottomNodeOriginalOffsetHeight - moveDistance + 'px'
        bottomNode.style.maxHeight = bottomNodeOriginalOffsetHeight - moveDistance + 'px'
      }
    }
  }
  /**
   * @param e MouseEvent
   * @param startPositionX X轴起点
   * @param startPositionY Y轴起点
   * @param eventTargetElement HtmlElement
   */
  private handleSelfMousemove(
    e,
    startPositionX,
    slefNodeLeft,
    startPositionY,
    slefNodeTop,
    eventTargetElement
  ) {
    const endPositionX = e.clientX
    const endPositionY = e.clientY
    // 鼠标运动轨迹
    const moveDistanceX = endPositionX - startPositionX
    const moveDistanceY = endPositionY - startPositionY

    if (eventTargetElement) {
      eventTargetElement.style.left = slefNodeLeft + moveDistanceX + 'px'
      eventTargetElement.style.top = slefNodeTop + moveDistanceY + 'px'
    }
  }
  private get notSlot(): boolean {
    const slots = this.$slots
    const notSlot: boolean = Object.keys(slots).map((slot) => slot).length === 0
    return notSlot
  }
  // 初始化移动节点的
  private handleInitNodeStyle(): void {
    const { leftNodeClass, rightNodeClass, topNodeClass, bottomNodeClass } = this.allProps
    const moverNode = this.$refs['mover-node'] as HTMLDivElement
    const moverNodeWidth: number = moverNode.offsetWidth
    const moverNodeHeight: number = moverNode.offsetHeight
    if (leftNodeClass && rightNodeClass && moverNode) {
      moverNode.style.cursor = 'col-resize'
      moverNode.style.width = moverNodeWidth + 'px'
      moverNode.style.minWidth = moverNodeWidth + 'px'
      moverNode.style.maxWidth = moverNodeWidth + 'px'
      return
    } else if (topNodeClass && bottomNodeClass && moverNode) {
      moverNode.style.cursor = 'row-resize'
      moverNode.style.height = moverNodeHeight + 'px'
      moverNode.style.minHeight = moverNodeHeight + 'px'
      moverNode.style.maxHeight = moverNodeHeight + 'px'
      return
    } else if (moverNode) {
      moverNode.style.cursor = 'move'
      return
    }
  }

  private mounted() {
    // 初始化左右节点的鼠标样式
    this.handleInitNodeStyle()
  }
}
</script>
<style lang='less' scoped>
.mover-node {
  position: relative;
  background: #909399;
  .default-mover-node {
    display: table;
    background-color: #909399;
    height: 100%;
    width: 20px;
    border-radius: 4px;
    text-align: center;
    i {
      display: table-cell;
      vertical-align: middle;
    }
  }
}
</style>