import React, { useEffect, useState } from 'react';
import { fetchChatProfiles } from '../../api/admin';

const ChatProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChatProfiles()
      .then(setProfiles)
      .catch(() => setError('Failed to load chat profiles'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm">Loading profiles...</div>;
  if (error) return <div className="text-red-500 text-sm">{error}</div>;

  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
        <div
          key={profile.id}
          className="bg-white border rounded-xl p-4 flex justify-between"
        >
          <div>
            <div className="font-medium text-[#2F5D50]">
              {profile.name}
            </div>
            <div className="text-sm text-[#6B6E6C]">
              Last message: {profile.lastMessage}
            </div>
          </div>
          <div className="text-sm text-[#6B6E6C]">
            Messages: {profile.totalMessages}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatProfiles;
