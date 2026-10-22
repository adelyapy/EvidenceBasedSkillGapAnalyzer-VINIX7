import { crc32, deflateRawSync } from "node:zlib";

export const COMMIT_SHA = "a".repeat(40);
export const TREE_SHA = "b".repeat(40);
export const BLOB_SHA = "c".repeat(40);
export const fixtureContent = "export const answer = 42;\n";

export type FixtureEntry = {
  path: string; content?: string | Buffer; mode?: number; deflate?: boolean;
  declaredSize?: number; encrypted?: boolean; wrongCrc?: boolean;
};

/** Construct bytes directly so unsafe-path tests do not rely on a writer sanitizing them. */
export function makeZip(entries: FixtureEntry[]): Buffer {
  const local: Buffer[] = [];
  const central: Buffer[] = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.path);
    const content = Buffer.isBuffer(entry.content) ? entry.content : Buffer.from(entry.content ?? "");
    const rawData = entry.deflate ? deflateRawSync(content) : content;
    const data = entry.encrypted ? Buffer.concat([Buffer.alloc(12), rawData]) : rawData;
    const method = entry.deflate ? 8 : 0;
    const checksum = entry.wrongCrc ? (crc32(content) ^ 1) >>> 0 : crc32(content);
    const flags = 0x800 | (entry.encrypted ? 1 : 0);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50);
    header.writeUInt16LE(20, 4); header.writeUInt16LE(flags, 6); header.writeUInt16LE(method, 8);
    header.writeUInt32LE(checksum, 14); header.writeUInt32LE(data.length, 18);
    header.writeUInt32LE(entry.declaredSize ?? content.length, 22); header.writeUInt16LE(name.length, 26);
    local.push(header, name, data);
    const record = Buffer.alloc(46);
    record.writeUInt32LE(0x02014b50); record.writeUInt16LE(0x0314, 4); record.writeUInt16LE(20, 6);
    record.writeUInt16LE(flags, 8); record.writeUInt16LE(method, 10);
    record.writeUInt32LE(checksum, 16); record.writeUInt32LE(data.length, 20);
    record.writeUInt32LE(entry.declaredSize ?? content.length, 24); record.writeUInt16LE(name.length, 28);
    record.writeUInt32LE(((entry.mode ?? 0o100644) * 65536) >>> 0, 38); record.writeUInt32LE(offset, 42);
    central.push(record, name);
    offset += header.length + name.length + data.length;
  }
  const directory = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...local, directory, end]);
}

export function githubFixture(options: {
  files?: { path: string; content: string | Buffer; size?: number; mode?: string }[];
  truncated?: boolean;
  private?: boolean;
  status?: number;
  headers?: HeadersInit;
} = {}) {
  const files = options.files ?? [{ path: "src/main.ts", content: fixtureContent }];
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input);
    calls.push({ url, init });
    if (options.status) return Response.json({ secret: "must never be surfaced" }, { status: options.status, headers: options.headers });
    if (url.endsWith("/repos/acme/demo")) return Response.json({ private: options.private ?? false, default_branch: "main" });
    if (url.endsWith("/commits/main")) return Response.json({ sha: COMMIT_SHA, commit: { tree: { sha: TREE_SHA } } });
    if (url.includes("/git/trees/")) return Response.json({ truncated: options.truncated ?? false, tree: files.map((file, index) => ({
      path: file.path, type: "blob", sha: (index + 1).toString(16).padStart(40, "0"),
      mode: file.mode ?? "100644", size: file.size ?? Buffer.byteLength(file.content),
    })) });
    const hash = url.split("/").pop();
    const index = parseInt(hash ?? "", 16) - 1;
    if (files[index]) return new Response(typeof files[index].content === "string" ? files[index].content : new Uint8Array(files[index].content));
    throw new Error("Unexpected fixture request");
  };
  return { fetch: fetcher, calls };
}
