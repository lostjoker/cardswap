import { U } from "./utils/U";
import Game from "./Game";
import { G } from "./G";

const {ccclass, property} = cc._decorator;

declare var wx:any

@ccclass
export default class RankList extends cc.Component {

    onLoad(){
        this.hide()
    }

    start() {
        U.log("CC_WECHATGAME:")
        U.log(CC_WECHATGAME)
        if (CC_WECHATGAME) {
            wx.showShareMenu({withShareTicket: true});//设置分享按钮，方便获取群id展示群排行榜
            this.tex = new cc.Texture2D();
            window["sharedCanvas"].width = 640;
            window["sharedCanvas"].height = 960;
            wx.postMessage({
                messageType: 1,
                MAIN_MENU_NUM: "x1"
            });
        }
    }

    friendButtonFunc(event) {
        if (CC_WECHATGAME) {
            // 发消息给子域
            wx.postMessage({
                messageType: 1,
                MAIN_MENU_NUM: "x1"
            });
        } else {
            U.log("获取好友排行榜数据。x1");
        }
    }

    groupFriendButtonFunc(event) {
        let title = G.ShareTitleArr[U.randInt(0,G.ShareTitleArr.length - 1)]
        let imgurl = G.ShareImgArr[U.randInt(0,G.ShareImgArr.length - 1)]
        if (CC_WECHATGAME) {
            wx.shareAppMessage({
                title: title,
                imageUrl: imgurl,
                success: (res) => {
                    if (res.shareTickets != undefined && res.shareTickets.length > 0) {
                        wx.postMessage({
                            messageType: 5,
                            MAIN_MENU_NUM: "x1",
                            shareTicket: res.shareTickets[0]
                        });
                    }
                }
            });
        } else {
            U.log("获取群排行榜数据。x1");
        }
    }

    gameOverButtonFunc (event) {
        if (CC_WECHATGAME) {
            wx.postMessage({// 发消息给子域
                messageType: 4,
                MAIN_MENU_NUM: "x1"
            });
        } else {
            U.log("获取横向展示排行榜数据。x1");
        }
    }

    /**
     * 提交得分
     */
    onBtnSubmitScore(){
        let score = this.game.score;
        if (CC_WECHATGAME) {
            wx.postMessage({
                messageType: 3,
                MAIN_MENU_NUM: "x1",
                score: score,
            });
        } else {
            U.log("提交得分: x1 : " + score)
        }
    }

    // 刷新子域的纹理
    _updateSubDomainCanvas() {
        if (window["sharedCanvas"] != undefined) {
            this.tex.initWithElement(window["sharedCanvas"]);
            this.tex.handleLoadedTexture();
            this.rankingScrollView.spriteFrame = new cc.SpriteFrame(this.tex);
        }
    }

    onBtnClose(){
        if(!this.game)
            G.eventBus.emit("hiderank")
        this.hide()
    }

    show(){
        this.node.active = true
    }

    hide(){
        this.node.active = false
    }

    update() {
        this._updateSubDomainCanvas();
    }
    
    game:Game = null
    tex:cc.Texture2D = null

    @property(cc.Node)
    groupFriendButton: cc.Node = null;
    @property(cc.Node)
    friendButton: cc.Node = null;
    @property(cc.Node)
    gameOverButton: cc.Node = null;
    @property(cc.Sprite)
    rankingScrollView: cc.Sprite = null;//显示排行榜
}
