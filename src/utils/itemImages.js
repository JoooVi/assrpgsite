export const getItemImageUrl = (item = {}) =>
  item.imageUrl || item.iconUrl || item.icon || item.image || "";

export const normalizeItemImageFields = (item = {}) => {
  const imageUrl = getItemImageUrl(item);
  return {
    ...item,
    imageUrl,
    iconUrl: imageUrl,
    icon: imageUrl,
  };
};
