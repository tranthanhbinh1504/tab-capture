const getMediaStreamId = () => {
  window.chrome.tabs.query({ currentWindow: !0, active: !0 }, function (e) {
    var n = e[0];
    chrome.tabCapture.getMediaStreamId({ consumerTabId: n.id }, (streamId) => {
      chrome.runtime.sendMessage({
        type: "startRecord",
        streamId: streamId,
        tab: n,
      });
    });
  });
};

const startRecord = async () => {
  getMediaStreamId();
};

const stopRecord = async () => {
  window.chrome.tabs.query({ currentWindow: !0, active: !0 }, function (e) {
    var n = e[0];
    chrome.tabCapture.getMediaStreamId({ consumerTabId: n.id }, (streamId) => {
      chrome.runtime.sendMessage({
        type: "stopRecord",
        tab: n,
      });
    });
  });
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startRecord").addEventListener("click", startRecord);
  document.getElementById("stopRecord").addEventListener("click", stopRecord);
});
