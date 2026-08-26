import { describe, expect, it, vi } from "vitest";

import {
  addCustomLesson,
  deleteCustomLesson,
  getCustomLessons,
  getNextCustomLessonId,
  subscribeCustomLessons
} from "./customLessonsService";
import { expectEventFired } from "../test/helpers/events";

const KEY = "n5_custom_lessons";
const CHANGE_EVENT = "n5-custom-lessons-changed";

const seed = (lessons) => localStorage.setItem(KEY, JSON.stringify(lessons));

describe("getCustomLessons", () => {
  it("trả về mảng rỗng khi chưa có bài tự thêm nào", () => {
    expect(getCustomLessons()).toEqual([]);
  });

  it("đọc lại danh sách đã lưu", () => {
    seed([{ id: 8, title: "Bài 8" }]);

    expect(getCustomLessons()).toEqual([{ id: 8, title: "Bài 8" }]);
  });

  it("trả về mảng rỗng khi dữ liệu trong localStorage bị hỏng", () => {
    localStorage.setItem(KEY, "{ khong-phai-json");

    expect(getCustomLessons()).toEqual([]);
  });

  it("trả về mảng rỗng khi dữ liệu đã lưu không phải mảng", () => {
    localStorage.setItem(KEY, JSON.stringify({ id: 8 }));

    expect(getCustomLessons()).toEqual([]);
  });
});

describe("addCustomLesson", () => {
  it("thêm bài mới vào cuối danh sách và trả về chính bài đó", () => {
    seed([{ id: 8, title: "Bài 8" }]);

    const lesson = { id: 9, title: "Bài 9" };

    expect(addCustomLesson(lesson)).toBe(lesson);
    expect(getCustomLessons()).toEqual([{ id: 8, title: "Bài 8" }, lesson]);
  });

  it("bắn sự kiện để giao diện cập nhật ngay", () => {
    expectEventFired(CHANGE_EVENT, () => addCustomLesson({ id: 9, title: "Bài 9" }));
  });
});

describe("deleteCustomLesson", () => {
  it("xoá đúng bài theo id", () => {
    seed([{ id: 8 }, { id: 9 }]);

    deleteCustomLesson(9);

    expect(getCustomLessons()).toEqual([{ id: 8 }]);
  });

  it("khớp id dù truyền vào là số hay chuỗi", () => {
    seed([{ id: 8 }, { id: "9" }]);

    deleteCustomLesson("8");
    deleteCustomLesson(9);

    expect(getCustomLessons()).toEqual([]);
  });

  it("không làm gì khi id không tồn tại", () => {
    seed([{ id: 8 }]);

    deleteCustomLesson(99);

    expect(getCustomLessons()).toEqual([{ id: 8 }]);
  });

  it("bắn sự kiện để giao diện cập nhật ngay", () => {
    seed([{ id: 8 }]);

    expectEventFired(CHANGE_EVENT, () => deleteCustomLesson(8));
  });
});

describe("getNextCustomLessonId", () => {
  it("nối tiếp sau bài tĩnh cuối cùng khi chưa có bài tự thêm", () => {
    expect(getNextCustomLessonId(7)).toBe(8);
  });

  it("nối tiếp sau id lớn nhất trong các bài tự thêm", () => {
    seed([{ id: 8 }, { id: 12 }, { id: 9 }]);

    expect(getNextCustomLessonId(7)).toBe(13);
  });

  it("vẫn dựa vào bài tĩnh khi id tự thêm nhỏ hơn", () => {
    seed([{ id: 2 }]);

    expect(getNextCustomLessonId(7)).toBe(8);
  });

  it("bắt đầu từ 1 khi không có bài nào", () => {
    expect(getNextCustomLessonId()).toBe(1);
  });

  // BUG: Math.max(...customIds) (customLessonsService.js:24) trả NaN nếu có một
  // bài với id không phải số, làm mọi lần thêm bài sau đó đều hỏng id.
  it.fails("KHÔNG được trả về NaN khi có bài với id không hợp lệ", () => {
    seed([{ id: 8 }, { title: "bài thiếu id" }]);

    expect(getNextCustomLessonId(7)).toBe(9);
  });
});

describe("subscribeCustomLessons", () => {
  it("gọi callback khi danh sách thay đổi", () => {
    const callback = vi.fn();
    const unsubscribe = subscribeCustomLessons(callback);

    addCustomLesson({ id: 9 });

    expect(callback).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("cũng lắng nghe sự kiện storage từ tab khác", () => {
    const callback = vi.fn();
    const unsubscribe = subscribeCustomLessons(callback);

    window.dispatchEvent(new Event("storage"));

    expect(callback).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("gỡ CẢ HAI listener sau khi huỷ đăng ký", () => {
    const callback = vi.fn();

    subscribeCustomLessons(callback)();

    addCustomLesson({ id: 9 });
    window.dispatchEvent(new Event("storage"));

    expect(callback).not.toHaveBeenCalled();
  });
});
