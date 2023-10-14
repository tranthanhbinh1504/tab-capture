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

  if (recording) {
    chrome.runtime.sendMessage({
      type: "stop-recording",
      target: "offscreen",
    });
    return;
  }

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
  } catch (err) {
    console.log(err);
  }
};

const openLinkedin = async () => {
  await chrome.tabs.create({ url: "https://www.linkedin.com/" });
};

const openWikipedia = async () => {
  await chrome.tabs.create({
    url: "https://www.wikipedia.com/",
  });
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

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "enable-capture") {
    setupOffscreenDocument(tab);
  }
});
