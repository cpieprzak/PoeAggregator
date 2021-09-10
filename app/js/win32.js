const keycode = require('keycode');
const ffi = require('ffi-napi');
const ref = require('ref-napi');
const os = require('os');
const import_Struct = require('ref-struct-di');

var arch = os.arch();
const Struct = import_Struct(ref);

function convertStringToBuffer(string) {
    string += '\0';
    return Buffer.from(string, 'ucs2');
}

var Input = Struct({
    "type": "int",
    // For some reason, the wScan value is only recognized as the wScan value when we add this filler slot.
    // It might be because it's expecting the values after this to be inside a "wrapper" substructure, as seen here:
    //     https://msdn.microsoft.com/en-us/library/windows/desktop/ms646270(v=vs.85).aspx
    "???": "int",
    "wVK": "short",
    "wScan": "short",
    "dwFlags": "int",
    "time": "int",
    "dwExtraInfo": "int64"
});

var lpctstr = ref.refType(ref.types.CString);

var user32 = ffi.Library("user32", {
    SendInput: ["int", ["int", Input, "int"]],
    FindWindowExW: ["int", ["int", "int", lpctstr, lpctstr]],
    SetForegroundWindow: ["int", ["int"]]
});

const extendedKeyPrefix = 0xe000;
const INPUT_KEYBOARD = 1;
const KEYEVENTF_EXTENDEDKEY = 0x0001;
const KEYEVENTF_KEYUP = 0x0002;
const KEYEVENTF_UNICODE = 0x0004;
const KEYEVENTF_SCANCODE = 0x0008;
const VK_CONTROL = 0x11;
const VK_RETURN = 0x0D;

var virtualKeys = [];
virtualKeys.push(VK_CONTROL);
virtualKeys.push(VK_RETURN);

function KeyToggle_Options() {
    this.asScanCode = true;
    this.keyCodeIsScanCode = false;
    this.flags = null;
    this.async = false; // async can reduce stutter in your app, if frequently sending key-events
}

let entry = new Input();
entry.type = INPUT_KEYBOARD;
entry.time = 0;
entry.dwExtraInfo = 0;

function KeyToggle(keyCode, type, options) {
    if(virtualKeys.includes(keyCode))
    {
        options = new Object();
        options.keyCodeIsScanCode = true;
        options.asScanCode = false;
    }

    const opt = Object.assign({}, new KeyToggle_Options(), options);

    // scan-code approach (default)
    if (opt.asScanCode) {
        let scanCode = opt.keyCodeIsScanCode ? keyCode : ConvertKeyCodeToScanCode(keyCode);
        let isExtendedKey = (scanCode & extendedKeyPrefix) == extendedKeyPrefix;

        entry.dwFlags = KEYEVENTF_SCANCODE;
        if (isExtendedKey) {
            entry.dwFlags |= KEYEVENTF_EXTENDEDKEY;
        }

        entry.wVK = 0;
        entry.wScan = isExtendedKey ? scanCode - extendedKeyPrefix : scanCode;
    }
    // (virtual) key-code approach
    else {
        entry.dwFlags = 0;
        entry.wVK = keyCode;
        entry.wScan = 0;
    }

    if (opt.flags != null) {
        entry.dwFlags = opt.flags;
    }
    if (type == "up") {
        entry.dwFlags |= KEYEVENTF_KEYUP;
    }

    if (opt.async) {
        return new Promise((resolve, reject) => {
            user32.SendInput.async(1, entry, arch === "x64" ? 40 : 28, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }
    return user32.SendInput(1, entry, arch === "x64" ? 40 : 28);
}

function KeyTap(keyCode, opt) {
    KeyToggle(keyCode, "down", opt);
    KeyToggle(keyCode, "up", opt);
}

// Scan-code for a char equals its index in this list. List based on: https://qb64.org/wiki/Scancodes, https://www.qbasic.net/en/reference/general/scan-codes.htm
// Not all keys are in this list, of course. You can add a custom mapping for other keys to the function below it, as needed.
let keys = "**1234567890-=**qwertyuiop[]**asdfghjkl;'`*\\zxcvbnm,./".split("");

function ConvertKeyCodeToScanCode(keyCode) {
    let keyChar = String.fromCharCode(keyCode).toLowerCase();
    let result = keys.indexOf(keyChar);
    console.assert(result != -1, `Could not find scan-code for key ${keyCode} (${keycode.names[keyCode]}).`)
    return result;
}

copyTextToClipboard(' ');
setTimeout(()=>{
    sendCopyPasteToPoe();
},1000);

var poeWinHandle = 0;
function getPoeWindowsHandle()
{
    if(poeWinHandle == 0)
    {
        poeWinHandle = user32.FindWindowExW(0, 0, null, convertStringToBuffer('Path of Exile'));
        if(poeWinHandle > 0)
        {
            KeyTap(VK_CONTROL);
        }
    }
    return poeWinHandle;
}

function setForegroundWindowToPoe()
{
    var success = false;
    var handle = getPoeWindowsHandle();
    if(handle && handle > 0)
    {
        if(user32.SetForegroundWindow(handle) > 0)
        {
            success = true;
        }
        else
        {
            poeWinHandle = 0;
        }
    }

    return success;
}

function sendCopyPasteToPoe() 
{
    if(setForegroundWindowToPoe())
    {
        setTimeout(()=>{
            KeyTap(VK_RETURN);
            KeyToggle(VK_CONTROL, "down");
            KeyTap(keycode.codes.v);
            KeyToggle(VK_CONTROL, "up");
            KeyTap(VK_RETURN);
        },25);
    }
}