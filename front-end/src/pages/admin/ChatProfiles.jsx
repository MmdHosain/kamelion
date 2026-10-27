import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/admin';
import { toPersianDigits } from '../../utils/jalaliDateUtils';

const ChatProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi.getChatProfiles()
      .then(setProfiles)
      .catch(() => setError('خطا در بارگذاری پروفایل‌های گفتگو'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-textDark/70">در حال بارگذاری پروفایل‌های گفتگو...</div>;
  if (error) return <div className="text-red-500 text-sm">{error}</div>;

  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
        <div
          key={profile.id}
          className="bg-white border rounded-xl p-4 flex justify-between"
        >
          <div>
            <div className="font-medium text-primary">
              {profile.name}
            </div>
            <div className="text-sm text-mutedText">
              آخرین پیام: {toPersianDigits(profile.lastMessage)}
            </div>
          </div>
          <div className="text-sm text-mutedText">
            پیام‌ها: {toPersianDigits(profile.totalMessages)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatProfiles;
