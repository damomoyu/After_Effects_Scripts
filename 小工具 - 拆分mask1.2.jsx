function buideUI(obj) {
    var win = (obj instanceof Panel) ? obj : new Window("palette", "拆分mask", [0, 0, 265, 75], { resizeable: true, });

    panel = win.add("panel",[10,10,255,65]);
    var helpBut = win.add("StaticText",[220,55,265,75]);
    helpBut.text = "HELP";
    helpFolder = new Folder([File.decode(scriptsLocation) + '\\拆分mask\\使用示例']);
    helpBut.addEventListener('click', function () {
        helpFolder.execute();//弹出文件夹
    });

    but_1 = panel.add("button", [5, 5, 235, 45], "拆分");
    return win;
}
var windows = buideUI(this);
if (windows instanceof Window) {//判断是否属于ScriptUI Panels下的类型的面板？
    windows.center();//居中
    windows.show();//显示
}

//是否选中层
function selLayer() {     /*定义一个xxx()的函数*/
    var myComp = app.project.activeItem;
    if (!(myComp instanceof CompItem)) {
        alert("没有选中合成");//弹出提示消息
        return false;//返回结果 
    } else if (myComp.selectedLayers.length < 1)/*判断是否选中层*/ {
        alert("没有选中层");//弹出提示消息
        return false;//返回结果 
    } else {
        return true;//返回结果 
    }
}

but_1.onClick = function () {
    if (selLayer() === true) {
        app.beginUndoGroup("按mask数量生成层");
        var myLayer = app.project.activeItem.selectedLayers[0];
        var maskNum = myLayer.mask.numProperties;
        var maskNumArray = [];
        for (var i = 1; i <= maskNum; i++) {//先储存一下mask的数量
            maskNumArray.push(i);
        }
        for (var i = 1; i <= maskNum; i++) {
            //复制出新的层并删掉层上的mask
            var myLayerCopy = myLayer.duplicate();
            var mlOld = myLayerCopy;
            myLayerCopy.name = myLayerCopy.name + "_" + i;
            var maskNumArrayData = [];
            maskNumArrayData.push.apply(maskNumArrayData, maskNumArray);
            maskNumArrayData.splice(i - 1, 1);
            for (var ii = maskNumArrayData.length; ii > 0; ii--) {
                myLayerCopy.property('ADBE Mask Parade').property(maskNumArrayData[ii - 1]).remove();
            }
            //myLayerCopy.property('ADBE Mask Parade').property(1).maskMode = MaskMode.ADD;//蒙版模式改成相加
            
            //mask坐标轴居中
            var maskShape = myLayerCopy.property('ADBE Mask Parade').property(1).property('ADBE Mask Shape');
            var maskX = [];
            var maskY = [];
            for (var iii = 0; iii < maskShape.value.vertices.length; iii++) {
                maskX.push(maskShape.value.vertices[iii][0]);
                maskY.push(maskShape.value.vertices[iii][1]);
                maskX.push(maskShape.value.vertices[iii][0] + maskShape.value.inTangents[iii][0]);
                maskY.push(maskShape.value.vertices[iii][1] + maskShape.value.inTangents[iii][1]);
                maskX.push(maskShape.value.vertices[iii][0] + maskShape.value.outTangents[iii][0]);
                maskY.push(maskShape.value.vertices[iii][1] + maskShape.value.outTangents[iii][1]);
            }
            maskX.sort(function (a, b) { return a - b });
            maskY.sort(function (a, b) { return a - b });
            var maskShapeBoundingAnchorPoint = [(maskX[0] + maskX[maskX.length - 1]) / 2, (maskY[0] + maskY[maskY.length - 1]) / 2, 0];
            var myLayerCopyPositionRawData = myLayerCopy.position.value;
            var myLayer_Copy_Source_AnchorPoint_Data = [myLayerCopy.anchorPoint.value[0], myLayerCopy.anchorPoint.value[1]];
            myLayerCopy.anchorPoint.setValue(maskShapeBoundingAnchorPoint);//设置一个新的锚点
            myLayerCopy.position.setValue(myLayerCopyPositionRawData - (myLayer_Copy_Source_AnchorPoint_Data - maskShapeBoundingAnchorPoint));//选中层的位置移动到合成中心
        
            //新层的旋转问题
            var mlOld = myLayer;//记录层的旋转数值
            if (myLayerCopy.threeDLayer === true) {     //将旋转归零
                myLayerCopy.orientation.setValue([0, 0, 0]);
                myLayerCopy.rotationX.setValue(0);
                myLayerCopy.rotationY.setValue(0);
            };
            myLayerCopy.rotationZ.setValue(0);
            myLayerCopy.scale.setValue([100, 100, 100]);
        
            //按指定层旋转和缩放
            function centerRotation(myLayer, mlOld) {//myLayer是需要旋转的层（object layer），mlOld是指定的层（object layer
                var myComp = app.project.activeItem;
                var newNull = myComp.layers.addNull(); //创建一个新的空对象
                var myLayerParent = myLayer.parent;//记录输入层的父级关系
                myLayer.parent = null;//取消输入层的父级关系
                newNull.moveBefore(myLayer);
                newNull.threeDLayer = mlOld.threeDLayer;
                newNull.position.setValue(mlOld.position.value);
                myLayer.parent = newNull;//父级连给空对象
                if (newNull.threeDLayer === true) {
                    newNull.orientation.setValue(mlOld.orientation.value);
                    newNull.rotationX.setValue(mlOld.rotationX.value);
                    newNull.rotationY.setValue(mlOld.rotationY.value);
                };
                newNull.rotationZ.setValue(mlOld.rotationZ.value);
                newNull.scale.setValue(mlOld.scale.value);
                myLayer.parent = myLayerParent;//父级连给原来的
                //删除空对象
                var newNullSourcename = newNull.source.name;
                function searchLayer(string) {//寻找项目中有没有名字为string的AVLayer,并输出他的在项目中的index
                    var itemNum = app.project.numItems;
                    for (searchLayerIndex = 1; searchLayerIndex <= itemNum; searchLayerIndex++) {
                        if (app.project.item(searchLayerIndex).name === string) {
                            return searchLayerIndex;
                        };
                    };
                };
                searchLayer(newNullSourcename);
                newNull.remove();//从当前合成中删除空对象
                app.project.item(searchLayerIndex).remove();//从当前项目中删除空对象
                return myLayer;
            }
        
            centerRotation(myLayerCopy, mlOld);
    
            
        }
        myLayer.enabled = false;//关掉这个层的眼睛
        myLayer.guideLayer = true;//打开参考线图层
        app.endUndoGroup();
    };
}
