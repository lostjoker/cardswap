import { G } from "../G";
import Game from "../Game";
import { NetWork } from "../NetWork";
import { U } from "../utils/U";
import { Platform } from "../utils/Platform";
import RankList from "../RankList";

/**
 * 结束面板
 */
const {ccclass, property} = cc._decorator;

declare var wx:any

@ccclass
export default class OverPanel extends cc.Component {

    onLoad(){
        let bb_node = cc.instantiate(this.bb);
        bb_node.setLocalZOrder(-1)
        this.node.addChild(bb_node)

        this.node.scale = 0.7
        this.node.active = false

    }

    /**
     * 点击重玩处理
     */
    onBtnRestart(){
        this.game.power = 5
        this.game.init()
        this.game.gameStart()
        this.hide()
        
        let lesseth = parseInt(Platform.getStorage("ETH")) - 0.03;
        Platform.putStorage("ETH",lesseth+"")
    }

    /**
     * 点击分享复活的处理
     */
    async onBtnShareRelive(){
        //主动发起转发
        await wx.shareAppMessage({
            title: G.ShareTitleArr[U.randInt(0,G.ShareTitleArr.length - 1)],
            imageUrl:G.ShareImgArr[U.randInt(0,G.ShareImgArr.length - 1)],
            success: ()=>{
                U.log("转发成功，准备复活")
                this.game.relive()
                this.hide()
                U.log("复活")
            },
            fail:()=>{
                U.log("转发失败，取消复活")
            }
        })
    }

    onBtnShowRank(){
        //排行榜
        if(!this.game.node_ranklist){
            this.game.node_ranklist = cc.instantiate(this.game.prefab_ranklist);
            this.game.node_ranklist.getComponent(RankList).game = this.game
            this.game.node.addChild(this.game.node_ranklist)
        }
        this.game.node_ranklist.getComponent(RankList).show()
        this.game.node_ranklist.getComponent(RankList).onBtnSubmitScore()
    }

    show(game: Game) {
        this.node_btn_sharerelive.getComponent(cc.Button).enabled = true;
        this.node.active = true
        this.node.runAction(cc.sequence(
            cc.scaleTo(G.TIME.SECOND_SMALL_2,1.2,1.2),
            cc.scaleTo(G.TIME.SECOND_SMALL,1,1)
        ))
        console.log("ETH: " + Platform.getStorage("ETH"))
        this.node_coinless.active = false

        G.wxgame.bannerad.hide()
    }

    hide(){
        this.node.active = false
        
        G.wxgame.bannerad.show()
    }

    @property(cc.Node)
    node_btn_sharerelive:cc.Node = null

    @property(cc.Node)
    node_btn_restart:cc.Node = null

    /**
     * 剩余货币量
     */
    @property(cc.Node)
    node_coinless:cc.Node = null

    @property(cc.Prefab)
    bb:cc.Prefab = null

    game:Game = null

}
