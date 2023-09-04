function buideUI(obj) {
    var win = (obj instanceof Panel) ? obj : new Window("palette", "根据蒙版生成裁剪后的合成", [0, 0, 265, 110], { resizeable: true, });

    panel = win.add("panel", [10, 10, 255, 100]);
    var helpBut = win.add("StaticText", [220, 90, 265, 110]);
    helpBut.text = 'HELP';
    helpFolder = new Folder([File.decode(scriptsLocation) + '\\根据mask创建合成\\使用示例']);
    helpBut.addEventListener('click', function () {
        helpFolder.execute();//弹出文件夹
    });

    but_1 = panel.add("button", [5, 40, 235, 80], "生成");
    edittext_1 = panel.add("edittext", [5, 5, 155, 35], " - 裁剪", { readonly: 0, noecho: 0, borderless: 0, multiline: 0, enterKeySignalsOnChange: 0 });
    check_1 = panel.add("checkbox", [160, 12, 240, 32], "保留副本");
    check_1.value = 0;
    return win;
}
var windows = buideUI(this);
if (windows instanceof Window) {//判断是否属于ScriptUI Panels下的类型的面板？
    windows.center();//居中
    windows.show();//显示
}

//是否选中层
function selLayer() {     /*定义一个xxx()的函数*/
    var mycomp = app.project.activeItem;
    if (!(mycomp instanceof CompItem)) {
        alert("没有选中合成");//弹出提示消息
        return false;//返回结果 
    } else if (mycomp.selectedLayers.length < 1)/*判断是否选中层*/ {
        alert("没有选中层");//弹出提示消息
        return false;//返回结果 
    } else {
        return true;//返回结果 
    }
}

//层上是否有mask
function selLayerMask() {
    var ml = app.project.activeItem.selectedLayers[0];
    if (ml.mask.numProperties < 1) {
        alert("选中层上没有蒙版");
        return false;
    } else {
        return true;
    }
}

//mask浮点转整数
function maskFloatToInt(maskArray) {//maskArray是数组
    for (var i = 0; i < maskArray.length; i++) {
        if (maskArray[i] instanceof Array == true) {
            for (var ii = 0; ii < maskArray[i].length; ii++) {
                maskArray[i][ii] = Math.round(maskArray[i][ii]);
            }
        } else {
            maskArray[i] = Math.round(maskArray[i]);
        }
    }
    return maskArray;
}

//判断mask是否是个矩形
function rectangleMask(maskShape) {
    var maskShapeArray = maskShape.value.vertices;
    maskFloatToInt(maskShapeArray);
    if (maskShapeArray.length === 4) {
        var maskShapeInTangentsArray = maskShape.value.inTangents;
        var maskShapeOutTangentsArray = maskShape.value.outTangents;
        if (maskShapeArray[0][0] === maskShapeArray[3][0]) {
            if (maskShapeArray[0][1] === maskShapeArray[1][1]) {
                if (maskShapeArray[1][0] === maskShapeArray[2][0]) {
                    if (maskShapeArray[2][1] === maskShapeArray[3][1]) {
                        var maskShapePointData = [];
                        for (var maskShapeArrayLength = 0; maskShapeArrayLength < maskShapeArray.length; maskShapeArrayLength++) {
                            maskShapePointData.push(maskShapeInTangentsArray[maskShapeArrayLength][0]);
                            maskShapePointData.push(maskShapeInTangentsArray[maskShapeArrayLength][1]);
                            maskShapePointData.push(maskShapeOutTangentsArray[maskShapeArrayLength][0]);
                            maskShapePointData.push(maskShapeOutTangentsArray[maskShapeArrayLength][1]);
                        };
                        maskShapePointData.sort(function (a, b) { return a - b });//从小到大排列
                        if (maskShapePointData[0] === maskShapePointData[maskShapePointData.length - 1]) {//判断最小值和最大值是否相等
                            return true;
                        } else {
                            return false;
                        };
                    };
                };
            };
        };
    } else {
        return false;
    }
}

//按指定层缩放和Z轴位置的调整
function centerScale(myLayer, mlOld) {//myLayer是选中层（object layer），scale是缩放的数组（Array）
    var mycomp = app.project.activeItem;
    var newNull = mycomp.layers.addNull(); //创建一个新的空对象
    var myLayerParent = myLayer.parent;//记录输入层的父级关系
    myLayer.parent = null;//取消输入层的父级关系
    newNull.moveBefore(myLayer);
    newNull.threeDLayer = mlOld.threeDLayer;//
    newNull.position.setValue([mlOld.position.value[0], mlOld.position.value[1], 0]);
    myLayer.parent = newNull;//父级连给空对象
    newNull.position.setValue(mlOld.position.value);
    newNull.scale.setValue(mlOld.scale.value);
    myLayer.parent = myLayerParent;//父级连给原来的
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

//按指定层旋转
function centerRotation(myLayer, mlOld) {//myLayer是需要旋转的层（object layer），mlOld是指定的层（object layer
    var mycomp = app.project.activeItem;
    var newNull = mycomp.layers.addNull(); //创建一个新的空对象
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
    myLayer.parent = myLayerParent;//父级连给原来的
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

//获取当前合成中选中层的子级，返回一个数组，里面是该层子集的index
function layersChild(obj, array) {
    var mycomp = app.project.activeItem;
    for (var i = 1; i <= mycomp.numLayers; i++) {
        if (mycomp.layer(i).parent === obj) {
            array.push(i)
        };
    };
    return array;
}

but_1.onClick = function () {
    app.beginUndoGroup("根据蒙版生成裁剪后的合成");
    var mycomp = app.project.activeItem;
    var ml = app.project.activeItem.selectedLayers[0];//选中层
    var ml_Label_Color = ml.label;//选中层颜色
    var ml_Parent_obj = ml.parent;//记录选中层的父级
    var ml_Child_Index = [];//取消子级的
    layersChild(ml, ml_Child_Index);
    for (var i = 0; i < ml_Child_Index.length; i++) {
        mycomp.layer(ml_Child_Index[i]).parent = null;
    }
    ml.parent = null;
    if (selLayer() == true) {
        if (selLayerMask() == true) {
            var mlOld = ml;
            var endMask = ml.mask.numProperties;//最后一个mask的index
            if (rectangleMask(ml.mask(endMask)('ADBE Mask Shape')) === true) {//判断蒙版是不是一个矩形，若果是不是矩形的话就创建一个新的mask
                //alert('用旧的mask')
                var newMaskShape = ml.mask(endMask)('ADBE Mask Shape');
                var newMaskShapeX = [];
                var newMaskShapeY = [];
                for (var iii = 0; iii < newMaskShape.value.vertices.length; iii++) {
                    newMaskShapeX.push(newMaskShape.value.vertices[iii][0]);
                    newMaskShapeY.push(newMaskShape.value.vertices[iii][1]);
                }
                for (var newMaskShapeXLength = 0; newMaskShapeXLength < newMaskShapeX.length; newMaskShapeXLength++) {//浮点转整数
                    newMaskShapeX[newMaskShapeXLength] = Math.round(newMaskShapeX[newMaskShapeXLength]);
                    newMaskShapeY[newMaskShapeXLength] = Math.round(newMaskShapeY[newMaskShapeXLength]);
                }
                newMaskShapeX.sort(function (a, b) { return a - b });
                newMaskShapeY.sort(function (a, b) { return a - b });
                var oldMaskShapeBoundingArray = [newMaskShapeX[0], newMaskShapeX[newMaskShapeX.length - 1], newMaskShapeY[0], newMaskShapeY[newMaskShapeY.length - 1]];//确定创建矩形的大小
                var maskPoint = ml.mask(endMask)('ADBE Mask Shape').value.vertices;
                ml.useNewMask = false;
            } else {
                var newMaskShape = ml.mask(endMask)('ADBE Mask Shape');
                var newMaskShapeX = [];
                var newMaskShapeY = [];
                for (var iii = 0; iii < newMaskShape.value.vertices.length; iii++) {
                    newMaskShapeX.push(newMaskShape.value.vertices[iii][0]);
                    newMaskShapeY.push(newMaskShape.value.vertices[iii][1]);
                    newMaskShapeX.push(newMaskShape.value.vertices[iii][0] + newMaskShape.value.inTangents[iii][0]);
                    newMaskShapeY.push(newMaskShape.value.vertices[iii][1] + newMaskShape.value.inTangents[iii][1]);
                    newMaskShapeX.push(newMaskShape.value.vertices[iii][0] + newMaskShape.value.outTangents[iii][0]);
                    newMaskShapeY.push(newMaskShape.value.vertices[iii][1] + newMaskShape.value.outTangents[iii][1]);
                }
                for (var newMaskShapeXLength = 0; newMaskShapeXLength < newMaskShapeX.length; newMaskShapeXLength++) {//浮点转整数
                    newMaskShapeX[newMaskShapeXLength] = Math.round(newMaskShapeX[newMaskShapeXLength]);
                    newMaskShapeY[newMaskShapeXLength] = Math.round(newMaskShapeY[newMaskShapeXLength]);
                }
                newMaskShapeX.sort(function (a, b) { return a - b });
                newMaskShapeY.sort(function (a, b) { return a - b });
                var newMaskShapeBoundingArray = [newMaskShapeX[0], newMaskShapeX[newMaskShapeX.length - 1], newMaskShapeY[0], newMaskShapeY[newMaskShapeY.length - 1]];//确定创建矩形的大小
                var newMask = ml.mask.addProperty('ADBE Mask Atom');
                var newMaskPath = new Shape();
                newMaskPath.vertices = [
                    [newMaskShapeBoundingArray[1], newMaskShapeBoundingArray[2]],//右上角的点
                    [newMaskShapeBoundingArray[0], newMaskShapeBoundingArray[2]],//左上角的点
                    [newMaskShapeBoundingArray[0], newMaskShapeBoundingArray[3]],//左下角的点
                    [newMaskShapeBoundingArray[1], newMaskShapeBoundingArray[3]]//右下角的点
                ];
                newMask('ADBE Mask Shape').setValue(newMaskPath);
                var maskPoint = ml.mask(endMask + 1)('ADBE Mask Shape').value.vertices;
                ml.useNewMask = true;
            }
            maskFloatToInt(maskPoint);
            var newLayer = ml.duplicate();//复制一个新的层;
            if (ml.useNewMask === false) {
                newLayer.mask(endMask).remove();//删除层上的蒙版
            } else {
                newLayer.mask(endMask + 1).remove();//删除层上的蒙版
            }
            var newLayerNewName = newLayer.name + edittext_1.text;//重新命名
            var precomposeIndex = newLayer.index;
            var newComp = mycomp.layers.precompose([precomposeIndex], newLayerNewName, true);//将这个层预合成(ae里第二个预合成)
            newComp.width = ml.width;
            newComp.height = ml.height;

            var newCompLayerPosition = newComp.layer(1).position;//获取合成里的第一个层的位置属性
            var newCompLayerAnchorPoint = newComp.layer(1).anchorPoint;//获取合成里的第一个层的中心点属性
            newComp.layer(1).scale.setValue([100, 100]);//将合成里的层的缩放设置为100%
            var newCompL = mycomp.layer(precomposeIndex);//选中之前预合成的那个合成，并给他一个新的变量名

            //新的预合成对3d层的适配
            newCompL.threeDLayer = newComp.layer(1).threeDLayer;//3d层
            newCompL.position.setValue(newComp.layer(1).position.value);
            newCompL.scale.setValue(newComp.layer(1).scale.value);
            newCompL.opacity.setValue(newComp.layer(1).opacity.value);

            //对合成里面的层的基础属性重置
            newComp.layer(1).threeDLayer = 0;//关闭合成里的层的三维开关
            newComp.layer(1).anchorPoint.setValue([newComp.width / 2, newComp.height / 2, 0]);
            newComp.layer(1).position.setValue([newComp.width / 2, newComp.height / 2, 0]);
            newComp.layer(1).scale.setValue([100, 100]);
            newComp.layer(1).rotationZ.setValue(0);
            newComp.layer(1).opacity.setValue(100);

            //由于我后面的计算都是按合成中心去计算的,这里的得对数值进行一个转换
            var positionData = [newCompL.position.value[0], newCompL.position.value[1]];
            var positionDataConversion = [newCompL.position.value[0] + mycomp.width / 2 - newCompL.position.value[0], newCompL.position.value[1] + mycomp.height / 2 - newCompL.position.value[1], newCompL.position.value[2]];
            newCompL.position.setValue(positionDataConversion);

            var pointA = maskPoint[0];
            var pointB = maskPoint[1];
            var pointC = maskPoint[2];
            var pointD = maskPoint[3];
            newComp.width = (pointA - pointB)[0];
            newComp.height = (pointC - pointB)[1];
            if (ml.width === mycomp.width && ml.height === mycomp.height) {                                                 //选中层和合成大小一致
                var newCompLX = ((pointA[0] - pointB[0]) / 2 + pointB[0]) - (mycomp.width / 2 - positionData[0]);
                var newCompLY = ((pointA[1] - pointD[1]) / 2 + pointD[1]) - (mycomp.height / 2 - positionData[1]);
                newCompL.position.setValue([newCompLX, newCompLY]);//新合成的位置
            } else {                                                                                                       //选中层和合成大小不一致
                var newCompLX = newCompL.position.value[0] - ((newCompL.position.value[0] - newCompL.width / 2) - (ml.position.value[0] + pointB[0] - ml.width / 2));
                var newCompLY = newCompL.position.value[1] - ((newCompL.position.value[1] - newCompL.height / 2) - (ml.position.value[1] + pointB[1] - ml.height / 2));
                newCompL.position.setValue([newCompLX, newCompLY]);//新合成的位置
            }
            centerScale(newCompL, mlOld);//选中层居中缩放

            //预合成里的那个层的位置坐标
            var newCompLayerX = newComp.width / 2;
            var newCompLayerY = newComp.height / 2;
            if (ml.useNewMask === false) {
                var maskShapeBoundingArray = oldMaskShapeBoundingArray;
            } else {
                var maskShapeBoundingArray = newMaskShapeBoundingArray;
            }
            newCompLayerAnchorPoint.setValue([(maskShapeBoundingArray[0] + maskShapeBoundingArray[1]) / 2, (maskShapeBoundingArray[2] + maskShapeBoundingArray[3]) / 2]);
            newCompLayerPosition.setValue([newCompLayerX, newCompLayerY]);
            centerRotation(newCompL, mlOld);

            mycomp.layer(ml.index - 1).label = ml_Label_Color;//把新建的合成的颜色标签改成选中层的颜色标签
            mycomp.layer(ml.index - 1).parent = ml_Parent_obj;//再把父级连回去

            for (var i = 0; i < ml_Child_Index.length; i++) {
                if (ml_Child_Index[i] < ml.index) {
                    mycomp.layer(ml_Child_Index[i]).parent = mycomp.layer(ml.index - 1);
                } else {
                    mycomp.layer(ml_Child_Index[i] + 1).parent = mycomp.layer(ml.index - 1);
                }
            }


            if (ml.useNewMask === true) {
                ml.mask(endMask + 1).remove();//删除层上生成的蒙版
            };

            if (check_1.value == 0) {         //是否保留副本
                ml.remove();
            };
        }
    }
    app.endUndoGroup();
}

