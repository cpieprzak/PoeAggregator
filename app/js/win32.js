const keycode = require('keycode');
const ffi = require('ffi-napi');
const ref = require('ref-napi');
const os = require('os');
const import_Struct = require('ref-struct-di');
const {promisify} = require('util');

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
    FindWindowExW: ["uint64", ["int", "int", lpctstr, lpctstr]],
    SetForegroundWindow: ["bool", ["uint64"]]
});

const sendInput = promisify(user32.SendInput.async);
const findWindowExW = promisify(user32.FindWindowExW.async);
const setForegroundWindow = promisify(user32.SetForegroundWindow.async);

const extendedKeyPrefix = 0xe000;
const INPUT_KEYBOARD = 1;
const KEYEVENTF_EXTENDEDKEY = 0x0001;
const KEYEVENTF_KEYUP = 0x0002;
const KEYEVENTF_UNICODE = 0x0004;
const KEYEVENTF_SCANCODE = 0x0008;
const VK_CONTROL = 0x11;
const VK_ALT = 0x12;
const VK_SHIFT = 0x10;
const VK_RETURN = 0x0D;

var virtualKeys = [];
virtualKeys.push(VK_CONTROL);
virtualKeys.push(VK_ALT);
virtualKeys.push(VK_SHIFT);
virtualKeys.push(VK_RETURN);

function KeyToggle_Options() {
    this.asScanCode = true;
    this.keyCodeIsScanCode = false;
    this.flags = null;
}

let entry = new Input();
entry.type = INPUT_KEYBOARD;
entry.time = 0;
entry.dwExtraInfo = 0;

function keyToggle(keyCode, type, options) {
    
    if(virtualKeys.includes(keyCode))
    {
        options = {};
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
    
    return sendInput(1, entry, arch === "x64" ? 40 : 28);

}

async function keyTap(keyCode, opt) {
    await keyToggle(keyCode, "down", opt);
    await keyToggle(keyCode, "up", opt);
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

async function setForegroundWindowToPoe()
{    
    var isSuccessful = false;
    var handle = await findWindowExW(0, 0, null, convertStringToBuffer('Path of Exile'));
    if(handle > 0)
    {
        isSuccessful = await setForegroundWindow(handle);
        if(!isSuccessful)
        {
            await focusAggregator();
            isSuccessful = await setForegroundWindow(handle);
        }
    }

    return isSuccessful;
}

async function sendClipboardTextToPoe() 
{
    if(await setForegroundWindowToPoe())
    {
        setTimeout(async ()=>{
            await keyTap(VK_RETURN);
            await keyToggle(VK_CONTROL, "down");
            await keyTap(keycode.codes.v);
            await keyToggle(VK_CONTROL, "up");
            await keyTap(VK_RETURN);
        },25);
    }
}

async function focusAggregator()
{
    // CommandOrControl+Alt+Shift+L
    
    await keyToggle(VK_CONTROL, "down");
    await keyToggle(VK_ALT, "down");
    await keyToggle(VK_SHIFT, "down");
    await keyTap(keycode.codes.l);
    await keyToggle(VK_SHIFT, "up");
    await keyToggle(VK_ALT, "up");
    await keyToggle(VK_CONTROL, "up");
}