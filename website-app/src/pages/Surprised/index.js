import React, { useState, useEffect } from 'react';
import './index.css';

const Surprised = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const fullTitle = '🎉 Chúc Mừng Năm Mới 2025 🎉';
  const fullMessage = `Chúc bạn và gia đình một năm mới thật nhiều sức khỏe, 8386, hạnh phúc viên mãn, thành công trong công việc, 
    tràn ngập tiếng cười, gắn kết yêu thương và đạt được mọi ước mơ đã đặt ra. Chúc cho mọi nỗ lực đều được 
    đền đáp xứng đáng, mọi khó khăn đều hóa giải, và mỗi ngày trôi qua đều là một ngày đáng nhớ! 🌟🎇`;

  useEffect(() => {
    let titleIndex = 0;
    const titleInterval = setInterval(() => {
      setTitle((prev) => prev + fullTitle[titleIndex]);
      titleIndex += 1;
      if (titleIndex === fullTitle.length) clearInterval(titleInterval); // Stop when done
    }, 100); // Delay for each character

    return () => clearInterval(titleInterval); // Cleanup on component unmount
  }, []);

  useEffect(() => {
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      setMessage((prev) => prev + fullMessage[messageIndex]);
      messageIndex += 1;
      if (messageIndex === fullMessage.length) clearInterval(messageInterval); // Stop when done
    }, 50); // Delay for each character

    return () => clearInterval(messageInterval); // Cleanup on component unmount
  }, []);

  return (
    <div className="new-year-container">
      <div className="confetti"></div>
      <h1 className="new-year-title">{title}</h1>
      <p className="new-year-message">{message}</p>
      <div className="fireworks">
        <div className="firework"></div>
        <div className="firework"></div>
        <div className="firework"></div>
      </div>
    </div>
  );
};

export default Surprised;
