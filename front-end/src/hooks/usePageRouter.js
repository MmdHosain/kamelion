import { useState } from 'react';

export const usePageRouter = () => {
  const [page, setPage] = useState("home");

  return { page, setPage };
};