import { Vue } from 'vue-property-decorator';
export default class MoverNode extends Vue {
    timer: number;
    leftNodeClass: string;
    rightNodeClass: string;
    topNodeClass: string;
    bottomNodeClass: string;
    time: number;
    get allProps(): {
        leftNodeClass: string;
        rightNodeClass: string;
        topNodeClass: string;
        bottomNodeClass: string;
    };
    handleAllPropsChange(lastedValue: any): void;
    private debounce;
    private handleDragNode;
    /**
     * 处理上下节点
     * @param event MouseEvent
     * @param eventTargetElement 运动节点 HTMLElement
     */
    handleTopAndBottomNode(event: MouseEvent, eventTargetElement: HTMLElement): false;
    /**
     * 处理左右节点
     * @param event MouseEvent
     * @param eventTargetElement 运动节点 HTMLElement
     */
    private handleLeftAndRightNode;
    private handleSelfNode;
    /**
     * @param e MouseEvent
     * @param startPositionX 开始的x轴坐标
     * @param leftNode 拖动区域的左侧节点
     * @param leftNodeOriginalWidth 拖动区域的左侧节点的开始宽度
     * @param rightNode 拖动区域的右侧节点
     * @param rightNodeOriginalWidth 拖动区域的右侧节点的开始宽度
     */
    private handleLeftAndRightMousemove;
    /**
     * @param e MouseEvent
     * @param startPositionY 开始的y轴坐标
     * @param topNode 拖动区域的上侧节点
     * @param topNodeOriginalHeight 拖动区域的上侧节点的开始高度
     * @param bottomNode 拖动区域的下侧节点
     * @param bottomNodeOriginalHeight 拖动区域的下侧节点的开始高度
     */
    private handleTopAndBottomMousemove;
    /**
     * @param e MouseEvent
     * @param startPositionX X轴起点
     * @param startPositionY Y轴起点
     * @param eventTargetElement HtmlElement
     */
    private handleSelfMousemove;
    private get notSlot();
}
