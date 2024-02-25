let recordRTC;
let isRecording = false;

const startRecording = () => {
    isRecording = true;
    recordRTC = RecordRTC({
        type: 'audio',
        recorderType: StereoAudioRecorder,
        mimeType: 'audio/wav'
    });
    recordRTC.startRecording();

    document.getElementById('start').disabled = true;
    document.getElementById('stop').disabled = false;
};

const stopRecording = () => {
    isRecording = false;
    recordRTC.stopRecording(() => {
        const blob = recordRTC.getBlob();
        const url = URL.createObjectURL(blob);

        const downloadLink = document.getElementById('download');
        downloadLink.href = url;
        downloadLink.disabled = false;
        downloadLink.style.display = 'block';

        recordRTC.destroy();
    });

    document.getElementById('start').disabled = false;
    document.getElementById('stop').disabled = true;
};

document.getElementById('start').addEventListener('click', startRecording);
document.getElementById('stop').addEventListener('click', stopRecording);
