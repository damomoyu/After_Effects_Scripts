app.beginUndoGroup("删除所有未启用的fx");//把下面的操作收纳成一步操作，让你能在ae里一步撤回

for (var i = 1; i <= app.project.numItems; i++) {//prj中有多少东西
    //alert(app.project.item(i).name)
    if (app.project.item(i) instanceof CompItem) {//prj中哪些是合成
        //alert(app.project.item(i).numLayers)
        for (var j = 1; j <= app.project.item(i).numLayers; j++) {
            //alert(app.project.item(i).layer(j).name);
            if (app.project.item(i).layer(j).property('ADBE Camera Options Group') === null) {//这个层是不是摄像机？
                if (app.project.item(i).layer(j).property('ADBE Light Options Group') === null) {//这个层是不是灯光层？
                    if (!(app.project.item(i).layer(j).effect.numProperties === 0)) { //哪些层上有插件？
                        for (var l = app.project.item(i).layer(j).effect.numProperties; 1 <= l; l--) {//有多少个插件？
                            if (app.project.item(i).layer(j).effect(l).enabled === false) {
                                app.project.item(i).layer(j).effect(l).remove();
                            }
                        }
                    }
                }
            }
        }
    }
}

app.endUndoGroup();





























