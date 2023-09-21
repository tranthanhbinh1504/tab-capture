const fetchBlob = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const base64 = await convertBlobToBase64(blob);

  return base64;
};

const convertBlobToBase64 = (blob) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;

      resolve(base64data);
    };
  });
};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log("recording_screen");
  if (request.name !== "startRecordingOnBackground") {
    return;
  }

  // Prompt user to choose screen or window
  chrome.desktopCapture.chooseDesktopMedia(["tab"], function (streamId) {
    if (streamId == null) {
      return;
    }

    // Once user has chosen screen or window, create a stream from it and start recording
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: "desktop",
            chromeMediaSourceId: streamId,
          },
        },
      })
      .then(async (stream) => {
        setTimeout(async () => {
          var currentTab = (
            await chrome.tabs.query({ currentWindow: true, active: true })
          )[0];
          if (
            request.lockTab.pendingUrl &&
            currentTab.id !== request.lockTab.id
          ) {
            alert("Pls select the correct tab");

            // Stop all tracks of stream
            stream.getTracks().forEach((track) => track.stop());
          } else {
            const mediaRecorder = new MediaRecorder(stream);

            const chunks = [];

            mediaRecorder.ondataavailable = function (e) {
              chunks.push(e.data);
            };

            mediaRecorder.onstop = async function (e) {
              // clearInterval(interval);

              const blobFile = new Blob(chunks, { type: "video/webm" });
              const base64 = await fetchBlob(URL.createObjectURL(blobFile));
              alert("Record Finished");
              await chrome.tabs.remove([request.lockTab.id]);

              stream.getTracks().forEach((track) => track.stop());
              // abc.closeInterval();
            };

            mediaRecorder.start();
          }
        }, 200);
      })
      .catch(async (err) => {
        console.log("stop record");
        await chrome.tabs.remove([request.lockTab.id]);
        chrome.tabs.query(
          { active: true, currentWindow: true },
          async function (tabs) {
            const tabWhenRecordingStopped = tabs[0];
            window.close();
          }
        );
        /* handle the error */
      });
  });
});
