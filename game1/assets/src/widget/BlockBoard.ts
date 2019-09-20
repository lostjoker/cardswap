import { G } from "../G";


/**
 * 遮挡面板
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class BlockBoard extends cc.Component {

    private loading: boolean = false;

    @property(cc.Label)
    lbl_msg: cc.Label = null;

    onLoad() {
        let grap = this.node.getChildByName("bg").getComponent(cc.Graphics)
        grap.fillColor = G.COLORS.BLOCKBOARD
        grap.fillRect(0, 0, this.node.width, this.node.height)
        if (this.lbl_msg)
            this.lbl_msg.node.active = this.loading
    }

    set Loading(val: boolean) {
        this.loading = val
    }

}
