/**
 * Tell IndexNow about URLs that changed in this deploy.
 *
 * The key file lives in this project site, so keyLocation is required and
 * only URLs under /the-cosmic-notebook/ can be submitted. This process always
 * finishes without taking the deploy job down: the workflow also sets
 * continue-on-error. A failed ping is logged and reported with exit code 1.
 */
import { execFileSync } from "node:child_process";
import {
  SITE_HOST,
  SITE_ORIGIN,
  allPingUrls,
  loadIndexNowKey,
  loadNotes,
  urlsForChanges,
} from "./discovery.mjs";

const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH_SIZE = 10000;

function fail(message) {
  console.log(`IndexNow: ${message}`);
  console.log("IndexNow: publishing continues.");
  process.exitCode = 1;
}

function isZeroSha(value) {
  return /^0+$/.test(value);
}

function isSha(value) {
  return /^[0-9a-f]{40}$/i.test(value);
}

function parseNameStatus(output) {
  const entries = [];

  for (const line of output.split("\n")) {
    if (!line.trim()) {
      continue;
    }

    const parts = line.split("\t");
    const code = parts[0] ?? "";

    if (code.startsWith("R") || code.startsWith("C")) {
      entries.push({
        status: code[0],
        oldPath: parts[1],
        path: parts[2],
      });
      continue;
    }

    entries.push({
      status: code[0],
      path: parts[1],
    });
  }

  return entries;
}

function readNoteAt(revision, filePath) {
  try {
    const raw = execFileSync("git", ["show", `${revision}:${filePath}`], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function changedEntries(before, sha) {
  if (!before || isZeroSha(before)) {
    return {
      entries: null,
      reason: "no previous commit SHA; submitting every public URL",
    };
  }

  if (!isSha(before) || !isSha(sha)) {
    return {
      entries: null,
      reason: "commit SHA was not available; submitting every public URL",
    };
  }

  try {
    const output = execFileSync(
      "git",
      ["diff", "--name-status", "--find-renames", before, sha],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
    );

    return { entries: parseNameStatus(output), reason: "" };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return {
      entries: null,
      reason: `could not diff ${before}..${sha} (${detail}); submitting every public URL`,
    };
  }
}

async function submit(key, urls) {
  let failed = false;

  for (let index = 0; index < urls.length; index += BATCH_SIZE) {
    const urlList = urls.slice(index, index + BATCH_SIZE);
    const payload = {
      host: SITE_HOST,
      key,
      keyLocation: `${SITE_ORIGIN}/${key}.txt`,
      urlList,
    };
    const ok = await postWithRetries(payload);
    failed ||= !ok;
  }

  if (failed) {
    fail("one or more submissions did not succeed.");
  }
}

async function postWithRetries(payload) {
  const waits = [0, 10000, 20000];
  let lastDetail = "no response";

  for (let attempt = 0; attempt < waits.length; attempt += 1) {
    if (waits[attempt] > 0) {
      await new Promise((resolve) => setTimeout(resolve, waits[attempt]));
    }

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000),
      });
      const body = (await response.text()).slice(0, 500);

      if (response.status >= 200 && response.status < 300) {
        console.log(
          `IndexNow accepted ${payload.urlList.length} URL(s) with HTTP ${response.status}.`
        );
        return true;
      }

      lastDetail = `HTTP ${response.status} ${body}`.trim();
      console.log(`IndexNow attempt ${attempt + 1} failed: ${lastDetail}`);

      if (response.status === 400 || response.status === 422) {
        break;
      }
    } catch (error) {
      lastDetail = error instanceof Error ? error.message : String(error);
      console.log(`IndexNow attempt ${attempt + 1} failed: ${lastDetail}`);
    }
  }

  console.log(`IndexNow submission failed: ${lastDetail}`);
  return false;
}

async function main() {
  const dryRun =
    process.env.INDEXNOW_DRY_RUN === "1" || process.argv.includes("--dry-run");
  const before = process.env.INDEXNOW_BEFORE ?? "";
  const sha = process.env.INDEXNOW_SHA || "HEAD";

  let key;

  try {
    key = loadIndexNowKey();
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
    return;
  }

  const notes = loadNotes();
  const { entries, reason } = changedEntries(before, sha);
  const urls = entries
    ? urlsForChanges(entries, notes, (filePath) => readNoteAt(before, filePath))
    : allPingUrls(notes);

  if (reason) {
    console.log(`IndexNow: ${reason}`);
  }

  const outside = urls.filter((url) => !url.startsWith(`${SITE_ORIGIN}/`));

  if (outside.length > 0) {
    fail(
      `refusing URLs outside ${SITE_ORIGIN}/: ${outside.join(", ")}`
    );
    return;
  }

  if (urls.length === 0) {
    console.log("IndexNow: no changed URLs to submit.");
    return;
  }

  console.log(`IndexNow: ${urls.length} URL(s) to submit.`);

  for (const url of urls) {
    console.log(`IndexNow URL: ${url}`);
  }

  if (dryRun) {
    console.log("IndexNow: dry run, no request sent.");
    return;
  }

  await submit(key, urls);
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
