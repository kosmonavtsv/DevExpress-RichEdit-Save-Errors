var isSavingPostponed = false;
var sendCounter = 0;
var someFlag = false;
const saveTimout = 500;
var timers = [];
var defaultPendingPeriod;
var mod;

const Mods = {
    Reproduce: 1,
    ForceSync: 2,
    Fix: 3,
}

// #region Buttons
function startToReproduce() {
    startDocumentEditing(Mods.Reproduce);

    timers.push(setInterval(() => sendDocumentToServer(), saveTimout));
}

function startWithForceSync() {
    startDocumentEditing(Mods.ForceSync);

    timers.push(setInterval(() => {
        console.log('Save');
        if (isSavingPostponed) {
            console.log('Saving is already Postponed');
            return;
        }
        isSavingPostponed = true;
        // The document will be sent in End_Synchronization handler
        RichEditTest.commands.forceSyncWithServer.execute();
    }, saveTimout));
}

function startWithFix() {
    startDocumentEditing(Mods.Fix);

    timers.push(setInterval(() => safeSaveRichEditor(RichEditTest, sendDocumentToServer), saveTimout));
}

function startDocumentEditing(selectedMod) {
    mod = selectedMod;
    disableStartButtons();
    // Edit document every <saveTimout> seconds
    timers.push(setInterval(editDocument, saveTimout));
}

function stop() {
    disableStartButtons(false);
    timers.forEach(t => clearInterval(t));
    timers = [];
}

function disableStartButtons(value) {
    value = value !== false;
    document.getElementById("startWithFixBtn").disabled = value;
    document.getElementById("startWithForceSyncBtn").disabled = value;
    document.getElementById("startToReproduceBtn").disabled = value;
    document.getElementById("stopBtn").disabled = !value;
}
// #endregion

/**
 * Safe save document
 * @param { MVCxClientRichEdit } richEditor Devexpress Rich editor
 * @param {() => Promise} callback Callback must save document and return promise.
 * @returns {{Promise}}
 */
function safeSaveRichEditor(richEditor, callback) {
    console.log('SaveRichEditor');
    if (isSavingPostponed) {
        console.log('Saving is already Postponed');
        return;
    }
    isSavingPostponed = true;

    return new Promise((resolve, reject) => {
        sendDocument = function () {
            // Waiting for an empty serverDispatcher
            // isWaiting - means that serverDispatcher is waiting answer from server
            // pendingTimerID - means that DX has a pending request, that will be executed in {pendingPeriod} ms
            if (richEditor.core.serverDispatcher.isWaiting || richEditor.core.serverDispatcher.pendingTimerID) {
                console.log('skip sendDocument')
                setTimeout(() => sendDocument(), 0);
                return;
            }
            // Set pendingTimerID to prevent document synchronization
            // since it changes document from second thread and can corrupt it.
            richEditor.core.serverDispatcher.pendingTimerID = 'fake pendingTimerID';

            var promise = callback();

            var endSaving = () => {
                isSavingPostponed = false;
                richEditor.core.serverDispatcher.pendingTimerID = null;
            };

            if (!promise) {
                endSaving();
                var message = "Callback didn't return promise";
                console.error(message);
                reject(message);
                return;
            }

            promise.then((response) => {
                endSaving();
                resolve(response)
            }, (error) => {
                endSaving();
                reject(error);
            });
        };
        sendDocument();
    });
}

function sendDocumentToServer() {
    RichEditTest.OnPost();
    var formdata = $('#chartnotecomposeform').serializeArray();
    console.log(`=> Begin sendDocument ${++sendCounter}`);
    return $.ajax({
        type: "POST",
        url: '/Home/SaveRichEdit',
        dataType: 'json',
        data: $.param(formdata)
    })
        .then(result => { console.log(`document.Length(on server): ${result.Length}`); })
        .catch(error => { console.log(error); })
        .always(() => { console.log(`<= End sendDocument ${--sendCounter}`); });
}

function editDocument(logMessage) {
    console.log(logMessage || "change document");
    RichEditTest.selection.goToDocumentStart();
    RichEditTest.commands.insertText.execute(new Date().toISOString());
    RichEditTest.commands.insertLineBreak.execute();
    RichEditTest.commands.insertTable.execute(10, 8);
    RichEditTest.commands.insertLineBreak.execute();
}

// #region DX handlers
function RichEditTestInit() {
    // Increase document save rate to improve reproducibility
    RichEditTest.requestSettings.pendingPeriod = saveTimout;
}

function Begin_Synchronization(s, e) {
    console.log('%c-> Begin Synchronization', 'color:green');
}

function End_Synchronization(s, e) {
    console.log('<- End Synchronization');
    if (mod === Mods.ForceSync && isSavingPostponed) {
        window.setTimeout(function () {
            isSavingPostponed = false;
            sendDocumentToServer();
        }, 0);
    }
}

var callbackCounter;

function Begin_Callback(s, e) {
    callbackCounter++;
    console.log(`=> Begin Callback ${callbackCounter}`);
}

function End_Callback(s, e) {
    callbackCounter--;
    console.log(`<= End Callback ${callbackCounter}`);
}
// #endregion
