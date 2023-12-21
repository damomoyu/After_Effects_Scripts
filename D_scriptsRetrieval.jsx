var scriptsLocation = '\\\\Nas2wei_01\\总传输暂放\\墨鱼\\脚本\\AE脚本';
var ae_Script_Location = '';

//不同版本AE的路径
var ae_2018_scripts_Location = 'C:\\Program Files\\Adobe\\Adobe After Effects CC 2018\\Support Files\\Scripts';
var ae_2020_scripts_Location = 'C:\\Program Files\\Adobe\\Adobe After Effects 2020\\Support Files\\Scripts';
var ae_2022_scripts_Location = 'C:\\Program Files\\Adobe\\Adobe After Effects 2022\\Support Files\\Scripts';
if (app.version.slice(0, 2) === '15') {
    ae_Script_Location = ae_2018_scripts_Location;
} else if (app.version.slice(0, 2) === '17') {
    ae_Script_Location = ae_2020_scripts_Location;
} else if (app.version.slice(0, 2) === '22') {
    ae_Script_Location = ae_2022_scripts_Location;
}

var ae_Script_Panels_Location = ae_Script_Location + '\\ScriptUI Panels';
var ae_Script_Startup_Location = ae_Script_Location + '\\Startup';
var script_Folder = new Folder([scriptsLocation]);
var script_Folder_NameArray = script_Folder.getFiles();

for (i = 0; i < script_Folder_NameArray.length; i++) {
    var scriptFolderName = File.decode(script_Folder_NameArray[i]);
    var scriptName = scriptFolderName.slice(scriptFolderName.lastIndexOf('/') + 1, scriptFolderName.length);
    var script = new File([scriptsLocation + '\\' + scriptName + '\\' + scriptName + '.jsx']);
    script.copy(ae_Script_Panels_Location + '\\D_' + scriptName + '.jsx');
}
//保存一个全局变量
var scriptData = '';
scriptData += 'var scriptsLocation = ' + "'" + File.encode(scriptsLocation) + "';";
var thisFile = File(ae_Script_Startup_Location + "/" + "D_scriptData.jsx");
if (!thisFile.exists) {
    thisFile.open("w");
    thisFile = new File(ae_Script_Startup_Location + "/" + "D_scriptData.jsx");
    thisFile.write(scriptData);
    thisFile.close();
} else {
    thisFile.open("w");
    thisFile.write(scriptData);
    thisFile.close();
}

