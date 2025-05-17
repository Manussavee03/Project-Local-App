import { db } from "./firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

const eventsRef = collection(db, "events");

export const addEvent = async (eventData) => {
  const docRef = await addDoc(eventsRef, eventData);
  return { ...eventData, event_id: docRef.id };
};

export const updateEvent = async (event_id, updatedData) => {
  const docRef = doc(db, "events", event_id);
  await updateDoc(docRef, updatedData);
};

export const deleteEvent = async (event_id) => {
  const docRef = doc(db, "events", event_id);
  await deleteDoc(docRef);
};