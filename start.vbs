Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
projectDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Launch the animated button launcher
WshShell.Run "mshta """ & projectDir & "\start.hta""", 1, True
