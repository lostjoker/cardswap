import DynamicSprite from "./utils/DynamicSprite";
import { U } from "./utils/U";
import { G } from "./G";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Card extends cc.Component {

    onLoad () {

    }

    start () {

    }

    init(data:any){
        this.gamedata = data.gamedata
        this.FT = data.ft
        for(let k in this.FT){
            //power = ft 数量 * 价格
            this.gamedata.power[k] = this.FT[k] * G.COIN[k].PRICE / G.COIN.STAND.PRICE
        }
    }

    /**
     * 更新卡牌视图
     */
    initView(){
        DynamicSprite.adapt(U.findChild(this.node, ["scalex","img"]),"texture/npc" + this.gamedata.cardid)
        if(this.gamedata.isenemy){
            U.findChild(this.node, ["scalex"]).scaleX = -1
        }
        this.gamedata.hp = this.gamedata.maxhp
        this.updateHpView()
        for(let k in this.FT){
            let newpower = cc.instantiate(U.findChild(this.node,["scalex","powerview","power"]))
            newpower.name = "power" + k
            newpower.getChildByName("bar").color = cc.hexToColor(G.COIN[k].COLOR)
            U.findChild(this.node,["scalex","powerview"]).addChild(newpower)
        }
        this.updatePowerView()
    }

    /**
     * 更新力量条视图
     */
    updatePowerView(){
        for(let k in this.gamedata.power){
            if(this.gamedata.power[k] > 0){
                let newpower = U.findChild(this.node,["scalex","powerview","power" + k])
                newpower.active = true
                let barwidthrate = this.gamedata.power[k] > 1 ? 1 : this.gamedata.power[k]
                //因为使用的是fillstart，range不变
                newpower.getChildByName("bgshadow").getComponent(cc.Sprite).fillStart = 1 - barwidthrate
                newpower.getChildByName("bg").getComponent(cc.Sprite).fillStart = 1 - barwidthrate
                newpower.getChildByName("bar").getComponent(cc.Sprite).fillStart = 1 - barwidthrate
            }
        }
    }

    /**
     * 更新血量视图
     */
    updateHpView(){
        U.setText(U.findChild(this.node,["hpbar","lbl"]),this.gamedata.hp + " / " + this.gamedata.maxhp)
        U.findChild(this.node,["hpbar","hp"]).getComponent(cc.Sprite).fillRange = this.gamedata.hp / this.gamedata.maxhp
        U.findChild(this.node,["hpbar"]).getComponent(cc.Animation).play("zoomonce")
    }

    /**
     * 威力加强
     */
    addPower(tilelist:any[]){
        for(let i = 0 ; i< tilelist.length; ++i){
            let coin = Object.keys(this.FT)[tilelist[i]]
            this.gamedata.power[coin] += 0.01
            let newpower = U.findChild(this.node,["scalex","powerview","power" + coin])
            newpower.getComponent(cc.Animation).play("zoomonce")
        }
        this.updatePowerView()
    }

    /**
     * 发动攻击
     */
    attack(card:Card){
        card.beated(this.gamedata.power)
    }

    /**
     * 受击
     */
    beated(powerdata:any){
        let power = 0
        for(let k in powerdata){
            power += powerdata[k] * 1000
        }
        this.gamedata.hp -= power
        this.updateHpView()
    }

    // update (dt) {}

    /**
     * 游戏数据
     */
    gamedata = {
        isenemy:false,
        hp:0,
        maxhp:0,
        power:{},//会根据price计算完毕
        cardid:-1,
    }

    /**
     * NFT卡内资产
     * 顺序目前需对应块索引
     */
    FT = {
        IOST:0,
        NEO:0,
        ETH:0,
        COCOS:0,
        BNB:0,
        BTC:0,
    }

    /**
     * 力量原始长度
     */
    powerwidth = 150

    @property(cc.Node)
    node_hp:cc.Node = null

    @property(cc.Node)
    node_img:cc.Node = null

}
