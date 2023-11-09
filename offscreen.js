// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target === "offscreen") {
    switch (message.type) {
      case "start-recording":
        startRecording(message.data, message.tab);
        break;
      case "stop-recording":
        stopRecording(message.tab);
        break;
      default:
        throw new Error("Unrecognized message:", message.type);
    }
  }
});

let abc = [];
let recorder;
let data = [];

async function startRecording(streamId, tab) {
  const media = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
      },
    },
    video: {
      mandatory: {
        chromeMediaSource: "tab",
        chromeMediaSourceId: streamId,
      },
    },
  });

  // Continue to play the captured audio to the user.
  const output = new AudioContext();
  const source = output.createMediaStreamSource(media);
  source.connect(output.destination);

  // Start recording.
  recorder = new MediaRecorder(media, { mimeType: "video/webm" });
  abc.push({ recorder: recorder, tabId: tab.id });
  recorder.ondataavailable = (event) => data.push(event.data);
  recorder.onstop = () => {
    chrome.runtime.sendMessage({ type: "stopInterval" });
    const blob = new Blob(data, { type: "video/webm" });
    window.open(URL.createObjectURL(blob), "_blank");
    recorder = undefined;
    data = [];
  };
  recorder.start();
  window.location.hash = "recording";
}

async function stopRecording(tab) {
  const recorder = abc.filter((item) => {
    return item.tabId === tab.id;
  })[0].recorder;
  if (recorder) {
    console.log(tab.id);
    console.log(recorder);
    recorder.stop();
    recorder.stream.getTracks().forEach((t) => t.stop());
    window.location.hash = "";
  } else {
    return;
  }
}
