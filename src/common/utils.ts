export const getPagination = (page?: string, nbItems?: string) => {
  const take = Number(nbItems) || 20;
  const skip = page ? ((Number(page) || 1) - 1) * take : 0;
  return { take, skip };
};
