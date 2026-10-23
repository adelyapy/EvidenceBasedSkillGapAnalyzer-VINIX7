
import type { FormEvent } from "react";
import type {
  HistoryFiltersValue,
  HistoryRoleId,
  HistorySort,
} from "@/types/history";
import HistoryIcon from "./HistoryIcon";

type RoleOption = {
  value: HistoryRoleId;
  label: string;
};

type Props = {
  value: HistoryFiltersValue;
  roleOptions: RoleOption[];
  onQueryChange: (value: string) => void;
  onRoleChange: (value: "all" | HistoryRoleId) => void;
  onSortChange: (value: HistorySort) => void;
  onApply: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export default function HistoryFilters({
  value,
  roleOptions,
  onQueryChange,
  onRoleChange,
  onSortChange,
  onApply,
  onReset,
}: Props) {
  return (
    <section className="bkh-filterSection" aria-labelledby="bkh-filter-title">
      <div className="bkh-sectionHeading">
        <div>
          <h2 id="bkh-filter-title">Cari dan Atur Riwayat</h2>
          <p>Filter dan pengurutan berdasarkan riwayat analisis akunmu.</p>
        </div>

        <details className="bkh-help">
          <summary>
            <HistoryIcon name="help" size={20} /> Bantuan
          </summary>
          <div>
            Cari berdasarkan nama analisis atau target role. Gunakan filter
            dan urutan, lalu pilih Terapkan untuk memperbarui daftar.
          </div>
        </details>
      </div>

      <form
        className="bkh-filterForm"
        role="search"
        onSubmit={onApply}
        onReset={onReset}
      >
        <label className="bkh-field bkh-field--search" htmlFor="bkh-search">
          <span>
            <HistoryIcon name="search" size={19} /> Cari riwayat analisis
          </span>
          <input
            id="bkh-search"
            type="search"
            value={value.query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Cari nama analisis atau posisi target..."
          />
        </label>

        <label className="bkh-field" htmlFor="bkh-role">
          <span>
            <HistoryIcon name="filter" size={19} /> Filter target role
          </span>
          <select
            id="bkh-role"
            value={value.role}
            onChange={(event) =>
              onRoleChange(event.target.value as "all" | HistoryRoleId)
            }
          >
            <option value="all">Semua role</option>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="bkh-field" htmlFor="bkh-sort">
          <span>
            <HistoryIcon name="sort" size={19} /> Urutkan
          </span>
          <select
            id="bkh-sort"
            value={value.sort}
            onChange={(event) =>
              onSortChange(event.target.value as HistorySort)
            }
          >
            <option value="oldest">Tanggal terlama</option>
            <option value="newest">Tanggal terbaru</option>
            <option value="highest">Skor kesiapan tertinggi</option>
            <option value="lowest">Skor kesiapan terendah</option>
          </select>
        </label>

        <div className="bkh-filterActions">
          <button className="bkh-applyButton" type="submit">
            Terapkan
          </button>
          <button className="bkh-resetButton" type="reset">
            Reset isian
          </button>
        </div>
      </form>
    </section>
  );
}
