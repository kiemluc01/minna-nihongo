const KEY = "n5_progress";

export const saveProgress = (data) => {
  localStorage.setItem(
    KEY,
    JSON.stringify(data)
  );
};

export const getProgress = () => {
  const data = localStorage.getItem(KEY);

  return data
    ? JSON.parse(data)
    : {
        vocabulary: [],
        grammar: [],
        alphabet: []
      };
};