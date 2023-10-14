const getMediaStreamId = () => {
  window.chrome.tabs.query({ currentWindow: !0, active: !0 }, function (e) {
    var n = e[0];
    chrome.tabCapture.getMediaStreamId({ consumerTabId: n.id }, (streamId) => {
      chrome.runtime.sendMessage({
        type: "tabRecord",
        streamId: streamId,
        tab: n,
      });
    });
  });
};

const openLinkedin = async () => {
  getMediaStreamId();
};

const openWikipedia = async () => {
  getMediaStreamId();
};

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("openLinkedin")
    .addEventListener("click", openLinkedin);

  document
    .getElementById("openWikipedia")
    .addEventListener("click", openWikipedia);
});
