const FlashcardController = {
  nextCard(current, total) {
    return (current + 1) % total;
  },

  prevCard(current, total) {
    return current === 0 ? total - 1 : current - 1;
  }
};

export default FlashcardController;