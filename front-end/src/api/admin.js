const fakeDelay = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const fetchDashboardStats = async () => {
  await fakeDelay(800);

  return {
    totalChats: 1240,
    activeUsers: 312,
    appointmentsToday: 18
  };
};

export const fetchChatProfiles = async () => {
  await fakeDelay(1000);

  return [
    {
      id: 1,
      name: 'User 001',
      lastMessage: 'Asking about anxiety',
      totalMessages: 14
    },
    {
      id: 2,
      name: 'User 002',
      lastMessage: 'Relationship advice',
      totalMessages: 8
    }
  ];
};

export const fetchReservedTimes = async () => {
  await fakeDelay(1000);

  return [
    {
      id: 1,
      date: '2026-02-24',
      time: '10:00',
      client: 'User 001'
    },
    {
      id: 2,
      date: '2026-02-25',
      time: '14:30',
      client: 'User 002'
    }
  ];
};
