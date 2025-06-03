//src/utils/idb.js
import { openDB } from 'idb';

const DB_NAME = 'story-db';
const STORE_NAME = 'stories';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
  },
});

export const saveStory = async (story) => {
  const db = await dbPromise;
  await db.put(STORE_NAME, story);
};

export const getAllStories = async () => {
  const db = await dbPromise;
  return await db.getAll(STORE_NAME);
};

export const deleteStory = async (id) => {
  const db = await dbPromise;
  await db.delete(STORE_NAME, id);
};