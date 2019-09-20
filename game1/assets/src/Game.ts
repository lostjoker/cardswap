/**
 * 游戏实现
 */
const { ccclass, property } = cc._decorator;

import {G} from "./G";
import Colors from "./Colors";
import { NetWork } from "./NetWork";
import OverPanel from "./widget/OverPanel";
import Tile from "./Tile";
import { U } from "./utils/U";
import { Platform } from "./utils/Platform";
import RankList from "./RankList";
import Card from "./Card";

// declare var wx:any

@ccclass
export default class Game extends cc.Component {

    async onLoad() {

        //结算界面
        if(!this.node_overPanel){
            this.node_overPanel = cc.instantiate(this.prefab_overpanel);
            this.node_overPanel.getComponent(OverPanel).game = this
            this.node.addChild(this.node_overPanel)
        }
        
        this.init()

        if(G.player){
            this.updateFace()
        }

        this.loadOver()
    }

    start(){
    }

    init(){
        this.finished = false
        
        this.DATA.mecard = new Card()
        this.DATA.mecard.init(G.getData().me)
        this.DATA.mecard.node = cc.instantiate(this.prefab_card)
        this.node_leftcard.addChild(this.DATA.mecard.node)
        this.DATA.mecard.initView()

        this.DATA.enemycard = new Card()
        this.DATA.enemycard.init(G.getData().enemy)
        this.DATA.enemycard.node = cc.instantiate(this.prefab_card)
        this.node_rightcard.addChild(this.DATA.enemycard.node)
        this.DATA.enemycard.initView()

        this.node_bg.color = Colors.bg[0]
        this.score = 0//Math.ceil(this.score * 0.4)//重玩分数-60%
        this.lbl_score_me.string = this.score + ""
        this.lbl_score_me.node.getComponent(cc.Widget).enabled = true
        this.updateMaxNumGen()
        this.tileBg.removeAllChildren()
        this.node_effects.removeAllChildren()
        this.node_combo.active = false
        this.node_encourage.active = false
        // 初始化方块数组
        this.tiles = [
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null],
            // [null, null, null, null, null],
            // [null, null, null, null, null]
        ];
        this.tilesdata = [
            [0, 0, 0, 0, 0,0,0],
            [0, 0, 0, 0, 0,0,0],
            [0, 0, 0, 0, 0,0,0],
            [0, 0, 0, 0, 0,0,0],
            [0, 0, 0, 0, 0,0,0],
            // [0, 0, 0, 0, 0],
            // [0, 0, 0, 0, 0],
        ]
        // 重置能量条
        this.resetPower(this.power)
        this.genTiles(true)
        //计算缩放倍率
        let tile = cc.instantiate(this.tilePre);
        let oldw = tile.width
        let oldh = tile.height
        this.tileScale.w = this.tiles[0][0].width / oldw
        this.tileScale.h = this.tiles[0][0].height / oldh
    }

    async loadOver(){
        this.gameStart()
        // await NetWork.request("game/loadover_DWJY", { vs: G.roomData.id })
    }

    gameStart(){
        this.updateScore()
        this.isMoving = false
    }

    /**
     * 更新最大的块生成数
     */
    updateMaxNumGen(){
        for(let i = 0; i < G.SCORE_RANK.length; ++i){
            if(this.score > G.SCORE_RANK[i].SCORE){
                this.maxNumGen = G.SCORE_RANK[i].MAX_NUM_GEN
                continue
            }
            break
        }
    }

    genTiles(first:boolean = false){
        // 计算生成方块数字的概率
        let chance = new Array();
        for (let num = 0; num < this.maxNumGen; num++) {
            //越小的值占的权重越高
            chance[num] = this.maxNumGen - num;
        }
        let weightall = 0;
        for (let num = 0; num < chance.length; num++) {
            weightall += chance[num];
        }
        
        // 生成初始方块
        for (let r = 0; r < this.tiles.length; r++) {
            for (let c = 0; c < this.tiles[r].length; c++) {
                if(!first && this.tiles[r][c])
                    continue
                let tile = cc.instantiate(this.tilePre);
                tile.getComponent(Tile).game = this;
                tile.width = (this.tileBg.width - this.line_weight * (this.tiles[r].length + 1)) / this.tiles[r].length
                tile.height = (this.tileBg.height - this.line_weight * (this.tiles.length + 1)) / this.tiles.length
                if(first){
                    let randomNum = 0;
                    while (true) {
                        let arr = new Array();
                        let scanArr = new Array();
                        randomNum = Math.random() * weightall;
                        let newNum = 0;
                        let min = 0;
                        for (let num = 0; num < chance.length; num++) {
                            if (randomNum >= min && randomNum <= min + chance[num]) {
                                newNum = num + 1;
                                break;
                            } else {
                                min = min + chance[num];
                            }
                        }
                        tile.getComponent(Tile).setNum(newNum, false, false);
                        this.tiles[r][c] = tile;
                        this.scanAround(r, c, -1, -1, newNum, arr, scanArr);
                        if (arr.length < this.clearNeed) {//初始不生成3连的
                            break;
                        }
                    }
                }else{
                    let randomNum = Math.random() * weightall
                    let newNum = 0;
                    let min = 0;
                    for (let num = 0; num < chance.length; num++) {
                        if (randomNum >= min && randomNum <= min + chance[num]) {
                            newNum = num + 1;
                            break;
                        } else {
                            min = min + chance[num];
                        }
                    }
                    tile.getComponent(Tile).setNum(newNum, false, false);
                    this.tiles[r][c] = tile;
                }
                tile.getComponent(Tile).drawMe(r, c);
                this.tileBg.addChild(tile);
            }
        }
    }

    /**
     * 复活
     */
    relive(){
        this.finished = false
        this.resetPower(this.powermax)
        this.score = Math.ceil(this.score * 0.7)//求助-30%
        this.lbl_score_me.string = this.score + ""
        this.lbl_score_me.node.getComponent(cc.Widget).enabled = true
        this.updateMaxNumGen()
        this.isMoving = false
    }

    /**
     * 重置能量条
     */
    resetPower(count = this.powermax){
        this.node_powers = [null, null, null, null, null];
        this.powerBarBg.removeAllChildren()
        for (let i = 0; i < count; i++) {
            let power = cc.instantiate(this.powerPre);
            power.width = (this.powerBarBg.width - this.line_weight * (this.node_powers.length + 1)) / this.node_powers.length;
            power.height = this.powerBarBg.height - this.line_weight * 2;
            this.powerBarBg.addChild(power);
            power.setPosition(this.line_weight + (this.line_weight + power.width) * i + power.width / 2, this.line_weight + power.height / 2);
            power.color = Colors.power;
            this.node_powers[i] = power
        };
        this.power = count
    }

    /**
     * 更新头像
     */
    updateFace(){
        // cc.loader.load({ url: G.player.avatarkey, type: "png" }, (err, texture) => {
        //     this.node_face_me.getChildByName("face").getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture)
        // })
    }

    /*
     * 核心扫描逻辑
     * @param row 指定行
     * @param col 指定列
     * @param lastRow 上次扫描的行，-1表示当前为出发点
     * @param lastCol 上次扫描的列，-1表示当前为出发点
     * @param num 扫描要比对的数字
     * @param arr 记录数字相同且彼此相邻的数组
     * @param scanArr 记录扫描过的点的数组
     */
    scanAround(r, c, lastRow, lastCol, num, arr, scanArr) {
        // U.log("row:",row,",col:",col,",lastRow:",lastRow,",lastCol:",lastCol,",num:",num,",arr:",arr,",scanArr:",scanArr);
        if (this.tiles[r][c] == null) {
            return;
        }
        let isClear = false;
        if (scanArr == undefined) {
            scanArr = new Array();
        }
        // 扫描过的节点不再扫描
        if (scanArr.indexOf(r + "#" + c) == -1) {
            scanArr.push(r + "#" + c);
        } else {
            return;
        }
        // 扫描上
        if ((r < this.tiles.length - 1) && (lastRow != (r + 1) || lastCol != c) && this.tiles[r + 1][c] != null) {
            let nextNum = this.tiles[r + 1][c].getComponent(Tile).num;
            if (nextNum == num) {
                if (arr.indexOf(r + "#" + c) == -1) {
                    arr.push(r + "#" + c);
                }
                this.scanAround(r + 1, c, r, c, num, arr, scanArr);
                isClear = true;
            }
        }
        // 扫描下
        if (r > 0 && (lastRow != (r - 1) || lastCol != c) && this.tiles[r - 1][c] != null) {
            let nextNum = this.tiles[r - 1][c].getComponent(Tile).num;
            if (nextNum == num) {
                if (arr.indexOf(r + "#" + c) == -1) {
                    arr.push(r + "#" + c);
                }
                this.scanAround(r - 1, c, r, c, num, arr, scanArr);
                isClear = true;
            }
        }
        // 扫描左
        if (c > 0 && (lastRow != r || lastCol != (c - 1)) && this.tiles[r][c - 1] != null) {
            let nextNum = this.tiles[r][c - 1].getComponent(Tile).num
            if (nextNum == num) {
                if (arr.indexOf(r + "#" + c) == -1) {
                    arr.push(r + "#" + c);
                }
                this.scanAround(r, c - 1, r, c, num, arr, scanArr);
                isClear = true;
            }
        }
        // 扫描右
        if ((c < this.tiles[0].length - 1) && (lastRow != r || lastCol != (c + 1)) && this.tiles[r][c + 1] != null) {
            let nextNum = this.tiles[r][c + 1].getComponent(Tile).num
            if (nextNum == num) {
                if (arr.indexOf(r + "#" + c) == -1) {
                    arr.push(r + "#" + c);
                }
                this.scanAround(r, c + 1, r, c, num, arr, scanArr);
                isClear = true;
            }
        }
        // 四周都不通，但不是出发遍历点，并且数字相同，也加入到数组
        if (!isClear && (lastRow != -1 && lastCol != -1)) {
            let curNum = this.tiles[r][c].getComponent(Tile).num
            if (curNum == num) {
                if (arr.indexOf(r + "#" + c) == -1) {
                    arr.push(r + "#" + c);
                }
            }
        }
    }

    // 主要操作逻辑
    operateLogic(touchRow, touchCol, curNum, isFirstCall) {
        let arr = new Array();
        let addScore = 0;
        let willclean = false//记录是否消除
        //加出几，加几分
        addScore += curNum
        if(curNum > Tile.MAX_NUM){
            //最大值的特殊消除
            willclean = true
            for(let r = touchRow - 1; r <= touchRow + 1; ++r){
                for(let c = touchCol - 1; c <= touchCol + 1; ++c){
                    if(!this.tiles[r] || !this.tiles[r][c])
                        continue
                    addScore += Math.floor(Math.pow(2,this.tiles[r][c].getComponent(Tile).num) * (this.combo + 1) / 2)
                    let num = this.tiles[r][c].getComponent(Tile).destoryTile()
                    this.destoryList.push(num)
                    this.tiles[r][c] = null
                }
            }
        }else{
            let scanArr = new Array();
            this.scanAround(touchRow, touchCol, -1, -1, curNum, arr, scanArr);
            if (arr.length >= this.clearNeed) {
                //有三连，有消除
                willclean = true
                for (let index in arr) {
                    let row = arr[index].split("#")[0]
                    let col = arr[index].split("#")[1]
                    //加分公式，连的数字越大基数越高，2^N1，连的越多倍率越高2^N1*N2
                    addScore += Math.floor(Math.pow(2, this.tiles[row][col].getComponent(Tile).num) * (this.combo + 1) / 2)
                    if (row != touchRow || col != touchCol) {
                        // 执行消除动作                    
                        let num = this.tiles[row][col].getComponent(Tile).destoryTile()
                        this.destoryList.push(num)
                        this.tiles[row][col] = null
                    } else {//增加值
                        //超过最大值从头开始
                        curNum = (curNum + 1 > Tile.MAX_NUM) ? 1 : (curNum + 1)
                        this.tiles[row][col].getComponent(Tile).setNum(curNum, false, true);
                    }
                }
            } else {
                if(isFirstCall){
                    //消除行为已停止
                    this.isMoving = false
                }
            }
        }
        // 更新分数
        this.score = parseInt(this.lbl_score_me.string) + addScore
        this.updateScore()
        this.updateBgColor()
        if(!willclean){
            return false
        }
        //所有方块向下移动
        this.scheduleOnce(()=> {
            this.moveAllTileDown();
        }, G.TIME.SECOND_SMALL_SMALL_2);
        if (!isFirstCall) {
            // 连击次数+1
            this.node_combo.active = true
            this.updateCombo()
            this.addEnergy()
            this.updateEmoji()
        }
        // 播放音效
        // if (this.combo < this.ac_star.length) {
        //     cc.audioEngine.play(this.ac_star[this.combo], false, 1);
        // } else {
        //     cc.audioEngine.play(this.ac_star[this.ac_star.length - 1], false, 1);
        // }
        return true;
    }

    /**
     * 能量槽增加判定
     */
    addEnergy(){
        if(this.power >= this.powermax)
            return
         //满足连击条件
        if(this.combo >= this.recoverPowerCombo){
            // 能量条补充一格
            this.power++
            let power = cc.instantiate(this.powerPre);
            power.width = (this.powerBarBg.width - this.line_weight * (this.node_powers.length + 1)) / this.node_powers.length;
            power.height = this.powerBarBg.height - this.line_weight * 2;
            this.powerBarBg.addChild(power);
            power.setPosition(this.line_weight + (this.line_weight + power.width) * (this.power - 1) + power.width / 2, this.line_weight + power.height / 2)
            power.color = Colors.power;
            power.setScale(0);
            power.runAction(cc.scaleTo(G.TIME.SECOND_SMALL, 1));
            this.node_powers[this.power - 1] = power
            
            if(this.power > this.powerless){
                for(let i = 0; i < this.powerless; ++i){
                    this.node_powers[i].color = Colors.power
                }
            }
        }
    }

    /**
     * 更新表情小动画
     */
    updateEmoji(){
        //emoji动画
        let idx = U.randInt(1, Object.keys(this.emojis).length)
        if(this.emojis["cat" + idx].cache){
            this.node_emo.getComponent(cc.Sprite).spriteFrame = this.emojis["cat" + idx].cache
        }else{
            cc.loader.loadRes(this.emojis["cat" + idx].url, cc.SpriteFrame , (err, spriteFrame) => {
                this.node_emo.getComponent(cc.Sprite).spriteFrame = spriteFrame
                this.emojis["cat" + idx].cache = spriteFrame
            })
        }
        this.node_emo.runAction(cc.sequence(
            cc.moveBy(G.TIME.SECOND_SMALL,cc.p(0,20)),
            cc.moveBy(G.TIME.SECOND_SMALL,cc.p(0,-20)),
            cc.moveBy(G.TIME.SECOND_SMALL,cc.p(0,20)),
            cc.moveBy(G.TIME.SECOND_SMALL,cc.p(0,-20)),
        ))
    }

    /**
     * 更新进度
     */
    updateScore(){
        this.lbl_score_me.string = this.score + ""
        this.lbl_score_me.node.runAction(cc.sequence(
            cc.scaleTo(G.TIME.SECOND_SMALL,1.3,1.3),
            cc.scaleTo(G.TIME.SECOND_SMALL_SMALL_3,1,1)
        ))
        this.lbl_score_me.getComponent(cc.Widget).enabled = true
        
    }

    // 所有方块向下移动
    moveAllTileDown() {
        for (let row = 0; row < this.tiles.length; row++) {
            for (let col = 0; col < this.tiles[row].length; col++) {
                if (this.tiles[row][col] != null) {// 有方块
                    for (let row1 = row; row1 > 0; row1--) {
                        if (this.tiles[row1 - 1][col] == null) {
                            //如果没有则向下移动
                            this.tiles[row1 - 1][col] = this.tiles[row1][col];
                            this.tiles[row1][col] = null;
                            this.tiles[row1 - 1][col].getComponent(Tile).moveTo(row1 - 1, col);
                        }
                    }
                }
            }
        }
        // 一定延迟后生成新方块
        this.scheduleOnce(() => {
            this.genTiles()
            //一定延迟后遍历执行操作逻辑，时间间隔需大于生成间隔
            this.scheduleOnce(()=> {
                let isSearch = false;
                for (let r = 0; r < this.tiles.length; r++) {
                    for (let c = 0; c < this.tiles[r].length; c++) {
                        if (!isSearch) {
                            isSearch = this.tiles[r][c] != null && this.operateLogic(r, c, this.tiles[r][c].getComponent(Tile).num, false);
                        }
                    }
                }
                if(!isSearch){
                    //真正所有动画和逻辑循环完
                    this.updateMaxNumGen()
                    this.updateEffect()
                    this.updateEncourage()
                    this.DATA.mecard.addPower(this.destoryList)
                    this.DATA.enemycard.beated(this.DATA.mecard.gamedata.power)
                    this.destoryList = []
                    this.isMoving = false
                }
            }, G.TIME.SECOND_SMALL_3)
        }, G.TIME.SECOND_SMALL)
    }

    /**
     * 更新连击提示
     */
    updateCombo(){
        ++this.combo
        this.node_combo.getChildByName("lbl").getComponent(cc.Label).string = this.combo + " COMBO!!"
        this.node_combo.getChildByName("lbl_shadow").getComponent(cc.Label).string = this.combo + " COMBO!!"
        this.node_combo.runAction(cc.sequence(
            cc.scaleTo(0,0.5,0.5),
            cc.fadeIn(0),
            cc.scaleTo(G.TIME.SECOND_SMALL_2,1,1),
            cc.fadeOut(G.TIME.SECOND_SMALL_2),
            cc.callFunc(() => {
                this.node_combo.active = false
            })
        ))
        this.node_combo.runAction(cc.sequence(
            cc.moveBy(G.TIME.SECOND_SMALL,cc.p(0,20)),
            cc.moveBy(G.TIME.SECOND_SMALL,cc.p(0,-20)),
            cc.moveBy(G.TIME.SECOND_SMALL,cc.p(0,20)),
            cc.moveBy(G.TIME.SECOND_SMALL,cc.p(0,-20)),
        ))
    }

    /**
     * 重刷可以触发的特效
     * fixme:目前的逻辑会重复触发这里，每次下动后都会延迟重刷新
     * 可以优化一个当前出现的最大值，避免多余的循环
     */
    updateEffect(){
        this.node_effects.removeAllChildren()
        for(let r = 0;  r < this.tiles.length; ++r){
            for(let c = 0; c < this.tiles[r].length; ++c){
                if(!this.tiles[r][c])
                    continue
                let tile = this.tiles[r][c].getComponent(Tile);
                // 最大值特效
                // if(tile.num >= Tile.MAX_NUM){
                //     let node_effect1:cc.Node = cc.instantiate(this.prefab_effect1)
                //     node_effect1.x = tile.node.x
                //     node_effect1.y = tile.node.y
                //     node_effect1.width *= this.tileScale.w
                //     node_effect1.height *= this.tileScale.h
                //     this.node_effects.addChild(node_effect1)
                //     node_effect1.getComponent(cc.Animation).play()
                // }
            }
        }
    }

    /**
     * 显示鼓励词
     */
    updateEncourage(){
        if(this.combo < 1)
            return
        this.node_encourage.stopAllActions()
        this.node_encourage.active = true
        let coloridx = (this.combo >= Colors.combo.length - 1) ? Colors.combo.length - 1 : this.combo
        this.node_encourage.getChildByName("bg").color = Colors.combo[coloridx]
        let wordidx = (this.combo >= this.encourage.length - 1) ? this.encourage.length - 1 : this.combo
        this.node_encourage.getChildByName("lbl").getComponent(cc.Label).string =  this.encourage[wordidx]
        this.node_encourage.getChildByName("lbl_shadow").getComponent(cc.Label).string = this.encourage[wordidx]
        this.node_encourage.runAction(cc.sequence(
            cc.fadeIn(0),
            cc.scaleTo(0,0.5),
            cc.scaleTo(G.TIME.SECOND_SMALL_2,1,1),
            cc.delayTime(G.TIME.SECOND),
            cc.spawn(
                cc.scaleTo(G.TIME.SECOND_SMALL,0),
                cc.fadeOut(G.TIME.SECOND_SMALL_2),
            ),
            cc.callFunc(()=>{
                this.node_encourage.active = false
            })
        ))
    }

    /**
     * 背景变色
     */
    updateBgColor(){
        let coloridx = Math.floor(this.score / 5000)
        coloridx = coloridx % Colors.bg.length
        this.node_bg.color = Colors.bg[coloridx]
    }

    /**
     * 将某块变成想要的值
     */
    changeTileToWant(row,col,val){
        this.tiles[row][col].getComponent(Tile).setNum(val, false, true);
    }

    /**
     * 回合变换
     */
    calcTurnOver(){

    }

    /**
     * 显示结果
     */
    async showResult(){
        U.log("show result")
        this.scheduleOnce(()=>{
            this.node_overPanel.getComponent(OverPanel).show(this)
        },G.TIME.SECOND)
    }

    /**
     * 点击返回按钮
     */
    onBackBtnClick(){
    }

    async onBtnShare(){
    }

    /**
     * 游戏数据
     */
    DATA:GameData = {
        mecard:null,
        enemycard:null,
    }
    
    score:number = 0;

    @property(cc.Prefab)
    tilePre: cc.Prefab = null;

    /**
     * 在原始prefab上缩放的倍率，计算得出，用于其他缩放比
     */
    tileScale = {
        w:1,
        h:1
    }

    fs:any

    savefile:string = "xdwjy.txt"

    @property(cc.Node)
    node_bg:cc.Node = null;

    @property(cc.Prefab)
    powerPre: cc.Prefab = null;

    @property(cc.Node)
    node_face_me:cc.Node = null

    @property(cc.Label)
    lbl_score_me: cc.Label = null;

    win_score:number = 1

    @property(Array)
    tiles: Array<any> = [];

    //块数据组
    tilesdata:Array<any> = []

    node_powers: Array<cc.Node> = [];

    //能量
    power:number = 5

    powermax:number = 5

    //能量较少标准，变色等用途
    powerless:number = 1

    /**
     * 块层
     */
    @property(cc.Node)
    tileBg: cc.Node = null

    /**
     * 触发效果层
     */
    @property(cc.Node)
    node_effects:cc.Node = null

    line_weight:number = 5

    /**
     * 血槽层
     */
    @property(cc.Node)
    powerBarBg: cc.Node = null;

    @property({type:[cc.AudioClip]})
    ac_star: string[] = [];

    //最大生成的数字，注：目前小于5会死循环于无限三连无法生成
    maxNumGen:number = 5;

    //当前出现着的最大值
    maxNumCurrent:number = 0

    //消除所需数量
    clearNeed:number = 3

    /**
     * 正在下落中，不可点
     */
    isMoving: boolean = false;

    /**
     * 连击次数，用于一些统计和判断
     */
    combo:number = 0

    /**
     * 可恢复能量槽的连击次数需求
     */
    recoverPowerCombo:number = 2

    /**
     * 消除块列表
     */
    destoryList = []

    /**
     * 猫表情
     */
    @property(cc.Node)
    node_emo:cc.Node = null

    /**
     * 表情图集合
     */
    emojis = {
        "cat1":{
            url:"texture/cat1",
            cache:null,
        },
        "cat2":{
            url:"texture/cat2",
            cache:null,
        },
        "cat3":{
            url:"texture/cat3",
            cache:null,
        },
    }

    //鼓励词
    encourage = [
        "",
        "NICE", "NICE!",
        "COOL", "COOL!", "COOL!!",
        "SUPER", "SUPER!", "SUPER!!", "SUPER!!",
        "WONDERFUL", "WONDERFUL!", "WONDERFUL!!", "WONDERFUL!!", "WONDERFUL!!",
        "EXCELLENT", "EXCELLENT!", "EXCELLENT!!", "EXCELLENT!!", "EXCELLENT!!", "EXCELLENT!!",
        "FANTASTIC", "FANTASTIC!", "FANTASTIC!!", "FANTASTIC!!", "FANTASTIC!!", "FANTASTIC!!", "FANTASTIC!!",
    ]

    @property(cc.Prefab)
    prefab_overpanel:cc.Prefab = null
    node_overPanel:cc.Node = null

    private static _instance: Game = null;
    public static get Instance() { return this._instance; }

    finished = false;

    /**
     * 特殊效果特效
     */
    @property(cc.Prefab)
    prefab_effect1:cc.Prefab = null;

    @property(cc.Node)
    node_encourage:cc.Node = null

    @property(cc.Node)
    node_combo:cc.Node = null

    node_ranklist:cc.Node = null
    @property(cc.Prefab)
    prefab_ranklist:cc.Prefab = null

    @property(cc.Node)
    node_btnshare:cc.Node = null

    /**
     * 卡牌自身prefab
     */
    @property(cc.Prefab)
    prefab_card:cc.Prefab = null;
    
    //左侧卡牌
    @property(cc.Node)
    node_leftcard:cc.Node = null

    //右侧卡牌
    @property(cc.Node)
    node_rightcard:cc.Node = null
}


type GameData = {
    mecard:Card,
    enemycard:Card
}