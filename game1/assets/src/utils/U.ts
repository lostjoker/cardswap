import { G } from "../G";
import { DEBUG } from "../config";

export class Util {

	static readonly Instance: Util = new Util()
	
	/**
	 * 只在debug模式下输出
	 */
	log(log) {
		if(DEBUG)
			console.log(log)
	}

	/**
	 * 数组求和
	 * @param arr
	 */
	sum(arr):number{
		let sum = 0
		for(let i = 0; i <arr.length; ++i){
			sum += arr[i]
		}
		return sum
	}

	/**
	 * 生成一个[min, max]区间内的随机整数
	 */
	randInt(min: number, max: number): number {
		return Math.floor(min + Math.random() * (max - min + 1));
	}

	/**
	 * 生成一个[min, max]区间内的随机浮点数，并保留x位
	 */
	randNumber(min: number, max: number, x:number): number {
		return parseFloat((min + Math.random() * (max - min + 1)).toFixed(x))
	}

	/**
	 * 生成一个随机布尔值。
	 */
	randBool(rate: number = 0.5): boolean {
		return Math.random() < rate;
	}

	/**
	 * 生成一个[min, max]区间的随机对象
	 */
	randObj(objs: any): any {
		let idx = this.randInt(0, Object.keys(objs).length - 1)
		let i = 0
		for (let k in objs) {
			if (i == idx)
				return objs[k]
			++i
		}
	}

	/**
	 * Fisher–Yates shuffle费雪耶兹随机置乱算法，数组随机排序
	 * @param arr 数组
	 */
	randArray(arr: Array<any>): Array<any> {
		let i = arr.length;
		while (i) {
			let j = Math.floor(Math.random() * i--);
			[arr[j], arr[i]] = [arr[i], arr[j]];
		}
		return arr;
	}

	isNumber(x: any): x is number {
		return typeof x === "number";
	}

	isString(x: any): x is string {
		return typeof x === "string";
	}

	ensureNumber(x: any): number {
		if (this.isNumber(x)) return x;
		if (this.isString(x)) return parseInt(x);
		throw new Error("type wrong!");
	}

	loader(url: string) {

	}

	/**
	 * 生成随机手机号，弹幕用
	 */
	randPhone(){
		let barrage = "1"
		for(let i = 0; i < 10; ++i){
			barrage += this.randInt(1,9)
		}
		return barrage
	}

	/**
	 * 显示tips
	 */
	showTips(parent:cc.Node, prefab_tips:cc.Prefab, str:string){
		let node_tips = cc.instantiate(prefab_tips)
		node_tips.getChildByName("lbl").getComponent(cc.Label).string = str
		parent.addChild(node_tips)

		node_tips.runAction(cc.sequence(
			cc.moveBy(G.TIME.SECOND_SMALL_3, cc.p(0,150)),
			cc.delayTime(G.TIME.SECOND_SMALL_5),
			cc.fadeOut(G.TIME.SECOND_SMALL_3),
			cc.callFunc(()=>{
				parent.removeChild(node_tips)
			})
		))
	}

	/**
	 * 异步获取公网IP
	 */
	async getPublicIP() {
		//todo: not php check
		return (await fetch("http://picbed.newgmud.cn/xxip.php")).text();
	}

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * 判断是否为JSON字符串
     * @param str
     */
    isJSONStr(str: string) {
        try {
            const obj = JSON.parse(str);
            return !!(typeof obj == 'object' && obj);
        } catch (e) {
            return false;
        }
    }

    /**
     * 二分法获取某个整数在某个范围内
     * @param {any[]} arr 已排序整数数组
     * @param {number} findVal 要搜索的整数
     * @param {number} lIndex 左侧索引
     * @param {number} rIndex 右侧索引
     * @returns {any}
     */
    binarySearch(arr: any[], findVal: number, lIndex: number, rIndex: number): number {
        if (lIndex > rIndex) {
            return lIndex <= 0 ? 0 : lIndex - 1;
        }
        const midIndex: number = Math.floor((lIndex + rIndex) / 2);
        const midVal: number = Number(arr[midIndex]);
        if (midVal > findVal) {
            return this.binarySearch(arr, findVal, lIndex, midIndex - 1);
        } else if (midVal <= findVal) {
            return this.binarySearch(arr, findVal, midIndex + 1, rIndex);
        } else {
            return midIndex + 1;
        }
    }

    /**
     * 场景进入过渡
     */
    async sceneIn(node: cc.Node) {
        U.mySetLocalZOrder(100, node, null, true)
        node.active = true
        for (let i = 0; i < node.children.length; ++i) {
            if (!node.children[i].getComponent(cc.Animation))
                continue
            node.children[i].getComponent(cc.Animation).play("line_down")
            await U.wait(G.TIME.SECOND_SMALL_SMALL_3 * G.TIME.RATE)
        }

        node.getChildByName("line_left").getComponent(cc.Animation).play("line_middle2left")
        node.getChildByName("line_right").getComponent(cc.Animation).play("line_middle2right")
        await U.wait(G.TIME.SECOND_SMALL_2 * G.TIME.RATE)
        node.active = false
    }

    /**
     * 场景退出过渡
     */
    async sceneOut(node: cc.Node, scene: string = "") {
        if (node.active)
            return
        U.mySetLocalZOrder(100, node, null, true)
        node.active = true
        node.getChildByName("line_left").getComponent(cc.Animation).play("line_left2middle")
        node.getChildByName("line_right").getComponent(cc.Animation).play("line_right2middle")
        await U.wait(G.TIME.SECOND_SMALL_SMALL_2 * G.TIME.RATE)

        //字幕的出现
        for (let i = 0; i < node.children.length; ++i) {
            if (node.children[i].name.indexOf("word_") == -1)
                continue
            node.children[i].active = true
            await U.wait(G.TIME.SECOND_SMALL_SMALL_2 * G.TIME.RATE)
        }
        await U.wait(G.TIME.SECOND_SMALL_3 * G.TIME.RATE)
        if (scene)
            cc.director.loadScene(scene)
        else {
            this.log("SCENE不存在：" + scene)
        }
    }

    /**
     * 场景退出过渡
     */
    sceneOut1(node: cc.Node, scene: string = "") {
        if (scene) {
            cc.director.preloadScene(scene, (error: Error) => {
                node.runAction(cc.sequence(
                    cc.fadeOut(G.TIME.SECOND_SMALL_2),
                    cc.callFunc(() => {
                        cc.director.loadScene(scene);
                    })
                ));
            });
        } else {
            node.runAction(cc.fadeOut(G.TIME.SECOND_SMALL_5));
        }
    }

    /**
     * 场景进入过渡
     */
    sceneIn1(node: cc.Node) {
        node.opacity = 0;
        //tofix:场景过渡的时候数据正好加载过来，刷新掉了场景可能会导致节点被覆盖？
        node.runAction(cc.sequence(
            cc.fadeIn(G.TIME.SECOND_SMALL_2),
            cc.callFunc(() => {
                node.opacity = 255;
            })
        ))
    }

    /**
     * 运行封装动作
     * @param node 节点
     * @param action 动作
     */
    runPromisifyAction(node: cc.Node, action: cc.FiniteTimeAction): Promise<void> {
        return new Promise(resolve => {
            node.runAction(cc.sequence(
                action,
                cc.callFunc(() => {
                    resolve()
                })
            ))
        })
    }

    /**
     * 通用设置颜色
     * @param node 
     * @param color 
     */
    setColor(node: cc.Node, color: cc.Color) {
        if (!node) {
            return
        }
        node.color = cc.color(color.getR(), color.getG(), color.getB())
        node.opacity = color.getA()
    }

    /**
     * 循环设置标题背景
     */
    setBgTop(node: cc.Node, color: cc.Color = null) {
        if (color) {
            U.setColor(node.getChildByName("bgtop"), color);
        } else {
            // U.setColor(node.getChildByName("bgtop"), Colors.THEME_CURRENT.TOP_BOTTOM);
        }
        for (let i = 0; i < node.children.length; ++i) {
            // if (node.children[i].getChildByName("bgtop")) {
            this.setBgTop(node.children[i], color);
            // }
        }
    }

    /**
     * 设置按钮可交互状态
     * @param node 按钮节点
     * @param interactable 交互状态
     * @param color 按钮颜色
     */
    setBtnInteractable(node: cc.Node, interactable: boolean, color?: cc.Color) {
        node.getComponent(cc.Button).interactable = interactable;
        if (color)
            this.setColor(node, color);
    }

    /**
     * 切换货币的公链标志
     * 薅奖期间暂用该方式临时修改客户端部分图片展示
     */
    CoinChainSign(img: string) {
        // if (img == "coin1") {
        //     if (G.NEO_MODE) {
        //         return "neo" + img
        //     }
        // }
        return img
    }

    /**
     * 文本缩略显示
     * @param txt 文本
     * @param len 期望显示的长度
     * @param pointpp 是否显示缩略号，默认显示
     */
    TextThumb(txt: string, len: number, pointpp: boolean = true) {
        let newtxt = txt.substr(0, len)
        if (txt != newtxt && pointpp) {
            newtxt += "..."
        }
        return newtxt
    }

    /**
     * 字符长度不足的数字前自动补零
     * @param num 传入的数字
     * @param length 所需字符长度
     */
    prefixInteger(num: number, length: number) {
        return (Array(length).join('0') + num).slice(-length);
    }

    /**
     * 根据节点名，按顺序查找节点以下子节点
     */
    findChild(node: cc.Node, name: string[], idx = 0): cc.Node {
        if (!node)
            return null
        if (idx < name.length - 1)
            return this.findChild(node.getChildByName(name[idx]), name, idx + 1)
        else
            return node.getChildByName(name[idx])
    }

    /**
     * 增减当前节点Z轴层级。
     * 有参照节点时，在参照节点的层级基础上进行增减层级。
     * 没有参照节点时，direct为true，直接给当前节点赋个层级；为false，在本节点已有层级上加减层级。
     * @param num 增减层级数
     * @param node 本节点
     * @param referenceNode 参照节点
     * @param direct 标记是否直接给节点赋个层级
     */
    mySetLocalZOrder(num: number, node: cc.Node, referenceNode: cc.Node = null, direct: boolean = false) {
        if (referenceNode)
            node.setLocalZOrder(referenceNode.getLocalZOrder() + num);
        else
            if (direct)
                node.setLocalZOrder(num);
            else
                node.setLocalZOrder(node.getLocalZOrder() + num);
    }

    //游戏默认字体
    FONTS = {
        DEFAULT: null,
        EFFECT: null,
    }

    /**
     * 设置游戏默认字体
     * @param font 
     */
    SetDefaultFont(obj) {
        for (let k in this.FONTS) {
            if (obj[k])
                this.FONTS[k] = obj[k]
        }
    }

    /**
     * 递归，将子节点全都设置默认字体
     */
    SetChildrenDefaultFont(node: cc.Node) {
        if (node.getComponent(cc.Label)) {//存在lbl子控件
            U.setText(node)
        }
        if (node.childrenCount) {
            for (let i = 0; i < node.children.length; ++i) {
                this.SetChildrenDefaultFont(node.children[i])
            }
        }
    }

    /**
     * 设置可自定义字体的文本
     * 也便于语言包统一
     * @param node 
     * @param str 
     * @param font
     */
    setText(node: cc.Node | cc.Component, str: any = null, font: cc.TTFFont = null) {
        if (!node) {
            U.log("DynamicSprite adapt err:" + node)
        }
        let comp = node.getComponent(cc.Label);

        if (!comp) {
            comp = node.addComponent(cc.Label);
        }

        comp.enabled = true
        if (font) {
            comp.font = font
        } else {
            comp.font = this.FONTS.DEFAULT
        }

        if (str != null) comp.string = str + "";
        else comp.string = "";
    }

    /**
     * 设置可自定义字体的富文本
     * 也便于语言包统一
     * @param node 
     * @param str 
     * @param font
     */
    setRichText(node: cc.Node | cc.Component, str: any = null, font: cc.TTFFont = null) {
        if (!node) {
            U.log("DynamicSprite adapt err:" + node)
        }
        let comp = node.getComponent(cc.RichText);

        if (!comp) {
            comp = node.addComponent(cc.RichText);
        }

        comp.enabled = true
        if (font) {
            comp.font = font
        } else {
            comp.font = this.FONTS.DEFAULT
        }

        if (str != null)
            comp.string = str + "";
    }

    //复制文本到剪切板,仅限web平台
    copyText(text: string) {
        const el = document.createElement('textarea');

        el.value = text;

        // Prevent keyboard from showing on mobile
        el.setAttribute('readonly', '');

        el.style['contain'] = 'strict';
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        el.style.fontSize = '12pt'; // Prevent zooming on iOS

        const selection = getSelection();
        let originalRange: any = false;
        if (selection.rangeCount > 0) {
            originalRange = selection.getRangeAt(0);
        }

        document.body.appendChild(el);
        el.select();

        // Explicit selection workaround for iOS
        el.selectionStart = 0;
        el.selectionEnd = text.length;

        let success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {
            U.log(err);
        }

        document.body.removeChild(el);

        if (originalRange) {
            selection.removeAllRanges();
            selection.addRange(originalRange);
        }

        return success;
    }

    /**
     * 执行弹进动画
     * @param node 执行动作的节点
     * @param time 节点运动时间
     */
    startFadeIn(node: cc.Node, time: number = G.TIME.SECOND_SMALL) {
        node.active = true;
        node.runAction(cc.spawn(
            cc.fadeTo(time, 255),
            cc.scaleTo(time, 1.0)
        ));
    }

    /**
     * 执行弹出动画
     * @param node 执行动作的节点
     * @param time 节点运动时间
     */
    startFadeOut(node: cc.Node, time: number = G.TIME.SECOND_SMALL) {
        node.runAction(cc.sequence(
            cc.spawn(
                cc.fadeTo(time, 0),
                cc.scaleTo(time, 0)
            ),
            cc.callFunc(() => {
                node.active = false;
            })
        ));
    }

    /**
     * excel导出的字符串是否为"0"或"1"
     * 因为目前excel内的大部分0和1都以字符串导出
     */
    excelTorF(v: any) {
        if (v && v != "0")
            return true
        else
            return false
    }

    /**
     * 格式化日期，例："yyyy-MM-dd hh:mm:ss"
     * @param fmt 格式化格式
     * @param date 指定日期
     */
    formatDate(fmt: string, date: any) {
        const o = {
            "M+": date.getMonth() + 1,  // 月份
            "d+": date.getDate(),   // 日
            "h+": date.getHours(),  // 小时
            "m+": date.getMinutes(),    // 分
            "s+": date.getSeconds(),    // 秒
            "q+": Math.floor((date.getMonth() + 3) / 3),    // 季度
            "S": date.getMilliseconds() // 毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (let k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }

    /**
     * 把科学计数法转化为普通字符串2e-7=>0.0000002
     * @param num 
     */
    toNonExponential(num: number) {
        let m: any[] = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
        return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
    }
    /**截取小数后n位 不四舍五入 toFixed(100.12345,4) = 100.1234 
     * @param num 要截取的数字
     * @param target 要保留的位数
      */
    toFixed(num: number | string, target: number): number | string {

        let a: string = num + '';
        if (a.lastIndexOf(".") < 0) {
            return num;
        }
        return Number(a.substring(0, a.lastIndexOf(".") + target + 1));
    }

    /**
     * 返回一个对象的大小，默认字节 B
     * @param object 
     * @param unit 是否显示单位 
     */
    sizeOf(object: any, unit?: boolean) {

        let objectList = [];
        let stack = [object];
        let bytes = 0;

        while (stack.length) {
            let value = stack.pop();
            if (typeof value === 'boolean') {
                bytes += 4;
            } else if (typeof value === 'string') {
                bytes += value.length * 2;
            } else if (typeof value === 'number') {
                bytes += 8;
            } else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
                objectList.push(value);
                // if the object is not an array, add the sizes of the keys
                if (Object.prototype.toString.call(value) != '[object Array]') {
                    for (let key in value) bytes += 2 * key.length;
                }
                for (let key in value) stack.push(value[key]);
            }
        }
        if (unit) {
            if (bytes < 1024) return bytes + "B";
            else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + "K";
            else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + "M";
            else return (bytes / 1073741824).toFixed(3) + "G";
        } else {
            return bytes;
        }
    }
}

export const U = Util.Instance;
