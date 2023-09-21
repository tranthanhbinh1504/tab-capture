const openLinkedin = () => {
  chrome.runtime.sendMessage({ name: "openLinkedin" });
};

const openWikipedia = () => {
  chrome.runtime.sendMessage({ name: "openWikipedia" });
};

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("openLinkedin")
    .addEventListener("click", openLinkedin);

  document
    .getElementById("openWikipedia")
    .addEventListener("click", openWikipedia);
});
