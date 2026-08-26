import { describe, expect, it, vi } from "vitest";

import { deleteKaiwa, getKaiwa, saveKaiwa, subscribeKaiwa } from "./kaiwaService";
import { expectEventFired } from "../test/helpers/events";

const KEY = "n5_lesson_kaiwa";
const CHANGE_EVENT = "n5-lesson-kaiwa-changed";

const sampleKaiwa = {
  speakers: [{ id: "a", name: "Aさん" }],
  lines: [{ id: "l1", speakerId: "a", text: "おはようございます。" }]
};

describe("getKaiwa", () => {
  it("trả về null khi bài chưa có hội thoại", () => {
    expect(getKaiwa(1)).toBeNull();
  });

  it("đọc lại đúng hội thoại đã lưu", () => {
    saveKaiwa(1, sampleKaiwa);

    expect(getKaiwa(1)).toEqual(sampleKaiwa);
  });

  it("khớp lessonId dù truyền vào là số hay chuỗi", () => {
    saveKaiwa("4", sampleKaiwa);

    expect(getKaiwa(4)).toEqual(sampleKaiwa);
    expect(getKaiwa("4")).toEqual(sampleKaiwa);
  });

  it("trả về null khi dữ liệu bị hỏng", () => {
    localStorage.setItem(KEY, "{ khong-phai-json");

    expect(getKaiwa(1)).toBeNull();
  });

  it("trả về null khi dữ liệu đã lưu là mảng", () => {
    localStorage.setItem(KEY, JSON.stringify([sampleKaiwa]));

    expect(getKaiwa(1)).toBeNull();
  });
});

describe("saveKaiwa", () => {
  it("mỗi bài chỉ giữ một hội thoại — lưu lần sau ghi đè lần trước", () => {
    saveKaiwa(1, sampleKaiwa);
    saveKaiwa(1, { speakers: [], lines: [] });

    expect(getKaiwa(1)).toEqual({ speakers: [], lines: [] });
  });

  it("không đụng tới hội thoại của bài khác", () => {
    saveKaiwa(1, sampleKaiwa);
    saveKaiwa(2, { speakers: [], lines: [] });

    expect(getKaiwa(1)).toEqual(sampleKaiwa);
  });

  it("bắn sự kiện để giao diện cập nhật ngay", () => {
    expectEventFired(CHANGE_EVENT, () => saveKaiwa(1, sampleKaiwa));
  });
});

describe("deleteKaiwa", () => {
  it("xoá hội thoại của đúng bài được chỉ định", () => {
    saveKaiwa(1, sampleKaiwa);
    saveKaiwa(2, sampleKaiwa);

    deleteKaiwa(1);

    expect(getKaiwa(1)).toBeNull();
    expect(getKaiwa(2)).toEqual(sampleKaiwa);
  });

  it("không lỗi khi bài chưa có hội thoại", () => {
    expect(() => deleteKaiwa(99)).not.toThrow();
  });

  it("bắn sự kiện sau khi xoá", () => {
    saveKaiwa(1, sampleKaiwa);

    expectEventFired(CHANGE_EVENT, () => deleteKaiwa(1));
  });
});

describe("subscribeKaiwa", () => {
  it("gọi callback khi có thay đổi rồi ngừng sau khi huỷ đăng ký", () => {
    const callback = vi.fn();
    const unsubscribe = subscribeKaiwa(callback);

    saveKaiwa(1, sampleKaiwa);
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
    saveKaiwa(2, sampleKaiwa);
    window.dispatchEvent(new Event("storage"));

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
