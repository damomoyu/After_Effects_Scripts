var selectedComp = app.project.activeItem;
var selectedLayer = app.project.activeItem.selectedLayers;

// Fisher-Yates 洗牌算法
function fisherYates(myArray) {
    for (var i = myArray.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = myArray[i];
        myArray[i] = myArray[j];
        myArray[j] = temp;
    };
    return myArray;
};

//收集选中层的index
var selectedLayerIndexArray = []
for (var i = 0; i < selectedLayer.length; i++) {
    selectedLayerIndexArray.push(selectedLayer[i].index);
}

//确认移动到指定层的位置
var moveAfterIndex = 0;
if (selectedLayer[0].index < selectedLayer[1].index) {
    moveAfterIndex = selectedLayer[0].index - 1;
} else {
    moveAfterIndex = selectedLayer[selectedLayer.length - 1].index - 1;
};

fisherYates(selectedLayerIndexArray);//打乱调换顺序

app.beginUndoGroup("随机选中层");//把下面的操作收纳成一步操作，让你能在ae里一步撤回
for (var i = 0; i < selectedLayer.length; i++) {
    selectedComp.layer(selectedLayerIndexArray[i]).moveAfter(selectedComp.layer(moveAfterIndex));
}
app.endUndoGroup();




































