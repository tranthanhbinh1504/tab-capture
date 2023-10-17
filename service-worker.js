var interval;
const setupOffscreenDocument = async (tab) => {
  const existingContexts = await chrome.runtime.getContexts({});
  let recording = false;

  const offscreenDocument = existingContexts.find(
    (c) => c.contextType === "OFFSCREEN_DOCUMENT"
  );

  if (!offscreenDocument) {
    // Create an offscreen document.
    await chrome.offscreen.createDocument({
      url: "offscreen.html",
      reasons: ["USER_MEDIA"],
      justification: "Recording from chrome.tabCapture API",
    });
  } else {
    recording = offscreenDocument.documentUrl.endsWith("#recording");
  }

  // if (recording) {
  //   chrome.runtime.sendMessage({
  //     type: "stop-recording",
  //     target: "offscreen",
  //   });
  //   clearInterval(interval);
  //   return;
  // }

  try {
    const streamId = await chrome.tabCapture.getMediaStreamId({
      targetTabId: tab.id,
    });

    // Send the stream ID to the offscreen document to start recording.
    chrome.runtime.sendMessage({
      type: "start-recording",
      target: "offscreen",
      data: streamId,
    });
    internalMessageContent(tab);
  } catch (err) {
    console.log(err);
  }
};

// Listen for startRecording message from popup.js
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === "tabRecord") {
    setupOffscreenDocument(request.tab);
  }

  if (request.type === "stopInterval") {
    clearInterval(interval);
  }
});

const internalMessageContent = (tab) => {
  interval = setInterval(() => {
    chrome.tabs.sendMessage(tab.id, {
      type: "onRecording",
    });
  }, 1000);
};
