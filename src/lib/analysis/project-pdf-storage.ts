const DB_NAME = "buktiva-project-files";
const STORE_NAME = "pdf-files";
const DB_VERSION = 1;

type StoredPdf = {
  blob: Blob;
  name: string;
  type: string;
  lastModified: number;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("Penyimpanan file browser tidak tersedia."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      reject(request.error ?? new Error("Gagal membuka penyimpanan file."));
    };
  });
}

export async function saveProjectPdf(id: string, file: File): Promise<void> {
  if (!id.trim()) throw new Error("ID PDF tidak valid.");

  const db = await openDatabase();

  try {
    const storedPdf: StoredPdf = {
      blob: file,
      name: file.name,
      type: file.type || "application/pdf",
      lastModified: file.lastModified,
    };

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).put(storedPdf, id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => {
        reject(transaction.error ?? new Error("Gagal menyimpan PDF."));
      };
      transaction.onabort = () => {
        reject(transaction.error ?? new Error("Penyimpanan PDF dibatalkan."));
      };
    });
  } finally {
    db.close();
  }
}

export async function getProjectPdf(id: string): Promise<File | null> {
  if (!id.trim()) return null;

  const db = await openDatabase();

  try {
    const result = await new Promise<unknown>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        reject(request.error ?? new Error("Gagal membaca PDF."));
      };
    });

    // Dukungan untuk file yang disimpan oleh versi helper sebelumnya.
    if (typeof File !== "undefined" && result instanceof File) {
      return result;
    }

    // Format tersimpan saat ini: Blob ditambah metadata file.
    if (
      result &&
      typeof result === "object" &&
      "blob" in result &&
      "name" in result &&
      "type" in result
    ) {
      const stored = result as StoredPdf;
      if (!(stored.blob instanceof Blob) || typeof stored.name !== "string") {
        return null;
      }

      return new File([stored.blob], stored.name, {
        type: typeof stored.type === "string" ? stored.type : "application/pdf",
        lastModified:
          typeof stored.lastModified === "number"
            ? stored.lastModified
            : Date.now(),
      });
    }

    // Beberapa browser dapat mengembalikan Blob saja.
    if (result instanceof Blob) {
      return new File([result], "project-evidence.pdf", {
        type: result.type || "application/pdf",
      });
    }

    return null;
  } finally {
    db.close();
  }
}

export async function deleteProjectPdf(id: string): Promise<void> {
  if (!id.trim()) return;

  const db = await openDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      transaction.objectStore(STORE_NAME).delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => {
        reject(transaction.error ?? new Error("Gagal menghapus PDF."));
      };
      transaction.onabort = () => {
        reject(transaction.error ?? new Error("Penghapusan PDF dibatalkan."));
      };
    });
  } finally {
    db.close();
  }
}
