//ui页面
function buideUI(obj) {
    var win = (obj instanceof Panel) ? obj : /*    ?   判断obj是否属于Panel面板，   :    否则创建一个新的面板*/new Window("palette", "摸鱼 box", [0, 0, 165, 151], { resizeable: true, });
    edittext_1 = win.add("edittext", [105, 42, 155, 72], "5", { readonly: false, noecho: 0, borderless: 0, multiline: 0, enterKeySignalsOnChange: 0 });
    check_1 = win.add("checkbox", [5, 50, 125, 80], "动画循环");
    check_1.value = 0;
    but_1 = win.add("button", [5, 5, 155, 35], "创建对应层");
    but_2 = win.add("button", [5, 77, 155, 107], "对齐画面");
    but_3 = win.add("button", [5, 113, 155, 143], "创建动画");
    return win;
}
var windows = buideUI(this);
//ui页面的执行
if (windows instanceof Window) {//判断是否属于ScriptUI Panels下的类型的面板？
    windows.center();//居中
    windows.show();//显示
}

//是否选中层
var mycomp;//
mycomp = app.project.activeItem;//选择的对象
function selLayer() {     /*定义一个xxx()的函数*/
    if (!(mycomp instanceof CompItem)) {
        alert("没有选中合成");//弹出提示消息
        return false;//返回结果 
    } else if (app.project.activeItem.selectedLayers/*这是一个数组，里面可能有很多不同的数据类型*/.length < 1)/*判断是否选中层*/ {
        alert("没有选中层");//弹出提示消息
        return false;//返回结果 
    } else {
        return true;//返回结果 
    }
}

function searchLayer(layer) {//寻找选中层的itemindex
    var itemNum = app.project.numItems;
    for (searchLayerIndex = 1; searchLayerIndex <= itemNum; searchLayerIndex++) {
        if (layer.source.name === app.project.item(searchLayerIndex).name) {
            if (app.project.item(searchLayerIndex).width === layer.width && app.project.item(searchLayerIndex).height === layer.height) {//通过判断层的长宽是相等来确定是不是同一个层
                return searchLayerIndex;
            }
        }
    }
    return false;
}


//创建相应的固态层
but_1.onClick = function () {
    if (selLayer() == true) {
        app.beginUndoGroup("创建相应的固态层");//把下面的操作收纳成一步操作，让你能在ae里一步撤回
        var Lw, Lh, Lpix, Ldur, Lname;
        var myLayer = mycomp.selectedLayers[0];
        Lw = myLayer.width;//获取所选层的宽度
        Lh = myLayer.height;//获取所选层的高度
        Lpix = mycomp.pixelAspect;//获取合成的像素比
        Ldur = myLayer.duration;//获取所选层的时间长度
        Lname = myLayer.name;//获取所选层的名字
        Lname = "路径动画" + " - " + Lname;//给他改个名字
        var offestTime = 10;//设置一个偏移层的时间，
        searchLayer(myLayer);
        var index1 = searchLayerIndex;
        if (app.project.item(index1).numLayers >= 1) {
            myLayer.timeRemapEnabled = 1;//打开时间重映射
            myLayer.timeRemap.removeKey(2);//删除时间重映射的第二个关键帧
            myLayer.startTime -= offestTime * mycomp.frameDuration;//层开始的时间往前偏移多少帧，
            myLayer.outPoint += offestTime * mycomp.frameDuration;//层结尾的时间往后偏移多少帧，
        } else {
            myLayer.startTime -= offestTime * mycomp.frameDuration;//层开始的时间往前偏移多少帧，
            myLayer.outPoint += offestTime * mycomp.frameDuration;//层结尾的时间往后偏移多少帧，
        }
        var flex = myLayer.effect.addProperty('ReelSmart Morph2');//添加flex Morph插件\
        flex(4).setValueAtTime((0 - 1) * mycomp.frameDuration, 1);//添加关键帧
        flex(4).setValueAtTime((1 - 1) * mycomp.frameDuration, 0);//添加关键帧
        var mysolid = app.project.activeItem.layers.addSolid([1, 1, 1], Lname, Lw, Lh, Lpix, [Ldur]);//创建一个固态层
        mysolid.moveBefore(myLayer);//移动到这个图层上面
        mysolid.opacity.setValue(0);//不透明度打为0
        mysolid.position.setValue(myLayer.position.value);//对齐选中层位置
        mysolid.scale.setValue(myLayer.scale.value);//对齐选中层缩放
        app.endUndoGroup();
    }
}

//对齐画面
but_2.onClick = function () {
    if (selLayer() == true) {
        var myLayer = mycomp.selectedLayers[0];
        app.beginUndoGroup("对齐画面");//把下面的操作收纳成一步操作，让你能在ae里一步撤回
        var newNullStart = mycomp.layers.addNull(); //创建一个开始的空对象
        newNullStart.name = "startPoint";
        newNullStart.shy = 1;
        newNullStart.effect.addProperty('ADBE Slider Control')('ADBE Slider Control-0001');
        newNullStart.position.expression =
            "var pathLayer = thisComp.layer(\"" + "路径动画" + " - " + myLayer.name + "\"); \r" +
            "var progress = effect('ADBE Slider Control')('ADBE Slider Control-0001')/100; \r" +
            "var pathToTrace = pathLayer('ADBE Mask Parade')(1)('ADBE Mask Shape');\r" +
            "pathLayer.toComp(pathToTrace.pointOnPath(progress));";
        newNullStart.position.setValue(newNullStart.position.value);
        newNullStart.moveBefore(myLayer);
        var newNullEnd = mycomp.layers.addNull();//创建一个结束空对象 
        newNullEnd.name = "endPoint";
        newNullEnd.shy = 1;//空对象打开消影
        newNullEnd.effect.addProperty('ADBE Slider Control')('ADBE Slider Control-0001');
        newNullEnd.position.expression =
            "var pathLayer = thisComp.layer(\"" + "路径动画" + " - " + myLayer.name + "\"); \r" +
            "var progress = effect('ADBE Slider Control')('ADBE Slider Control-0001')/100; \r" +
            "var pathToTrace = pathLayer('ADBE Mask Parade')(1)('ADBE Mask Shape');\r" +
            "pathLayer.toComp(pathToTrace.pointOnPath(progress));";
        newNullEnd.position.setValue(newNullEnd.position.value);
        newNullEnd.moveBefore(myLayer);
        app.endUndoGroup();
    }
}


//创建动画
but_3.onClick = function () {
    if (selLayer() == true) {
        app.beginUndoGroup("创建相应的动画");//把下面的操作收纳成一步操作，让你能在ae里一步撤回
        var tN = parseInt(edittext_1.text) + 1;//获取生成点数
        var maskpoint = [];//创建一个空的数组？
        var myLayer = mycomp.selectedLayers[0];
        myLayerName = mycomp.selectedLayers[0].name + "";
        var nullEnd = mycomp.layer(myLayer.index - 1);
        var end = nullEnd.effect.property('ADBE Slider Control').property('ADBE Slider Control-0001').value;//获取结束空对象的值
        end = end / 100;
        var nullStart = mycomp.layer(myLayer.index - 2);
        var start = nullStart.effect.property('ADBE Slider Control').property('ADBE Slider Control-0001').value//获取开始空对象的值
        start = start / 100;
        var ratio = ((end - start) / (tN - 2));//给关键帧创建一个比值的转换，为了方便后期的调整,虽然我觉得后期大概率不会调整，0~1就完事了
        nullEnd.remove();//删除这个空对象
        nullStart.remove();//删除这个空对象

        //创建一个新的路径
        var point = [0, 0]
        for (var i = 1; i < tN; i++) {
            maskpoint.push(point);
        }

        var mymask = mycomp.selectedLayers[0].mask.addProperty('ADBE Mask Atom');//给选中的层添加mask
        var mypath = new Shape();//定义一个新的mask
        mypath.vertices = maskpoint;//新mask的点的数量和位置--------------------
        mypath.closed = false;//新mask是否闭合
        mymask('ADBE Mask Shape').setValue(mypath);//设置成新的mask

        var nullSet = [];//创建空对象们的空组

        var slider1 = myLayer.effect.addProperty('ADBE Slider Control');//添加一个滑块用来整体控制动画速率
        slider1.name = "动画完成度？"
        slider1.property('ADBE Slider Control-0001').setValue(100);

        //alert (myLayer.mask(i).name);

        //创建空对象们
        for (var i = 0; i < maskpoint.length; i++) {
            var nullName = myLayer.name + " " + "-" + " " + myLayer.mask(1).name + " " + "-" + " " + i;
            nullSet.push(nullName);//把名字添加到空组里

            var newNull = mycomp.layers.addNull(); //创建一个新的空对象
            newNull.shy = 1;//空对象打开消影
            newNull.moveBefore(myLayer);//把空对象移动到选中层上面
            newNull.name = nullName;//给空对象一个新名字
            newNull.label = 11;//空对象的标签颜色   其实这步可以不要

            //给空对象加个滑块效果，并设置关键帧
            var ef = newNull.effect.addProperty('ADBE Slider Control')('ADBE Slider Control-0001');
            ef.setValueAtTime(0, start + (i * ratio));
            ef.setValueAtTime(1, (1 - end + start) + (i * ratio));
            ef.expression =
                "var key1 = effect('ADBE Slider Control')('ADBE Slider Control-0001').key(1).value; \r" +
                "key1 + (value-key1)*(thisComp.layer(\"" + myLayerName + "\").effect('ADBE Slider Control')('ADBE Slider Control-0001')/100)";

            // 给位置关键帧上表达式
            newNull.position.setValue(maskpoint[i]);
            newNull.position.expression =
                "var pathLayer = thisComp.layer(\"" + "路径动画" + " - " + myLayerName + "\"); \r" +
                "var progress = effect('ADBE Slider Control')('ADBE Slider Control-0001'); \r" +
                "var pathToTrace = pathLayer('ADBE Mask Parade')(1)('ADBE Mask Shape');\r" +
                "pathLayer.toComp(pathToTrace.pointOnPath(progress));";
            newNull.position.setValue(newNull.position.value);
        }

        //添加效果和表达式
        for (var n = 0; n < nullSet.length; n++) {
            var newControl = myLayer.effect.addProperty('ADBE Layer Control');
            newControl.name = nullSet[n];
            newControl.property("ADBE Layer Control-0001").setValue(mycomp.layer(nullSet[n]).index);
        }
        mymask('ADBE Mask Shape').expression =
            "var nullLayerNames = [\"" + nullSet.join("\",\"") + "\"]; \r" +
            "var origPath = thisProperty; \r" +
            "var origPoints = origPath.points(); \r" +
            "var origInTang = origPath.inTangents(); \r" +
            "var origOutTang = origPath.outTangents(); \r" +
            "var getNullLayers = []; \r" +
            "for (var i = 0, il = nullLayerNames.length; i < il; i++){ \r" +
            "    try{  \r" +
            "        getNullLayers.push(effect(nullLayerNames[i])(\"ADBE Layer Control-0001\")); \r" +
            "    } catch(err) { \r" +
            "        getNullLayers.push(null); \r" +
            "    }} \r" +
            "for (var i = 0, il = getNullLayers.length; i < il; i++){ \r" +
            "    if (getNullLayers[i] != null && getNullLayers[i].index != thisLayer.index){ \r" +
            "        origPoints[i] = fromCompToSurface(getNullLayers[i].toComp(getNullLayers[i].anchorPoint));  \r" +
            "    }} \r" +
            "createPath(origPoints,origInTang,origOutTang,origPath.isClosed());";
        app.endUndoGroup();
    }
}