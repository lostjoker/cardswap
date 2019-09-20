import { U } from "../utils/U";

const { ccclass, property } = cc._decorator;

/**
 * 方便为sprite设置动态资源的组件。
 * @author 武僧
 */
@ccclass
export default class DynamicSprite extends cc.Component {

    onLoad() {
        this.refresh();
    }

    @property(cc.String)
    _sprite: string = "";

    set sprite(value: string) {
        this._sprite = value;
        this.refresh();
    }

    get sprite() {
        return this._sprite;
    }

    refresh() {
        if (this._sprite === '') return;

        const sprite: cc.Sprite = this.getComponent(cc.Sprite)
        if (!sprite) {
            U.log("非sprite节点!");
            return;
        }
        cc.loader.loadRes(this._sprite, cc.SpriteFrame, (err, spriteFrame) => {
            if (err) {
                cc.error("加载资源错误：" + this._sprite);
                this.sprite = "";
                return;
            }
            sprite.spriteFrame = spriteFrame
            const widget: cc.Widget = this.getComponent(cc.Widget)
            if (widget) {
                widget.enabled = true;
            }
        });
    }

    /**
     * 为指定节点适配动态资源
     * @param node 节点或组件
     * @param res 资源字符串
     */
    static adapt(node: cc.Node | cc.Component, res: string) {
        if (!node) {
            U.log("DynamicSprite adapt err:" + node);
        }
        let ds: DynamicSprite = node.getComponent(DynamicSprite);
        if (!ds) {
            ds = node.addComponent(DynamicSprite);
        }
        ds.enabled = true;
        ds.sprite = res;
    }

}
