
const {ccclass, property} = cc._decorator;

import {G} from "./G";
import Colors from "./Colors";
import * as Game from "./Game";
import Lang from "./Lang";
import { U } from "./utils/U";
import DynamicSprite from "./utils/DynamicSprite";

@ccclass
export default class Tile extends cc.Component {
    onLoad(){
    }

    onTouch(){
        if(this.game.isMoving){
            return
        }
        if(this.num > Tile.MAX_NUM){
            U.log(Lang.TEXT.NUM_MAX)
            return
        }
        //先清空特效
        this.game.node_effects.removeAllChildren()
        // cc.audioEngine.play(this.clickEffect, false, 1);
        this.game.isMoving = true;
        // 连击次数归零
        this.game.combo = 0;
        // cc.audioEngine.play(this.addCoin, false, 1);
        this.setNum(this.num + 1,true,false)
    }

    // 绘制新方块
    drawMe(row,col){
        this.node.setPosition(this.game.line_weight + (this.game.line_weight +this.node.width)*col+this.node.width/2, this.game.line_weight +(this.game.line_weight  +this.node.height)*row+this.node.height/2)
        this.node.setScale(0);
        this.node.runAction(cc.scaleTo(G.TIME.SECOND_SMALL_SMALL_5,1));
        this.setArrPosition(row,col);
    }

    // 移动到特定点
    moveTo(row,col){
        this.row = row;
        this.col = col;
        this.node.stopActionByTag(1);
        let action = cc.moveTo(G.TIME.SECOND_SMALL_SMALL_5,cc.p(this.game.line_weight +(this.game.line_weight +this.node.width)*col+this.node.width/2,this.game.line_weight +(this.game.line_weight +this.node.height)*row+this.node.height/2));
        this.node.runAction(action);
        action.setTag(1);
    }

    // 方块销毁
    destoryTile(){
        let action = cc.sequence(cc.scaleTo(G.TIME.SECOND_SMALL_SMALL_5,0),cc.callFunc(function(node){
            node.destroy();
        },this.node,this.node));
        this.node.runAction(action);
        return this.num -1 //代表实际消除的num
    }

    // 设置方块在数组的位置
    setArrPosition(row,col){
        this.row = row;
        this.col = col;
    }

    // 设置方块数字
    setNum(num,exeLogic,playEffect){
        this.num = num
        this.numLabel.string = this.num + "";
        // let color:cc.Color = Colors["num" + num];
        // if(color)
        //     this.node.color = Colors["num" + num];
        // else
        //     this.node.color = Colors.nums;
        if(this.num <= Tile.MAX_NUM)
            DynamicSprite.adapt(this.node.getChildByName("img"),"texture/block" + num)

        if(playEffect){
            this.node.runAction(cc.sequence(cc.scaleTo(G.TIME.SECOND_SMALL_SMALL_3,1.5),cc.scaleTo(G.TIME.SECOND_SMALL_SMALL_3,1)));
        }
        // 消除逻辑
        if(!exeLogic){
            return
        }
        // 执行逻辑
        let isMove = this.game.operateLogic(this.row,this.col,this.num,true);
        let powers = this.game.node_powers
        // 能量条-1
        if(!isMove){
            this.game.power--
            let costBarAction = cc.sequence(cc.scaleTo(G.TIME.SECOND_SMALL,0),cc.callFunc((power) => {
                power.destroy();
            },null,powers[this.game.power]));
            powers[this.game.power].runAction(costBarAction);
            powers[this.game.power] = null;
            // 游戏结束逻辑判断：能量条为空
            // if(this.game.power <= 0){
            //     this.game.isMoving = true
            //     this.game.score = parseInt(this.game.lbl_score_me.string);
            //     // Game Over
            //     this.game.showResult()
            //     return
            // }

            //能量条颜色
            // if(this.game.power <= this.game.powerless){
            //     for(let i = 0; i < this.game.powerless; ++i){
            //         this.game.node_powers[i].color = Colors.powerless
            //     }
            // }
        }
    }

    @property(cc.Label)
    numLabel:cc.Label = null;

    // @property({url:cc.AudioClip})
    // clickEffect:string = "";

    // @property({url:cc.AudioClip})
    // addCoin:string = "";

    /**
     * 当前的数字
     */
    num:number = 0;
    
    /**
     * 最大块值
     */
    static MAX_NUM: number = 5;

    game:Game.default = null;

    row:number = 0;

    col:number = 0;

}
