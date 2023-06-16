import { collection, doc, getDoc, runTransaction } from "@firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "@firebase/storage";
import { ExcalidrawElement, FileId } from "../../element/types";
import Portal from "../collab/Portal";
import { getSceneVersion } from "../../element";
import { restoreElements } from "../../data/restore";
import { decompressData } from "../../data/encode";
import { decryptData, encryptData } from "../../data/encryption";
import { getSyncableElements, SyncableExcalidrawElement } from ".";
import { firestore, storage } from "../../../lib/firebaseClient";
import {
  AppState,
  BinaryFileData,
  BinaryFileMetadata,
  DataURL,
} from "../../types";
import { reconcileElements } from "../collab/reconciliation";
import { MIME_TYPES } from "../../constants";
import { FILE_CACHE_MAX_AGE_SEC } from "../app_constants";

interface FirebaseStoredScene {
  sceneVersion: number;
  iv: Uint8Array | string;
  ciphertext: Uint8Array | string;
}

const encryptElements = async (
  key: string,
  elements: readonly ExcalidrawElement[]
): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> => {
  const json = JSON.stringify(elements);
  const encoded = new TextEncoder().encode(json);
  const { encryptedBuffer, iv } = await encryptData(key, encoded);

  return { ciphertext: encryptedBuffer, iv };
};

const decryptElements = async (
  data: any,
  roomKey: string
): Promise<readonly ExcalidrawElement[]> => {
  const iv = Buffer.from(data.iv, "base64");
  const ciphertext = Buffer.from(data.ciphertext, "base64");

  const decrypted = await decryptData(iv, ciphertext, roomKey);
  const decodedData = new TextDecoder("utf-8").decode(
    new Uint8Array(decrypted)
  );
  return JSON.parse(decodedData);
};

class FirebaseSceneVersionCache {
  private static cache = new WeakMap<SocketIOClient.Socket, number>();
  static get = (socket: SocketIOClient.Socket) => {
    return FirebaseSceneVersionCache.cache.get(socket);
  };
  static set = (
    socket: SocketIOClient.Socket,
    elements: readonly SyncableExcalidrawElement[]
  ) => {
    FirebaseSceneVersionCache.cache.set(socket, getSceneVersion(elements));
  };
}

export const isSavedToFirebase = (
  portal: Portal,
  elements: readonly ExcalidrawElement[]
): boolean => {
  if (portal.socket && portal.roomId && portal.roomKey) {
    const sceneVersion = getSceneVersion(elements);

    return FirebaseSceneVersionCache.get(portal.socket) === sceneVersion;
  }
  // if no room exists, consider the room saved so that we don't unnecessarily
  // prevent unload (there's nothing we could do at that point anyway)
  return true;
};

export const saveFilesToFirebase = async ({
  prefix,
  files,
}: {
  prefix: string;
  files: { id: FileId; buffer: Uint8Array }[];
}) => {
  const erroredFiles = new Map<FileId, true>();
  const savedFiles = new Map<FileId, true>();

  await Promise.all(
    files.map(async ({ id, buffer }) => {
      try {
        const storageRef = ref(storage, `${prefix}/${id}`);
        await uploadBytesResumable(storageRef, buffer, {
          contentType: MIME_TYPES.binary,
          cacheControl: `public, max-age=${FILE_CACHE_MAX_AGE_SEC}`,
        });
        savedFiles.set(id, true);
      } catch (error: any) {
        erroredFiles.set(id, true);
      }
    })
  );

  return { savedFiles, erroredFiles };
};

const createFirebaseSceneDocument = async (
  elements: readonly SyncableExcalidrawElement[],
  roomKey: string
) => {
  const sceneVersion = getSceneVersion(elements);
  const { ciphertext, iv } = await encryptElements(roomKey, elements);

  const base64Iv = Buffer.from(iv).toString("base64");
  const base64Ciphertext = Buffer.from(new Uint8Array(ciphertext)).toString(
    "base64"
  );

  return {
    sceneVersion,
    iv: base64Iv,
    ciphertext: base64Ciphertext,
  } as FirebaseStoredScene;
};

export const saveToFirebase = async (
  portal: Portal,
  elements: readonly SyncableExcalidrawElement[],
  appState: AppState
) => {
  const { roomId, roomKey, socket } = portal;
  if (
    // bail if no room exists as there's nothing we can do at this point
    !roomId ||
    !roomKey ||
    !socket ||
    isSavedToFirebase(portal, elements)
  ) {
    return false;
  }

  const docRef = doc(collection(firestore, "scenes"), roomId);

  const savedData = await runTransaction(firestore, async (transaction) => {
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      const sceneDocument = await createFirebaseSceneDocument(
        elements,
        roomKey
      );

      transaction.set(docRef, sceneDocument);

      return {
        elements,
        reconciledElements: null,
      };
    }

    const prevDocData = snapshot.data() as FirebaseStoredScene;
    const prevElements = getSyncableElements(
      await decryptElements(prevDocData, roomKey)
    );

    const reconciledElements = getSyncableElements(
      reconcileElements(elements, prevElements, appState)
    );

    const sceneDocument = await createFirebaseSceneDocument(
      reconciledElements,
      roomKey
    );

    transaction.update(docRef, sceneDocument as any);
    return {
      elements,
      reconciledElements,
    };
  });

  FirebaseSceneVersionCache.set(socket, savedData.elements);

  return { reconciledElements: savedData.reconciledElements };
};

export const loadFromFirebase = async (
  roomId: string,
  roomKey: string,
  socket: SocketIOClient.Socket | null
): Promise<readonly ExcalidrawElement[] | null> => {
  const docRef = await getDoc(doc(collection(firestore, "scenes"), roomId));
  if (!docRef.exists()) {
    return null;
  }
  const storedScene = docRef.data() as FirebaseStoredScene;
  const elements = getSyncableElements(
    await decryptElements(storedScene, roomKey)
  );

  if (socket) {
    FirebaseSceneVersionCache.set(socket, elements);
  }

  return restoreElements(elements, null);
};

export const loadFilesFromFirebase = async (
  prefix: string,
  decryptionKey: string,
  filesIds: readonly FileId[]
) => {
  const loadedFiles: BinaryFileData[] = [];
  const erroredFiles = new Map<FileId, true>();

  await Promise.all(
    [...new Set(filesIds)].map(async (id) => {
      try {
        const filePath = `${prefix}/${id}`;
        const fileRef = ref(storage, filePath);
        const fileUrl = await getDownloadURL(fileRef);
        const response = await fetch(fileUrl);

        if (response.status < 400) {
          const arrayBuffer = await response.arrayBuffer();

          const { data, metadata } = await decompressData<BinaryFileMetadata>(
            new Uint8Array(arrayBuffer),
            {
              decryptionKey,
            }
          );

          const dataURL = new TextDecoder().decode(data) as DataURL;

          loadedFiles.push({
            mimeType: metadata.mimeType || MIME_TYPES.binary,
            id,
            dataURL,
            created: metadata?.created || Date.now(),
            lastRetrieved: metadata?.created || Date.now(),
          });
        } else {
          erroredFiles.set(id, true);
        }
      } catch (error: any) {
        erroredFiles.set(id, true);
        console.error(error);
      }
    })
  );

  return { loadedFiles, erroredFiles };
};
