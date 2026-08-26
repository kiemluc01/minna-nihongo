// Node 26 định nghĩa sẵn một global `localStorage` (thử nghiệm) trả về undefined
// khi không chạy kèm --localstorage-file, và nó CHE mất localStorage của jsdom.
// Vì gần như mọi service trong dự án đọc/ghi trực tiếp `localStorage`, ta cài một
// bản Storage in-memory đúng hợp đồng của Web Storage để test chạy tất định.
class MemoryStorage {
  #data = new Map();

  get length() {
    return this.#data.size;
  }

  key(index) {
    return Array.from(this.#data.keys())[index] ?? null;
  }

  getItem(key) {
    const value = this.#data.get(String(key));
    return value === undefined ? null : value;
  }

  setItem(key, value) {
    this.#data.set(String(key), String(value));
  }

  removeItem(key) {
    this.#data.delete(String(key));
  }

  clear() {
    this.#data.clear();
  }
}

export const installLocalStorage = () => {
  const storage = new MemoryStorage();

  for (const target of [globalThis, window]) {
    Object.defineProperty(target, "localStorage", {
      value: storage,
      configurable: true,
      writable: true
    });
  }

  return storage;
};
