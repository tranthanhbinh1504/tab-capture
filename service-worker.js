const setupOffscreenDocument = async () => {
  // Get current tab to focus on it after start recording on recording screen tab
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);

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

  if (recording) {
    chrome.runtime.sendMessage({
      type: "stop-recording",
      target: "offscreen",
    });
    return;
  }

  const streamId = await chrome.tabCapture.getMediaStreamId({
    targetTabId: tab.id,
  });

  // Send the stream ID to the offscreen document to start recording.
  chrome.runtime.sendMessage({
    type: "start-recording",
    target: "offscreen",
    data: streamId,
  });
};

const openLinkedin = async () => {
  const newTab = await chrome.tabs.create({
    url: "https://www.linkedin.com/",
  });

  setupOffscreenDocument();
};

const openWikipedia = async () => {
  const newTab = await chrome.tabs.create({
    url: "https://www.wikipedia.com/",
  });
  // setupOffscreenDocument();
};

// Listen for startRecording message from popup.js
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.name === "openLinkedin") {
    openLinkedin();
  }

  if (request.name === "openWikipedia") {
    openWikipedia();
  }
});
