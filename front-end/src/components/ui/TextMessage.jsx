import React from 'react';

const TextMessage = ({ content }) => {
  if (!content) return null;
  // نمایش خطوط جدید به صورت <br>
  return (
    <div className="whitespace-pre-wrap dir-rtl text-right">
      {content}
    </div>
  );
};

export default TextMessage;
