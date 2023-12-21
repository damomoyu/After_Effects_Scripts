

/*

var selectedComp = app.project.activeItem;
var selectedLayer = app.project.activeItem.selectedLayers;

//alert(selectedLayer[0].name)

//app.executeCommand(18);//剪切
app.executeCommand(19);//复制
app.executeCommand(20);//粘贴
//app.executeCommand(21);//删除
selectedLayer[0].name=1111;
selectedLayer[1].name=2222;
selectedLayer[2].name=3333;
app.executeCommand(16);//撤回


*/

//alert(app.project.numItems);
app.beginUndoGroup("重置木偶网格");//把下面的操作收纳成一步操作，让你能在ae里一步撤回

for (var i = 1; i <= app.project.numItems; i++) {//prj中有多少东西
    //alert(app.project.item(i).name)
    if (app.project.item(i) instanceof CompItem) {//prj中哪些是合成
        //alert(app.project.item(i).numLayers)
        for (var j = 1; j <= app.project.item(i).numLayers; j++) {
            //alert(app.project.item(i).layer(j).name);
            if (app.project.item(i).layer(j).property('ADBE Camera Options Group') === null) {//这个层是不是摄像机？
                if (app.project.item(i).layer(j).property('ADBE Light Options Group') === null) {//这个层是不是灯光层？
                    if (!(app.project.item(i).layer(j).effect('ADBE FreePin3') === null)) { //层上有没有木偶插件？
                        //alert(app.project.item(i).layer(j).effect('ADBE FreePin3').arap.mesh(1).deform.numProperties)
                        //alert(app.project.item(i).layer(j).effect('ADBE FreePin3').arap.mesh(1).deform(1).name)
                        //alert(app.project.item(i).layer(j).effect('ADBE FreePin3').arap.mesh(1).name);
                        //app.project.item(i).layer(j).effect('ADBE FreePin3').arap.mesh(1).remove()
                        for (var k = 1; k <= app.project.item(i).layer(j).effect('ADBE FreePin3').arap.mesh(1).deform.numProperties; k++) {
                            app.project.item(i).layer(j).effect('ADBE FreePin3').arap.mesh(1).deform(k).remove()
                            app.executeCommand(16);//撤回
                        }
                        //app.executeCommand(18);//剪切
                        //app.executeCommand(16);//撤回
                    }
                }
            }
        }
    }
}

app.endUndoGroup();


