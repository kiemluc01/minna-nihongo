import { vi } from "vitest";

// shuffle / resolveBlank / generateKaiwaExercise đều gọi Math.random, nên mọi
// assertion về NỘI DUNG cụ thể phải cố định chuỗi giá trị random trước.
// Khi hết chuỗi values, giá trị cuối được lặp lại (thay vì trả undefined).
export const stubRandom = (values) => {
  let index = 0;

  const spy = vi.spyOn(Math, "random").mockImplementation(() => {
    const value = values[Math.min(index, values.length - 1)];
    index += 1;
    return value;
  });

  return spy;
};

// Math.random() === 0 luôn chọn phần tử đầu tiên: shuffle giữ nguyên thứ tự đảo
// theo một cách xác định, resolveBlank chọn ứng viên đầu.
export const stubRandomZero = () => stubRandom([0]);
