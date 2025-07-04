import fs from "fs/promises";
import path from "path";
// import { nanoid } from "nanoid";

import Contact from "../db/Contact.js";
import { where } from "sequelize";

const contactsPath = path.resolve("db", "contacts.json");

// const updateContacts = (contacts) =>
//   fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

export const listContacts = () => Contact.findAll();

export const getContactById = (id) => Contact.findByPk(id);

export const removeContact = async (id) => {
  const contact = await getContactById(id);
  if (!contact) return null;

  await contact.destroy();
  return contact;
};

export const addContact = (payload) => Contact.create(payload);

export const updateContact = async (id, data) => {
  const contact = await getContactById(id);
  if (!contact) return null;

  await contact.update(data);
  return contact;
};

export const updateStatusContact = async (id, { favorite }) => {
  const contact = await getContactById(id);
  // if (!contact) {
  //   throw HttpError(404, "Not found");
  // }
  if (!contact) return null;
  await contact.update({ favorite });
  return contact;
};
