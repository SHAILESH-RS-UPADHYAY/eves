Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
launchDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Run EVES directly into the Dashboard without showing terminal window
WshShell.Run "cmd /c node """ & launchDir & "\runner.js"" --dashboard", 0, False
