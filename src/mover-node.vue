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
  timer: number | null = null
  // 父节点
  parantElement!: HTMLElement
  // 父节点的position
  parantElementPosition: string = ''
  // 复制的运动节点
  cloneMoveElement!: HTMLElement

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
    default: () => 1,
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
  // 开始拖拽节点
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
    const moveElement: HTMLElement = event.target!
    if (this.topNodeClass && this.bottomNodeClass) {
      this.handleTopBottomNode(event, moveElement)
      return
    } else if (this.leftNodeClass && this.rightNodeClass) {
      this.handleLeftAndRightNode(event, moveElement)
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
  handleTopBottomNode(event: MouseEvent, moveElement: HTMLElement): false {
    // 移动节点的父节点
    this.parantElement = moveElement.parentElement! as HTMLElement
    // 移动节点的父节点的 position
    this.parantElementPosition = this.parantElement.style.position || 'static'
    let cloneMoveElement!: HTMLElement

    if (this.cloneNode) {
      // 将父节点的
      this.parantElement.style.position = 'relative'
      // 初始化的时候就进行 节点复制 避免多次无用复制
      cloneMoveElement = moveElement.cloneNode(true)! as HTMLElement
      cloneMoveElement.style.position = 'absolute'
      cloneMoveElement.style.opacity = '0.5'
      cloneMoveElement.style.width = moveElement.offsetWidth + 'px'
      cloneMoveElement.style.height = moveElement.offsetHeight + 'px'
      cloneMoveElement.style.top = moveElement.offsetTop + 'px'
      cloneMoveElement.style.left = moveElement.offsetLeft + 'px'
      this.parantElement.appendChild(cloneMoveElement)
    }
    const cloneMoveElementTop = cloneMoveElement.offsetTop
    // 开始位置
    const startPositionY = event.clientY
    // 上节点
    const topNode = document.querySelector(`.${this.topNodeClass}`)! as HTMLElement
    // 上节点的高度
    const topNodeHeight: number = topNode.offsetHeight

    // 下节点
    const bottomNode = document.querySelector(`.${this.bottomNodeClass}`)! as HTMLElement
    // 下节点的初始高度
    const bottomNodeHeight: number = bottomNode.offsetHeight

    // 防抖函数
    let debounceFunction: Function = this.debounceFunction(this.handleUpAndDownMove, this.time)
    // 鼠标移动的时候
    document.onmousemove = (e) => {
      // 鼠标运动距离
      const moveDistance = e.clientY - startPositionY
      // 启用防抖函数
      debounceFunction(
        moveDistance,
        topNode,
        topNodeHeight,
        bottomNode,
        bottomNodeHeight,
        moveElement,
        cloneMoveElement,
        cloneMoveElementTop
      )
    }
    // 当鼠标抬起的时候
    document.onmouseup = async (e) => {
      // 鼠标运动距离
      const moveDistance = e.clientY - startPositionY
      // 移除子节点
      if (this.cloneNode) {
        this.handleStopUpAndDownMove(
          moveDistance,
          topNode,
          topNodeHeight,
          bottomNode,
          bottomNodeHeight,
          cloneMoveElement
        )
      }
      document.onmousemove = null
      document.onmouseup = null
    }
    return false
  }

  /**
   * 此方法只处理 上下节点的height
   * @param moveDistance 移动距离
   * @param topNode 拖动区域的上侧节点
   * @param topNodeHeight 上节点的开始高度
   * @param bottomNode 拖动区域的下侧节点
   * @param bottomNodeHeight 下节点的开始高度
   */
  private handleUpAndDownMove(
    moveDistance: number,
    topNode: HTMLElement,
    topNodeHeight: number,
    bottomNode: HTMLElement,
    bottomNodeHeight: number,
    moveElement: HTMLElement,
    cloneMoveElement: HTMLElement,
    cloneMoveElementTop: number
  ) {
    // 上节点距离浏览器的距离
    const topNodeTop: number = topNode.getBoundingClientRect().top
    // 如果开启了cloneNode属性 将移动节点复制一份用鼠标拖拽
    if (this.cloneNode) {
      // 复制节点距离浏览器的距离
      const cloneNodeElementTop: number = cloneMoveElement.getBoundingClientRect().top
      // 控制复制节点的top属性
      if (topNodeTop <= cloneNodeElementTop) {
        cloneMoveElement.style.top = cloneMoveElementTop + moveDistance + 'px'
      } else {
        // 如果超出运动距离 运动距离就是上节点的高度
        this.handleStopUpAndDownMove(
          -topNodeHeight,
          topNode,
          topNodeHeight,
          bottomNode,
          bottomNodeHeight,
          cloneMoveElement
        )
        document.onmousemove = null
        document.onmouseup = null
      }
    } else {
      // 运动节点距离浏览器的距离
      const targetElementTop: number = moveElement.getBoundingClientRect().top
      topNode.style.height = topNodeHeight + moveDistance + 'px'
      topNode.style.minHeight = topNodeHeight + moveDistance + 'px'
      topNode.style.maxHeight = topNodeHeight + moveDistance + 'px'
      if (topNodeTop < targetElementTop) {
        bottomNode.style.height = bottomNodeHeight - moveDistance + 'px'
        bottomNode.style.minHeight = bottomNodeHeight - moveDistance + 'px'
        bottomNode.style.maxHeight = bottomNodeHeight - moveDistance + 'px'
      }
    }
  }
  private handleStopUpAndDownMove(
    moveDistance: number,
    topNode: HTMLElement,
    topNodeHeight: number,
    bottomNode: HTMLElement,
    bottomNodeHeight: number,
    cloneMoveElement: HTMLElement
  ) {
    this.parantElement.removeChild(cloneMoveElement)
    topNode.style.height = topNodeHeight + moveDistance + 'px'
    topNode.style.minHeight = topNodeHeight + moveDistance + 'px'
    topNode.style.maxHeight = topNodeHeight + moveDistance + 'px'
    bottomNode.style.height = bottomNodeHeight - moveDistance + 'px'
    bottomNode.style.minHeight = bottomNodeHeight - moveDistance + 'px'
    bottomNode.style.maxHeight = bottomNodeHeight - moveDistance + 'px'
  }
  /**
   * 处理左右节点
   * @param event MouseEvent
   * @param eventTargetElement 运动节点 HTMLElement
   */
  private handleLeftAndRightNode(event: MouseEvent, moveElement: HTMLElement): false {
    // 移动节点的父节点
    this.parantElement = moveElement.parentElement! as HTMLElement
    // 移动节点的父节点的 position
    this.parantElementPosition = this.parantElement.style.position || 'static'
    let moveElementLeft: number
    let cloneMoveElement!: HTMLElement
    let cloneMoveElementLeft: number
    if (this.cloneNode) {
      // 将父节点的
      this.parantElement.style.position = 'relative'
      // 初始化的时候就进行 节点复制 避免多次无用复制
      cloneMoveElement = moveElement.cloneNode(true)! as HTMLElement
      cloneMoveElement.style.position = 'absolute'
      cloneMoveElement.style.opacity = '0.5'
      cloneMoveElement.style.width = moveElement.offsetWidth + 'px'
      cloneMoveElement.style.height = moveElement.offsetHeight + 'px'
      cloneMoveElement.style.top = moveElement.offsetTop + 'px'
      cloneMoveElement.style.left = moveElement.offsetLeft + 'px'
      cloneMoveElementLeft = cloneMoveElement.offsetLeft
      this.parantElement.appendChild(cloneMoveElement)
    } else {
      moveElementLeft = moveElement.offsetLeft
    }
    // 开始距离
    const startPositionX = event.clientX
    // 上节点
    const leftNode = document.querySelector(`.${this.leftNodeClass}`)! as HTMLElement
    // 做节点宽度
    const leftNodeWidth: number = leftNode.offsetWidth
    // 右节点
    const rightNode = document.querySelector(`.${this.rightNodeClass}`)! as HTMLElement
    // 右节点宽度
    const rightNodeWidth: number = rightNode.offsetWidth
    // 防抖函数
    let debounceFunction = this.debounceFunction(this.handleLeftAndRightMove, this.time)
    document.onmousemove = (e) => {
      const endPositionX = e.clientX
      // 鼠标运动轨迹
      const moveDistance = endPositionX - startPositionX
      debounceFunction(
        moveDistance,
        leftNode,
        leftNodeWidth,
        rightNode,
        rightNodeWidth,
        moveElement,
        moveElementLeft,
        cloneMoveElement,
        cloneMoveElementLeft
      )
    }

    document.onmouseup = (e) => {
      if (this.cloneNode) {
        const endPositionX = e.clientX
        // 鼠标运动轨迹
        const moveDistance = endPositionX - startPositionX
        this.handleStopLeftAndRightMove(
          moveDistance,
          leftNode,
          leftNodeWidth,
          rightNode,
          rightNodeWidth,
          cloneMoveElement
        )
      }

      document.onmousemove = null
      document.onmouseup = null
    }
    return false
  }

  /**
   * @param e MouseEvent
   * @param startPositionX 开始的x轴坐标
   * @param leftNode 拖动区域的左侧节点
   * @param leftNodeOriginalWidth 拖动区域的左侧节点的开始宽度
   * @param rightNode 拖动区域的右侧节点
   * @param rightNodeOriginalWidth 拖动区域的右侧节点的开始宽度
   */
  private handleLeftAndRightMove(
    moveDistance: number,
    leftNode: HTMLElement,
    leftNodeWidth: number,
    rightNode: HTMLElement,
    rightNodeWidth: number,
    moveElement: HTMLElement,
    _moveElementLeft: number,
    cloneMoveElement: HTMLElement,
    cloneMoveElementLeft: number
  ) {
    // 获取父节点 的左边距离
    const parantElementLeft: number = this.parantElement.getBoundingClientRect().left
    // 获取父节点 的右边距离
    const parantElementRight: number = this.parantElement.getBoundingClientRect().right
    // 如果开启了cloneNode属性 将移动节点复制一份用鼠标拖拽
    if (this.cloneNode) {
      // 复制节点距离浏览器的距离
      const cloneNodeElementLeft: number = cloneMoveElement.getBoundingClientRect().left
      const cloneNodeElementRight: number = cloneMoveElement.getBoundingClientRect().right
      if (parantElementLeft < cloneNodeElementLeft && parantElementRight >= cloneNodeElementRight) {
        cloneMoveElement.style.left = cloneMoveElementLeft + moveDistance + 'px'
      } else {
        // 超出范围且向左移动
        if (moveDistance < 0) {
          cloneMoveElement.style.left = 0 + 'px'
          leftNode.style.width = 0 + 'px'
          leftNode.style.minWidth = 0 + 'px'
          leftNode.style.maxWidth = 0 + 'px'
          rightNode.style.width =
            this.parantElement.getBoundingClientRect().width - moveElement.offsetWidth + 'px'
          rightNode.style.minWidth =
            this.parantElement.getBoundingClientRect().width - moveElement.offsetWidth + 'px'
          rightNode.style.maxWidth =
            this.parantElement.getBoundingClientRect().width - moveElement.offsetWidth + 'px'
        } else {
          // 超出范围且向右移动
          cloneMoveElement.style.right = 0 + 'px'
          rightNode.style.width = 0 + 'px'
          rightNode.style.minWidth = 0 + 'px'
          rightNode.style.maxWidth = 0 + 'px'
          leftNode.style.width =
            this.parantElement.getBoundingClientRect().width - moveElement.offsetWidth + 'px'
          leftNode.style.minWidth =
            this.parantElement.getBoundingClientRect().width - moveElement.offsetWidth + 'px'
          leftNode.style.maxWidth =
            this.parantElement.getBoundingClientRect().width - moveElement.offsetWidth + 'px'
        }
        this.parantElement.removeChild(cloneMoveElement)
        document.onmousemove = null
        document.onmouseup = null
      }
    } else {
      // 运动节点距离浏览器的距离
      const moveElementLeft: number = moveElement.getBoundingClientRect().left
      const moveElementRight: number = moveElement.getBoundingClientRect().right
      if (parantElementLeft <= moveElementLeft && parantElementRight >= moveElementRight) {
        leftNode.style.width = leftNodeWidth + moveDistance + 'px'
        leftNode.style.minWidth = leftNodeWidth + moveDistance + 'px'
        leftNode.style.maxWidth = leftNodeWidth + moveDistance + 'px'
        rightNode.style.width = rightNodeWidth - moveDistance + 'px'
        rightNode.style.minWidth = rightNodeWidth - moveDistance + 'px'
        rightNode.style.maxWidth = rightNodeWidth - moveDistance + 'px'
      } else {
        document.onmousemove = null
        document.onmouseup = null
        if (moveDistance < 0) {
          leftNode.style.width = 0 + 'px'
          leftNode.style.minWidth = 0 + 'px'
          leftNode.style.maxWidth = 0 + 'px'
          rightNode.style.width =
            this.parantElement.getBoundingClientRect().width - moveElement.offsetWidth + 'px'
          rightNode.style.minWidth =
            this.parantElement.getBoundingClientRect().width - moveElement.offsetWidth + 'px'
          rightNode.style.maxWidth =
            this.parantElement.getBoundingClientRect().width - moveElement.offsetWidth + 'px'
        } else {
          console.log('xxxxxx')
          moveElement.style.right = 0 + 'px'
          rightNode.style.width = 0 + 'px'
          rightNode.style.minWidth = 0 + 'px'
          rightNode.style.maxWidth = 0 + 'px'
          leftNode.style.width =
            this.parantElement.getBoundingClientRect().width - moveElement.offsetWidth + 'px'
          leftNode.style.minWidth =
            this.parantElement.getBoundingClientRect().width - moveElement.offsetWidth + 'px'
          leftNode.style.maxWidth =
            this.parantElement.getBoundingClientRect().width - moveElement.offsetWidth + 'px'
        }
      }
    }
  }
  private handleStopLeftAndRightMove(
    moveDistance: number,
    leftNode: HTMLElement,
    leftNodeWidth: number,
    rightNode: HTMLElement,
    rightNodeWidth: number,
    cloneMoveElement: HTMLElement
  ) {
    this.parantElement.removeChild(cloneMoveElement)
    leftNode.style.width = leftNodeWidth + moveDistance + 'px'
    leftNode.style.minWidth = leftNodeWidth + moveDistance + 'px'
    leftNode.style.maxWidth = leftNodeWidth + moveDistance + 'px'
    rightNode.style.width = rightNodeWidth - moveDistance + 'px'
    rightNode.style.minWidth = rightNodeWidth - moveDistance + 'px'
    rightNode.style.maxWidth = rightNodeWidth - moveDistance + 'px'
  }
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