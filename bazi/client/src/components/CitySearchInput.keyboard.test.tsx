import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { CityProvider, CitySearchInput } from "@orasage/city/react";
import type { BirthplaceValue, CityRecord } from "@orasage/city";

const beijing: CityRecord = {
  city: "北京",
  province: "北京",
  country: "中国",
  lng: 116.4074,
  lat: 39.9042,
  timezone: "+8",
  pinyin: "BJ",
};

vi.mock("@orasage/city", async () => {
  const actual = await vi.importActual<typeof import("@orasage/city")>("@orasage/city");
  return {
    ...actual,
    loadCityCatalog: vi.fn(async () => [beijing]),
    addCityToCatalog: vi.fn(),
    searchCities: (_catalog: CityRecord[], q: string) => {
      if (!q) return [];
      if (q.includes("北京") || q.includes("中国")) return [beijing];
      return [];
    },
  };
});

// CitySearchInput imports catalog/search from relative paths inside the package.
vi.mock("../../../../packages/city/src/catalog", () => ({
  loadCityCatalog: vi.fn(async () => [beijing]),
  addCityToCatalog: vi.fn(),
}));

vi.mock("../../../../packages/city/src/search", async () => {
  const actual = await vi.importActual<typeof import("../../../../packages/city/src/search")>(
    "../../../../packages/city/src/search",
  );
  return {
    ...actual,
    searchCities: (_catalog: CityRecord[], q: string) => {
      if (!q) return [];
      if (q.includes("北京") || q.includes("中国")) return [beijing];
      return [];
    },
  };
});

function Harness({ onChange }: { onChange?: (v: BirthplaceValue) => void }) {
  const [value, setValue] = useState<BirthplaceValue>({ city: "", country: "" });
  return (
    <CityProvider
      api={{
        lookupCity: async () => ({ found: false as const, suggestion: "not found" }),
        confirmCity: async (p) => ({ ...beijing, ...p }),
        listCities: async () => [beijing],
      }}
      locale="zh-CN"
    >
      <CitySearchInput
        value={value}
        onChange={(v) => {
          setValue(v);
          onChange?.(v);
        }}
      />
    </CityProvider>
  );
}

describe("CitySearchInput keyboard (T1-02)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ArrowDown → Enter 选中候选并写回经纬度", async () => {
    const user = userEvent.setup();
    const spy = vi.fn();
    render(<Harness onChange={spy} />);

    const input = screen.getByRole("combobox");
    await user.type(input, "北京");

    await waitFor(() => {
      expect(input).toHaveAttribute("aria-expanded", "true");
    });

    await user.keyboard("{ArrowDown}");
    expect(input).toHaveAttribute("aria-activedescendant");

    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          city: "北京",
          country: "中国",
          lng: 116.4074,
          lat: 39.9042,
        }),
      );
    });
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("Escape 关闭列表", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole("combobox");
    await user.type(input, "北京");
    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "true"));
    await user.keyboard("{Escape}");
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("清除按钮有可访问名称", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole("combobox");
    await user.type(input, "北京");
    await waitFor(() => expect(input).toHaveAttribute("aria-expanded", "true"));
    await user.keyboard("{ArrowDown}{Enter}");
    expect(screen.getByRole("button", { name: "清除出生地" })).toBeInTheDocument();
  });
});
