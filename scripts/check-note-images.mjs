import { access, readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const postsDirectory = resolve(root, "src/content/posts");
const ledgerPath = resolve(root, "src/content/used-note-images.json");
const publicDirectory = resolve(root, "public");
const notesImageDirectory = resolve(publicDirectory, "images/notes");

function fail(message) {
  throw new Error(`Note images: ${message}`);
}

const ledger = JSON.parse(await readFile(ledgerPath, "utf8"));
const entries = ledger.images;

if (!Array.isArray(entries)) {
  fail("used-note-images.json needs an images array.");
}

const ledgerIds = new Set();
const filesByNote = new Map();
const noteByFile = new Map();

for (const entry of entries) {
  if (!entry.id || ledgerIds.has(entry.id)) {
    fail(`duplicate or missing image id (${entry.id ?? "empty"}).`);
  }

  ledgerIds.add(entry.id);

  if (!entry.note || !Array.isArray(entry.files) || entry.files.length === 0) {
    fail(`image ${entry.id} needs a note id and at least one file.`);
  }

  if (filesByNote.has(entry.note)) {
    fail(`note ${entry.note} is listed twice in the image ledger.`);
  }

  filesByNote.set(entry.note, new Set(entry.files));

  for (const file of entry.files) {
    if (noteByFile.has(file)) {
      fail(`${file} is already used by ${noteByFile.get(file)}.`);
    }

    noteByFile.set(file, entry.note);
    await access(resolve(publicDirectory, file));
  }
}

let trackedOnDisk;

try {
  trackedOnDisk = await readdir(notesImageDirectory);
} catch {
  trackedOnDisk = [];
}

for (const name of trackedOnDisk) {
  const file = `images/notes/${name}`;

  if (!noteByFile.has(file)) {
    fail(`${file} is on disk but not listed in used-note-images.json.`);
  }
}

const postFiles = (await readdir(postsDirectory)).filter((file) =>
  file.endsWith(".json")
);

const notesWithImages = new Set();

for (const fileName of postFiles) {
  const noteId = fileName.replace(/\.json$/, "");
  const data = JSON.parse(
    await readFile(resolve(postsDirectory, fileName), "utf8")
  );
  const image = data.image;

  if (!image) {
    continue;
  }

  notesWithImages.add(noteId);

  const localRefs = [image.src, image.thumbSrc].filter(Boolean);
  const remoteRefs = [image.url].filter(Boolean);
  const expected = filesByNote.get(noteId);

  if (!expected) {
    fail(`${noteId} has an image that is not in used-note-images.json.`);
  }

  for (const ref of localRefs) {
    if (noteByFile.get(ref) !== noteId) {
      fail(`${noteId} uses ${ref}, which is not assigned to that note.`);
    }
  }

  for (const file of expected) {
    if (!localRefs.includes(file)) {
      fail(`${noteId} does not reference ledger file ${file}.`);
    }
  }

  for (const ref of remoteRefs) {
    const owners = entries.filter(
      (entry) => entry.note === noteId && (entry.urls ?? []).includes(ref)
    );

    if (owners.length !== 1) {
      fail(`${noteId} uses remote image ${ref}, which is not in the ledger.`);
    }
  }
}

for (const noteId of filesByNote.keys()) {
  if (!notesWithImages.has(noteId)) {
    fail(`ledger entry for ${noteId} does not match a note image.`);
  }
}

console.log(
  `Note images ok: ${entries.length} image${entries.length === 1 ? "" : "s"} tracked, no repeats.`
);
