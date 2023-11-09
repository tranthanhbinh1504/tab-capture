function onRecording() {
  window.location.assign("https://www.linkedin.com/");
  chrome.runtime.sendMessage({ type: "stopInterval" });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type == "onRecording") {
    onRecording();
  }
});
