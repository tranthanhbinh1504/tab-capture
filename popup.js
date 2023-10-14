const getMediaStreamId = () => {
  window.chrome.tabs.query({ currentWindow: !0, active: !0 }, function (e) {
    var n = e[0];
    console.log(n);
    // chrome.tabCapture.getMediaStreamId({ consumerTabId: n.id }, (streamId) => {
    //   chrome.tabs.sendMessage(n.id, {
    //     type: "tabRecord",
    //     streamId: streamId,
    //     tabId: n.id,
    //   });
    // });
  });
};

const openLinkedin = async () => {
  getMediaStreamId();
  await chrome.tabs.create({ url: "https://www.linkedin.com/" });
};

const openWikipedia = async () => {
  getMediaStreamId();
  await chrome.tabs.create({
    url: "https://www.wikipedia.com/",
  });
};

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("openLinkedin")
    .addEventListener("click", openLinkedin);

  document
    .getElementById("openWikipedia")
    .addEventListener("click", openWikipedia);
});
