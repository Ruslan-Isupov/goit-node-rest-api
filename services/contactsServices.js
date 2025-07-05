import Contact from "../db/Contact.js";

export const listContacts = (query) =>
  Contact.findAll({
    where: query,
  });

export const getContactById = (query) =>
  Contact.findOne({
    where: query,
  });

export const removeContact = async (query) => {
  const contact = await getContactById(query);
  if (!contact) return null;

  await contact.destroy();
  return contact;
};

export const addContact = (payload) => Contact.create(payload);

export const updateContact = async (query, data) => {
  const contact = await getContactById(query);
  if (!contact) return null;

  await contact.update(data);
  return contact;
};

export const updateStatusContact = async (id, { favorite }) => {
  const contact = await Contact.findByPk(id);
  if (!contact) return null;
  await contact.update({ favorite });
  return contact;
};
