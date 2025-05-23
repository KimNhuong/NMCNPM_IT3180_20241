import ReactAudioPlayer from 'react-audio-player';
import cute from './cute2.mp3'
function AudioPlayer() {
  return (
    <div>
      <ReactAudioPlayer
        src={cute}
        controls
      />
    </div>
  );
}

export default AudioPlayer;
