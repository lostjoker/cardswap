import { G } from "./G";
import Tile from "./Tile";
import RankList from "./RankList";
import { U } from "./utils/U";

const {ccclass, property} = cc._decorator;

declare var wx:any

@ccclass
export default class Main extends cc.Component {

    async onLoad () {
        this.redrop()
        G.eventBus.on("hiderank",()=>{
            if(G.wxgame.infobutton)
                G.wxgame.infobutton.show()
            if(G.wxgame.bannerad)
                G.wxgame.bannerad.show()
        })
        await this.initWXGame()
    }

    start () {
        cc.director.preloadScene("game")

        // for(let i in this.testdata){
        //     console.log(i + ":" + this.testdata[i])
        // }
    }

    redrop(){
        this.drops = 0
        this.node_tiles.removeAllChildren()
        this.schedule(this.dropDownTile, G.TIME.SECOND_SMALL, 500)
    }

    /**
     * 随机掉落块效果
     */
    dropDownTile(){
        let node_tile:cc.Node = cc.instantiate(this.prefab_tile)
        node_tile.getComponent(Tile).setNum(U.randInt(0,Tile.MAX_NUM),false,false)
        node_tile.scale = 2
        node_tile.x = U.randInt(-this.node.width / 2, this.node.width / 2)
        node_tile.y = this.node.height / 2
        node_tile.zIndex = -this.drops
        node_tile.rotation = U.randInt(0,360)
        this.node_tiles.addChild(node_tile)
        let droptime = G.TIME.SECOND_SMALL * U.randInt(3,Tile.MAX_NUM)
        if(node_tile.x < -this.node.width / 4 || node_tile.x > this.node.width / 4){
            node_tile.runAction(cc.moveTo(droptime, cc.p(node_tile.x,(- this.node.height / 2 + 20 + Math.floor(this.drops / 2)))))
        }else if(node_tile.x < -this.node.width / 6 || node_tile.x > this.node.width / 6){
            node_tile.runAction(cc.moveTo(droptime, cc.p(node_tile.x,(- this.node.height / 2 + 20 + Math.floor(this.drops / 1.5)))))
        }else if(node_tile.x < -this.node.width / 8 || node_tile.x > this.node.width / 8){
            node_tile.runAction(cc.moveTo(droptime, cc.p(node_tile.x,(- this.node.height / 2 + 20 + Math.floor(this.drops / 1.25)))))
        }else{
            node_tile.runAction(cc.moveTo(droptime, cc.p(node_tile.x,(- this.node.height / 2 + 20 + Math.floor(this.drops)))))
        }
        ++this.drops
    }

    /**
     * 点了emoji
     */
    onBtnEmoji(event,eventdata){
        this.node.getChildByName("cat" + eventdata).runAction(cc.sequence(
            cc.moveBy(G.TIME.SECOND_SMALL,cc.p(0,20)),
            cc.moveBy(G.TIME.SECOND_SMALL,cc.p(0,-20)),
            cc.moveBy(G.TIME.SECOND_SMALL,cc.p(0,20)),
            cc.moveBy(G.TIME.SECOND_SMALL,cc.p(0,-20)),
        ))
    }

    /**
     * 初始化微信小游戏部分
     */
    async initWXGame(){
        try {
            if(!wx){
                U.log("未发现微信接口")
                this.node_startbtn.active = true
                return
            }
            this.node_startbtn.active = false
            //计算canvas与实际wx内的呈现比例
            let ratex = this.node.width / window.innerWidth
            let ratey = this.node.height / window.innerHeight
            G.wxgame.infobutton = wx.createUserInfoButton({
                type: "text",
                text: "开始游戏",
                style: {
                    left: (this.node.width - 300) / ratex / 2,
                    top: (this.node.height - 100) / ratey / 2,
                    width: 300 / ratex,
                    height: 100 / ratey,
                    lineHeight: 50,
                    backgroundColor: "#F2E54E",
                    borderColor:"#999131",
                    borderWidth:4,
                    color: "#000000",
                    textAlign: "center",
                    fontSize: 22,
                    borderRadius: 4
                }
            })
            G.wxgame.infobutton.onTap((res) => {
                U.log(G.wxgame.infobutton)
                U.log(res)
                G.player.name = res.userInfo.nickName
                G.player.avatarkey = res.userInfo.avatarUrl
                G.wxgame.infobutton.hide()
                U.log(G.player)
                this.onBtnStart()
            })
            G.wxgame.bannerad = wx.createBannerAd({
                adUnitId: "adunit-1093826677110416",
                style: {
                    left: 0,
                    top: (this.node.height - 185) / ratey ,
                    height: 80 / ratey,
                    width: this.node.width / ratex,
                }
            })
            G.wxgame.bannerad.show()
            await wx.showShareMenu({
                withShareTicket:false,
                title: '叫上小伙伴们！',
                success: (res) => {
                    U.log('分享菜单成功');
                    U.log(res);
                },
                fail: (res) => {
                    U.log('分享菜单失败');
                    U.log(res);
                }
            })
            let title = G.ShareTitleArr[U.randInt(0,G.ShareTitleArr.length - 1)]
            let imgurl = G.ShareImgArr[U.randInt(0,G.ShareImgArr.length - 1)]
            await wx.onShareAppMessage((obj)=>{
                return {
                    title: title,
                    imageUrl: imgurl,
                    success: ()=>{
                        U.log("转发成功")
                    },
                    fail:()=>{
                        U.log("转发失败")
                    }
                }
            })
        } catch (error) {
            U.log(error)
        }
    }

    onBtnStart(){
        cc.director.loadScene("game")
    }

    async onBtnShare(){
        let title = G.ShareTitleArr[U.randInt(0,G.ShareTitleArr.length - 1)]
        let imgurl = G.ShareImgArr[U.randInt(0,G.ShareImgArr.length - 1)]
        //主动发起转发
        await wx.shareAppMessage({
            title: title,
            imageUrl: imgurl,
            success: ()=>{
                U.log("转发成功，main")
            },
            fail:()=>{
                U.log("转发失败，main")
            }
        })
    }

    /**
     * 更多有趣的游戏二维码
     */
    onBtnOtherGame(){
        if(!wx){
            U.log("未发现微信接口")
            this.node_startbtn.active = true
            return
        }
        let temparr = U.randArray(G.OtherGame)
        for(let i = 0; i < temparr.length; ++i){
            if(temparr[i].SELF){//排除跳转回自己
                temparr.splice(i,1)
                break
            }
        }
        U.log("APPID: " + temparr[0].APPID)
        
        wx.navigateToMiniProgram({
            appId: temparr[0].APPID,
            path: "",
            extraData: {
                from: temparr[0].SIGN
            },
            envVersion: "trial",//"develop",
            success(res) {
                U.log("navigateToMiniProgram success")
                U.log(res)
            },
            fail(res) {
                U.log("navigateToMiniProgram fail")
                U.log(res)
            },
            complete(res) {
                U.log("navigateToMiniProgram complete")
                U.log(res)
            },
        })
    }

    /**
     * 显示排行榜
     */
    onBtnShowRank(){
        if(G.wxgame.infobutton)
            G.wxgame.infobutton.hide()
        if(G.wxgame.bannerad)
            G.wxgame.bannerad.hide()
        if(!this.node_ranklist){
            this.node_ranklist = cc.instantiate(this.prefab_ranklist)
            // this.node_ranklist.getComponent(RankList).game = this
            this.node.addChild(this.node_ranklist)
        }
        this.node_ranklist.getComponent(RankList).show()
    }

    drops:number = 0

    /**
     * 非wx模式下显示
     */
    @property(cc.Node)
    node_startbtn:cc.Node = null

    @property(cc.Node)
    node_tiles:cc.Node = null
    
    @property(cc.Prefab)
    prefab_tile:cc.Prefab = null

    node_ranklist:cc.Node = null
    @property(cc.Prefab)
    prefab_ranklist:cc.Prefab = null


    testdata = {
        "10014": {
            "1": {
                "pool_level3": 0,
                "pool_level2": 1,
                "pool_level1": 19
            },
            "2": {
                "pool_level1": 2
            },
            "3": {
                "pool_level1": 2
            },
            "4": {
                "pool_level1": 2
            },
            "5": {
                "pool_level1": 1
            },
            "6": {
                "pool_level1": 3
            }
        },
        "10018": {
            "1": {
                "pool_level1": 14
            },
            "2": {
                "pool_level1": 1
            }
        },
        "10020": {
            "1": {
                "pool_level1": 2
            },
            "3": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 2
            },
            "5": {
                "pool_level1": 1
            }
        },
        "10024": {
            "1": {
                "pool_level1": 14
            }
        },
        "10027": {
            "1": {
                "pool_level1": 5
            },
            "3": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 1
            }
        },
        "10030": {
            "1": {
                "pool_level1": 4
            }
        },
        "10031": {
            "1": {
                "pool_level3": 0,
                "pool_level2": 1,
                "pool_level1": 19
            },
            "2": {
                "pool_level1": 7
            },
            "3": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 1
            },
            "5": {
                "pool_level1": 1
            },
            "6": {
                "pool_level1": 1
            }
        },
        "10035": {
            "1": {
                "pool_level1": 13
            }
        },
        "10036": {
            "2": {
                "pool_level1": 4
            },
            "3": {
                "pool_level1": 2
            },
            "4": {
                "pool_level1": 2
            },
            "5": {
                "pool_level1": 2
            },
            "6": {
                "pool_level1": 2
            }
        },
        "10037": {
            "1": {
                "pool_level3": 0,
                "pool_level2": 1,
                "pool_level1": 1
            }
        },
        "10038": {
            "1": {
                "pool_level1": 2
            }
        },
        "10046": {
            "1": {
                "pool_level1": 1
            }
        },
        "10048": {
            "1": {
                "pool_level1": 12
            },
            "2": {
                "pool_level1": 1
            }
        },
        "10050": {
            "1": {
                "pool_level1": 1
            }
        },
        "10052": {
            "1": {
                "pool_level1": 5
            },
            "2": {
                "pool_level1": 1
            },
            "3": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 2
            }
        },
        "10058": {
            "1": {
                "pool_level1": 4
            },
            "2": {
                "pool_level1": 1
            },
            "3": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 1
            },
            "5": {
                "pool_level1": 1
            },
            "6": {
                "pool_level1": 1
            }
        },
        "10059": {
            "1": {
                "pool_level3": 0,
                "pool_level2": 1,
                "pool_level1": 0
            },
            "3": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 1
            },
            "5": {
                "pool_level1": 1
            },
            "6": {
                "pool_level1": 1
            }
        },
        "10066": {
            "1": {
                "pool_level3": 0,
                "pool_level2": 3,
                "pool_level1": 0
            },
            "2": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 1
            },
            "5": {
                "pool_level1": 1
            }
        },
        "10073": {
            "1": {
                "pool_level1": 1
            },
            "2": {
                "pool_level1": 1
            },
            "3": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 1
            },
            "5": {
                "pool_level1": 1
            },
            "6": {
                "pool_level1": 1
            }
        },
        "10075": {
            "1": {
                "pool_level1": 10
            }
        },
        "10078": {
            "1": {
                "pool_level1": 26,
                "pool_level3": 1,
                "pool_level2": 1
            },
            "2": {
                "pool_level1": 1
            },
            "3": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 1
            },
            "5": {
                "pool_level1": 1
            },
            "6": {
                "pool_level1": 1
            }
        },
        "10085": {
            "1": {
                "pool_level1": 1
            },
            "2": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 1
            }
        },
        "10094": {
            "1": {
                "pool_level1": 5
            },
            "2": {
                "pool_level1": 2
            },
            "3": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 1
            },
            "5": {
                "pool_level1": 1
            },
            "6": {
                "pool_level1": 3
            }
        },
        "10117": {
            "1": {
                "pool_level3": 0,
                "pool_level2": 1,
                "pool_level1": 4
            },
            "2": {
                "pool_level1": 1
            },
            "3": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 1
            },
            "5": {
                "pool_level1": 1
            },
            "6": {
                "pool_level1": 1
            }
        },
        "10127": {
            "1": {
                "pool_level1": 1
            }
        },
        "10128": {
            "1": {
                "pool_level3": 0,
                "pool_level2": 1,
                "pool_level1": 25
            },
            "2": {
                "pool_level1": 1
            },
            "3": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 1
            },
            "5": {
                "pool_level1": 1
            },
            "6": {
                "pool_level1": 1
            }
        },
        "10129": {
            "1": {
                "pool_level3": 0,
                "pool_level2": 1,
                "pool_level1": 0
            }
        },
        "10145": {
            "1": {
                "pool_level1": 2
            },
            "2": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 1
            }
        },
        "10156": {
            "1": {
                "pool_level1": 1
            },
            "2": {
                "pool_level1": 1
            },
            "3": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 1
            },
            "5": {
                "pool_level1": 1
            },
            "6": {
                "pool_level1": 1
            }
        },
        "10183": {
            "2": {
                "pool_level1": 2
            }
        },
        "10184": {
            "1": {
                "pool_level3": 0,
                "pool_level2": 2,
                "pool_level1": 22
            }
        },
        "10206": {
            "1": {
                "pool_level1": 1
            }
        },
        "10208": {
            "1": {
                "pool_level3": 0,
                "pool_level2": 1,
                "pool_level1": 6
            },
            "2": {
                "pool_level1": 1
            },
            "3": {
                "pool_level3": 0,
                "pool_level2": 1,
                "pool_level1": 1
            },
            "4": {
                "pool_level3": 0,
                "pool_level2": 1,
                "pool_level1": 1
            },
            "5": {
                "pool_level1": 1
            },
            "6": {
                "pool_level1": 2
            }
        },
        "10211": {
            "1": {
                "pool_level1": 17
            },
            "2": {
                "pool_level1": 2
            },
            "3": {
                "pool_level1": 2
            },
            "4": {
                "pool_level1": 4
            },
            "5": {
                "pool_level1": 2
            },
            "6": {
                "pool_level1": 2
            }
        },
        "10215": {
            "1": {
                "pool_level1": 1
            }
        },
        "10237": {
            "1": {
                "pool_level1": 11
            }
        },
        "10247": {
            "1": {
                "pool_level3": 1,
                "pool_level2": 18,
                "pool_level1": 0
            },
            "2": {
                "pool_level3": 1,
                "pool_level2": 3,
                "pool_level1": 3
            },
            "3": {
                "pool_level3": 1,
                "pool_level2": 1,
                "pool_level1": 0
            },
            "4": {
                "pool_level3": 1,
                "pool_level2": 2,
                "pool_level1": 0
            },
            "5": {
                "pool_level3": 1,
                "pool_level2": 1,
                "pool_level1": 3
            },
            "6": {
                "pool_level3": 1,
                "pool_level2": 1,
                "pool_level1": 0
            }
        },
        "10252": {
            "1": {
                "pool_level1": 4
            },
            "2": {
                "pool_level1": 1
            },
            "3": {
                "pool_level1": 1
            }
        },
        "10263": {
            "1": {
                "pool_level1": 5
            },
            "2": {
                "pool_level1": 1
            }
        },
        "10271": {
            "1": {
                "pool_level3": 0,
                "pool_level2": 1,
                "pool_level1": 14
            },
            "2": {
                "pool_level1": 1
            },
            "3": {
                "pool_level1": 3
            },
            "4": {
                "pool_level1": 2
            },
            "5": {
                "pool_level1": 2
            },
            "6": {
                "pool_level1": 2
            }
        },
        "10288": {
            "1": {
                "pool_level1": 12
            },
            "2": {
                "pool_level1": 3
            },
            "4": {
                "pool_level1": 1
            }
        },
        "10290": {
            "1": {
                "pool_level1": 7
            }
        },
        "10295": {
            "3": {
                "pool_level1": 2
            },
            "6": {
                "pool_level1": 2
            }
        },
        "10301": {
            "1": {
                "pool_level1": 7
            },
            "2": {
                "pool_level1": 2
            },
            "3": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 1
            },
            "5": {
                "pool_level1": 1
            },
            "6": {
                "pool_level1": 1
            }
        },
        "10338": {
            "1": {
                "pool_level1": 11,
                "pool_level3": 0,
                "pool_level2": 1
            },
            "2": {
                "pool_level1": 1
            },
            "3": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 1
            },
            "5": {
                "pool_level1": 1
            },
            "6": {
                "pool_level1": 1
            }
        },
        "10415": {
            "1": {
                "pool_level3": 2,
                "pool_level2": 37,
                "pool_level1": 0
            }
        },
        "10425": {
            "1": {
                "pool_level1": 1
            }
        },
        "10433": {
            "1": {
                "pool_level1": 1
            }
        },
        "10490": {
            "1": {
                "pool_level1": 21
            },
            "2": {
                "pool_level1": 4
            },
            "3": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 1
            },
            "5": {
                "pool_level1": 1
            },
            "6": {
                "pool_level1": 1
            }
        },
        "10495": {
            "1": {
                "pool_level3": 0,
                "pool_level2": 13,
                "pool_level1": 0
            },
            "2": {
                "pool_level3": 0,
                "pool_level2": 6,
                "pool_level1": 0
            },
            "3": {
                "pool_level3": 0,
                "pool_level2": 2,
                "pool_level1": 0
            },
            "4": {
                "pool_level3": 0,
                "pool_level2": 2,
                "pool_level1": 0
            },
            "5": {
                "pool_level3": 0,
                "pool_level2": 4,
                "pool_level1": 0
            },
            "6": {
                "pool_level3": 0,
                "pool_level2": 2,
                "pool_level1": 0
            }
        },
        "10527": {
            "1": {
                "pool_level1": 15
            },
            "2": {
                "pool_level1": 4
            },
            "3": {
                "pool_level1": 1
            },
            "4": {
                "pool_level1": 1
            },
            "5": {
                "pool_level1": 1
            },
            "6": {
                "pool_level1": 1
            }
        },
        "10581": {
            "1": {
                "pool_level1": 1
            }
        },
        "10664": {
            "1": {
                "pool_level1": 4
            }
        },
        "10709": {
            "1": {
                "pool_level3": 0,
                "pool_level2": 28,
                "pool_level1": -10
            },
            "2": {
                "pool_level3": 1,
                "pool_level2": 0,
                "pool_level1": 0
            },
            "3": {
                "pool_level3": 1,
                "pool_level2": 0,
                "pool_level1": 0
            },
            "4": {
                "pool_level3": 0,
                "pool_level2": 1,
                "pool_level1": 0
            },
            "5": {
                "pool_level3": 0,
                "pool_level2": 1,
                "pool_level1": 0
            },
            "6": {
                "pool_level3": 0,
                "pool_level2": 1,
                "pool_level1": 0
            }
        },
        "10734": {
            "1": {
                "pool_level1": 22
            }
        },
        "10758": {
            "1": {
                "pool_level1": 2
            }
        },
        "10785": {
            "1": {
                "pool_level3": 0,
                "pool_level2": 1,
                "pool_level1": 0
            }
        }
    }

}
