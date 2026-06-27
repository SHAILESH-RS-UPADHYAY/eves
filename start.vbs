Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
projectDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Launch EVES in dev mode — completely hidden, no terminal window
' Parameter 0 = hide window, False = don't wait for it to finish
WshShell.Run "cmd /c cd /d """ & projectDir & """ && npx electron-vite dev", 0, False
