import { useState } from "react";

export const useProgressStore = () => {

  const [progress, setProgress] =
    useState({
      learned: 0,
      total: 0
    });

  return {
    progress,
    setProgress
  };
};