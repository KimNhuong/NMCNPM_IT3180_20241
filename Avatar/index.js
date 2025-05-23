import React from 'react';
import './Avatar.css';

function Avatar({ name, imageUrl}) {
  function getRandomColor() {
    const hue = Math.floor(name.charCodeAt(0) / 256 * 360);
    const saturation = Math.floor(name.charCodeAt(0) / 256 * 360);
    const lightness = 50; 
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const randomColor = getRandomColor();

  return imageUrl ? (
    <img
      src={imageUrl}
      alt="Avatar"
      className="uy-avatar"
      style={{ width: '100%', height: '100%', borderRadius: '50%' }}
    />
  ) : (
    <div
      className="uy-avatar-placeholder"
      style={{ width: '100%', height: '100%', backgroundColor: randomColor, borderRadius: '50%' }}
    >
      {initial}
    </div>
  );
}


export default Avatar;
