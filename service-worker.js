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

const audioRecordNewTab = async (newTab) => {
  debugger;
  const tabId = newTab.id;
  chrome.tabCapture.getMediaStreamId({ targetTabId: tabId }, async (id) => {
    const media = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: id,
        },
      },
      video: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: id,
        },
      },
    });

    // Continue to play the captured audio to the user.
    const output = new AudioContext();
    const source = output.createMediaStreamSource(media);
    source.connect(output.destination);
  });
};

const openLinkedin = async () => {
  const a = await chrome.tabs.create({ url: "https://www.linkedin.com/" });
  // console.log(a);
  // setupOffscreenDocument(a);

  // setupOffscreenDocument();

  // const newTab = await chrome.tabs.create({
  //   url: "https://www.linkedin.com/",
  // });
  // audioRecordNewTab(newTab);
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

chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "enable-capture") {
    setupOffscreenDocument(tab);
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  console.log("run");
  setupOffscreenDocument(tab);
});
